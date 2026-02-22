"use client";

import { useEffect, useMemo, useState } from "react";

type UserProfile = {
  fullName: string;
  expectedSalary: number;
  preferredJobs: string[];
  interests: string[];
  familySize: number;
  monthlyDebt: number;
  housingBudget: number;
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

type RecommendResponse = {
  preferences: string[];
  results: Record<string, Place[]>;
  userLocation?: { text: string; lat: number; lng: number };
};

type AppRecommendResponse = {
  profile: UserProfile;
  hiddenGems: RecommendResponse;
  jobs: Array<{
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
  }>;
  housing: Array<{
    id: string;
    addressLine: string;
    city: string;
    state: string;
    zip: string;
    addressText: string;
    priceMin?: number | null;
    priceMax?: number | null;
    listingUrl?: string | null;
    matchScore: number;
    matchReason: string;
  }>;
  meta: {
    city: string;
    generatedAt: string;
    derivedPreferences: string[];
    services?: {
      hiddenGems?: string;
      jobs?: string;
      housing?: string;
    };
  };
};

type DashboardSection = "hidden_gems" | "jobs" | "housing";

const DEFAULT_CITY = "St Louis, MO";

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

async function fetchAppRecommendations(profile: UserProfile) {
  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    let msg = "Backend request failed";
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as AppRecommendResponse;
}

// optional: lets you keep profile between pages without firestore
function readProfileFromLocalStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem("urbanMatchProfile");
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // super simple safety
    return {
      fullName: String(parsed.fullName ?? ""),
      expectedSalary: Number(parsed.expectedSalary ?? 0),
      preferredJobs: Array.isArray(parsed.preferredJobs) ? parsed.preferredJobs.map(String) : [],
      interests: Array.isArray(parsed.interests) ? parsed.interests.map(String) : [],
      familySize: Number(parsed.familySize ?? 1),
      monthlyDebt: Number(parsed.monthlyDebt ?? 0),
      housingBudget: Number(parsed.housingBudget ?? 0),
      rentOrOwn: parsed.rentOrOwn === "own" ? "own" : "rent",
    };
  } catch {
    return null;
  }
}

