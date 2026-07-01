# 🍕 PizzaDash

A pizza-themed DoorDash clone that finds the **best pizza places near you** using real-time location data and OpenStreetMap — no API key required.

## Features

- **Geolocation** — Uses browser's native GPS to find your exact position
- **Real pizza data** — Queries the free [Overpass API](https://overpass-api.de) (OpenStreetMap) to find nearby pizza restaurants
- **Smart ranking** — Sorts by a weighted score of rating + proximity
- **Order links** — Every pizza place gets direct links to:
  - 🍕 DoorDash
  - 🚗 Uber Eats
  - 📍 Google Maps (for directions or ordering)
  - 🌐 Official restaurant website (when available)
- **Filter & sort** — Filter by Open Now, Free Delivery, Under 30 min, Top Rated; sort by distance, rating, delivery time, or fee
- **Pizza theme** — Red/orange color palette, pizza emojis, Playfair Display headings, and smooth animations

## Tech Stack

- **React** + **Vite** (fast dev server, optimized production build)
- **Tailwind CSS** v3 (utility-first styling)
- **Lucide React** (icons)
- **Overpass API** — free OpenStreetMap data, no API key needed
- **Nominatim** — free reverse geocoding for human-readable location names
- **Browser Geolocation API** — native GPS/location detection

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), click **Find Pizza Near Me**, allow location access, and enjoy your pizza results!

## Build for Production

```bash
npm run build
npm run preview
```

## How It Works

1. User clicks **Find Pizza Near Me**
2. Browser asks for location permission (GPS/WiFi)
3. App queries the Overpass API with a 5-mile radius for nodes tagged `cuisine=pizza` or restaurant names containing "pizza"
4. Results are ranked by a weighted score (rating × 0.4 + proximity score × 0.6)
5. Each result shows delivery time estimates, ratings (consistent pseudo-random from OSM node ID), and direct order links

## Notes

- Rating values are algorithmically derived from the OpenStreetMap node ID since OSM doesn't store ratings. They are consistent but not from a real review system.
- Order links route to DoorDash/Uber Eats search for the restaurant name; direct "Order" buttons depend on whether the restaurant is listed on those platforms.
- Pizza place data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
