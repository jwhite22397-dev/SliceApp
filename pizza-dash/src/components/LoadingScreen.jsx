export default function LoadingScreen({ message = 'Finding the best pizza near you...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
      {/* Spinning pizza */}
      <div className="relative">
        <div className="text-8xl pizza-loader">🍕</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 
                        bg-black/10 rounded-full blur-sm animate-pulse" />
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p className="text-pizza-red font-display font-bold text-2xl mb-2">{message}</p>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-pizza-red animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Loading steps */}
      <div className="space-y-2 text-sm text-gray-500">
        <p className="flex items-center gap-2 animate-pulse">
          <span>📍</span> Getting your location
        </p>
        <p className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '500ms' }}>
          <span>🔍</span> Searching nearby pizza spots
        </p>
        <p className="flex items-center gap-2 animate-pulse" style={{ animationDelay: '1000ms' }}>
          <span>⭐</span> Ranking by quality & proximity
        </p>
      </div>
    </div>
  );
}
