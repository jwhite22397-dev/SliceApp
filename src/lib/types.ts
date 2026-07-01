export interface Coords {
  lat: number;
  lon: number;
}

export interface PizzaPlace {
  id: string;
  name: string;
  coords: Coords;
  /** Distance from the user in kilometers. */
  distanceKm: number;
  /** Estimated delivery time window in minutes. */
  etaMin: number;
  etaMax: number;
  /** Delivery fee in dollars (0 === free delivery). */
  deliveryFee: number;
  /** Rating out of 5. */
  rating: number;
  /** Number of ratings shown next to the star. */
  ratingCount: number;
  /** Overall "best near me" score (higher is better). */
  score: number;
  /** Human readable address if available. */
  address?: string;
  cuisineTags: string[];
  priceTier: 1 | 2 | 3;
  /** Direct website / order link when the venue advertises one. */
  website?: string;
  phone?: string;
  /** Whether the place looks like it takes online orders. */
  ordersOnline: boolean;
  /** A best-effort URL that lands the user on an order page. */
  orderUrl: string;
  /** Deterministic emoji-based hero art. */
  art: string;
  isOpenGuess: boolean;
  promo?: string;
}
