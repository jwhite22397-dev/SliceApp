import { MapPin, ChevronRight } from 'lucide-react';

export default function HeroSection({ onDetectLocation, isLoading }) {
  return (
    <section className="relative bg-gradient-to-br from-pizza-red via-pizza-red-dark to-pizza-brown overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 text-8xl">🍕</div>
        <div className="absolute top-16 right-12 text-6xl">🍅</div>
        <div className="absolute bottom-8 left-1/4 text-7xl">🧀</div>
        <div className="absolute bottom-4 right-8 text-5xl">🌿</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5">🍕</div>
      </div>

      {/* Pizza slice decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 
                        text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Delivery available near you
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-white text-4xl md:text-6xl lg:text-7xl 
                       leading-tight mb-4 drop-shadow-lg">
          The Best Pizza,
          <br />
          <span className="text-pizza-orange-light">Delivered Fast</span>
        </h1>

        <p className="text-red-100 text-lg md:text-xl max-w-xl mx-auto mb-10 font-light">
          Discover the highest-rated pizza spots near you and order directly. 
          Hot, fresh, and on its way in minutes.
        </p>

        {/* CTA Button */}
        <button
          onClick={onDetectLocation}
          disabled={isLoading}
          className="group inline-flex items-center gap-3 bg-white text-pizza-red font-bold 
                     text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-white/25 
                     hover:bg-pizza-cream active:scale-95 transition-all duration-300
                     disabled:opacity-70 disabled:cursor-not-allowed animate-pulse-red"
        >
          {isLoading ? (
            <>
              <span className="pizza-loader text-2xl">🍕</span>
              Finding pizza near you...
            </>
          ) : (
            <>
              <MapPin size={22} className="text-pizza-red-light group-hover:animate-bounce" />
              Find Pizza Near Me
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Social proof strip */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-red-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300">⭐⭐⭐⭐⭐</span>
            <span>50,000+ happy customers</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span>Average 28 min delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🍕</span>
            <span>500+ pizza joints</span>
          </div>
        </div>
      </div>
    </section>
  );
}
