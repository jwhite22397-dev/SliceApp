import { useEffect, useState } from "react";
import { PinIcon } from "./icons";

interface LocationModalProps {
  open: boolean;
  currentLabel: string;
  locating: boolean;
  geoError: string | null;
  onClose: () => void;
  onUseMyLocation: () => void;
  onSubmitAddress: (address: string) => void;
}

export function LocationModal({
  open,
  currentLabel,
  locating,
  geoError,
  onClose,
  onUseMyLocation,
  onSubmitAddress,
}: LocationModalProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmitAddress(trimmed);
  };

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="loc-form">
          <h2>Where should we deliver? 🍕</h2>
          <p>
            {currentLabel
              ? `Currently searching near ${currentLabel}.`
              : "Set a location so we can find the closest, tastiest pizza."}
          </p>

          <div className="loc-input">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Enter address, city, or ZIP"
            />
            <button className="big-btn" onClick={submit}>
              Go
            </button>
          </div>

          <button
            className="loc-locate"
            onClick={onUseMyLocation}
            disabled={locating}
          >
            <PinIcon size={16} />
            {locating ? "Locating you…" : "Use my current location"}
          </button>

          {geoError && <div className="loc-error">{geoError}</div>}
        </div>
      </div>
    </div>
  );
}
