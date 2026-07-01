import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BestPick } from "./components/BestPick";
import { CategoryBar } from "./components/CategoryBar";
import { FilterBar, type FilterState } from "./components/FilterBar";
import { Header } from "./components/Header";
import { LocationModal } from "./components/LocationModal";
import { RestaurantCard } from "./components/RestaurantCard";
import { GridSkeleton } from "./components/Skeletons";
import { StoreModal } from "./components/StoreModal";
import { useGeolocation } from "./hooks/useGeolocation";
import { CATEGORIES } from "./lib/categories";
import { geocode, reverseGeocode } from "./lib/geo";
import { findPizzaPlaces } from "./lib/overpass";
import type { Coords, PizzaPlace } from "./lib/types";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function App() {
  const geo = useGeolocation();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [places, setPlaces] = useState<PizzaPlace[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [usedFallback, setUsedFallback] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<FilterState>({
    mode: "delivery",
    sort: "best",
    freeDelivery: false,
    openNow: false,
    topRated: false,
  });

  const [selected, setSelected] = useState<PizzaPlace | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);

  // Kick off a geolocation request once on first load.
  const askedOnce = useRef(false);
  useEffect(() => {
    if (askedOnce.current) return;
    askedOnce.current = true;
    geo.locate();
  }, [geo]);

  // When geolocation resolves, adopt those coords + a friendly label.
  useEffect(() => {
    if (geo.status === "granted" && geo.coords) {
      setCoords(geo.coords);
      reverseGeocode(geo.coords).then((label) => {
        if (label) setLocationLabel(label);
        else setLocationLabel("Your current location");
      });
    } else if (geo.status === "denied" || geo.status === "unavailable") {
      // No auto-location — invite the user to type an address.
      setLocationOpen(true);
    }
  }, [geo.status, geo.coords]);

  // Load pizza places whenever the target coordinates change.
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    setLoadState("loading");
    findPizzaPlaces(coords)
      .then((res) => {
        if (cancelled) return;
        setPlaces(res.places);
        setUsedFallback(res.usedFallback);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  const handleAddress = useCallback(async (address: string) => {
    const hit = await geocode(address);
    if (hit) {
      setCoords(hit.coords);
      setLocationLabel(hit.label);
      setLocationOpen(false);
    } else {
      setLocationLabel("");
      alert("Couldn't find that address. Try being more specific.");
    }
  }, []);

  const handleUseMyLocation = useCallback(() => {
    geo.locate();
  }, [geo]);

  // Close the location modal automatically once we have coords from GPS.
  useEffect(() => {
    if (geo.status === "granted") setLocationOpen(false);
  }, [geo.status]);

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === category);
    const q = query.trim().toLowerCase();

    let list = places.filter((p) => {
      if (filters.freeDelivery && p.deliveryFee !== 0) return false;
      if (filters.openNow && !p.isOpenGuess) return false;
      if (filters.topRated && p.rating < 4.5) return false;

      if (cat && cat.match.length > 0) {
        const haystack = (p.cuisineTags.join(" ") + " " + p.name).toLowerCase();
        if (!cat.match.some((m) => haystack.includes(m))) return false;
      }

      if (q) {
        const haystack = (
          p.name +
          " " +
          p.cuisineTags.join(" ") +
          " " +
          (p.address ?? "")
        ).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "distance":
          return a.distanceKm - b.distanceKm;
        case "rating":
          return b.rating - a.rating || b.ratingCount - a.ratingCount;
        case "eta":
          return a.etaMin - b.etaMin;
        default:
          return b.score - a.score;
      }
    });

    return list;
  }, [places, filters, category, query]);

  const bestPick = useMemo(() => {
    if (filtered.length === 0) return null;
    return filtered.reduce((best, p) => (p.score > best.score ? p : best));
  }, [filtered]);

  const anyFilterActive =
    filters.freeDelivery ||
    filters.openNow ||
    filters.topRated ||
    category !== "all" ||
    query.trim() !== "";

  const resetFilters = () => {
    setFilters((f) => ({
      ...f,
      freeDelivery: false,
      openNow: false,
      topRated: false,
    }));
    setCategory("all");
    setQuery("");
  };

  return (
    <>
      <Header
        locationLabel={locationLabel}
        query={query}
        onQueryChange={setQuery}
        onOpenLocation={() => setLocationOpen(true)}
      />
      <CategoryBar active={category} onSelect={setCategory} />

      <main className="container">
        {loadState === "loading" && (
          <>
            <h1 className="section-title">Finding the best pizza near you… 🍕</h1>
            <GridSkeleton count={8} />
          </>
        )}

        {loadState === "error" && (
          <div className="state">
            <div className="state__emoji">😢</div>
            <h2>We burned the pizza</h2>
            <p>
              Something went wrong while searching for pizzerias. Give it another
              shot.
            </p>
            <button className="big-btn" onClick={() => coords && setCoords({ ...coords })}>
              Try again
            </button>
          </div>
        )}

        {loadState === "idle" && (
          <div className="state">
            <div className="state__emoji">📍🍕</div>
            <h2>Let's find pizza near you</h2>
            <p>
              Share your location or type an address and SliceApp will surface the
              best, closest pizzerias — then link you straight to their order page.
            </p>
            <button className="big-btn" onClick={() => setLocationOpen(true)}>
              Set your location
            </button>
          </div>
        )}

        {loadState === "ready" && (
          <>
            {usedFallback && (
              <div className="banner">
                Heads up: we couldn't reach the live pizzeria map, so we're showing
                a sample neighborhood near you. Try again shortly for real spots.
              </div>
            )}

            {bestPick && (
              <BestPick place={bestPick} mode={filters.mode} onView={setSelected} />
            )}

            <h2 className="section-title">
              Pizza places near you
              <span className="count">{filtered.length} spots</span>
            </h2>

            <FilterBar filters={filters} onChange={setFilters} />

            {filtered.length === 0 ? (
              <div className="state">
                <div className="state__emoji">🔍</div>
                <h2>No pizzerias match those filters</h2>
                <p>Try loosening your filters or clearing your search.</p>
                {anyFilterActive && (
                  <button className="big-btn" onClick={resetFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid" style={{ marginTop: 18 }}>
                {filtered.map((place, i) => (
                  <RestaurantCard
                    key={place.id}
                    place={place}
                    rank={i + 1}
                    mode={filters.mode}
                    onClick={setSelected}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <footer className="footer">
          Built with 🍕 by SliceApp · Real pizzerias from{" "}
          <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>
          . Not affiliated with DoorDash.
        </footer>
      </main>

      <StoreModal
        place={selected}
        mode={filters.mode}
        onClose={() => setSelected(null)}
      />

      <LocationModal
        open={locationOpen}
        currentLabel={locationLabel}
        locating={geo.status === "locating"}
        geoError={geo.error}
        onClose={() => setLocationOpen(false)}
        onUseMyLocation={handleUseMyLocation}
        onSubmitAddress={handleAddress}
      />
    </>
  );
}
