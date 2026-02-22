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

const DEFAULT_CITY = "St Louis, MO";
const GENS_BASE =
  process.env.GENS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:5000";
const MAS_BASE = process.env.MAS_API_BASE_URL ?? "http://127.0.0.1:8080";

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

    return {
      id: String(home.propertyId ?? `home-${idx}`),
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
    const jobsUrl = `${MAS_BASE}/api/jobs/search?${new URLSearchParams({ role: preferredRole }).toString()}`;
    const housingUrl = `${MAS_BASE}/api/housing/search-by-city?${new URLSearchParams({ city: "St Louis" }).toString()}`;

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
        housing = rankHousing(rawHousing, profile);
      } catch {}
    }

    return NextResponse.json({
      profile,
      hiddenGems,
      jobs,
      housing,
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
