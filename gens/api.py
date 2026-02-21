import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY")

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

PREFERENCE_TYPES = {
    "nightlife": ["bar", "night_club"],
    "restaurants": ["restaurant"],
    "brunch": ["cafe", "bakery"],
    "sports": ["stadium", "sports_bar"],
    "daylife": ["tourist_attraction", "park", "museum"],
}

FIELD_MASK = "places.displayName,places.formattedAddress,places.rating,places.primaryType,places.types,places.location"

app = FastAPI()

# Allow your React app to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite / CRA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    location: str
    preferences: list[str]
    radius_m: float = 2000.0
    max_results: int = 10

def get_lat_lng(location: str):
    resp = requests.get(GEOCODE_URL, params={"address": location, "key": API_KEY}, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("results"):
        raise HTTPException(status_code=400, detail="Location not found")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

def nearby_places(lat: float, lng: float, preference: str, radius_m: float, max_results: int):
    types = PREFERENCE_TYPES.get(preference)
    if not types:
        return []

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    body = {
        "includedTypes": types,
        "maxResultCount": min(max_results, 20),
        "rankPreference": "DISTANCE",
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius_m),
            }
        },
    }

    resp = requests.post(PLACES_NEARBY_URL, headers=headers, json=body, timeout=20)
    if resp.status_code != 200:
        # Bubble up Google’s error message
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    results = []
    for p in data.get("places", []):
        results.append({
            "name": (p.get("displayName") or {}).get("text"),
            "address": p.get("formattedAddress"),
            "rating": p.get("rating"),
            "primaryType": p.get("primaryType"),
            "types": p.get("types", []),
            "lat": (p.get("location") or {}).get("latitude"),
            "lng": (p.get("location") or {}).get("longitude"),
        })
    return results

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/preferences")
def preferences():
    return {"preferences": list(PREFERENCE_TYPES.keys())}

@app.post("/recommend")
def recommend(req: RecommendRequest):
    lat, lng = get_lat_lng(req.location)

    out = {"location": req.location, "lat": lat, "lng": lng, "results": {}}

    for pref in req.preferences:
        pref = pref.strip().lower()
        out["results"][pref] = nearby_places(lat, lng, pref, req.radius_m, req.max_results)

    return out