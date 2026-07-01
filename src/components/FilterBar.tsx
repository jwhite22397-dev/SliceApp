export type SortMode = "best" | "distance" | "rating" | "eta";
export type DeliveryMode = "delivery" | "pickup";

export interface FilterState {
  mode: DeliveryMode;
  sort: SortMode;
  freeDelivery: boolean;
  openNow: boolean;
  topRated: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="filters">
      <div className="toggle-group" role="tablist" aria-label="Order type">
        <button
          className={filters.mode === "delivery" ? "is-active" : ""}
          onClick={() => set({ mode: "delivery" })}
        >
          Delivery
        </button>
        <button
          className={filters.mode === "pickup" ? "is-active" : ""}
          onClick={() => set({ mode: "pickup" })}
        >
          Pickup
        </button>
      </div>

      <label className="chip">
        Sort:&nbsp;
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as SortMode })}
          aria-label="Sort results"
        >
          <option value="best">Best match</option>
          <option value="distance">Closest</option>
          <option value="rating">Top rated</option>
          <option value="eta">Fastest</option>
        </select>
      </label>

      <button
        className={`chip ${filters.freeDelivery ? "is-active" : ""}`}
        onClick={() => set({ freeDelivery: !filters.freeDelivery })}
      >
        🚴 Free delivery
      </button>
      <button
        className={`chip ${filters.openNow ? "is-active" : ""}`}
        onClick={() => set({ openNow: !filters.openNow })}
      >
        🟢 Open now
      </button>
      <button
        className={`chip ${filters.topRated ? "is-active" : ""}`}
        onClick={() => set({ topRated: !filters.topRated })}
      >
        ⭐ 4.5+ rated
      </button>
    </div>
  );
}
