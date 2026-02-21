"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firebase auth form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function resetAuthFields() {
    setFullName("");
    setEmail("");
    setPassword("");
    setAuthError(null);
    setAuthLoading(false);
  }

  function openAuth(mode: "signup" | "login") {
    setAuthMode(mode);
    setIsAuthOpen(true);
    resetAuthFields();
  }

  function closeAuth() {
    setIsAuthOpen(false);
    resetAuthFields();
  }

  async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);

        // Save display name (optional)
        const name = fullName.trim();
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      closeAuth();
    } catch (err: any) {
      // Firebase errors are already pretty clear
      setAuthError(err?.message ?? "Authentication failed.");
      setAuthLoading(false);
    }
  }

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
        <div className="navRight">
          <button
            className={isMobileMenuOpen ? "menuButton open" : "menuButton"}
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="mobileMenuBackdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobileMenu" onClick={(event) => event.stopPropagation()}>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how" onClick={() => setIsMobileMenuOpen(false)}>
              How it works
            </a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>
              Why STL
            </a>

            <button
              className="btn btnPrimary mobileStart"
              type="button"
              onClick={() => {
                openAuth("signup");
                setIsMobileMenuOpen(false);
              }}
            >
              Get started
            </button>

            <button
              className="btn btnGhost mobileStart"
              type="button"
              onClick={() => {
                openAuth("login");
                setIsMobileMenuOpen(false);
              }}
            >
              Log in
            </button>
          </nav>
        </div>
      )}

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
            <button className="btn btnPrimary" type="button" onClick={() => openAuth("signup")}>
              Get started
            </button>


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

      {isAuthOpen && (
        <div className="authModalBackdrop" onClick={closeAuth}>
          <section
            className="authModal"
            role="dialog"
            aria-modal="true"
            aria-label="Authentication"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="authHeader">
              <h3>{authMode === "signup" ? "Create your account" : "Log in to Urban Match"}</h3>
              <button className="authClose" type="button" onClick={closeAuth}>
                Close
              </button>
            </div>

            <div className="authSwitch">
              <button
                className={authMode === "signup" ? "authTab active" : "authTab"}
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                }}
              >
                Sign up
              </button>
              <button
                className={authMode === "login" ? "authTab active" : "authTab"}
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
              >
                Log in
              </button>
            </div>

            <form className="authForm" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <label className="field">
                  Full name
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={authLoading}
                  />
                </label>
              )}

              <label className="field">
                Email
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={authLoading}
                />
              </label>

              <label className="field">
                Password
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={authLoading}
                />
              </label>

              {authError && <div className="authError">{authError}</div>}

              <button className="btn btnPrimary authSubmit" type="submit" disabled={authLoading}>
                {authLoading ? "Please wait..." : authMode === "signup" ? "Sign up" : "Log in"}
              </button>
            </form>
          </section>
        </div>
      )}

      <style jsx>{`
        :global(html, body) {
          padding: 0;
          margin: 0;
          background: #000; /* keep your current theme */
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
          padding: 10px 16px;
          background: rgba(0, 0, 0, 0.95);
          border-bottom: none;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -42px;
          height: 42px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
          pointer-events: none;
        }

        .navLeft {
          max-width: 1120px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navRight {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .logoBox {
          width: 26px;
          height: 26px;
          border: 2px solid rgba(255, 255, 255, 0.85);
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.06);
        }

        .brand {
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
        }

        .navLinks {
          display: flex;
          gap: 14px;
          margin-left: 10px;
        }

        .navLinks a {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.86);
          font-size: 13px;
        }

        .navLinks a:hover {
          color: #fff;
        }

        .menuButton {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          cursor: pointer;
          padding: 0;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
        }

        .menuButton span {
          width: 16px;
          height: 1.5px;
          background: #fff;
          border-radius: 999px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .menuButton.open span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }

        .menuButton.open span:nth-child(2) {
          opacity: 0;
        }

        .menuButton.open span:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        .mobileMenuBackdrop {
          display: none;
        }

        .mobileMenu {
          display: none;
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
          align-items: center;
          justify-content: center;
          text-align: center;
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
          cursor: pointer;
          font-family: inherit;
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

        /* Below hero */
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

        /* Auth modal */
        .authModalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(5px);
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .authModal {
          width: min(460px, 100%);
          border-radius: 18px;
          background: #0e1118;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.55);
          padding: 18px;
        }

        .authHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .authHeader h3 {
          margin: 0;
          font-size: 20px;
        }

        .authClose {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.88);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
        }

        .authSwitch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }

        .authTab {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.82);
          font-weight: 600;
          cursor: pointer;
        }

        .authTab.active {
          background: rgba(29, 78, 216, 0.26);
          border-color: rgba(96, 165, 250, 0.46);
          color: #fff;
        }

        .authForm {
          display: grid;
          gap: 10px;
        }

        .field {
          display: grid;
          gap: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        .field input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          padding: 10px 12px;
          outline: none;
        }

        .field input:focus {
          border-color: rgba(96, 165, 250, 0.68);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.16);
        }

        .authError {
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.22);
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          line-height: 1.4;
        }

        .authSubmit {
          width: 100%;
          margin-top: 8px;
        }

        .authSubmit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .nav {
            padding: 9px 12px;
          }

          .nav::after {
            bottom: -32px;
            height: 32px;
          }

          .title {
            font-size: 36px;
            line-height: 1.08;
            letter-spacing: -0.7px;
          }

          .subtitle {
            font-size: 16px;
            line-height: 1.55;
          }

          .heroContent {
            height: auto;
            min-height: 500px;
            padding: 24px 18px 32px;
          }

          .ctaRow {
            width: 100%;
            gap: 10px;
          }

          .ctaRow .btn {
            width: 100%;
            max-width: 320px;
          }

          .h2 {
            font-size: 22px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .step {
            grid-template-columns: 34px 1fr;
            gap: 10px;
            padding: 12px;
          }

          .stepNum {
            width: 30px;
            height: 30px;
            border-radius: 9px;
          }

          .section {
            padding: 36px 16px;
          }

          .footer {
            flex-direction: column;
            align-items: flex-start;
            padding: 18px 16px 28px;
          }

          .footerLinks {
            flex-wrap: wrap;
            gap: 10px 14px;
          }

          .navLinks {
            display: none;
          }

          .menuButton {
            display: inline-flex;
          }

          .mobileMenuBackdrop {
            position: fixed;
            inset: 0;
            z-index: 70;
            background: rgba(0, 0, 0, 0.22);
            display: block;
          }

          .mobileMenu {
            position: absolute;
            right: 12px;
            top: 58px;
            width: min(260px, calc(100% - 24px));
            display: grid;
            gap: 8px;
            padding: 12px;
            border-radius: 14px;
            background: rgba(7, 9, 13, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45);
          }

          .mobileMenu a {
            text-decoration: none;
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            padding: 8px 6px;
            border-radius: 8px;
          }

          .mobileMenu a:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .mobileStart {
            width: 100%;
            margin-top: 2px;
          }

          .videoHero {
            height: 88vh;
            min-height: 560px;
          }

          .authModal {
            padding: 16px;
          }

          .authHeader h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
}
