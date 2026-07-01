const demoLocations = [
  { name: "New York, NY", latitude: 40.73061, longitude: -73.935242 },
  { name: "Chicago, IL", latitude: 41.878113, longitude: -87.629799 },
  { name: "San Francisco, CA", latitude: 37.774929, longitude: -122.419418 },
  { name: "Austin, TX", latitude: 30.267153, longitude: -97.743057 },
  { name: "Seattle, WA", latitude: 47.606209, longitude: -122.332071 },
];

const fallbackPizzerias = [
  {
    name: "Joe's Pizza",
    city: "New York, NY",
    latitude: 40.730497,
    longitude: -74.00222,
    rating: 4.7,
    orderUrl: "https://www.joespizzanyc.com/",
    description: "Classic New York slices with a fast, no-frills counter vibe.",
  },
  {
    name: "Lou Malnati's Pizzeria",
    city: "Chicago, IL",
    latitude: 41.890358,
    longitude: -87.633704,
    rating: 4.6,
    orderUrl: "https://www.loumalnatis.com/order-online",
    description: "Buttery deep dish, crisp edges, and Chicago pizza heritage.",
  },
  {
    name: "Tony's Pizza Napoletana",
    city: "San Francisco, CA",
    latitude: 37.800332,
    longitude: -122.409053,
    rating: 4.6,
    orderUrl: "https://tonyspizzanapoletana.com/",
    description: "Award-winning pies spanning Neapolitan, coal-fired, and more.",
  },
  {
    name: "Home Slice Pizza",
    city: "Austin, TX",
    latitude: 30.249497,
    longitude: -97.749016,
    rating: 4.7,
    orderUrl: "https://homeslicepizza.com/",
    description: "New York-style pizza with Austin energy and big slice appeal.",
  },
  {
    name: "Delancey",
    city: "Seattle, WA",
    latitude: 47.69036,
    longitude: -122.371479,
    rating: 4.6,
    orderUrl: "https://www.delanceyseattle.com/",
    description: "Wood-fired neighborhood pies with seasonal toppings.",
  },
];

const locationSelect = document.querySelector("#locationSelect");
const findPizzaButton = document.querySelector("#findPizzaButton");
const statusMessage = document.querySelector("#statusMessage");
const bestMatch = document.querySelector("#bestMatch");
const resultsList = document.querySelector("#resultsList");

for (const location of demoLocations) {
  const option = document.createElement("option");
  option.value = location.name;
  option.textContent = location.name;
  locationSelect.append(option);
}

findPizzaButton.addEventListener("click", findPizza);

