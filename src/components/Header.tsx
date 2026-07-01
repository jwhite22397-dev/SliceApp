import { BagIcon, ChevronDown, PinIcon, SearchIcon } from "./icons";

interface HeaderProps {
  locationLabel: string;
  query: string;
  onQueryChange: (v: string) => void;
  onOpenLocation: () => void;
}

export function Header({
  locationLabel,
  query,
  onQueryChange,
  onOpenLocation,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__row">
        <div className="brand">
          <img
            src={`${import.meta.env.BASE_URL}pizza.svg`}
            alt=""
            className="brand__logo"
          />
          <span>
            Slice<span className="brand__dash">App</span>
          </span>
        </div>

        <button className="location-pill" onClick={onOpenLocation}>
          <PinIcon size={16} />
          <span>{locationLabel || "Set your address"}</span>
          <ChevronDown size={15} className="chev" />
        </button>

        <label className="search">
          <SearchIcon size={18} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search pizzerias, toppings, deals…"
            aria-label="Search pizza places"
          />
        </label>

        <div className="header__actions">
          <button className="pill-btn pill-btn--ghost">Sign In</button>
          <button className="cart-btn">
            <BagIcon size={16} />
            <span>0</span>
          </button>
        </div>
      </div>
    </header>
  );
}
