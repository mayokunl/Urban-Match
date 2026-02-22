export type Place = {
  name: string | null;
  address: string | null;
  googleMapsUri?: string | null;
  websiteUri?: string | null;
  rating?: number | null;
  summary?: string | null;
  userRatingCount?: number | null;
  lat?: number | null;
  lng?: number | null;
  types?: string[];
};

export type RecommendResponse = {
  preferences: string[];
  results: Record<string, Place[]>;
  userLocation?: { text: string; lat: number; lng: number };
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

export async function fetchRecommendations(location: string, preferences: string[]) {
  const params = new URLSearchParams();
  params.set("location", location);
  params.set("preferences", preferences.join(","));

  const url = `${BASE}/recommend?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store", // important for Next dev + live API
  });

  if (!res.ok) {
    // Your Flask API returns { "error": "..." } when it fails
    let msg = `Backend request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(msg);
  }

  return (await res.json()) as RecommendResponse;
}