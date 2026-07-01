import { MapPin, ShoppingBag, Search } from 'lucide-react';

export default function Header({ locationName, onChangeLocation }) {
  return (
    <header className="bg-pizza-red shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-3xl leading-none">🍕</span>
            <div>
              <span className="text-white font-display font-bold text-xl tracking-tight block leading-none">
                PizzaDash
              </span>
              <span className="text-red-200 text-xs font-medium">Hot & Fast Delivery</span>
            </div>
          </div>

          {/* Location Bar */}
          <button
            onClick={onChangeLocation}
            className="flex items-center gap-2 bg-pizza-red-dark hover:bg-pizza-red-light 
                       text-white px-4 py-2 rounded-full transition-colors duration-200 
                       text-sm font-medium flex-1 max-w-xs min-w-0"
          >
            <MapPin size={14} className="flex-shrink-0 text-red-200" />
            <span className="truncate text-left">
              {locationName || 'Detect my location'}
            </span>
          </button>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pizza..."
                className="pl-9 pr-4 py-2 rounded-full text-sm bg-white/10 text-white 
                           placeholder-red-200 border border-white/20 focus:outline-none 
                           focus:bg-white/20 w-36 focus:w-48 transition-all duration-300"
              />
            </div>
            <button className="relative p-2 text-white hover:text-red-200 transition-colors">
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 bg-pizza-orange text-white text-xs 
                               w-5 h-5 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
