import type { Coordinates, PizzaPlace, SearchRadius } from "../types";
import { haversineDistance } from "./geo";

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

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function buildOverpassQuery(coords: Coordinates, radiusMiles: SearchRadius): string {
  const radiusMeters = Math.round(radiusMiles * 1609.34);
  const { lat, lon } = coords;

  return `
    [out:json][timeout:25];
  (
    node["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"pizza|italian"](around:${radiusMeters},${lat},${lon});
    way["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"pizza|italian"](around:${radiusMeters},${lat},${lon});
    node["name"~"pizza",i]["amenity"](around:${radiusMeters},${lat},${lon});
    way["name"~"pizza",i]["amenity"](around:${radiusMeters},${lat},${lon});
    node["brand"~"domino|pizza hut|papa john|little caesar|marco's|blaze pizza",i](around:${radiusMeters},${lat},${lon});
    way["brand"~"domino|pizza hut|papa john|little caesar|marco's|blaze pizza",i](around:${radiusMeters},${lat},${lon});
  );
  out center tags;
  `.trim();
}

function getCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon };
  if (el.center) return el.center;
  return null;
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] ?? tags["addr:town"],
    tags["addr:state"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Address not listed";
}

function isLikelyOpen(hours?: string): boolean | undefined {
  if (!hours) return undefined;
  const now = new Date();
  const day = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][now.getDay()];
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

  for (const segment of hours.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed.includes(day)) continue;
    const timeMatch = trimmed.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    if (!timeMatch) continue;
    const open = timeMatch[1].replace(":", "");
    const close = timeMatch[2].replace(":", "");
    if (time >= open && time <= close) return true;
  }
  return false;
}

function buildOrderUrl(
  name: string,
  address: string,
  website?: string
): { url: string; source: PizzaPlace["orderSource"] } {
  if (website) {
    const normalized = website.startsWith("http") ? website : `https://${website}`;
    return { url: normalized, source: "website" };
  }

  const query = encodeURIComponent(`${name} pizza order online ${address}`);
  const brand = name.toLowerCase();

  if (
    brand.includes("domino") ||
    brand.includes("pizza hut") ||
    brand.includes("papa john") ||
    brand.includes("little caesar") ||
    brand.includes("blaze")
  ) {
    return {
      url: `https://www.doordash.com/search/store/${encodeURIComponent(name)}`,
      source: "doordash",
    };
  }

  if (brand.includes("mod pizza") || brand.includes("pieology")) {
    return {
      url: `https://www.ubereats.com/search?q=${encodeURIComponent(name)}`,
      source: "ubereats",
    };
  }

  return {
    url: `https://www.google.com/search?q=${query}`,
    source: "google",
  };
}

function scorePlace(
  distanceMiles: number,
  tags: Record<string, string>,
  maxDistance: number
): number {
  let score = 100;

  const distanceScore = Math.max(0, 40 - (distanceMiles / maxDistance) * 40);
  score = distanceScore;

  if (tags.website || tags["contact:website"]) score += 15;
  if (tags.phone || tags["contact:phone"]) score += 10;
  if (tags.delivery === "yes") score += 12;
  if (tags.takeaway === "yes") score += 8;
  if (tags["addr:street"]) score += 5;
  if (tags.opening_hours && isLikelyOpen(tags.opening_hours)) score += 10;

  const name = (tags.name ?? "").toLowerCase();
  if (name.includes("pizza")) score += 5;
  if (tags.cuisine?.includes("pizza")) score += 5;

  return Math.min(100, Math.round(score));
}

function dedupePlaces(elements: OverpassElement[]): OverpassElement[] {
  const seen = new Map<string, OverpassElement>();

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name ?? tags.brand;
    const coords = getCoords(el);
    if (!name || !coords) continue;

    const key = `${name.toLowerCase()}-${coords.lat.toFixed(3)}-${coords.lon.toFixed(3)}`;
    const existing = seen.get(key);
    if (!existing || Object.keys(tags).length > Object.keys(existing.tags ?? {}).length) {
      seen.set(key, el);
    }
  }

  return Array.from(seen.values());
}

async function queryOverpass(query: string): Promise<OverpassResponse> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "SliceApp/1.0 (pizza finder; https://github.com/sliceapp)",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        lastError = new Error(`Overpass returned ${res.status}`);
        continue;
      }

      return (await res.json()) as OverpassResponse;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Overpass request failed");
    }
  }

  throw lastError ?? new Error("Failed to search for pizza places. Please try again.");
}

export async function findNearbyPizza(
  coords: Coordinates,
  radiusMiles: SearchRadius = 5
): Promise<PizzaPlace[]> {
  const query = buildOverpassQuery(coords, radiusMiles);

  const data = await queryOverpass(query);
  const unique = dedupePlaces(data.elements);

  const places: PizzaPlace[] = [];

  for (const el of unique) {
    const tags = el.tags ?? {};
    const name = tags.name ?? tags.brand;
    const position = getCoords(el);
    if (!name || !position) continue;

    const distanceMiles = haversineDistance(coords, position);
    const address = buildAddress(tags);
    const website = tags.website ?? tags["contact:website"];
    const { url, source } = buildOrderUrl(name, address, website);

    places.push({
      id: `${el.type}-${el.id}`,
      name,
      lat: position.lat,
      lon: position.lon,
      distanceMiles,
      address,
      cuisine: tags.cuisine ?? "pizza",
      phone: tags.phone ?? tags["contact:phone"],
      website,
      openingHours: tags.opening_hours,
      delivery: tags.delivery === "yes",
      takeaway: tags.takeaway === "yes",
      score: scorePlace(distanceMiles, tags, radiusMiles),
      orderUrl: url,
      orderSource: source,
      isOpen: isLikelyOpen(tags.opening_hours),
    });
  }

  places.sort((a, b) => b.score - a.score || a.distanceMiles - b.distanceMiles);

  return places;
}
