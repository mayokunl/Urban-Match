import { NextRequest, NextResponse } from "next/server";

type UserProfile = {
  fullName?: string;
  expectedSalary?: number;
  preferredJobs?: string[];
  interests?: string[];
  familySize?: number;
  monthlyDebt?: number;
  housingBudget?: number;
  rentOrOwn?: "rent" | "own";
};

type Place = {
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

type HiddenGemsResponse = {
  preferences: string[];
  results: Record<string, Place[]>;
  userLocation?: { text: string; lat: number; lng: number };
};

type JobDto = {
  id?: string;
  title?: string;
  description?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  redirectUrl?: string;
  redirect_url?: string;
  company?: { displayName?: string; display_name?: string };
  location?: { displayName?: string; display_name?: string; area?: string[] };
  contractType?: string;
  contractTime?: string;
  contract_type?: string;
  contract_time?: string;
};

type RankedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applyUrl: string | null;
  descriptionSnippet: string | null;
  contractType: string | null;
  contractTime: string | null;
  matchScore: number;
  matchReason: string;
};

type HousingProperty = {
  propertyId?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  list_price_min?: number | null;
  list_price_max?: number | null;
  href?: string;
  location?: {
    address?: {
      line?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
};

type RankedHousing = {
  id: string;
  title: string;
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  addressText: string;
  priceMin: number | null;
  priceMax: number | null;
  listingUrl: string | null;
  matchScore: number;
  matchReason: string;
};

type LifeOverview = {
  text: string;
  highlights: string[];
  recommendedHousingId: string | null;
  recommendedHousingTitle: string | null;
  avgDistanceToTopGemsMiles: number | null;
  gemsWithin3Miles: number | null;
  topJobTitles: string[];
};

const DEFAULT_CITY = "St Louis, MO";
const GENS_BASE =
  process.env.GENS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "";
const MAS_BASE = process.env.MAS_API_BASE_URL ?? "http://127.0.0.1:8080";
const JOBS_API_BASE_URL = process.env.JOBS_API_BASE_URL ?? MAS_BASE;
const HOUSING_API_BASE_URL = process.env.HOUSING_API_BASE_URL ?? MAS_BASE;
const DEFAULT_HOUSING_QUERY = process.env.HOUSING_SEARCH_QUERY ?? "63103";
const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.GENS_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  null;

function mapInterestsToPrefs(interests: string[]) {
  const out = new Set<string>();
  const supportedPrefs = new Set([
    "restaurants",
    "nightlife",
    "brunch",
    "sports",
    "shopping",
    "parks_recreation",
  ]);

  for (const raw of interests) {
    const s = raw.trim().toLowerCase();
    if (!s) continue;

    if (supportedPrefs.has(s)) {
      out.add(s);
      continue;
    }

    if (s.includes("food") || s.includes("restaurant") || s.includes("dinner") || s.includes("eat")) {
      out.add("restaurants");
    } else if (
      s.includes("night") ||
      s.includes("club") ||
      s.includes("bar") ||
      s.includes("music") ||
      s.includes("concert") ||
      s.includes("dj") ||
      s.includes("dance")
    ) {
      out.add("nightlife");
    } else if (s.includes("brunch") || s.includes("coffee") || s.includes("cafe")) {
      out.add("brunch");
    } else if (s.includes("sport") || s.includes("game") || s.includes("stadium")) {
      out.add("sports");
    } else if (s.includes("shop") || s.includes("mall") || s.includes("clothes")) {
      out.add("shopping");
    } else if (
      s.includes("park") ||
      s.includes("museum") ||
      s.includes("hike") ||
      s.includes("outdoor") ||
      s.includes("trail") ||
      s.includes("art") ||
      s.includes("cinema") ||
      s.includes("movie")
    ) {
      out.add("parks_recreation");
    }
  }

  if (out.size === 0) out.add("restaurants");
  return Array.from(out);
}

function normalizeProfile(input: UserProfile): Required<UserProfile> {
  return {
    fullName: String(input.fullName ?? ""),
    expectedSalary: Number(input.expectedSalary ?? 0),
    preferredJobs: Array.isArray(input.preferredJobs) ? input.preferredJobs.map(String) : [],
    interests: Array.isArray(input.interests) ? input.interests.map(String) : [],
    familySize: Number(input.familySize ?? 1),
    monthlyDebt: Number(input.monthlyDebt ?? 0),
    housingBudget: Number(input.housingBudget ?? 0),
    rentOrOwn: input.rentOrOwn === "own" ? "own" : "rent",
  };
}

function toSnippet(text?: string, max = 220) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function rankJobs(rawJobs: JobDto[], profile: Required<UserProfile>) {
  const preferredTerms = profile.preferredJobs
    .map((j) => j.trim().toLowerCase())
    .filter(Boolean);
  const targetSalary = profile.expectedSalary > 0 ? profile.expectedSalary : null;

  const ranked: RankedJob[] = rawJobs.map((job, idx) => {
    const title = String(job.title ?? "Untitled role");
    const titleLower = title.toLowerCase();
    const company = String(job.company?.displayName ?? job.company?.display_name ?? "Unknown company");
    const location = String(job.location?.displayName ?? job.location?.display_name ?? DEFAULT_CITY);
    const rawSalaryMin = job.salaryMin ?? job.salary_min;
    const rawSalaryMax = job.salaryMax ?? job.salary_max;
    const salaryMin = typeof rawSalaryMin === "number" ? rawSalaryMin : null;
    const salaryMax = typeof rawSalaryMax === "number" ? rawSalaryMax : null;

    let score = 0;
    let reason = "General nearby job result";

    const matchingTerm = preferredTerms.find((term) => titleLower.includes(term));
    if (matchingTerm) {
      score += 60;
      reason = `Matches preferred job: ${matchingTerm}`;
    }

    if (targetSalary && (salaryMin !== null || salaryMax !== null)) {
      const min = salaryMin ?? salaryMax ?? 0;
      const max = salaryMax ?? salaryMin ?? 0;
      if (targetSalary >= min && targetSalary <= max) {
        score += 30;
        reason = matchingTerm
          ? `${reason}; salary range overlaps target`
          : "Salary range overlaps your target";
      } else if (Math.abs((min + max) / 2 - targetSalary) <= targetSalary * 0.2) {
        score += 15;
        if (!matchingTerm) reason = "Salary range is close to your target";
      }
    }

    const contractTime = job.contractTime ?? job.contract_time ?? null;
    const contractType = job.contractType ?? job.contract_type ?? null;

    if ((contractTime ?? "").toLowerCase().includes("full")) {
      score += 5;
      if (!matchingTerm && !String(reason).includes("Salary")) reason = "Full-time role";
    }

    return {
      id: String(job.id ?? `job-${idx}`),
      title,
      company,
      location,
      salaryMin,
      salaryMax,
      applyUrl: job.redirectUrl ?? job.redirect_url ?? null,
      descriptionSnippet: toSnippet(job.description),
      contractType,
      contractTime,
      matchScore: score,
      matchReason: reason,
    };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore || a.title.localeCompare(b.title));
  return ranked.slice(0, 12);
}

function rankHousing(rawHomes: HousingProperty[], profile: Required<UserProfile>) {
  const budget = profile.housingBudget > 0 ? profile.housingBudget : null;

  const ranked: RankedHousing[] = rawHomes.map((home, idx) => {
    const address = home.location?.address;
    const line = String(address?.line ?? "");
    const city = String(address?.city ?? "");
    const state = String(address?.state ?? "");
    const zip = String(address?.zip ?? "");
    const addressText = [line, city, state, zip].filter(Boolean).join(", ") || "Address unavailable";
    const rawPriceMin = home.priceMin ?? home.list_price_min;
    const rawPriceMax = home.priceMax ?? home.list_price_max;
    const priceMin = typeof rawPriceMin === "number" ? rawPriceMin : null;
    const priceMax = typeof rawPriceMax === "number" ? rawPriceMax : null;
    const low = priceMin ?? priceMax;
    const high = priceMax ?? priceMin;
    const midpoint = low !== null && high !== null ? (low + high) / 2 : low ?? high;

    let matchScore = 0;
    let matchReason = "Nearby rental listing";

    if (budget && midpoint !== null) {
      if (high !== null && high <= budget) {
        matchScore += 80;
        matchReason = "Within your housing budget";
      } else if ((low !== null && low <= budget) || midpoint <= budget * 1.1) {
        matchScore += 55;
        matchReason = "Near your budget";
      } else if (midpoint <= budget * 1.25) {
        matchScore += 25;
        matchReason = "Slightly above budget";
      } else {
        matchScore += 5;
        matchReason = "Above budget, but may be useful for comparison";
      }
    } else if (midpoint !== null) {
      matchScore += 15;
      matchReason = "Price available";
    } else {
      matchReason = "Price range unavailable";
    }

    if (city.toLowerCase().includes("st") || city.toLowerCase().includes("saint")) {
      matchScore += 5;
    }

    let title = line || "Rental Listing";
    if (!line && home.href) {
      try {
        const slug = new URL(home.href).pathname.split("/").pop() ?? "";
        const base = slug.split("_")[0]?.replace(/-/g, " ").trim();
        if (base) title = base;
      } catch {}
    }

    return {
      id: String(home.propertyId ?? `home-${idx}`),
      title,
      addressLine: line,
      city,
      state,
      zip,
      addressText,
      priceMin,
      priceMax,
      listingUrl: home.href ?? null,
      matchScore,
      matchReason,
    };
  });

  ranked.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const aPrice = a.priceMin ?? a.priceMax ?? Number.MAX_SAFE_INTEGER;
    const bPrice = b.priceMin ?? b.priceMax ?? Number.MAX_SAFE_INTEGER;
    return aPrice - bPrice;
  });

  return ranked.slice(0, 12);
}

function basicHousingFallback(rawHomes: HousingProperty[]) {
  return rawHomes.slice(0, 12).map((home, idx) => {
    const address = home.location?.address;
    const line = String(address?.line ?? "");
    const city = String(address?.city ?? "");
    const state = String(address?.state ?? "");
    const zip = String(address?.zip ?? "");
    const addressText = [line, city, state, zip].filter(Boolean).join(", ") || "Address unavailable";
    const rawPriceMin = home.priceMin ?? home.list_price_min;
    const rawPriceMax = home.priceMax ?? home.list_price_max;
    const priceMin = typeof rawPriceMin === "number" ? rawPriceMin : null;
    const priceMax = typeof rawPriceMax === "number" ? rawPriceMax : null;
    const title = line || "Rental Listing";

    return {
      id: String(home.propertyId ?? `home-${idx}`),
      title,
      addressLine: line,
      city,
      state,
      zip,
      addressText,
      priceMin,
      priceMax,
      listingUrl: home.href ?? null,
      matchScore: 0,
      matchReason: priceMin !== null || priceMax !== null ? "Price available" : "Price range unavailable",
    } satisfies RankedHousing;
  });
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function flattenTopGems(hiddenGems: HiddenGemsResponse, max = 8) {
  return Object.values(hiddenGems.results)
    .flat()
    .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
    .slice(0, max);
}

async function geocodeAddress(address: string) {
  if (!GOOGLE_MAPS_API_KEY || !address) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
    };
    const loc = data.results?.[0]?.geometry?.location;
    if (typeof loc?.lat === "number" && typeof loc?.lng === "number") {
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch {
    return null;
  }
}

async function buildLifeOverview(args: {
  profile: Required<UserProfile>;
  hiddenGems: HiddenGemsResponse;
  jobs: RankedJob[];
  housing: RankedHousing[];
}) {
  const { profile, hiddenGems, jobs, housing } = args;
  const topHousing = housing[0] ?? null;
  const topJobTitles = jobs.slice(0, 3).map((j) => j.title);
  const highlights: string[] = [];

  let avgDistanceToTopGemsMiles: number | null = null;
  let gemsWithin3Miles: number | null = null;

  if (topHousing) {
    if (topHousing.priceMax !== null && profile.housingBudget > 0 && topHousing.priceMax <= profile.housingBudget) {
      highlights.push("Top housing option is within budget");
    } else if (topHousing.priceMin !== null && profile.housingBudget > 0 && topHousing.priceMin <= profile.housingBudget) {
      highlights.push("Top housing option starts near your budget");
    }
  }

  const gems = flattenTopGems(hiddenGems, 8);
  if (topHousing && gems.length > 0) {
    const geo = await geocodeAddress(topHousing.addressText);
    if (geo) {
      const distances = gems.map((g) => haversineMiles(geo.lat, geo.lng, g.lat!, g.lng!));
      avgDistanceToTopGemsMiles = Number((distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(1));
      gemsWithin3Miles = distances.filter((d) => d <= 3).length;
      highlights.push(
        gemsWithin3Miles > 0
          ? `${gemsWithin3Miles} of your top hidden gems are within ~3 miles`
          : `Average distance to top hidden gems is ~${avgDistanceToTopGemsMiles} miles`,
      );
    }
  }

  if (topJobTitles.length > 0) {
    highlights.push(`Top job matches include ${topJobTitles.slice(0, 2).join(" and ")}`);
  }

  const textParts: string[] = [];
  if (topHousing) {
    textParts.push(
      `To maximize your life in St. Louis, start by looking at ${topHousing.title} (${topHousing.addressText}) because it is currently your strongest housing match: ${topHousing.matchReason.toLowerCase()}.`,
    );
  } else {
    textParts.push("To maximize your life in St. Louis, start by generating more housing matches so we can compare budget fit and location.");
  }

    if (avgDistanceToTopGemsMiles !== null) {
      textParts.push(
        gemsWithin3Miles && gemsWithin3Miles > 0
          ? `It is close to your lifestyle picks, with ${gemsWithin3Miles} top hidden gems within about 3 miles (average distance ~${avgDistanceToTopGemsMiles} miles).`
          : `It is about ${avgDistanceToTopGemsMiles} miles on average from your top hidden gems.`,
      );
    }

  if (topJobTitles.length > 0) {
    textParts.push(`Your strongest job matches right now are ${topJobTitles.slice(0, 3).join(", ")}.`);
  } else {
    textParts.push("No strong job matches were returned yet, so broadening your preferred job keywords may help.");
  }

  return {
    text: textParts.join(" "),
    highlights,
    recommendedHousingId: topHousing?.id ?? null,
    recommendedHousingTitle: topHousing?.title ?? null,
    avgDistanceToTopGemsMiles,
    gemsWithin3Miles,
    topJobTitles,
  } satisfies LifeOverview;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { profile?: UserProfile };
    if (!body?.profile) {
      return NextResponse.json({ error: "Missing profile payload" }, { status: 400 });
    }

    const profile = normalizeProfile(body.profile);
    const derivedPreferences = mapInterestsToPrefs(profile.interests);

    const params = new URLSearchParams({
      location: DEFAULT_CITY,
      preferences: derivedPreferences.join(","),
    });

    const preferredRole = profile.preferredJobs.find((j) => j.trim()) || "Software Engineer";
    const jobsUrl = `${JOBS_API_BASE_URL}/api/jobs/search?${new URLSearchParams({ role: preferredRole }).toString()}`;
    const housingUrl = `${HOUSING_API_BASE_URL}/api/housing/search-by-city?${new URLSearchParams({ city: DEFAULT_HOUSING_QUERY }).toString()}`;

    const [hiddenGemsResult, jobsResult, housingResult] = await Promise.allSettled([
      fetch(`${GENS_BASE}/recommend?${params.toString()}`, { method: "GET", cache: "no-store" }),
      fetch(jobsUrl, { method: "GET", cache: "no-store" }),
      fetch(housingUrl, { method: "GET", cache: "no-store" }),
    ]);

    if (hiddenGemsResult.status === "rejected") {
      return NextResponse.json({ error: "Hidden gems backend request failed" }, { status: 502 });
    }
    const hiddenGemsRes = hiddenGemsResult.value;
    if (!hiddenGemsRes.ok) {
      let msg = `Hidden gems backend failed (${hiddenGemsRes.status})`;
      try {
        const err = await hiddenGemsRes.json();
        if (err?.error) msg = err.error;
      } catch {}
      return NextResponse.json({ error: msg }, { status: hiddenGemsRes.status });
    }
    const hiddenGems = (await hiddenGemsRes.json()) as HiddenGemsResponse;

    let jobs: RankedJob[] = [];
    let housing: RankedHousing[] = [];

    if (jobsResult.status === "fulfilled" && jobsResult.value.ok) {
      try {
        const rawJobs = (await jobsResult.value.json()) as JobDto[];
        jobs = rankJobs(rawJobs, profile);
      } catch {}
    }

    if (housingResult.status === "fulfilled" && housingResult.value.ok) {
      try {
        const rawHousing = (await housingResult.value.json()) as HousingProperty[];
        try {
          housing = rankHousing(rawHousing, profile);
        } catch {
          housing = basicHousingFallback(rawHousing);
        }
      } catch {}
    }

    const lifeOverview = await buildLifeOverview({ profile, hiddenGems, jobs, housing });

    return NextResponse.json({
      profile,
      hiddenGems,
      jobs,
      housing,
      lifeOverview,
      meta: {
        city: DEFAULT_CITY,
        generatedAt: new Date().toISOString(),
        derivedPreferences,
        services: {
          hiddenGems: "ok",
          jobs: jobs.length > 0 ? "ok" : "empty_or_unavailable",
          housing: housing.length > 0 ? "ok" : "empty_or_unavailable",
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
