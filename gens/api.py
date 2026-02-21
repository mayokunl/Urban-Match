import os
import math
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# ----------------------------
# Setup
# ----------------------------
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY")

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

app = Flask(__name__)
CORS(app)  # allow frontend calls during dev

# ----------------------------
# Preferences (NO daylife)
# ----------------------------
PREFERENCE_TYPES = {
    "nightlife": ["bar", "night_club"],
    "restaurants": ["restaurant"],
    "brunch": ["cafe", "bakery"],
    "sports": ["sports_bar", "stadium"],
    "shopping": ["clothing_store", "shoe_store", "book_store", "jewelry_store"],
    "parks_recreation": ["park", "tourist_attraction", "museum"],
}

# Typos / friendly inputs
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
# ----------------------------
MIN_RATING = 4.2

REVIEW_BANDS = {
    "restaurants": (25, 450),
    "brunch": (25, 450),
    "nightlife": (25, 700),
    "sports": (25, 900),
    "shopping": (15, 600),
    "parks_recreation": (10, 1200),
}

CHAIN_KEYWORDS = {
    # food chains
    "starbucks", "chipotle", "mcdonald", "mcdonald’s", "panera", "subway",
    "taco bell", "wendy", "burger king", "domino", "domino's", "pizza hut",
    "dunkin", "dunkin'", "jimmy john", "jimmy john's", "kfc", "popeyes",
    "five guys", "panda express", "chick-fil-a", "chick fil a", "ihop",
    "applebee", "applebee's", "chili", "chili's", "outback", "olive garden",
    "red lobster", "buffalo wild wings", "bww", "wingstop", "jersey mike",
    "jersey mike's", "papa john", "papa john's", "little caesars", "qdoba",
    "raising cane", "raising cane's", "shake shack", "sonic", "arby's", "arbys",
    "jack in the box", "hardee", "hardee's", "white castle",

    # retail chains
    "walmart", "target", "costco", "sam's club", "best buy",
    "home depot", "the home depot", "lowe", "lowe's",
    "walgreens", "cvs", "tj maxx", "marshalls", "ross",
    "old navy", "gap", "h&m", "zara", "forever 21",
}

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
# Helpers
# ----------------------------
def get_lat_lng(location: str):
    resp = requests.get(GEOCODE_URL, params={"address": location, "key": API_KEY})
    resp.raise_for_status()
    data = resp.json()
    if not data.get("results"):
        raise ValueError("Location not found")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

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

def fetch_places_raw(lat, lng, preference, radius=1400):
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

def is_hidden_gem(p: dict, preference: str) -> bool:
    name = p.get("name") or ""
    rating = p.get("rating")
    count = p.get("userRatingCount")

    if looks_like_chain(name) or looks_too_obvious(name):
        return False
    if rating is None or rating < MIN_RATING:
        return False

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
# API Routes
# ----------------------------
@app.get("/health")
def health():
    return jsonify({"ok": True})

# Example:
# /recommend?location=St%20Louis%2C%20MO&preferences=restaurants,shopping
@app.get("/recommend")
def recommend():
    location = (request.args.get("location") or "").strip()
    prefs_raw = (request.args.get("preferences") or "").strip()

    if not location:
        return jsonify({"error": "Missing location"}), 400
    if not prefs_raw:
        return jsonify({"error": "Missing preferences"}), 400

    prefs = [normalize_pref(p) for p in prefs_raw.split(",") if p.strip()]
    # keep only supported preferences
    prefs = [p for p in prefs if p in PREFERENCE_TYPES]

    if not prefs:
        return jsonify({"error": "No valid preferences provided"}), 400

    try:
        base_lat, base_lng = get_lat_lng(location)
    except ValueError:
        return jsonify({"error": "Location not found"}), 404

    centers = generate_search_centers(base_lat, base_lng, step_m=1800)

    results_by_pref = {}
    for pref in prefs:
        all_places = []
        for (c_lat, c_lng) in centers:
            all_places.extend(fetch_places_raw(c_lat, c_lng, pref, radius=1400))

        all_places = dedupe_places(all_places)
        gems = [p for p in all_places if is_hidden_gem(p, pref)]

        gems.sort(key=lambda p: (-(p["rating"] or 0), (p["userRatingCount"] or 999999)))
        results_by_pref[pref] = gems[:10]

    return jsonify({
        "userLocation": {"text": location, "lat": base_lat, "lng": base_lng},
        "preferences": prefs,
        "results": results_by_pref
    })

if __name__ == "__main__":
    # Run: python api.py
    app.run(host="0.0.0.0", port=5000, debug=True)