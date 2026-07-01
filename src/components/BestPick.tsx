import { formatDistance } from "../lib/distance";
import type { PizzaPlace } from "../lib/types";
import { StarIcon } from "./icons";

interface BestPickProps {
  place: PizzaPlace;
  mode: "delivery" | "pickup";
  onView: (place: PizzaPlace) => void;
}

export function BestPick({ place, mode, onView }: BestPickProps) {
  const eta =
    mode === "pickup"
      ? `${Math.max(place.etaMin - 8, 5)}–${Math.max(place.etaMax - 12, 12)} min pickup`
      : `${place.etaMin}–${place.etaMax} min`;

  return (
    <section className="bestpick" aria-label="Best pizza place near you">
      <div className="bestpick__art">{place.art}</div>
      <div className="bestpick__body">
        <span className="bestpick__badge">🏆 Best pick near you</span>
        <h2 className="bestpick__name">{place.name}</h2>
        <div className="bestpick__meta">
          <span>
            <StarIcon size={14} /> {place.rating.toFixed(1)} (
            {place.ratingCount.toLocaleString()})
          </span>
          <span className="dot">{formatDistance(place.distanceKm)} away</span>
          <span className="dot">{eta}</span>
          <span className="dot">
            {place.deliveryFee === 0
              ? "Free delivery"
              : `$${place.deliveryFee.toFixed(2)} delivery`}
          </span>
        </div>
        <div>
          <a
            className="bestpick__cta"
            href={place.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Order now →
          </a>
          <button
            className="bestpick__secondary"
            onClick={() => onView(place)}
          >
            See details
          </button>
        </div>
      </div>
    </section>
  );
}
