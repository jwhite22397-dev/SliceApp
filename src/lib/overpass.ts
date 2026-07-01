import { haversineKm } from "./distance";
import { seededInt, seededPick, seededUnit } from "./hash";
import { scorePlace } from "./scoring";
import type { Coords, PizzaPlace } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const PIZZA_ART = ["🍕", "🍕", "🍕", "🧑‍🍳", "🔥", "🧀", "🍅"];

const PROMOS = [
  "Free delivery over $15",
  "20% off your first order",
  "Buy one slice, get one free",
  "$0 delivery fee",
  "Family deal: 2 large pies $22",
  null,
  null,
  null,
];

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(center: Coords, radiusMeters: number): string {
  const { lat, lon } = center;
  return `[out:json][timeout:25];
(
  nwr(around:${radiusMeters},${lat},${lon})["amenity"~"restaurant|fast_food"]["cuisine"~"pizza"];
  nwr(around:${radiusMeters},${lat},${lon})["amenity"~"restaurant|fast_food"]["name"~"pizz",i];
  nwr(around:${radiusMeters},${lat},${lon})["shop"="pizza"];
);
out center tags 80;`;
}

function composeAddress(tags: Record<string, string>): string | undefined {
  const house = tags["addr:housenumber"];
  const street = tags["addr:street"];
  const city = tags["addr:city"];
  const parts: string[] = [];
  if (house || street) parts.push([house, street].filter(Boolean).join(" "));
  if (city) parts.push(city);
  return parts.length ? parts.join(", ") : undefined;
}

function pickWebsite(tags: Record<string, string>): string | undefined {
  const raw =
    tags.website ||
    tags["contact:website"] ||
    tags.url ||
    tags["contact:facebook"];
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function buildOrderUrl(
  name: string,
  website: string | undefined,
  address: string | undefined
): string {
  if (website) return website;
  const query = encodeURIComponent(
    `order pizza online ${name} ${address ?? ""}`.trim()
  );
  return `https://www.google.com/search?q=${query}`;
}

function enrich(el: OverpassElement, user: Coords): PizzaPlace | null {
  const coords: Coords | null =
    el.lat != null && el.lon != null
      ? { lat: el.lat, lon: el.lon }
      : el.center
        ? { lat: el.center.lat, lon: el.center.lon }
        : null;
  if (!coords) return null;

  const tags = el.tags ?? {};
  const name = tags.name?.trim() || "Neighborhood Pizzeria";
  const id = `${el.type}/${el.id}`;
  const distanceKm = haversineKm(user, coords);

  const website = pickWebsite(tags);
  const address = composeAddress(tags);
  const hasMenu = Boolean(tags.website || tags["contact:website"]);
  const ordersOnline = hasMenu || seededUnit(id) > 0.35;

  // OSM rarely carries ratings, so we synthesize deterministic-but-believable
  // numbers seeded on the stable venue id (they never flicker between loads).
  const rating = 3.6 + seededUnit(`${id}:rating`) * 1.4; // 3.6 – 5.0
  const ratingCount = seededInt(`${id}:count`, 40, 1800);
  const baseEta = 12 + Math.round(distanceKm * 6);
  const etaMin = baseEta + seededInt(`${id}:eta`, 0, 6);
  const etaMax = etaMin + seededInt(`${id}:etah`, 8, 18);
  const freeDelivery = seededUnit(`${id}:free`) > 0.55;
  const deliveryFee = freeDelivery
    ? 0
    : Math.round((0.99 + seededUnit(`${id}:fee`) * 4) * 100) / 100;
  const priceTier = ((seededInt(`${id}:price`, 1, 3)) as 1 | 2 | 3);

  const cuisineTags = (tags.cuisine ?? "pizza")
    .split(";")
    .map((c) => c.trim().replace(/_/g, " "))
    .filter(Boolean)
    .slice(0, 3);
  if (!cuisineTags.includes("pizza")) cuisineTags.unshift("pizza");

  const promo = seededPick(`${id}:promo`, PROMOS) ?? undefined;

  const partial: Omit<PizzaPlace, "score"> = {
    id,
    name,
    coords,
    distanceKm,
    etaMin,
    etaMax,
    deliveryFee,
    rating: Math.round(rating * 10) / 10,
    ratingCount,
    address,
    cuisineTags: Array.from(new Set(cuisineTags)),
    priceTier,
    website,
    phone: tags.phone || tags["contact:phone"],
    ordersOnline,
    orderUrl: buildOrderUrl(name, website, address),
    art: seededPick(`${id}:art`, PIZZA_ART),
    isOpenGuess: seededUnit(`${id}:open`) > 0.15,
    promo,
  };

  return { ...partial, score: 0 };
}

async function runOverpass(query: string): Promise<OverpassResponse | null> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) continue;
      return (await res.json()) as OverpassResponse;
    } catch {
      // Try the next mirror.
    }
  }
  return null;
}

