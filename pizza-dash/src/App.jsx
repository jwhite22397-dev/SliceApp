import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TopPickBanner from './components/TopPickBanner';
import PizzaCard from './components/PizzaCard';
import FilterBar from './components/FilterBar';
import LoadingScreen from './components/LoadingScreen';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { useGeolocation } from './hooks/useGeolocation';
import { fetchNearbyPizzaPlaces } from './utils/overpass';

const APP_STATE = {
  IDLE: 'idle',
  LOCATING: 'locating',
  FETCHING: 'fetching',
  SUCCESS: 'success',
  ERROR: 'error',
};

function reverseGeocode(lat, lon) {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`,
    { headers: { 'Accept-Language': 'en' } }
  )
    .then((r) => r.json())
    .then((d) => {
      const addr = d.address || {};
      return (
        addr.neighbourhood ||
        addr.suburb ||
        addr.city_district ||
        addr.town ||
        addr.city ||
        addr.county ||
        'your area'
      );
    })
    .catch(() => 'your area');
}

export default function App() {
  const [appState, setAppState] = useState(APP_STATE.IDLE);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [sortMode, setSortMode] = useState('best');
  const [filterMode, setFilterMode] = useState('All');

  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // When location is obtained, fetch pizza places
  useEffect(() => {
    if (!location) return;
    setAppState(APP_STATE.FETCHING);

    // Get human-readable location name in parallel
    reverseGeocode(location.lat, location.lon).then(setLocationName);

    fetchNearbyPizzaPlaces(location.lat, location.lon)
      .then((results) => {
        if (results.length === 0) {
          setError('No pizza places found within 5 miles. Try a different location.');
          setAppState(APP_STATE.ERROR);
        } else {
          setPlaces(results);
          setAppState(APP_STATE.SUCCESS);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch pizza places. Please check your connection and try again.');
        setAppState(APP_STATE.ERROR);
      });
  }, [location]);

  // Handle geolocation errors
  useEffect(() => {
    if (geoError) {
      setError(geoError);
      setAppState(APP_STATE.ERROR);
    }
  }, [geoError]);

  // When user clicks "Find Pizza Near Me"
  const handleDetectLocation = useCallback(() => {
    setAppState(APP_STATE.LOCATING);
    setError(null);
    setPlaces([]);
    requestLocation();
  }, [requestLocation]);

  // Filtered and sorted places
  const displayedPlaces = useMemo(() => {
    let result = [...places];

    // Apply filter
    if (filterMode === 'Open Now') {
      result = result.filter((p) => p.isOpen);
    } else if (filterMode === 'Free Delivery') {
      result = result.filter((p) => p.deliveryFee === 'Free');
    } else if (filterMode === 'Under 30 min') {
      result = result.filter((p) => p.deliveryMinutes < 30);
    } else if (filterMode === 'Top Rated') {
      result = result.filter((p) => p.rating >= 4.0);
    }

    // Apply sort
    if (sortMode === 'distance') {
      result.sort((a, b) => a.distanceMiles - b.distanceMiles);
    } else if (sortMode === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === 'delivery') {
      result.sort((a, b) => a.deliveryMinutes - b.deliveryMinutes);
    } else if (sortMode === 'fee') {
      const feeVal = (p) => (p.deliveryFee === 'Free' ? 0 : parseFloat(p.deliveryFee));
      result.sort((a, b) => feeVal(a) - feeVal(b));
    }
    // 'best' keeps original weighted order

    return result;
  }, [places, sortMode, filterMode]);

  const isLoading = appState === APP_STATE.LOCATING || appState === APP_STATE.FETCHING;
  const loadingMessage =
    appState === APP_STATE.LOCATING
      ? 'Getting your location...'
      : 'Searching for pizza near you...';

  const topPick = displayedPlaces[0] || null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        locationName={locationName}
        onChangeLocation={handleDetectLocation}
      />

      {/* Hero — shown only before results */}
      {appState !== APP_STATE.SUCCESS && (
        <HeroSection
          onDetectLocation={handleDetectLocation}
          isLoading={isLoading}
        />
      )}

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Loading state */}
        {isLoading && (
          <LoadingScreen message={loadingMessage} />
        )}

        {/* Error state */}
        {appState === APP_STATE.ERROR && (
          <ErrorMessage message={error} onRetry={handleDetectLocation} />
        )}

        {/* Success state */}
        {appState === APP_STATE.SUCCESS && (
          <div className="animate-fade-in">
            {/* Location header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
                  🍕 Best Pizza near{' '}
                  <span className="text-pizza-red">{locationName}</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Found <strong>{places.length}</strong> pizza spots within 5 miles — sorted by 
                  rating & proximity
                </p>
              </div>
              <button
                onClick={handleDetectLocation}
                className="flex items-center gap-2 text-sm text-pizza-red font-semibold 
                           hover:text-pizza-red-dark transition-colors"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* Top pick banner */}
            {topPick && <TopPickBanner place={topPick} />}

            {/* Sticky filter/sort bar */}
            <FilterBar
              count={displayedPlaces.length}
              onSortChange={setSortMode}
              onFilterChange={setFilterMode}
            />

            {/* Grid of pizza cards */}
            {displayedPlaces.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">🍕</p>
                <p className="text-lg font-medium">No results match your filters.</p>
                <p className="text-sm mt-2">Try removing some filters to see more options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {displayedPlaces.map((place, idx) => (
                  <PizzaCard
                    key={place.id}
                    place={place}
                    rank={idx + 1}
                    isTopPick={idx === 0 && filterMode === 'All' && sortMode === 'best'}
                  />
                ))}
              </div>
            )}

            {/* Attribution */}
            <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <MapPin size={11} />
              <span>
                Pizza place data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">OpenStreetMap</a> contributors
              </span>
            </div>
          </div>
        )}

        {/* Idle state — just the hero does the work */}
        {appState === APP_STATE.IDLE && (
          <div className="py-10 text-center">
            <p className="text-gray-400 text-sm">
              Click the button above to find pizza near you
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
