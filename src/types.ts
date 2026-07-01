export interface Coordinates {
  lat: number;
  lon: number;
}

export interface PizzaPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceMiles: number;
  address: string;
  cuisine: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  delivery?: boolean;
  takeaway?: boolean;
  score: number;
  orderUrl: string;
  orderSource: "website" | "doordash" | "ubereats" | "google";
  isOpen?: boolean;
}

export type SearchRadius = 1 | 3 | 5 | 10;

export type AppState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "searching"; coords: Coordinates }
  | { status: "success"; coords: Coordinates; places: PizzaPlace[] }
  | { status: "error"; message: string };
