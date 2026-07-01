import { Zap, ExternalLink, Star, Clock, MapPin } from 'lucide-react';
import StarRating from './StarRating';

export default function TopPickBanner({ place }) {
  if (!place) return null;

  const openOrder = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <div className="relative bg-gradient-to-r from-pizza-red via-pizza-red-dark to-pizza-brown 
                    rounded-3xl overflow-hidden shadow-2xl mb-10 animate-fade-in">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 text-9xl translate-x-8 -translate-y-4">🍕</div>
        <div className="absolute bottom-0 left-1/3 text-7xl translate-y-4">🔥</div>
      </div>

      {/* Gold shimmer bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-pizza-orange text-white text-xs font-bold px-3 py-1 
                               rounded-full flex items-center gap-1 shadow-lg">
                <Zap size={12} />
                TOP PIZZA PICK NEAR YOU
              </span>
              {place.isOpen && (
                <span className="bg-green-500/20 border border-green-400/30 text-green-300 
                                 text-xs font-semibold px-2 py-0.5 rounded-full">
                  ● Open Now
                </span>
              )}
            </div>

            <h2 className="font-display font-black text-white text-3xl md:text-4xl mb-2 truncate">
              {place.name}
            </h2>

            <p className="text-red-200 text-sm mb-4 font-medium">{place.category}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <StarRating rating={place.rating} />
                <span className="text-white font-bold">{place.rating}</span>
                <span className="text-red-300">({place.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-200">
                <Clock size={14} className="text-pizza-orange-light" />
                <span className="font-medium">{place.deliveryMinutes}–{place.deliveryMinutes + 10} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-200">
                <MapPin size={14} className="text-pizza-orange-light" />
                <span className="font-medium">{place.distanceMiles} mi away</span>
              </div>
              <div className="text-red-200 font-medium">
                {place.deliveryFee === 'Free' ? (
                  <span className="text-green-300 font-bold">Free Delivery 🎉</span>
                ) : (
                  <span>{place.deliveryFee} delivery</span>
                )}
              </div>
            </div>

            {place.address && (
              <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                <MapPin size={11} />
                {place.address}
              </p>
            )}
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => openOrder(place.doordashUrl)}
              className="bg-white text-pizza-red font-bold text-base px-8 py-4 rounded-full 
                         shadow-xl hover:bg-pizza-cream active:scale-95 transition-all duration-200
                         flex items-center justify-center gap-2 min-w-[200px] hover:shadow-2xl"
            >
              🍕 Order Now
              <ExternalLink size={16} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => openOrder(place.uberEatsUrl)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 
                           text-white text-sm font-semibold py-2.5 px-4 rounded-full 
                           active:scale-95 transition-all duration-200 text-center"
              >
                🚗 Uber Eats
              </button>
              <button
                onClick={() => openOrder(place.mapsUrl)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 
                           text-white text-sm font-semibold py-2.5 px-4 rounded-full 
                           active:scale-95 transition-all duration-200 text-center"
              >
                📍 Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
