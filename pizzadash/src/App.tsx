import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Coordinates = {
  lat: number
  lon: number
}

type PizzaPlace = {
  id: string
  name: string
  address: string
  distanceKm: number
  pizzaScore: number
  etaMinutes: number
  orderUrl: string
  hasDirectOrderLink: boolean
}

type OverpassElement = {
  id: number
  lat?: number
  lon?: number
  center?: {
    lat: number
    lon: number
  }
  tags?: Record<string, string>
}

const DEFAULT_LOCATION: Coordinates = {
  lat: 40.758,
  lon: -73.9855,
}

const DEFAULT_LOCATION_LABEL = 'Times Square, New York (demo location)'

const RADIUS_OPTIONS = [
  { label: '2 km (walkable)', value: 2000 },
  { label: '5 km (quick delivery)', value: 5000 },
  { label: '8 km (balanced)', value: 8000 },
  { label: '12 km (max choices)', value: 12000 },
]

function haversineDistanceKm(from: Coordinates, to: Coordinates): number {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const latDelta = toRadians(to.lat - from.lat)
  const lonDelta = toRadians(to.lon - from.lon)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function calculatePizzaScore(
  distanceKm: number,
  hasDirectOrderLink: boolean,
  cuisineTag: string | undefined,
  restaurantName: string
): number {
  const distanceScore = Math.max(0, 72 - distanceKm * 10)
  const orderBonus = hasDirectOrderLink ? 16 : 0
  const cuisineBonus = cuisineTag?.toLowerCase().includes('pizza') ? 8 : 0
  const consistencyBonus = (hashString(restaurantName) % 16) + 4

  return Math.min(
    100,
    Math.max(1, Math.round(distanceScore + orderBonus + cuisineBonus + consistencyBonus))
  )
}

function estimateEtaMinutes(distanceKm: number, restaurantName: string): number {
  const randomFactor = hashString(restaurantName) % 7
  return Math.max(12, Math.round(14 + distanceKm * 5.5 + randomFactor))
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

function formatAddress(tags: Record<string, string>): string {
  const streetParts = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean)
  const cityParts = [tags['addr:city'], tags['addr:state']].filter(Boolean)
  const pieces = [streetParts.join(' '), cityParts.join(', ')].filter(Boolean)

  return pieces.length > 0 ? pieces.join(' • ') : 'Address unavailable'
}

function buildOrderUrl(tags: Record<string, string>, placeName: string): string {
  return (
    tags.website ??
    tags['contact:website'] ??
    tags.url ??
    `https://www.doordash.com/search/store/${encodeURIComponent(placeName)}/`
  )
}

function buildOverpassQuery(location: Coordinates, radiusMeters: number): string {
  return `[out:json][timeout:25];
(
  node["name"]["amenity"~"restaurant|fast_food"]["cuisine"~"pizza"](around:${radiusMeters},${location.lat},${location.lon});
  node["name"]["shop"="pizza"](around:${radiusMeters},${location.lat},${location.lon});
  way["name"]["amenity"~"restaurant|fast_food"]["cuisine"~"pizza"](around:${radiusMeters},${location.lat},${location.lon});
  way["name"]["shop"="pizza"](around:${radiusMeters},${location.lat},${location.lon});
  relation["name"]["amenity"~"restaurant|fast_food"]["cuisine"~"pizza"](around:${radiusMeters},${location.lat},${location.lon});
  relation["name"]["shop"="pizza"](around:${radiusMeters},${location.lat},${location.lon});
);
out center tags 40;`
}

async function fetchNearbyPizza(
  location: Coordinates,
  radiusMeters: number
): Promise<PizzaPlace[]> {
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: buildOverpassQuery(location, radiusMeters),
  })

  if (!response.ok) {
    throw new Error('Could not load pizza places right now.')
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] }
  const elements = payload.elements ?? []
  const uniquePlaces = new Map<string, PizzaPlace>()

  for (const element of elements) {
    const tags = element.tags ?? {}
    const placeName = tags.name?.trim()
    const lat = element.lat ?? element.center?.lat
    const lon = element.lon ?? element.center?.lon

    if (!placeName || typeof lat !== 'number' || typeof lon !== 'number') {
      continue
    }

    const key = `${placeName.toLowerCase()}-${lat.toFixed(4)}-${lon.toFixed(4)}`
    const distanceKm = haversineDistanceKm(location, { lat, lon })
    const orderUrl = buildOrderUrl(tags, placeName)
    const hasDirectOrderLink = Boolean(
      tags.website ?? tags['contact:website'] ?? tags.url
    )
    const pizzaScore = calculatePizzaScore(
      distanceKm,
      hasDirectOrderLink,
      tags.cuisine,
      placeName
    )

    uniquePlaces.set(key, {
      id: `${element.id}-${key}`,
      name: placeName,
      address: formatAddress(tags),
      distanceKm,
      pizzaScore,
      etaMinutes: estimateEtaMinutes(distanceKm, placeName),
      orderUrl,
      hasDirectOrderLink,
    })
  }

  return [...uniquePlaces.values()]
    .sort((first, second) => {
      if (second.pizzaScore !== first.pizzaScore) {
        return second.pizzaScore - first.pizzaScore
      }
      return first.distanceKm - second.distanceKm
    })
    .slice(0, 12)
}

