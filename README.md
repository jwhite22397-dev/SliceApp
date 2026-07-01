# 🍕 SliceApp

**Find the best, closest pizza place near you — and jump straight to their order page.**

SliceApp is a pizza-themed food-delivery web app inspired by DoorDash. It uses
your location to surface real pizzerias nearby, ranks them to crown a single
**Best Pick**, and links you directly to each spot's online ordering page.

## What it does

- **Uses your location** — asks for GPS, or lets you type an address / ZIP.
- **Finds real pizzerias** near you from [OpenStreetMap](https://www.openstreetmap.org)
  via the free Overpass API (no API key required). The search radius widens
  automatically until it finds enough spots.
- **Ranks the "Best Pick"** using a blend of closeness (dominant), rating, and
  order convenience — then shows it in a big hero banner with an **Order now** button.
- **Links to the order page** — uses each venue's published website when
  available, otherwise sends you to an online-ordering search for that place.
- **DoorDash-style UI, pizza flavored** — sticky red header with a location
  pill and search, horizontal category rail (Pepperoni, Margherita, Deep Dish,
  Vegan, Wings…), delivery/pickup toggle, sort + filter chips, restaurant cards
  with ratings, ETAs, delivery fees, and distance, plus a store detail modal.

## Tech stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) for dev/build
- OpenStreetMap **Overpass API** (pizza discovery) and **Nominatim** (geocoding)
- Zero paid API keys, zero backend — it all runs in the browser.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed URL (default `http://localhost:5173`). Allow location
access, or click the location pill to type an address.

### Other scripts

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

## How "best" is decided

Each candidate gets a score (see `src/lib/scoring.ts`):

```
score = closeness × 0.55  +  rating × 0.30  +  convenience × 0.15
```

- **closeness** decays from 1 (right next to you) to 0 (edge of the search radius)
- **rating** is normalized from the 1–5 scale
- **convenience** rewards online ordering and low/free delivery fees

The highest-scoring open spot becomes the **Best Pick**.

## Notes

- OpenStreetMap rarely stores ratings/ETAs, so those values are generated
  deterministically per venue (seeded on its stable ID) for a realistic feel —
  names, locations, addresses, and websites are **real** OSM data.
- If the Overpass mirrors are unreachable, SliceApp falls back to a generated
  sample neighborhood so the UI never breaks, and shows a notice.
- Not affiliated with DoorDash. Built as a themed clone for fun.
