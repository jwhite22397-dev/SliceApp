import { useCallback, useState } from "react";
import { BestPick } from "./components/BestPick";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PizzaCard } from "./components/PizzaCard";
import { EmptyState, ErrorBanner, LoadingState } from "./components/States";
import { findNearbyPizza } from "./lib/pizzaSearch";
import { getCurrentPosition, reverseGeocode } from "./lib/geo";
import type { AppState, PizzaPlace, SearchRadius } from "./types";

export default function App() {
  const [state, setState] = useState<AppState>({ status: "idle" });
  const [locationLabel, setLocationLabel] = useState("Tap to use your location");
  const [radius, setRadius] = useState<SearchRadius>(5);

  const findPizza = useCallback(async () => {
    setState({ status: "locating" });

    try {
      const coords = await getCurrentPosition();
      const label = await reverseGeocode(coords);
      setLocationLabel(label);

      setState({ status: "searching", coords });

      let places = await findNearbyPizza(coords, radius);

      if (places.length === 0 && radius < 10) {
        places = await findNearbyPizza(coords, 10);
      }

      if (places.length === 0) {
        setState({
          status: "error",
          message: `No pizza places found within 10 miles of ${label}. Try again from a different location.`,
        });
        return;
      }

      setState({ status: "success", coords, places });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }, [radius]);

  const isLoading = state.status === "locating" || state.status === "searching";
  const places: PizzaPlace[] = state.status === "success" ? state.places : [];
  const bestPick = places[0];
  const runnersUp = places.slice(1);

  return (
    <div className="min-h-screen bg-slice-cream">
      <Header
        locationLabel={locationLabel}
        onLocate={findPizza}
        isLocating={isLoading}
      />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {state.status !== "success" && (
          <Hero
            onFindPizza={findPizza}
            isLoading={isLoading}
            locationLabel={locationLabel}
            radius={radius}
            onRadiusChange={setRadius}
          />
        )}

        {state.status === "locating" && (
          <LoadingState message="Getting your location..." />
        )}

        {state.status === "searching" && (
          <LoadingState message="Finding the best pizza spots..." />
        )}

        {state.status === "error" && (
          <ErrorBanner message={state.message} onRetry={findPizza} />
        )}

        {state.status === "success" && bestPick && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slice-red">
                  Results near {locationLabel}
                </p>
                <h2 className="font-display text-2xl font-extrabold text-slice-charcoal md:text-3xl">
                  {places.length} pizza {places.length === 1 ? "spot" : "spots"} found
                </h2>
              </div>
              <button
                type="button"
                onClick={findPizza}
                className="rounded-xl border border-slice-charcoal/10 bg-white px-4 py-2 text-sm font-semibold text-slice-charcoal transition hover:border-slice-red/30"
              >
                Refresh results
              </button>
            </div>

            <BestPick place={bestPick} />

            {runnersUp.length > 0 && (
              <section>
                <h3 className="mb-4 font-display text-xl font-bold text-slice-charcoal">
                  More great options
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {runnersUp.map((place, i) => (
                    <PizzaCard
                      key={place.id}
                      place={place}
                      rank={i + 2}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {state.status === "success" && places.length === 0 && (
          <EmptyState
            message="We couldn't find any pizzerias nearby. Try expanding your search radius."
            onRetry={findPizza}
          />
        )}
      </main>

      <footer className="mt-16 border-t border-slice-charcoal/5 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slice-muted">
          <p className="font-display text-lg font-bold text-slice-charcoal">
            Slice<span className="text-slice-red">App</span>
          </p>
          <p className="mt-1">
            Pizza data from OpenStreetMap · Built with 🍕 and love
          </p>
        </div>
      </footer>
    </div>
  );
}
