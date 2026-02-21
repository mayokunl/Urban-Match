"use client";

export default function Home() {
  return (
    <main className="page">
      {/* Background video (subtle) */}
      <div className="bgWrap" aria-hidden="true">
        <video className="bgVideo" autoPlay loop muted playsInline>
          <source src="/stl.mp4" type="video/mp4" />
        </video>
        <div className="bgOverlay" />
      </div>

      {/* Navbar */}
      <header className="nav">
        <div className="navLeft">
          <div className="logoBox" aria-hidden="true">U</div>
          <span className="brand">Urban Match</span>

          <nav className="navLinks">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#about">Why STL</a>
          </nav>
        </div>

        <div className="navRight">
          <a className="btn btnPrimary" href="#get-started">Get started</a>
          <button className="iconBtn" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="heroInner">
          <div className="badge">St. Louis life, organized.</div>

          <h1 className="title">
            One place to explore STL.
            <br />
            Less scrolling. More living.
          </h1>

          <p className="subtitle" id="about">
            Urban Match helps you optimize your life in St. Louis by showing you
            housing, hidden gems, and jobs around you in one clean dashboard.
          </p>

          <div className="ctaRow" id="get-started">
            <a className="btn btnPrimary" href="/onboarding">Get started</a>
            <a className="btn btnGhost" href="#features">See features</a>
          </div>

          <div className="miniRow">
            <div className="miniCard">
              <div className="miniTop">🏠 Housing</div>
              <div className="miniText">Find places that fit your budget and vibe.</div>
            </div>
            <div className="miniCard">
              <div className="miniTop">✨ Hidden gems</div>
              <div className="miniText">Discover spots and events near you.</div>
            </div>
            <div className="miniCard">
              <div className="miniTop">💼 Jobs</div>
              <div className="miniText">Explore opportunities around your area.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section (simple Notion-style) */}
      <section className="section" id="features">
        <div className="sectionInner">
          <h2 className="h2">Features</h2>
          <div className="grid">
            <div className="card">
              <h3>Explore housing</h3>
              <p>Browse places with neighborhood context and quick filters.</p>
            </div>
            <div className="card">
              <h3>Find hidden gems</h3>
              <p>Curated spots and events to help you actually enjoy the city.</p>
            </div>
            <div className="card">
              <h3>Discover jobs</h3>
              <p>Nearby roles and easy links so you can move fast.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="sectionInner">
          <h2 className="h2">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="stepNum">1</div>
              <div>
                <div className="stepTitle">Tell us what you want</div>
                <div className="stepText">Your budget, interests, and preferred areas.</div>
              </div>
            </div>
            <div className="step">
              <div className="stepNum">2</div>
              <div>
                <div className="stepTitle">We show matches</div>
                <div className="stepText">Housing, gems, and jobs around you.</div>
              </div>
            </div>
            <div className="step">
              <div className="stepNum">3</div>
              <div>
                <div className="stepTitle">Save and build a plan</div>
                <div className="stepText">Keep favorites and make your week easier.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>© {new Date().getFullYear()} Urban Match</div>
        <div className="footerLinks">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#get-started">Get started</a>
        </div>
      </footer>

      <style jsx>{`
        :global(html, body) {
          padding: 0;
          margin: 0;
          background: #fff;
          color: #111;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica,
            Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }

        .page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Background video (very subtle like a hero illustration) */
        .bgWrap {
          position: fixed;
          inset: 0;
          z-index: -2;
        }
        .bgVideo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.95) contrast(0.95);
        }
        .bgOverlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(6px);
        }

        /* Notion-like navbar */
        .nav {
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }
        .navLeft {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .logoBox {
          width: 30px;
          height: 30px;
          border: 2px solid #111;
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 14px;
          background: #fff;
        }
        .brand {
          font-weight: 700;
          white-space: nowrap;
        }
        .navLinks {
          display: flex;
          gap: 16px;
          margin-left: 14px;
        }
        .navLinks a {
          text-decoration: none;
          color: #111;
          opacity: 0.78;
          font-size: 14px;
        }
        .navLinks a:hover {
          opacity: 1;
        }
        .navRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Buttons (Notion-ish) */
        .btn {
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid rgba(0, 0, 0, 0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
        }
        .btn:active {
          transform: translateY(1px);
        }
        .btnPrimary {
          background: #1d4ed8; /* blue */
          color: #fff;
          border-color: transparent;
          box-shadow: 0 10px 22px rgba(29, 78, 216, 0.18);
        }
        .btnPrimary:hover {
          box-shadow: 0 14px 28px rgba(29, 78, 216, 0.22);
        }
        .btnGhost {
          background: rgba(255, 255, 255, 0.75);
          color: #111;
        }
        .btnGhost:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        /* Hamburger icon */
        .iconBtn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.75);
          display: none;
          cursor: pointer;
          padding: 10px;
          gap: 4px;
          flex-direction: column;
          justify-content: center;
        }
        .iconBtn span {
          display: block;
          height: 2px;
          width: 100%;
          background: rgba(0, 0, 0, 0.75);
          border-radius: 999px;
        }

        /* Hero */
        .hero {
          max-width: 1120px;
          margin: 0 auto;
          padding: 70px 20px 38px;
        }
        .heroInner {
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(29, 78, 216, 0.10);
          border: 1px solid rgba(29, 78, 216, 0.18);
          color: #0f172a;
          font-weight: 600;
          font-size: 13px;
        }
        .title {
          margin: 18px 0 0;
          font-size: 56px;
          line-height: 1.02;
          letter-spacing: -1.2px;
        }
        .subtitle {
          margin: 14px auto 0;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.72);
          max-width: 680px;
        }
        .ctaRow {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Mini feature cards (Notion-like simple blocks) */
        .miniRow {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .miniCard {
          text-align: left;
          padding: 14px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .miniCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08);
        }
        .miniTop {
          font-weight: 700;
          margin-bottom: 6px;
        }
        .miniText {
          color: rgba(0, 0, 0, 0.68);
          font-size: 14px;
          line-height: 1.5;
        }

        /* Sections */
        .section {
          padding: 46px 20px;
        }
        .sectionInner {
          max-width: 1120px;
          margin: 0 auto;
        }
        .h2 {
          margin: 0 0 14px;
          font-size: 24px;
          letter-spacing: -0.3px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .card {
          padding: 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
        }
        .card h3 {
          margin: 0 0 6px;
          font-size: 16px;
        }
        .card p {
          margin: 0;
          color: rgba(0, 0, 0, 0.68);
          line-height: 1.55;
          font-size: 14px;
        }

        /* Steps */
        .steps {
          display: grid;
          gap: 10px;
          max-width: 760px;
        }
        .step {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 12px;
          align-items: start;
          padding: 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
        }
        .stepNum {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(29, 78, 216, 0.10);
          border: 1px solid rgba(29, 78, 216, 0.18);
          display: grid;
          place-items: center;
          font-weight: 800;
          color: #0f172a;
        }
        .stepTitle {
          font-weight: 700;
          margin-bottom: 4px;
        }
        .stepText {
          color: rgba(0, 0, 0, 0.68);
          font-size: 14px;
          line-height: 1.5;
        }

        /* Footer */
        .footer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 20px 30px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(0, 0, 0, 0.55);
          font-size: 13px;
        }
        .footerLinks {
          display: flex;
          gap: 14px;
        }
        .footerLinks a {
          color: rgba(0, 0, 0, 0.6);
          text-decoration: none;
        }
        .footerLinks a:hover {
          color: rgba(0, 0, 0, 0.85);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .title {
            font-size: 44px;
          }
          .miniRow,
          .grid {
            grid-template-columns: 1fr;
          }
          .navLinks {
            display: none;
          }
          .iconBtn {
            display: inline-flex;
          }
        }
      `}</style>
    </main>
  );
}