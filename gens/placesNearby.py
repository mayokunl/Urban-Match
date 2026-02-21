import os
import math
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

# ----------------------------
# Setup
# ----------------------------
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY")

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
STATIC_MAPS_URL = "https://maps.googleapis.com/maps/api/staticmap"

# ----------------------------
# Preferences (NO daylife)
# ----------------------------
PREFERENCE_TYPES = {
    "nightlife": ["bar", "night_club"],
    "restaurants": ["restaurant"],
    "brunch": ["cafe", "bakery"],
    "sports": ["sports_bar", "stadium"],

    # NEW
    "shopping": ["clothing_store", "shoe_store", "book_store", "jewelry_store"],

    # NEW
    "parks_recreation": ["park", "tourist_attraction", "museum"],
}

# Typo-proof + friendly inputs
PREFERENCE_ALIASES = {
    # restaurants typos
    "resturaunts": "restaurants",
    "resturants": "restaurants",
    "restaraunts": "restaurants",
    "restaraunt": "restaurants",
    "resturaunt": "restaurants",
    "restaurant": "restaurants",
    "food": "restaurants",

    # nightlife variants
    "bars": "nightlife",
    "clubs": "nightlife",
    "night clubs": "nightlife",

    # parks & recreation variants
    "park": "parks_recreation",
    "parks": "parks_recreation",
    "recreation": "parks_recreation",
    "rec": "parks_recreation",
    "parks and recreation": "parks_recreation",
    "parks & recreation": "parks_recreation",

    # shopping variants
    "shop": "shopping",
    "shops": "shopping",
    "store": "shopping",
    "stores": "shopping",
}

def normalize_pref(p: str) -> str:
    p = (p or "").strip().lower()
    return PREFERENCE_ALIASES.get(p, p)

# ----------------------------
# Hidden gem thresholds
# (different caps per category)
# ----------------------------
MIN_RATING = 4.2

REVIEW_BANDS = {
    "restaurants": (25, 450),
    "brunch": (25, 450),
    "nightlife": (25, 700),
    "sports": (25, 900),
    "shopping": (15, 600),
    "parks_recreation": (10, 1200),  # parks can have more reviews but still “local”
}

# Food chains + retail chains (blocklist)
CHAIN_KEYWORDS = {
    # food
    "starbucks", "chipotle", "mcdonald", "mcdonald’s", "panera", "subway",
    "taco bell", "wendy", "burger king", "domino", "domino's", "pizza hut",
    "dunkin", "dunkin'", "jimmy john", "jimmy john's", "kfc", "popeyes",
    "five guys", "panda express", "chick-fil-a", "chick fil a", "ihop",
    "applebee", "applebee's", "chili", "chili's", "outback", "olive garden",
    "red lobster", "buffalo wild wings", "bww", "wingstop", "jersey mike",
    "jersey mike's", "papa john", "papa john's", "little caesars", "qdoba",
    "raising cane", "raising cane's", "shake shack", "sonic", "arby's", "arbys",
    "jack in the box", "hardee", "hardee's", "white castle",

    # retail
    "walmart", "target", "costco", "sam's club", "best buy",
    "home depot", "the home depot", "lowe", "lowe's",
    "walgreens", "cvs", "tj maxx", "marshalls", "ross",
    "old navy", "gap", "h&m", "zara", "forever 21",
}

# Optional: location-specific “big obvious” things (keep small)
NOT_HIDDEN_GEM_KEYWORDS = {
    "ballpark village", "budweiser brew house"
}

def looks_like_chain(name: str) -> bool:
    if not name:
        return False
    low = name.lower()
    return any(k in low for k in CHAIN_KEYWORDS)

def looks_too_obvious(name: str) -> bool:
    if not name:
        return False
    low = name.lower()
    return any(k in low for k in NOT_HIDDEN_GEM_KEYWORDS)

# ----------------------------
# Geocode user location -> lat/lng
# ----------------------------
def get_lat_lng(location: str):
    resp = requests.get(GEOCODE_URL, params={"address": location, "key": API_KEY})
    resp.raise_for_status()
    data = resp.json()
    if not data.get("results"):
        raise ValueError("Location not found")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

# ----------------------------
# Generate multiple search centers around user location
# ----------------------------
def generate_search_centers(lat, lng, step_m=1800):
    dlat = step_m / 111_000
    dlng = step_m / (111_000 * max(math.cos(math.radians(lat)), 0.2))
    return [
        (lat, lng),
        (lat + dlat, lng),
        (lat - dlat, lng),
        (lat, lng + dlng),
        (lat, lng - dlng),
        (lat + dlat, lng + dlng),
        (lat + dlat, lng - dlng),
        (lat - dlat, lng + dlng),
        (lat - dlat, lng - dlng),
    ]

