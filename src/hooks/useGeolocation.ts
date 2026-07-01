import { useCallback, useState } from "react";
import type { Coords } from "../lib/types";

interface GeoState {
  coords: Coords | null;
  status: "idle" | "locating" | "granted" | "denied" | "unavailable";
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    coords: null,
    status: "idle",
    error: null,
  });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        coords: null,
        status: "unavailable",
        error: "Geolocation isn't supported in this browser.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "locating", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          status: "granted",
          error: null,
        });
      },
      (err) => {
        setState({
          coords: null,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable",
          error:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied. Enter an address instead."
              : "Couldn't grab your location. Enter an address instead.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, locate } as const;
}