function App() {
  const [location, setLocation] = useState<Coordinates>(DEFAULT_LOCATION)
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL)
  const [hasLiveLocation, setHasLiveLocation] = useState(false)
  const [radiusMeters, setRadiusMeters] = useState(5000)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [places, setPlaces] = useState<PizzaPlace[]>([])
  const [lastFetchedAt, setLastFetchedAt] = useState('')

  const bestPlace = useMemo(() => places[0], [places])

  const loadNearbyPizza = async (nextLocation: Coordinates, radius: number) => {
    setIsLoading(true)
    setError('')

    try {
      const nearbyPizza = await fetchNearbyPizza(nextLocation, radius)
      setPlaces(nearbyPizza)

      if (nearbyPizza.length === 0) {
        setError('No pizza spots found in that radius. Try increasing the search range.')
      }
    } catch {
      setError(
        'Live pizza lookup failed. Please retry in a moment or switch to a larger radius.'
      )
      setPlaces([])
    } finally {
      setLastFetchedAt(new Date().toLocaleTimeString())
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNearbyPizza(DEFAULT_LOCATION, radiusMeters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshWithCurrentSettings = async () => {
    await loadNearbyPizza(location, radiusMeters)
  }

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser. Showing demo location instead.')
      setHasLiveLocation(false)
      setLocation(DEFAULT_LOCATION)
      setLocationLabel(DEFAULT_LOCATION_LABEL)
      await loadNearbyPizza(DEFAULT_LOCATION, radiusMeters)
      return
    }

    setIsLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const preciseLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }

        setLocation(preciseLocation)
        setLocationLabel(
          `Live location (${preciseLocation.lat.toFixed(3)}, ${preciseLocation.lon.toFixed(3)})`
        )
        setHasLiveLocation(true)
        await loadNearbyPizza(preciseLocation, radiusMeters)
      },
      async () => {
        setHasLiveLocation(false)
        setLocation(DEFAULT_LOCATION)
        setLocationLabel(DEFAULT_LOCATION_LABEL)
        setError('Location access was denied. Using demo location instead.')
        await loadNearbyPizza(DEFAULT_LOCATION, radiusMeters)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-badge">Slice</span>
          <p className="brand-name">SliceSprint</p>
        </div>
        <button className="button secondary" type="button" onClick={useMyLocation}>
          Use my location
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">DoorDash-style pizza finder</p>
        <h1>Find the best closest pizza place and order in one tap.</h1>
        <p className="subtext">
          SliceSprint checks pizza spots around you, ranks them by proximity plus pizza
          quality signals, and links directly to an order page.
        </p>
      </section>

      <section className="controls">
        <div>
          <p className="control-label">Current area</p>
          <p className="control-value">{locationLabel}</p>
        </div>
        <label className="radius-selector">
          <span className="control-label">Delivery radius</span>
          <select
            value={radiusMeters}
            onChange={(event) => setRadiusMeters(Number(event.target.value))}
          >
            {RADIUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button className="button" type="button" onClick={refreshWithCurrentSettings}>
          Refresh list
        </button>
      </section>

      {bestPlace ? (
        <section className="best-match">
          <p className="control-label">Top recommendation</p>
          <h2>{bestPlace.name}</h2>
          <div className="best-meta">
            <span>{formatDistance(bestPlace.distanceKm)} away</span>
            <span>{bestPlace.etaMinutes} min ETA</span>
            <span>Pizza score {bestPlace.pizzaScore}/100</span>
            <span>{bestPlace.hasDirectOrderLink ? 'Direct ordering' : 'DoorDash link'}</span>
          </div>
          <a
            className="button best-link"
            href={bestPlace.orderUrl}
            target="_blank"
            rel="noreferrer"
          >
            Order from {bestPlace.name}
          </a>
        </section>
      ) : null}

      {error ? <p className="status error">{error}</p> : null}
      {isLoading ? <p className="status">Finding nearby pizza places...</p> : null}
      {!hasLiveLocation ? (
        <p className="status hint">
          Tip: allow location access to get truly “near me” recommendations.
        </p>
      ) : null}
      {lastFetchedAt ? <p className="status hint">Last updated at {lastFetchedAt}</p> : null}

      <section className="grid">
        {places.map((place, index) => (
          <article className="card" key={place.id}>
            <p className="rank">#{index + 1} pick</p>
            <h3>{place.name}</h3>
            <p className="address">{place.address}</p>
            <div className="meta">
              <span>{formatDistance(place.distanceKm)}</span>
              <span>{place.etaMinutes} min</span>
              <span>Score {place.pizzaScore}</span>
            </div>
            <a
              className="button card-link"
              href={place.orderUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open order page
            </a>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
