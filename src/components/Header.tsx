import {
  MapPin,
  Pizza,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

interface HeaderProps {
  locationLabel: string;
  onLocate: () => void;
  isLocating: boolean;
}

export function Header({ locationLabel, onLocate, isLocating }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slice-red/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slice-red text-white shadow-lg shadow-slice-red/30">
            <Pizza className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-slice-charcoal">
              Slice<span className="text-slice-red">App</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slice-muted">
              Pizza delivery, perfected
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLocate}
          disabled={isLocating}
          className="hidden items-center gap-2 rounded-full border border-slice-red/20 bg-slice-cream px-4 py-2 text-sm font-medium text-slice-charcoal transition hover:border-slice-red/40 hover:bg-white disabled:opacity-60 sm:flex"
        >
          <MapPin className="h-4 w-4 text-slice-red" />
          <span className="max-w-[180px] truncate">{locationLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 text-slice-muted transition hover:bg-slice-cream hover:text-slice-charcoal"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-slice-muted transition hover:bg-slice-cream hover:text-slice-charcoal"
            aria-label="Orders"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full bg-slice-charcoal p-2 text-white transition hover:bg-slice-red"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