function formatPrefTitle(pref: string) {
  const map: Record<string, string> = {
    restaurants: "Restaurants",
    nightlife: "Nightlife",
    brunch: "Brunch & Cafes",
    sports: "Sports",
    shopping: "Shopping",
    parks_recreation: "Parks & Recreation",
  };
  return map[pref] || pref;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AppRecommendResponse | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>("hidden_gems");

  const prefs = useMemo(() => mapInterestsToPrefs(profile?.interests ?? []), [profile?.interests]);

  useEffect(() => {
    // For now: just pull from localStorage (hackathon simple)
    const stored = readProfileFromLocalStorage();
    setProfile(stored);

    console.log("📌 DASHBOARD loaded profile (localStorage):", stored);
  }, []);

  async function handleRun() {
    setError(null);
    setLoading(true);

    try {
      if (!profile) {
        throw new Error("No profile found. Go back and complete your profile first.");
      }

      // ✅ backend team wants console logs
      console.log("✅ DASHBOARD profile payload:", {
        ...profile,
        expectedSalary: Number(profile.expectedSalary),
        familySize: Number(profile.familySize),
        monthlyDebt: Number(profile.monthlyDebt),
        housingBudget: Number(profile.housingBudget),
      });

      console.log("✅ DASHBOARD calling backend:", { location: DEFAULT_CITY, prefs });

      const res = await fetchAppRecommendations(profile);
      setData(res);

      console.log("✅ DASHBOARD backend results:", res);
    } catch (e: any) {
      console.error("❌ DASHBOARD error:", e);
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brandRow">
          <div className="logoBox" aria-hidden="true">
            U
          </div>
          <div className="brandText">
            <div className="brand">Urban Match</div>
            <div className="sub">Dashboard</div>
          </div>
        </div>

        <div className="topProfile" aria-label="Profile summary">
          <div className="topProfileName">{profile?.fullName || "No profile found"}</div>
          <div className="topProfileMeta">
            {profile
              ? `Family ${profile.familySize} | Housing $${profile.housingBudget}/mo | ${profile.interests.length} interests`
              : "Save your profile on the home page to personalize recommendations."}
          </div>
        </div>

        <div className="actions">
          <a className="btn ghost" href="/">
            Back
          </a>
          {activeSection === "hidden_gems" && (
            <button className="btn primary" onClick={handleRun} disabled={loading}>
              {loading ? "Loading..." : "Generate plan"}
            </button>
          )}
        </div>
      </header>

      <nav className="sectionNav" aria-label="Dashboard sections">
        <button
          type="button"
          className={activeSection === "hidden_gems" ? "sectionTab active" : "sectionTab"}
          onClick={() => setActiveSection("hidden_gems")}
        >
          Hidden Gems
        </button>
        <button
          type="button"
          className={activeSection === "jobs" ? "sectionTab active" : "sectionTab"}
          onClick={() => setActiveSection("jobs")}
        >
          Jobs Nearby
        </button>
        <button
          type="button"
          className={activeSection === "housing" ? "sectionTab active" : "sectionTab"}
          onClick={() => setActiveSection("housing")}
        >
          Housing
        </button>
      </nav>

      <section className={activeSection === "hidden_gems" ? "wrap" : "wrap wrapSingle"}>
        {activeSection === "hidden_gems" && (
        <section className="panel">
          <h2 className="h2">Your plan inputs</h2>

          <div className="grid2">
            <div className="field">
              <label>Preferences (derived from interests)</label>
              <div className="chips">
                {prefs.map((p) => (
                  <span key={p} className="chip">
                    {formatPrefTitle(p)}
                  </span>
                ))}
                {prefs.length === 0 && <span className="hint">No interests yet</span>}
              </div>
              <div className="hint">Edit interests from your profile modal on the home page.</div>
            </div>
          </div>

          <div className="profileBox">
            <div className="profileTop">
              <div>
                <div className="profileTitle">{profile?.fullName || "No profile found"}</div>
                <div className="profileMeta">
                  Salary: ${profile?.expectedSalary ?? 0} · Family: {profile?.familySize ?? 1} · Debt: $
                  {profile?.monthlyDebt ?? 0}/mo · Housing: ${profile?.housingBudget ?? 0}/mo
                </div>
              </div>

              <button className="btn ghost" onClick={() => console.log("📌 PROFILE (dashboard):", profile)}>
                Log profile
              </button>
            </div>

            <div className="hint">
              If this is blank, go back to the homepage and save your profile, then come here again.
            </div>
          </div>

          {error && <div className="error">Error: {error}</div>}
        </section>
        )}

        <section className="panel">
          <h2 className="h2">
            {activeSection === "hidden_gems"
              ? "Hidden Gems"
              : activeSection === "jobs"
                ? "Jobs Nearby"
                : "Housing"}
          </h2>

          {activeSection === "hidden_gems" && !data && (
            <div className="empty">
              Click <b>Generate plan</b> to fetch hidden gems from your Flask API.
            </div>
          )}

          {activeSection === "hidden_gems" && data && (
            <div className="sections">
                  {Object.entries(data.hiddenGems.results).map(([pref, places]) => (
                <section key={pref} className="prefSection">
                  <div className="prefHeader">
                    <h3>{formatPrefTitle(pref)}</h3>
                    <span className="count">{places.length} results</span>
                  </div>

                  <div className="cards">
                    {places.map((p, idx) => (
                      <article key={`${pref}-${idx}-${p.googleMapsUri ?? p.name ?? "place"}`} className="card">
                        <div className="cardTop">
                          <div className="name">{p.name || "Unknown"}</div>
                          <div className="rating">
                            {typeof p.rating === "number" ? `${p.rating.toFixed(1)}★` : "—"}
                            <span className="muted">
                              {typeof p.userRatingCount === "number" ? ` (${p.userRatingCount})` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="addr">{p.address || "No address"}</div>

                        {p.summary && <div className="summary">{p.summary}</div>}

                        <div className="links">
                          {p.googleMapsUri && (
                            <a className="link" href={p.googleMapsUri} target="_blank" rel="noreferrer">
                              Maps
                            </a>
                          )}
                          {p.websiteUri && (
                            <a className="link" href={p.websiteUri} target="_blank" rel="noreferrer">
                              Website
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeSection === "jobs" && (
            <>
              {(!data || data.jobs.length === 0) && (
                <div className="empty">
                  No jobs yet. Run Generate plan in Hidden Gems first, and make sure the `masconsulting` backend is
                  running.
                </div>
              )}
              <div className="stackCard">
                <div className="stackTitle">Preferred jobs from profile</div>
                <div className="chips">
                  {(profile?.preferredJobs ?? []).map((job) => (
                    <span key={job} className="chip">
                      {job}
                    </span>
                  ))}
                  {(profile?.preferredJobs ?? []).length === 0 && (
                    <span className="hint">No preferred jobs saved yet.</span>
                  )}
                </div>
              </div>
              {data && data.jobs.length > 0 && (
                <div className="cards" style={{ marginTop: 12 }}>
                  {data.jobs.map((job, idx) => (
                    <article key={job.id ?? `${job.title ?? "job"}-${idx}`} className="card">
                      <div className="cardTop">
                        <div className="name">{job.title || "Untitled role"}</div>
                        <div className="rating">
                          {job.salaryMin || job.salaryMax
                            ? `$${Math.round(job.salaryMin ?? 0).toLocaleString()}-$${Math.round(
                                job.salaryMax ?? 0,
                              ).toLocaleString()}`
                            : "Salary n/a"}
                        </div>
                      </div>
                      <div className="addr">
                        {job.company || "Unknown company"}
                        {job.location ? ` | ${job.location}` : ""}
                      </div>
                      <div className="summary">{job.matchReason} (score: {job.matchScore})</div>
                      {job.descriptionSnippet && (
                        <div className="summary">{job.descriptionSnippet}</div>
                      )}
                      <div className="links">
                        {job.applyUrl && (
                          <a className="link" href={job.applyUrl} target="_blank" rel="noreferrer">
                            Apply
                          </a>
                        )}
                        {job.contractType && <span className="muted">{job.contractType}</span>}
                        {job.contractTime && <span className="muted">{job.contractTime}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "housing" && (
            <>
              {(!data || data.housing.length === 0) && (
                <div className="empty">
                  No housing results yet. Run Generate plan in Hidden Gems first, and make sure the `masconsulting`
                  backend is running.
                </div>
              )}
              <div className="stackCard">
                <div className="stackTitle">Housing preferences from profile</div>
                <div className="stackMeta">
                  Budget: ${profile?.housingBudget ?? 0}/mo | Goal: {profile?.rentOrOwn === "own" ? "Own" : "Rent"}{" "}
                  | Family size: {profile?.familySize ?? 1}
                </div>
              </div>
              {data && data.housing.length > 0 && (
                <div className="cards" style={{ marginTop: 12 }}>
                  {data.housing.map((home, idx) => {
                    return (
                      <article key={home.id ?? `home-${idx}`} className="card">
                        <div className="cardTop">
                          <div className="name">Rental Listing</div>
                          <div className="rating">
                            {home.priceMin || home.priceMax
                              ? `$${Math.round(home.priceMin ?? 0).toLocaleString()}-$${Math.round(
                                  home.priceMax ?? 0,
                                ).toLocaleString()}`
                              : "Price n/a"}
                          </div>
                        </div>
                        <div className="addr">{home.addressText || "Address unavailable"}</div>
                        <div className="summary">{home.matchReason} (score: {home.matchScore})</div>
                        <div className="links">
                          {home.listingUrl && (
                            <a className="link" href={home.listingUrl} target="_blank" rel="noreferrer">
                              View listing
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </section>

      <style jsx>{`
        :global(html, body) {
          padding: 0;
          margin: 0;
          background: #000000;
          color: #ffffff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .page {
          min-height: 100vh;
          background: #000000;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brandRow {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logoBox {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.06);
        }

        .brandText {
          display: grid;
          line-height: 1.1;
        }

        .brand {
          font-weight: 800;
          font-size: 14px;
        }

        .sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }

        .topProfile {
          min-width: 0;
          flex: 1;
          max-width: 520px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          padding: 8px 10px;
        }

        .topProfileName {
          font-size: 13px;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topProfileMeta {
          margin-top: 2px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn {
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn.primary {
          background: #1d4ed8;
          border-color: transparent;
          color: #fff;
          box-shadow: 0 10px 22px rgba(29, 78, 216, 0.18);
        }

        .btn.ghost {
          background: rgba(255, 255, 255, 0.06);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 16px 40px;
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 14px;
        }

        .wrapSingle {
          grid-template-columns: 1fr;
        }

        .sectionNav {
          position: sticky;
          top: 67px;
          z-index: 40;
          display: flex;
          gap: 8px;
          padding: 10px 16px 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0));
        }

        .sectionTab {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .sectionTab.active {
          background: rgba(29, 78, 216, 0.24);
          border-color: rgba(96, 165, 250, 0.38);
          color: #ffffff;
        }

        .panel {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          padding: 14px;
        }

        .h2 {
          margin: 2px 0 12px;
          font-size: 18px;
          letter-spacing: -0.2px;
        }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
          color: rgba(255, 255, 255, 0.92);
        }

        .field input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          padding: 10px 12px;
          outline: none;
          font-size: 14px;
        }

        .field input:focus {
          border-color: rgba(29, 78, 216, 0.6);
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
        }

        .hint {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 6px;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          min-height: 40px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.03);
        }

        .chip {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(29, 78, 216, 0.25);
          background: rgba(29, 78, 216, 0.08);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
        }

        .profileBox {
          display: none;
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.9);
          padding: 12px;
        }

        .profileTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .profileTitle {
          font-weight: 900;
          font-size: 16px;
        }

        .profileMeta {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.62);
          margin-top: 4px;
          line-height: 1.45;
        }

        .error {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.18);
          color: rgba(255, 220, 220, 0.95);
          font-weight: 700;
          font-size: 13px;
        }

        .empty {
          padding: 14px;
          border-radius: 14px;
          border: 1px dashed rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
        }

        .sections {
          display: grid;
          gap: 14px;
        }

        .stackCard {
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 12px;
        }

        .stackTitle {
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .stackMeta {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.45;
        }

        .prefSection {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
        }

        .prefHeader {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .prefHeader h3 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -0.2px;
        }

        .count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.58);
          font-weight: 700;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .card {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 12px;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
        }

        .cardTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }

        .name {
          font-weight: 900;
          font-size: 14px;
          line-height: 1.25;
        }

        .rating {
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }

        .muted {
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
        }

        .addr {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.4;
        }

        .summary {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.45;
        }

        .links {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .link {
          font-size: 13px;
          font-weight: 900;
          color: #1d4ed8;
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }

        @media (max-width: 980px) {
          .sectionNav {
            top: 111px;
            overflow-x: auto;
            padding-top: 8px;
            padding-bottom: 2px;
          }
          .topbar {
            flex-wrap: wrap;
          }
          .topProfile {
            order: 3;
            flex-basis: 100%;
            max-width: none;
          }
          .wrap {
            grid-template-columns: 1fr;
          }
          .grid2 {
            grid-template-columns: 1fr;
          }
          .cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
