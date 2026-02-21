"use client";

export default function Home() {
  return (
    <main className="page">
      {/* Permanent navbar (fixed) */}
      <header className="nav">
        <div className="navLeft">
          <div className="logoBox" aria-hidden="true">
            U
          </div>
          <span className="brand">Urban Match</span>

          <nav className="navLinks">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#about">Why STL</a>
          </nav>
        </div>

       
      </header>

      {/* Scrollable video hero */}
      <section className="videoHero">
        <video className="heroVideo" autoPlay loop muted playsInline preload="auto">
          <source src="/stl.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay so text is readable */}
        <div className="heroOverlay" />

        {/* Centered content */}
        <div className="heroContent">
          <div className="badge">St. Louis life, organized.</div>

          <h1 className="title">
            One place to explore STL.
            <br />
            Less scrolling. More living.
          </h1>

          <p className="subtitle" id="about">
            Urban Match helps you optimize your life in St. Louis by showing you housing,
            hidden gems, and jobs around you in one clean dashboard.
          </p>

          <div className="ctaRow" id="get-started">
            <a className="btn btnPrimary" href="/onboarding">
              Get started
            </a>
            <a className="btn btnGhost" href="#features">
              See features
            </a>
          </div>
        </div>
      </section>

      {/* Below hero content */}
      <section className="content">
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
      </section>

      <style jsx>{`
        :global(html, body) {
          padding: 0;
          margin: 0;
          background: #000; /* black background */
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica,
            Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }

        .page {
          min-height: 100vh;
          overflow-x: hidden;
          background: #000;
        }

        /* Fixed navbar */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.65);
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(10px);
        }

        .navLeft {
          max-width: 1120px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logoBox {
          width: 30px;
          height: 30px;
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.06);
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
          color: rgba(255, 255, 255, 0.86);
          font-size: 14px;
        }

        .navLinks a:hover {
          color: #fff;
        }

      

        /* Video hero scrolls away */
        .videoHero {
          position: relative;
          height: 92vh;
          min-height: 640px;
          overflow: hidden;
          background: #000;
          padding-top: 70px; /* offset for fixed nav */
        }

        .heroVideo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.95) contrast(0.95);
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.35) 45%,
            rgba(0, 0, 0, 0.85) 100%
          );
        }

        .heroContent {
          position: relative;
          z-index: 2;
          height: calc(92vh - 70px);
          min-height: 540px;
          display: flex;
          flex-direction: column;
          align-items: center; /* center horizontally */
          justify-content: center; /* center vertically */
          text-align: center; /* center text */
          padding: 0 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(29, 78, 216, 0.22);
          border: 1px solid rgba(96, 165, 250, 0.28);
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
          margin: 14px 0 0;
          max-width: 720px;
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
        }

        .ctaRow {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btnPrimary {
          background: #1d4ed8;
          color: #fff;
          border-color: transparent;
          box-shadow: 0 10px 22px rgba(29, 78, 216, 0.22);
        }

        .btnGhost {
          background: rgba(255, 255, 255, 0.10);
          color: #fff;
        }

        /* Below hero (black theme, but readable) */
        .content {
          background: #000;
        }

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
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
        }

        .card h3 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.55;
          font-size: 14px;
        }

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
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
        }

        .stepNum {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(29, 78, 216, 0.20);
          border: 1px solid rgba(96, 165, 250, 0.22);
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .stepTitle {
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stepText {
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
          line-height: 1.5;
        }

        .footer {
          max-width: 1120px;
          margin: 0 auto;
          padding: 20px 20px 30px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
        }

        .footerLinks {
          display: flex;
          gap: 14px;
        }

        .footerLinks a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
        }

        .footerLinks a:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        @media (max-width: 900px) {
          .title {
            font-size: 44px;
          }
          .grid {
            grid-template-columns: 1fr;
          }
          .navLinks {
            display: none;
          }
          .videoHero {
            height: 88vh;
            min-height: 560px;
          }
        }
      `}</style>
    </main>
  );
}