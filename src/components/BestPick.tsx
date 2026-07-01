import { Crown, ExternalLink, MapPin, Phone, Star, Timer } from "lucide-react";
import type { PizzaPlace } from "../types";
import { formatDistance, formatEta } from "../lib/geo";

interface BestPickProps {
  place: PizzaPlace;
}

const ORDER_LABELS: Record<PizzaPlace["orderSource"], string> = {
  website: "Order on their site",
  doordash: "Order on DoorDash",
  ubereats: "Order on Uber Eats",
  google: "Find order page",
};

export function BestPick({ place }: BestPickProps) {
  return (
    <section className="animate-slide-up overflow-hidden rounded-3xl bg-gradient-to-br from-slice-red via-slice-red-dark to-slice-orange p-[2px] shadow-2xl shadow-slice-red/25">
      <div className="relative overflow-hidden rounded-[22px] bg-white">
        <div className="absolute -right-8 -top-8 text-[120px] opacity-[0.07] select-none">
          🍕
        </div>

        <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slice-cheese/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slice-crust">
              <Crown className="h-3.5 w-3.5" />
              Best pick near you
            </div>

            <h2 className="font-display text-3xl font-extrabold text-slice-charcoal md:text-4xl">
              {place.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slice-muted">
              <span className="inline-flex items-center gap-1 font-semibold text-slice-charcoal">
                <Star className="h-4 w-4 fill-slice-cheese text-slice-cheese" />
                {place.score}/100 match
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slice-red" />
                {formatDistance(place.distanceMiles)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Timer className="h-4 w-4 text-slice-olive" />
                {formatEta(place.distanceMiles)}
              </span>
              {place.isOpen === true && (
                <span className="rounded-full bg-slice-olive/10 px-2 py-0.5 text-xs font-semibold text-slice-olive">
                  Open now
                </span>
              )}
              {place.isOpen === false && (
                <span className="rounded-full bg-slice-muted/10 px-2 py-0.5 text-xs font-semibold text-slice-muted">
                  May be closed
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slice-muted">{place.address}</p>

            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slice-red hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {place.phone}
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={place.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pulse-glow inline-flex items-center justify-center gap-2 rounded-2xl bg-slice-red px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-slice-red/40 transition hover:bg-slice-red-dark hover:shadow-xl"
            >
              {ORDER_LABELS[place.orderSource]}
              <ExternalLink className="h-5 w-5" />
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slice-charcoal/10 px-8 py-3 text-center font-semibold text-slice-charcoal transition hover:border-slice-red/30 hover:bg-slice-cream"
            >
              <MapPin className="h-4 w-4" />
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
