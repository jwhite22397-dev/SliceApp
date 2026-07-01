# SliceApp 🍕

A pizza-themed food delivery finder inspired by DoorDash. SliceApp uses your location to discover the best nearby pizzerias and links you directly to their order pages.

## Features

- **Location-based search** — Uses your browser's geolocation to find pizza near you
- **Smart ranking** — Scores pizzerias by distance, delivery options, hours, and online ordering availability
- **One-click ordering** — Links to restaurant websites, DoorDash, Uber Eats, or Google order search
- **DoorDash-inspired UI** — Clean delivery-app layout with a warm pizza theme (reds, cheese gold, crust browns)
- **No API keys required** — Powered by free OpenStreetMap and Overpass APIs

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Find best pizza near me**. Allow location access when prompted.

## How It Works

1. SliceApp requests your GPS coordinates via the browser Geolocation API
2. It queries OpenStreetMap's Overpass API for restaurants, fast food, and pizza-named venues within your chosen radius (1–10 miles)
3. Each result is scored based on proximity, delivery/takeaway tags, opening hours, and whether they have a website
4. The top pick is highlighted with a prominent order button; runners-up appear in a card grid below

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide React icons
- OpenStreetMap / Overpass API / Nominatim