/**
 * Fetch real pizza places near `user` from OpenStreetMap. Progressively widens
 * the search radius until it finds a healthy set of results. Falls back to a
 * generated neighborhood if every mirror is unreachable so the UI never breaks.
 */
export async function findPizzaPlaces(user: Coords): Promise<{
  places: PizzaPlace[];
  usedFallback: boolean;
  radiusKm: number;
}> {
  const radiiMeters = [2500, 6000, 12000, 25000];

  for (const radius of radiiMeters) {
    const data = await runOverpass(buildQuery(user, radius));
    if (!data) break; // network failure — go to fallback

    const places = data.elements
      .map((el) => enrich(el, user))
      .filter((p): p is PizzaPlace => p !== null);

    // Deduplicate by name+rough location (chains list many nodes).
    const seen = new Set<string>();
    const unique = places.filter((p) => {
      const key = `${p.name.toLowerCase()}@${p.coords.lat.toFixed(3)},${p.coords.lon.toFixed(3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length >= 4 || radius === radiiMeters[radiiMeters.length - 1]) {
      const maxDist = Math.max(...unique.map((p) => p.distanceKm), 0.001);
      const scored = unique
        .map((p) => ({ ...p, score: scorePlace(p, maxDist) }))
        .sort((a, b) => b.score - a.score);
      if (scored.length > 0) {
        return { places: scored, usedFallback: false, radiusKm: radius / 1000 };
      }
    }
  }

  const fallback = buildFallbackPlaces(user);
  return { places: fallback, usedFallback: true, radiusKm: 5 };
}

const FALLBACK_NAMES = [
  "Tony's Slice House",
  "Bella Napoli Pizzeria",
  "Crust & Co.",
  "The Dough Joe",
  "Mamma Mia Pies",
  "Brooklyn Coal Oven",
  "Sliced Heaven",
  "Fired Up Pizza Bar",
  "Nonna's Kitchen",
  "Cheesy Rider Pizza",
];

/**
 * Generates believable pizzerias scattered around the user's coordinates.
 * Only used when OpenStreetMap can't be reached (e.g. offline demo).
 */
export function buildFallbackPlaces(user: Coords): PizzaPlace[] {
  const places = FALLBACK_NAMES.map((name, i) => {
    const seed = `fallback:${name}`;
    // Scatter within ~4km using the seed for stable positions.
    const angle = seededUnit(`${seed}:a`) * Math.PI * 2;
    const dist = 0.3 + seededUnit(`${seed}:d`) * 3.7;
    const dLat = (dist / 111) * Math.cos(angle);
    const dLon =
      (dist / (111 * Math.cos((user.lat * Math.PI) / 180))) * Math.sin(angle);
    const coords: Coords = { lat: user.lat + dLat, lon: user.lon + dLon };
    const distanceKm = haversineKm(user, coords);

    const rating = 3.7 + seededUnit(`${seed}:r`) * 1.3;
    const etaMin = 12 + Math.round(distanceKm * 6) + i;
    const freeDelivery = seededUnit(`${seed}:free`) > 0.5;

    const partial: Omit<PizzaPlace, "score"> = {
      id: seed,
      name,
      coords,
      distanceKm,
      etaMin,
      etaMax: etaMin + seededInt(`${seed}:eh`, 8, 16),
      deliveryFee: freeDelivery
        ? 0
        : Math.round((0.99 + seededUnit(`${seed}:fee`) * 3) * 100) / 100,
      rating: Math.round(rating * 10) / 10,
      ratingCount: seededInt(`${seed}:c`, 80, 1600),
      address: `${seededInt(`${seed}:h`, 10, 980)} Main St`,
      cuisineTags: seededPick(`${seed}:cui`, [
        ["pizza", "italian"],
        ["pizza", "wings"],
        ["pizza", "vegan"],
        ["pizza", "deep dish"],
      ]),
      priceTier: seededInt(`${seed}:p`, 1, 3) as 1 | 2 | 3,
      website: undefined,
      phone: undefined,
      ordersOnline: true,
      orderUrl: `https://www.google.com/search?q=${encodeURIComponent(
        `order pizza online ${name}`
      )}`,
      art: seededPick(`${seed}:art`, PIZZA_ART),
      isOpenGuess: seededUnit(`${seed}:o`) > 0.1,
      promo: seededPick(`${seed}:promo`, PROMOS) ?? undefined,
    };
    return partial;
  });

  const maxDist = Math.max(...places.map((p) => p.distanceKm), 0.001);
  return places
    .map((p) => ({ ...p, score: scorePlace(p, maxDist) }))
    .sort((a, b) => b.score - a.score);
}
