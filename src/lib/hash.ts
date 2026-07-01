/**
 * Tiny deterministic string hash (FNV-1a variant) that returns a value in
 * [0, 1). We use it so synthesized values (ratings, ETAs, promos) stay stable
 * for a given venue across renders instead of flickering on every request.
 */
export function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Normalize the unsigned 32-bit int into [0, 1).
  return (h >>> 0) / 4294967296;
}

/** Deterministically pick an item from a list based on a seed. */
export function seededPick<T>(seed: string, items: readonly T[]): T {
  const idx = Math.floor(seededUnit(seed) * items.length);
  return items[Math.min(idx, items.length - 1)];
}

/** Deterministic integer in [min, max]. */
export function seededInt(seed: string, min: number, max: number): number {
  return min + Math.floor(seededUnit(seed) * (max - min + 1));
}
