import os
import requests
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY")


# ----------------------------
# API Endpoints
# ----------------------------

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"


# ----------------------------
# User preference → Google types
# ----------------------------

PREFERENCE_TYPES = {

    "nightlife": [
        "bar",
        "night_club"
    ],

    "restaurants": [
        "restaurant"
    ],

    "brunch": [
        "cafe",
        "bakery"
    ],

    "sports": [
        "stadium",
        "sports_bar"
    ],

    "daylife": [
        "tourist_attraction",
        "park",
        "cafe"
    ]

}


# ----------------------------
# Convert user location → lat/lng
# ----------------------------

def get_lat_lng(location):

    params = {
        "address": location,
        "key": API_KEY
    }

    resp = requests.get(GEOCODE_URL, params=params)
    resp.raise_for_status()

    data = resp.json()

    if not data["results"]:
        raise ValueError("Location not found")

    loc = data["results"][0]["geometry"]["location"]

    return loc["lat"], loc["lng"]


# ----------------------------
# Get nearby places based on preference
# ----------------------------

def nearby_places(lat, lng, preference, radius=2000):

    types = PREFERENCE_TYPES.get(preference)

    if not types:
        print(f"Unknown preference: {preference}")
        return []

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
            "places.displayName,"
            "places.formattedAddress,"
            "places.rating"
    }

    body = {
        "includedTypes": types,
        "maxResultCount": 10,

        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": lat,
                    "longitude": lng
                },
                "radius": radius
            }
        }
    }

    resp = requests.post(
        PLACES_NEARBY_URL,
        headers=headers,
        json=body
    )

    resp.raise_for_status()

    data = resp.json()

    results = []

    for place in data.get("places", []):

        results.append({

            "name":
                place.get("displayName", {}).get("text"),

            "address":
                place.get("formattedAddress"),

            "rating":
                place.get("rating")

        })

    return results


# ----------------------------
# MAIN PROGRAM
# ----------------------------

if __name__ == "__main__":

    print("\nUrban-Match Recommender\n")

    # User enters location dynamically
    user_location = input("Enter location: ")

    lat, lng = get_lat_lng(user_location)

    print("\nAvailable preferences:")
    print("nightlife, restaurants, brunch, sports, daylife")

    # User enters preferences dynamically
    user_preferences = input(
        "\nEnter preferences separated by comma: "
    ).split(",")

    user_preferences = [p.strip() for p in user_preferences]

    print("\nRecommendations:\n")

    for pref in user_preferences:

        print(f"\n--- {pref.upper()} ---")

        places = nearby_places(lat, lng, pref)

        if not places:
            print("No results found")
            continue

        for p in places:

            print(
                f"{p['name']} "
                f"(Rating: {p['rating']})"
            )

            print(p["address"])
            print()