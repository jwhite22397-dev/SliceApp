import type { Coords } from "./types";

const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Turn a typed address into coordinates + a tidy label. */
export async function geocode(
  query: string
): Promise<{ coords: Coords; label: string } | null> {
  const url = `${NOMINATIM}/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data.length) return null;
    const hit = data[0];
    return {
      coords: { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) },
      label: shortLabel(hit.display_name),
    };
  } catch {
    return null;
  }
}

/** Turn coordinates into a friendly "neighborhood, city" label. */
export async function reverseGeocode(coords: Coords): Promise<string | null> {
  const url = `${NOMINATIM}/reverse?format=json&zoom=16&lat=${coords.lat}&lon=${coords.lon}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const a = data.address ?? {};
    const locality =
      a.neighbourhood || a.suburb || a.city_district || a.road || a.village;
    const city = a.city || a.town || a.county;
    const label = [locality, city].filter(Boolean).join(", ");
    return label || (data.display_name ? shortLabel(data.display_name) : null);
  } catch {
    return null;
  }
}

function shortLabel(displayName: string): string {
  return displayName.split(",").slice(0, 2).join(", ").trim();
}
