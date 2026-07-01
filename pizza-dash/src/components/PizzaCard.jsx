import { Clock, MapPin, Phone, ExternalLink, Star, ChevronRight, Zap } from 'lucide-react';
import StarRating from './StarRating';

// Pizza gradient backgrounds (cycling through a set)
const CARD_GRADIENTS = [
  'from-red-500 to-orange-500',
  'from-orange-600 to-yellow-500',
  'from-red-700 to-red-500',
  'from-amber-600 to-orange-500',
  'from-rose-600 to-red-500',
];

const PIZZA_ICONS = ['🍕', '🔥', '🍅', '🧀', '⭐', '🏆'];

export default function PizzaCard({ place, rank, isTopPick }) {
  const gradient = CARD_GRADIENTS[(rank - 1) % CARD_GRADIENTS.length];
  const icon = PIZZA_ICONS[(rank - 1) % PIZZA_ICONS.length];

  const handleOrder = (url, e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card animate-slide-up group" style={{ animationDelay: `${(rank - 1) * 80}ms` }}>
      {/* Image / Hero area */}
      <div className={`relative bg-gradient-to-br ${gradient} h-40 flex items-center justify-center overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-2 text-6xl opacity-30">🍕</div>
          <div className="absolute bottom-2 left-2 text-4xl opacity-20">🌿</div>
        </div>

        {/* Rank badge */}
        <div className="absolute top-3 left-3">
          {isTopPick ? (
            <span className="bg-pizza-orange text-white text-xs font-bold px-3 py-1 
                             rounded-full shadow-lg flex items-center gap-1">
              <Zap size={12} />
              #1 Best Pick
            </span>
          ) : (
            <span className="bg-black/30 text-white text-xs font-bold px-3 py-1 
                             rounded-full backdrop-blur-sm">
              #{rank}
            </span>
          )}
        </div>

        {/* Open/Closed badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            place.isOpen
              ? 'bg-green-500/80 text-white'
              : 'bg-gray-500/80 text-white'
          } backdrop-blur-sm`}>
            {place.isOpen ? '● Open' : '● Closed'}
          </span>
        </div>

        {/* Center pizza emoji */}
        <div className="text-7xl drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Delivery fee chip */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm 
                        text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
          {place.deliveryFee === 'Free' ? (
            <span className="text-green-600">Free Delivery</span>
          ) : (
            <span>{place.deliveryFee} delivery</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and category */}
        <div className="mb-2">
          <h3 className="font-display font-bold text-gray-900 text-lg leading-tight truncate">
            {place.name}
          </h3>
          <span className="text-xs text-pizza-brown-light font-medium uppercase tracking-wide">
            {place.category}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <StarRating rating={place.rating} />
            <span className="font-semibold text-gray-800 ml-1">{place.rating}</span>
            <span className="text-gray-400">({place.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-pizza-red" />
            <span className="font-medium">{place.deliveryMinutes}–{place.deliveryMinutes + 10} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-pizza-red" />
            <span className="font-medium">{place.distanceMiles} mi away</span>
          </div>
        </div>

        {/* Address */}
        {place.address && (
          <p className="text-xs text-gray-400 truncate mb-3 flex items-center gap-1">
            <MapPin size={11} className="flex-shrink-0" />
            {place.address}
          </p>
        )}

        {/* Phone */}
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-pizza-brown-light hover:text-pizza-red flex items-center gap-1 mb-3 transition-colors"
          >
            <Phone size={11} />
            {place.phone}
          </a>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {/* Primary Order Button */}
          <button
            onClick={(e) => handleOrder(place.doordashUrl, e)}
            className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
          >
            🍕 Order on DoorDash
            <ExternalLink size={14} />
          </button>

          {/* Secondary options */}
          <div className="flex gap-2">
            <button
              onClick={(e) => handleOrder(place.uberEatsUrl, e)}
              className="flex-1 bg-gray-900 text-white text-xs font-semibold py-2 px-3 
                         rounded-full hover:bg-gray-700 active:scale-95 transition-all 
                         duration-200 flex items-center justify-center gap-1.5"
            >
              🚗 Uber Eats
            </button>
            <button
              onClick={(e) => handleOrder(place.mapsUrl, e)}
              className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 px-3 
                         rounded-full hover:bg-blue-700 active:scale-95 transition-all 
                         duration-200 flex items-center justify-center gap-1.5"
            >
              📍 Google Maps
            </button>
          </div>

          {/* Website link if available */}
          {place.tags?.website && (
            <a
              href={place.tags.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full btn-secondary text-sm py-2 flex items-center justify-center 
                         gap-2 border border-pizza-red text-pizza-red hover:bg-pizza-cream
                         rounded-full transition-colors font-semibold"
            >
              🌐 Official Website
              <ChevronRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
