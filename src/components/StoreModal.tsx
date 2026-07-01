import { useEffect } from "react";
import { formatDistance } from "../lib/distance";
import type { PizzaPlace } from "../lib/types";
import { StarIcon } from "./icons";

interface StoreModalProps {
  place: PizzaPlace | null;
  mode: "delivery" | "pickup";
  onClose: () => void;
}

export function StoreModal({ place, mode, onClose }: StoreModalProps) {
  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place, onClose]);

  if (!place) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.coords.lat},${place.coords.lon}`;
  const eta =
    mode === "pickup"
      ? `${Math.max(place.etaMin - 8, 5)}–${Math.max(place.etaMax - 12, 12)} min pickup`
      : `${place.etaMin}–${place.etaMax} min delivery`;

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__hero">
          <span>{place.art}</span>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="modal__body">
          <h2 className="modal__name">{place.name}</h2>
          <div className="modal__meta">
            <span>
              <StarIcon size={13} /> {place.rating.toFixed(1)} (
              {place.ratingCount.toLocaleString()} ratings)
            </span>
            <span>· {"$".repeat(place.priceTier)}</span>
            <span>· {place.cuisineTags.join(", ")}</span>
          </div>

          <div className="modal__info">
            <div className="row">
              <span className="k">Distance</span>
              <span>{formatDistance(place.distanceKm)} from you</span>
            </div>
            <div className="row">
              <span className="k">{mode === "pickup" ? "Pickup" : "Delivery"}</span>
              <span>{eta}</span>
            </div>
            <div className="row">
              <span className="k">Delivery fee</span>
              <span>
                {place.deliveryFee === 0
                  ? "Free"
                  : `$${place.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {place.address && (
              <div className="row">
                <span className="k">Address</span>
                <span>{place.address}</span>
              </div>
            )}
            {place.phone && (
              <div className="row">
                <span className="k">Phone</span>
                <a href={`tel:${place.phone}`}>{place.phone}</a>
              </div>
            )}
            <div className="row">
              <span className="k">Status</span>
              <span>
                {place.isOpenGuess ? "Likely open now" : "May be closed"}
                {place.ordersOnline ? " · Takes online orders" : ""}
              </span>
            </div>
          </div>

          <div className="modal__order">
            <a
              className="big-btn"
              href={place.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {place.website ? "Order on their site →" : "Find order page →"}
            </a>
            <a
              className="secondary"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Map
            </a>
          </div>
          {!place.website && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 12.5,
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              This pizzeria didn't publish a direct order link, so we'll take you
              to their online ordering search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