async function findPizza() {
  const selectedDemo = demoLocations.find(
    (location) => location.name === locationSelect.value,
  );

  setLoading(true);

  try {
    const origin = selectedDemo ?? (await getCurrentPosition());
    updateStatus(
      selectedDemo
        ? `Scouting pizza near ${selectedDemo.name}...`
        : "Scouting pizza around your current location...",
    );

    const livePlaces = await fetchOpenMapPizzaPlaces(origin);
    const places = livePlaces.length >= 3 ? livePlaces : fallbackPizzerias;
    const rankedPlaces = rankPlaces(places, origin).slice(0, 6);

    if (!rankedPlaces.length) {
      renderEmptyState("No pizza places found", "Try a demo city or search again.");
      return;
    }

    renderResults(rankedPlaces);
    updateStatus(
      livePlaces.length
        ? `Found ${livePlaces.length} nearby pizza candidates. The top match is ${rankedPlaces[0].name}.`
        : `Live pizza data was limited, so showing trusted demo picks. The top match is ${rankedPlaces[0].name}.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    renderEmptyState("Could not get your location", message);
    updateStatus(`${message} Pick a demo city to try SliceScout instantly.`);
  } finally {
    setLoading(false);
  }
}

function getCurrentPosition() {
  if (!("geolocation" in navigator)) {
    return Promise.reject(
      new Error("Your browser does not support location sharing."),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(new Error("Location sharing was blocked or unavailable."));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 5,
        timeout: 12000,
      },
    );
  });
}

async function fetchOpenMapPizzaPlaces(origin) {
  const query = `
    [out:json][timeout:12];
    (
      node(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"pizza",i];
      way(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"pizza",i];
      relation(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"pizza",i];
      node(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["name"~"pizza|pizzeria",i];
      way(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["name"~"pizza|pizzeria",i];
      relation(around:9000,${origin.latitude},${origin.longitude})["amenity"~"restaurant|fast_food|cafe"]["name"~"pizza|pizzeria",i];
    );
    out center tags 30;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.elements
    .map(toPizzaPlace)
    .filter(Boolean)
    .filter(uniqueByNameAndLocation);
}

function toPizzaPlace(element) {
  const tags = element.tags ?? {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const name = tags.name ?? tags.brand;

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  const city = tags["addr:city"] ?? "";
  const orderUrl =
    tags["delivery:website"] ??
    tags["takeaway:website"] ??
    tags["contact:website"] ??
    tags.website ??
    tags.url ??
    buildOrderSearchUrl(name, city);

  return {
    name,
    city,
    latitude,
    longitude,
    rating: null,
    orderUrl,
    description:
      street || city
        ? [street, city].filter(Boolean).join(", ")
        : "Nearby pizza place from open map data.",
    hasDirectOrderUrl: Boolean(
      tags["delivery:website"] ??
        tags["takeaway:website"] ??
        tags["contact:website"] ??
        tags.website ??
        tags.url,
    ),
  };
}

function uniqueByNameAndLocation(place, index, places) {
  const key = `${place.name.toLowerCase()}-${place.latitude.toFixed(4)}-${place.longitude.toFixed(4)}`;
  return (
    places.findIndex((candidate) => {
      const candidateKey = `${candidate.name.toLowerCase()}-${candidate.latitude.toFixed(4)}-${candidate.longitude.toFixed(4)}`;
      return candidateKey === key;
    }) === index
  );
}

function rankPlaces(places, origin) {
  return places
    .map((place) => {
      const distanceMiles = distanceBetweenMiles(origin, place);
      const directOrderBonus = place.hasDirectOrderUrl === false ? 0 : 8;
      const ratingBonus = place.rating ? place.rating * 5 : 18;
      const distanceScore = Math.max(0, 80 - distanceMiles * 9);

      return {
        ...place,
        distanceMiles,
        score: Math.round(distanceScore + ratingBonus + directOrderBonus),
        orderUrl: place.orderUrl ?? buildOrderSearchUrl(place.name, place.city),
      };
    })
    .sort((a, b) => b.score - a.score || a.distanceMiles - b.distanceMiles);
}

function distanceBetweenMiles(origin, place) {
  const earthRadiusMiles = 3958.8;
  const originLat = toRadians(origin.latitude);
  const placeLat = toRadians(place.latitude);
  const deltaLat = toRadians(place.latitude - origin.latitude);
  const deltaLon = toRadians(place.longitude - origin.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(placeLat) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function buildOrderSearchUrl(name, city = "") {
  const query = encodeURIComponent(`${name} ${city} pizza order online`);
  return `https://www.google.com/search?q=${query}`;
}

function buildDirectionsUrl(place) {
  const query = encodeURIComponent(
    `${place.name} ${place.city ?? ""}`.trim() ||
      `${place.latitude},${place.longitude}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function renderResults(places) {
  const [winner, ...otherPlaces] = places;

  bestMatch.className = "best-match";
  replaceChildren(
    bestMatch,
    createBestMatchContent(winner),
    createActionPanel(winner),
  );

  replaceChildren(
    resultsList,
    ...otherPlaces.map((place, index) => createPlaceCard(place, index + 2)),
  );
}

function createBestMatchContent(place) {
  const wrapper = document.createElement("div");
  wrapper.append(
    createTextElement("p", "eyebrow", "Best closest match"),
    createTextElement("h3", "", place.name),
    createTextElement(
      "p",
      "",
      `${place.description} SliceScout ranks this highest for nearby distance and order availability.`,
    ),
    createMetaRow(place),
  );
  return wrapper;
}

function createActionPanel(place) {
  const wrapper = document.createElement("div");
  wrapper.className = "best-actions";
  wrapper.append(createOrderLink(place), createDirectionsLink(place));
  return wrapper;
}

function createPlaceCard(place, rank) {
  const card = document.createElement("article");
  card.className = "place-card";
  card.append(
    createTextElement("span", "rank", `#${rank}`),
    createTextElement("h3", "", place.name),
    createTextElement("p", "", place.description),
    createMetaRow(place, "card-meta"),
  );

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(createOrderLink(place), createDirectionsLink(place));
  card.append(actions);

  return card;
}

function createMetaRow(place, className = "match-meta") {
  const row = document.createElement("div");
  row.className = className;
  row.append(
    createTextElement("span", "pill", `${place.distanceMiles.toFixed(1)} mi`),
    createTextElement("span", "pill score", `${place.score}% slice fit`),
    createTextElement(
      "span",
      "pill",
      place.hasDirectOrderUrl === false ? "Order search" : "Order link ready",
    ),
  );

  if (place.rating) {
    row.append(createTextElement("span", "pill", `${place.rating} rating`));
  }

  return row;
}

function createOrderLink(place) {
  const link = document.createElement("a");
  link.className = "order-link";
  link.href = place.orderUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent =
    place.hasDirectOrderUrl === false ? "Find order page" : "Order pizza";
  return link;
}

function createDirectionsLink(place) {
  const link = document.createElement("a");
  link.className = "directions-link";
  link.href = buildDirectionsUrl(place);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Map it";
  return link;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
}

function renderEmptyState(title, message) {
  bestMatch.className = "best-match empty-state";
  replaceChildren(
    bestMatch,
    createTextElement("h3", "", title),
    createTextElement("p", "", message),
  );
  replaceChildren(resultsList);
}

function updateStatus(message) {
  statusMessage.textContent = message;
}

function setLoading(isLoading) {
  findPizzaButton.disabled = isLoading;
  findPizzaButton.textContent = isLoading ? "Heating the oven..." : "Find my slice";
}

function replaceChildren(parent, ...children) {
  parent.replaceChildren(...children);
}