# ----------------------------
# Build static map URL (preview)
# ----------------------------
def build_static_map_url(center_lat, center_lng, markers, zoom=13, size="640x400"):
    marker_params = []
    for m in markers:
        label = m.get("label", "")
        if label:
            marker_params.append(f"label:{label}|{m['lat']},{m['lng']}")
        else:
            marker_params.append(f"{m['lat']},{m['lng']}")

    params = [
        ("center", f"{center_lat},{center_lng}"),
        ("zoom", str(zoom)),
        ("size", size),
        ("key", API_KEY),
    ]
    for mp in marker_params:
        params.append(("markers", mp))

    return f"{STATIC_MAPS_URL}?{urlencode(params)}"

# ----------------------------
# Places search (raw), then filter as "hidden gems"
# ----------------------------
def nearby_places(lat, lng, preference, radius=1400):
    types = PREFERENCE_TYPES.get(preference)
    if not types:
        return []

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": ",".join([
            "places.displayName",
            "places.formattedAddress",
            "places.rating",
            "places.userRatingCount",
            "places.location",
            "places.types",
            "places.websiteUri",
            "places.googleMapsUri",
            "places.editorialSummary",
        ])
    }

    body = {
        "includedTypes": types,
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius
            }
        }
    }

    resp = requests.post(PLACES_NEARBY_URL, headers=headers, json=body)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for place in data.get("places", []):
        name = place.get("displayName", {}).get("text")
        rating = place.get("rating")
        count = place.get("userRatingCount")
        loc = place.get("location") or {}

        if loc.get("latitude") is None or loc.get("longitude") is None:
            continue

        results.append({
            "name": name,
            "address": place.get("formattedAddress"),
            "rating": rating,
            "userRatingCount": count,
            "lat": loc.get("latitude"),
            "lng": loc.get("longitude"),
            "websiteUri": place.get("websiteUri"),
            "googleMapsUri": place.get("googleMapsUri"),
            "summary": (place.get("editorialSummary") or {}).get("text"),
            "types": place.get("types", []),
        })

    return results

def is_hidden_gem(place: dict, preference: str) -> bool:
    name = place.get("name") or ""
    rating = place.get("rating")
    count = place.get("userRatingCount")

    if looks_like_chain(name) or looks_too_obvious(name):
        return False

    if rating is None or rating < MIN_RATING:
        return False

    # category-specific review band
    min_c, max_c = REVIEW_BANDS.get(preference, (20, 1500))
    if count is None or count < min_c or count > max_c:
        return False

    return True

def dedupe_places(places):
    seen = set()
    out = []
    for p in places:
        key = p.get("googleMapsUri") or f"{p.get('name')}|{p.get('address')}"
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out

# ----------------------------
# MAIN
# ----------------------------
if __name__ == "__main__":
    print("\nUrban-Match Recommender (Hidden Gems)\n")

    user_location = input("Enter location: ").strip()
    base_lat, base_lng = get_lat_lng(user_location)

    print("\nAvailable preferences:")
    print("nightlife, restaurants, brunch, sports, shopping, parks_recreation")

    user_preferences = input("\nEnter preferences separated by comma: ").split(",")
    user_preferences = [normalize_pref(p) for p in user_preferences if p.strip()]

    centers = generate_search_centers(base_lat, base_lng, step_m=1800)

    print("\nRecommendations:\n")

    for pref in user_preferences:
        if pref not in PREFERENCE_TYPES:
            print(f"\n--- {pref.upper()} ---")
            print("Unknown preference (try: nightlife, restaurants, brunch, sports, shopping, parks_recreation)")
            continue

        print(f"\n--- {pref.upper()} (HIDDEN GEMS NEAR {user_location}) ---")

        all_places = []
        for (c_lat, c_lng) in centers:
            all_places.extend(nearby_places(c_lat, c_lng, pref, radius=1400))

        all_places = dedupe_places(all_places)

        gems = [p for p in all_places if is_hidden_gem(p, pref)]

        if not gems:
            print("No results found (try increasing radius or loosening filters)")
            continue

        # Rank: higher rating first, then fewer reviews (more “hidden”)
        gems.sort(key=lambda p: (-(p["rating"] or 0), (p["userRatingCount"] or 999999)))
        top = gems[:10]

        markers = []
        for i, p in enumerate(top):
            markers.append({"lat": p["lat"], "lng": p["lng"], "label": chr(ord("A") + i)})

        static_map_url = build_static_map_url(base_lat, base_lng, markers, zoom=13)
        print("\nStatic Map Preview URL:")
        print(static_map_url)
        print()

        for i, p in enumerate(top):
            label = chr(ord("A") + i)
            print(f"{label}) {p['name']} (Rating: {p['rating']} • Reviews: {p['userRatingCount']})")
            print(p["address"])
            print(f"Google Maps: {p['googleMapsUri']}")
            if p.get("websiteUri"):
                print(f"Website: {p['websiteUri']}")
            if p.get("summary"):
                print(f"About: {p['summary']}")
            print()