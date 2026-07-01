export interface Category {
  id: string;
  label: string;
  emoji: string;
  /** cuisine tag substrings that match this category */
  match: string[];
}

export const CATEGORIES: Category[] = [
  { id: "all", label: "All Pizza", emoji: "🍕", match: [] },
  { id: "pepperoni", label: "Pepperoni", emoji: "🍕", match: ["pepperoni", "meat"] },
  { id: "margherita", label: "Margherita", emoji: "🍅", match: ["margherita", "italian"] },
  { id: "deep-dish", label: "Deep Dish", emoji: "🥧", match: ["deep dish", "chicago"] },
  { id: "vegan", label: "Vegan", emoji: "🌱", match: ["vegan", "vegetarian"] },
  { id: "wings", label: "Wings", emoji: "🍗", match: ["wings", "chicken"] },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾", match: ["gluten"] },
  { id: "sides", label: "Sides", emoji: "🧄", match: ["sides", "garlic", "bread"] },
  { id: "dessert", label: "Dessert", emoji: "🍰", match: ["dessert", "sweet"] },
];
