/**
 * Fetches nearby pizza places using the free Overpass API (OpenStreetMap).
 * No API key required.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Radius in meters to search for pizza places
const SEARCH_RADIUS = 8000;

function buildOverpassQuery(lat, lon) {
  // Search for restaurants/fast_food with pizza cuisine, or nodes named pizza
  return `
[out:json][timeout:25];
(
  node["amenity"~"restaurant|fast_food"]["cuisine"~"pizza",i](around:${SEARCH_RADIUS},${lat},${lon});
  way["amenity"~"restaurant|fast_food"]["cuisine"~"pizza",i](around:${SEARCH_RADIUS},${lat},${lon});
  node["amenity"~"restaurant|fast_food"]["name"~"pizza|pizzeria|pie",i](around:${SEARCH_RADIUS},${lat},${lon});
);
out center body;
`;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDeliveryTime(distanceMiles) {
  // Rough estimate: 5 min base + 3 min/mile
  const minutes = Math.round(5 + distanceMiles * 3);
  // Round to nearest 5
  return Math.max(15, Math.ceil(minutes / 5) * 5);
}

function deriveOrderUrl(tags, name) {
  const website = tags.website || tags['contact:website'] || tags.url;
  if (website) return website;

  // Build DoorDash search link as fallback
  const encoded = encodeURIComponent(name);
  return `https://www.doordash.com/search/store/${encoded}/`;
}

function derivePhone(tags) {
  return tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
}

function deriveAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  return parts.length > 0 ? parts.join(' ') : null;
}

// Generate a pseudo-random but consistent rating based on OSM id
function generateRating(id) {
  const seed = parseInt(String(id).slice(-4), 10);
  return (3.5 + ((seed % 15) / 10)).toFixed(1);
}

function generateReviewCount(id) {
  const seed = parseInt(String(id).slice(-5), 10);
  return 20 + (seed % 480);
}

function generateDeliveryFee(distanceMiles) {
  if (distanceMiles < 1) return 'Free';
  if (distanceMiles < 2) return '$0.99';
  if (distanceMiles < 4) return '$1.99';
  return '$2.99';
}

function generateCategory(tags) {
  const cuisine = (tags.cuisine || '').toLowerCase();
  if (cuisine.includes('italian')) return 'Italian Pizza';
  if (cuisine.includes('neapolitan')) return 'Neapolitan';
  if (cuisine.includes('new_york') || cuisine.includes('new york')) return 'New York Style';
  if (cuisine.includes('chicago')) return 'Chicago Deep Dish';
  if (cuisine.includes('sicilian')) return 'Sicilian';
  const name = (tags.name || '').toLowerCase();
  if (name.includes('chicago')) return 'Chicago Deep Dish';
  if (name.includes('new york') || name.includes('ny')) return 'New York Style';
  if (name.includes('italian') || name.includes('italia')) return 'Italian Pizza';
  return 'Pizza';
}

const PIZZA_EMOJIS = ['🍕', '🍕', '🍕', '🔥', '⭐', '🏆'];

export async function fetchNearbyPizzaPlaces(lat, lon) {
  const query = buildOverpassQuery(lat, lon);
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  // Deduplicate by name+approximate location
  const seen = new Set();
  const places = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name;
    if (!name) continue;

    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const key = `${name.toLowerCase().replace(/\s/g, '')}-${Math.round(elLat * 100)}-${Math.round(elLon * 100)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const distanceMiles = haversineDistance(lat, lon, elLat, elLon);
    const deliveryMinutes = estimateDeliveryTime(distanceMiles);
    const rating = parseFloat(generateRating(el.id));
    const reviewCount = generateReviewCount(el.id);

    places.push({
      id: el.id,
      name,
      lat: elLat,
      lon: elLon,
      distanceMiles: parseFloat(distanceMiles.toFixed(2)),
      deliveryMinutes,
      rating,
      reviewCount,
      deliveryFee: generateDeliveryFee(distanceMiles),
      category: generateCategory(tags),
      address: deriveAddress(tags),
      phone: derivePhone(tags),
      orderUrl: deriveOrderUrl(tags, name),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&ll=${elLat},${elLon}`,
      doordashUrl: `https://www.doordash.com/search/store/${encodeURIComponent(name)}/`,
      uberEatsUrl: `https://www.ubereats.com/search?q=${encodeURIComponent(name)}`,
      emoji: PIZZA_EMOJIS[Math.floor(Math.random() * PIZZA_EMOJIS.length)],
      isOpen: Math.random() > 0.2, // assume mostly open for demo
      tags,
    });
  }

  // Sort by a weighted score: rating * 0.4 + inverse distance * 0.6
  places.sort((a, b) => {
    const scoreA = a.rating * 0.4 + (1 / (a.distanceMiles + 0.1)) * 2 * 0.6;
    const scoreB = b.rating * 0.4 + (1 / (b.distanceMiles + 0.1)) * 2 * 0.6;
    return scoreB - scoreA;
  });

  return places;
}
