import { Loader2, MapPin, Navigation, Pizza } from "lucide-react";
import type { SearchRadius } from "../types";

interface HeroProps {
  onFindPizza: () => void;
  isLoading: boolean;
  locationLabel: string;
  radius: SearchRadius;
  onRadiusChange: (radius: SearchRadius) => void;
}

const RADIUS_OPTIONS: SearchRadius[] = [1, 3, 5, 10];

export function Hero({
  onFindPizza,
  isLoading,
  locationLabel,
  radius,
  onRadiusChange,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slice-charcoal px-6 py-12 text-white md:px-12 md:py-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-[10%] top-[20%] animate-float text-6xl">🍕</div>
        <div className="absolute right-[15%] top-[10%] animate-float text-4xl" style={{ animationDelay: "0.5s" }}>🧀</div>
        <div className="absolute bottom-[15%] left-[20%] animate-float text-5xl" style={{ animationDelay: "1s" }}>🫒</div>
        <div className="absolute bottom-[20%] right-[10%] animate-float text-3xl" style={{ animationDelay: "1.5s" }}>🍅</div>
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          <Pizza className="h-4 w-4 text-slice-cheese" />
          The DoorDash of pizza — but better
        </div>

        <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
          Find the best slice
          <span className="block text-slice-cheese">near you</span>
        </h2>

        <p className="mx-auto mt-4 max-w-md text-base text-white/70">
          We scan nearby pizzerias, rank them by distance, delivery options, and
          availability — then link you straight to their order page.
        </p>

        <div className="mx-auto mt-8 max-w-md">
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-sm">
            <MapPin className="ml-2 h-5 w-5 shrink-0 text-slice-cheese" />
            <span className="flex-1 truncate text-left text-sm text-white/80">
              {locationLabel}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  radius === r
                    ? "bg-slice-cheese text-slice-charcoal"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onFindPizza}
            disabled={isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slice-red px-8 py-4 text-lg font-bold text-white shadow-xl shadow-slice-red/30 transition hover:bg-slice-red-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Locating your perfect slice...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                Find best pizza near me
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
