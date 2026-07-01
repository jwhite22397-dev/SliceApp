import type { CSSProperties } from "react";
import { ExternalLink, MapPin, Star, Timer } from "lucide-react";
import type { PizzaPlace } from "../types";
import { formatDistance, formatEta } from "../lib/geo";

interface PizzaCardProps {
  place: PizzaPlace;
  rank: number;
  style?: CSSProperties;
}

const PIZZA_EMOJIS = ["🍕", "🧀", "🫒", "🌶️", "🍅", "🥖"];

const ORDER_LABELS: Record<PizzaPlace["orderSource"], string> = {
  website: "Order",
  doordash: "DoorDash",
  ubereats: "Uber Eats",
  google: "Order",
};

export function PizzaCard({ place, rank, style }: PizzaCardProps) {
  const emoji = PIZZA_EMOJIS[rank % PIZZA_EMOJIS.length];

  return (
    <article
      className="animate-slide-up group flex flex-col overflow-hidden rounded-2xl border border-slice-charcoal/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slice-red/10"
      style={style}
    >
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-slice-cheese/40 via-slice-orange/20 to-slice-red/10">
        <span className="text-5xl transition group-hover:scale-110">{emoji}</span>
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-slice-charcoal shadow-sm">
          #{rank}
        </div>
        {place.isOpen === true && (
          <div className="absolute right-3 top-3 rounded-full bg-slice-olive px-2 py-0.5 text-xs font-bold text-white">
            Open
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold text-slice-charcoal line-clamp-1">
          {place.name}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slice-muted">
          <span className="inline-flex items-center gap-0.5 font-semibold text-slice-charcoal">
            <Star className="h-3 w-3 fill-slice-cheese text-slice-cheese" />
            {place.score}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {formatDistance(place.distanceMiles)}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5">
            <Timer className="h-3 w-3" />
            {formatEta(place.distanceMiles)}
          </span>
        </div>

        <p className="mt-2 flex-1 text-xs text-slice-muted line-clamp-2">
          {place.address}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.delivery && (
            <span className="rounded-full bg-slice-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slice-red">
              Delivery
            </span>
          )}
          {place.takeaway && (
            <span className="rounded-full bg-slice-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slice-orange">
              Pickup
            </span>
          )}
          <span className="rounded-full bg-slice-cheese/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slice-crust">
            {place.cuisine}
          </span>
        </div>

        <a
          href={place.orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slice-charcoal py-2.5 text-sm font-bold text-white transition group-hover:bg-slice-red"
        >
          {ORDER_LABELS[place.orderSource]}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}
