import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "Home",      label: "Home" },
  { to: "Skills",    label: "Skills" },
  { to: "Education", label: "Education" },
  { to: "Projects",  label: "Projects" },
  { to: "Contact",   label: "Contacts" },
];

function NavBar() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const menuRef                   = useRef();

  /* blur navbar on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

        :root {
          --cyan:        #08BDBA;
          --cyan-dim:    rgba(8,189,186,0.12);
          --cyan-glow:   rgba(8,189,186,0.3);
          --bg:          #070d14;
          --glass:       rgba(7,13,20,0.7);
          --glass-border:rgba(255,255,255,0.08);
          --text:        #e8f0f8;
          --muted:       #7a8fa6;
        }

        /* ── navbar wrapper ── */
        .nav-root {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .nav-root.nav-scrolled {
          background: var(--glass);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        .nav-root.nav-top {
          background: transparent;
          border-bottom: 1px solid transparent;
        }

        .nav-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ── logo ── */
        .nav-logo {
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 1.2rem;
          color: var(--text);
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }
        .logo-mark {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--cyan);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 800; color: #070d14;
          font-family: 'Syne', sans-serif;
          box-shadow: 0 0 14px var(--cyan-glow);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .nav-logo:hover .logo-mark {
          transform: rotate(-6deg) scale(1.1);
          box-shadow: 0 0 24px var(--cyan-glow);
        }

        /* ── desktop links ── */
        .nav-links {
          display: flex; align-items: center; gap: 0.25rem;
          list-style: none; margin: 0; padding: 0;
        }
        @media (max-width: 768px) { .nav-links { display: none; } }

        .nav-link {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          padding: 0.45rem 1rem;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.05);
        }
        .nav-link.active {
          color: var(--text);
          border-color: var(--glass-border);
          background: rgba(255,255,255,0.06);
        }
        .nav-link.active::after {
          content: '';
          position: absolute; bottom: -1px; left: 25%; right: 25%;
          height: 2px; border-radius: 1px;
          background: var(--cyan);
          box-shadow: 0 0 8px var(--cyan-glow);
        }

        /* ── hamburger ── */
        .nav-hamburger {
          display: none;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text);
          transition: border-color 0.2s, background 0.2s;
        }
        .nav-hamburger:hover { border-color: var(--cyan); background: var(--cyan-dim); }
        @media (max-width: 768px) { .nav-hamburger { display: flex; align-items: center; justify-content: center; } }

        /* ── mobile menu ── */
        .mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
          background: rgba(7,13,20,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .mobile-menu.open {
          max-height: 400px;
          opacity: 1;
        }
        .mobile-menu-inner {
          padding: 0.75rem 1.5rem 1.5rem;
          display: flex; flex-direction: column; gap: 0.25rem;
        }
        .mobile-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: all 0.2s;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .mobile-link::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--muted); flex-shrink: 0;
          transition: background 0.2s;
        }
        .mobile-link:hover {
          color: var(--text);
          background: rgba(255,255,255,0.05);
          border-color: var(--glass-border);
        }
        .mobile-link.active {
          color: var(--cyan);
          background: var(--cyan-dim);
          border-color: rgba(8,189,186,0.2);
        }
        .mobile-link.active::before { background: var(--cyan); box-shadow: 0 0 6px var(--cyan-glow); }

        /* ── page offset ── */
        .page-offset { padding-top: 64px; }
      `}</style>

      <header className={`nav-root ${scrolled ? "nav-scrolled" : "nav-top"}`} ref={menuRef}>
        <div className="nav-inner">

          {/* Logo */}
          <NavLink to="Home" className="nav-logo" onClick={() => setIsOpen(false)}>
            <div className="logo-mark">S</div>
            <span>Salal</span>
          </NavLink>

          {/* Desktop links */}
          <ul className="nav-links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setIsOpen(prev => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              /* X icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* hamburger icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`mobile-menu${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
          <div className="mobile-menu-inner">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `mobile-link${isActive ? " active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <>
      <style>{`
        .footer-root {
          position: relative; z-index: 1;
          background: rgba(7,13,20,0.8);
          border-top: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
          padding: 2rem 2rem;
          font-family: 'DM Sans', sans-serif;
        }
        .footer-inner {
          max-width: 1300px; margin: 0 auto;
          display: flex; flex-wrap: wrap;
          justify-content: space-between; align-items: center;
          gap: 1rem;
        }
        .footer-left { display: flex; align-items: center; gap: 0.6rem; }
        .footer-logo-mark {
          width: 26px; height: 26px; border-radius: 6px;
          background: #08BDBA;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800; color: #070d14;
          font-family: 'Syne', sans-serif;
        }
        .footer-copy {
          font-size: 0.82rem; color: #7a8fa6;
        }
        .footer-links {
          display: flex; gap: 1.5rem; align-items: center;
        }
        .footer-link {
          font-size: 0.82rem; color: #7a8fa6;
          text-decoration: none;
          transition: color 0.2s;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .footer-link:hover { color: #08BDBA; }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-logo-mark">S</div>
            <span className="footer-copy">© 2025 Muhammad Salal. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <a href="https://github.com/Salal04" target="_blank" rel="noreferrer" className="footer-link">
              GitHub →
            </a>
            <a href="https://www.linkedin.com/in/salal-shabbir-a022172b6" target="_blank" rel="noreferrer" className="footer-link">
              LinkedIn →
            </a>
            <a href="mailto:salalshabbir242@gmail.com" className="footer-link">
              Email →
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ── LAYOUT ── */
function Layout() {
  return (
    <>
      <style>{`
        body { margin: 0; background: #070d14; }
        .layout-root { display: flex; flex-direction: column; min-height: 100vh; background: #070d14; }
        .layout-main { flex: 1; padding-top: 64px; }
      `}</style>

      <div className="layout-root">
        <NavBar />
        <main className="layout-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout;
