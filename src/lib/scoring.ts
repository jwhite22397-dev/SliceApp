import type { PizzaPlace } from "./types";

/**
 * "Best closest pizza place near me" score.
 *
 * We blend the three things a hungry person actually cares about:
 *   1. How close it is (dominant factor — this is the "closest" part).
 *   2. How good it is (rating).
 *   3. Whether you can order online right now.
 *
 * The result is normalized so higher is always better, letting us confidently
 * crown a single "Best Pick".
 */
export function scorePlace(
  place: Omit<PizzaPlace, "score">,
  maxDistanceKm: number
): number {
  const safeMax = Math.max(maxDistanceKm, 0.001);

  // Closeness: 1 when on top of you, decaying toward 0 at the search edge.
  const closeness = 1 - Math.min(place.distanceKm / safeMax, 1);

  // Quality: ratings run 1–5, map onto 0–1.
  const quality = (place.rating - 1) / 4;

  // Convenience: free/cheap delivery and a real order link nudge the score up.
  const feePenalty = Math.min(place.deliveryFee / 8, 1); // $8 fee ≈ worst case
  const convenience =
    (place.ordersOnline ? 0.7 : 0.2) + (1 - feePenalty) * 0.3;

  const score =
    closeness * 0.55 + quality * 0.3 + convenience * 0.15;

  return Math.round(score * 1000) / 1000;
}
