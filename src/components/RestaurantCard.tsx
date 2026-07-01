import { formatDistance } from "../lib/distance";
import type { PizzaPlace } from "../lib/types";
import { StarIcon } from "./icons";

interface RestaurantCardProps {
  place: PizzaPlace;
  rank: number;
  mode: "delivery" | "pickup";
  onClick: (place: PizzaPlace) => void;
}

export function RestaurantCard({
  place,
  rank,
  mode,
  onClick,
}: RestaurantCardProps) {
  const eta =
    mode === "pickup"
      ? `${Math.max(place.etaMin - 8, 5)}–${Math.max(place.etaMax - 12, 12)} min`
      : `${place.etaMin}–${place.etaMax} min`;

  return (
    <button className="card" onClick={() => onClick(place)}>
      <div className="card__media">
        <span>{place.art}</span>
        {rank <= 3 && <span className="card__rank">#{rank}</span>}
        <span className="card__fav" aria-hidden="true">
          ♡
        </span>
        {place.promo && <span className="card__promo">{place.promo}</span>}
      </div>
      <div className="card__body">
        <div className="card__title-row">
          <span className="card__name">{place.name}</span>
          <span className="rating-badge">
            <StarIcon size={12} /> {place.rating.toFixed(1)}{" "}
            <span className="count">
              ({place.ratingCount.toLocaleString()})
            </span>
          </span>
        </div>
        <div className="card__meta">
          <span>{eta}</span>
          <span className="sep">{formatDistance(place.distanceKm)}</span>
          <span className="sep">
            {place.deliveryFee === 0 ? (
              <span className="free-deliv">Free delivery</span>
            ) : (
              `$${place.deliveryFee.toFixed(2)} delivery`
            )}
          </span>
        </div>
        <div className="card__meta">
          <span>{"$".repeat(place.priceTier)}</span>
          {!place.isOpenGuess && <span className="sep closed">Closed</span>}
          {place.ordersOnline && place.isOpenGuess && (
            <span className="sep">Orders online</span>
          )}
        </div>
        <div className="card__tags">
          {place.cuisineTags.slice(0, 3).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
