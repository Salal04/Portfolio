import React, { useEffect, useState, useRef } from "react";
import ProjectList from "./ProjectCard";
import CardsList from "./skillcard";
import { NavLink } from "react-router-dom";
import profile from "../assets/pic23.png";
import { Helmet } from "react-helmet";

/* ─── Floating particle background ─── */
function Particles() {
  return (
    <div className="particles-bg" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${6 + Math.random() * 10}s`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          opacity: 0.15 + Math.random() * 0.3,
        }} />
      ))}
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(to / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= to) { setCount(to); clearInterval(timer); }
          else setCount(start);
        }, 35);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Contact chip ─── */
function Chip({ icon, label, value, href }) {
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel="noreferrer"
      className="contact-chip"
    >
      <span className="chip-icon">{icon}</span>
      <div>
        <p className="chip-label">{label}</p>
        <p className="chip-value">{value}</p>
      </div>
    </a>
  );
}

function Dashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.15);
          --cyan-glow: rgba(8,189,186,0.35);
          --bg: #070d14;
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }

        .portfolio-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* ── particles ── */
        .particles-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
        }
        .particle {
          position: absolute; bottom: -10px; border-radius: 50%;
          background: var(--cyan);
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.4); opacity: 0; }
        }

        /* ── hero ── */
        .hero-section {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 5rem 4rem 3rem;
          align-items: center;
          min-height: 92vh;
        }
        @media (max-width: 768px) {
          .hero-section { grid-template-columns: 1fr; padding: 3rem 1.5rem 2rem; min-height: auto; }
          .hero-img-col { order: -1; }
        }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--cyan-dim); border: 1px solid var(--cyan-glow);
          padding: 0.3rem 1rem; border-radius: 100px;
          font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--cyan); font-family: 'DM Sans', sans-serif;
          animation: fadeSlideDown 0.6s ease both;
        }
        .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); animation: pulse 1.8s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .hero-name {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 800; line-height: 1.05;
          margin: 1rem 0 0.5rem;
          animation: fadeSlideUp 0.7s 0.1s ease both;
        }
        .hero-name .highlight {
          background: linear-gradient(135deg, var(--cyan) 0%, #00e5ff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-role {
          font-size: 1.1rem; color: var(--muted); font-weight: 300;
          animation: fadeSlideUp 0.7s 0.2s ease both;
          margin-bottom: 1.2rem;
        }

        .hero-bio {
          font-size: 0.95rem; line-height: 1.75; color: #8fa8c0;
          max-width: 480px;
          animation: fadeSlideUp 0.7s 0.3s ease both;
        }

        .hero-cta {
          display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem;
          animation: fadeSlideUp 0.7s 0.4s ease both;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--cyan); color: #070d14;
          padding: 0.75rem 1.8rem; border-radius: 8px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
          text-decoration: none; transition: all 0.25s;
          box-shadow: 0 0 20px var(--cyan-glow);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 35px var(--cyan-glow); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1px solid var(--glass-border); color: var(--text);
          padding: 0.75rem 1.8rem; border-radius: 8px;
          font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.9rem;
          text-decoration: none; transition: all 0.25s;
          background: var(--glass); backdrop-filter: blur(8px);
        }
        .btn-outline:hover { border-color: var(--cyan); color: var(--cyan); transform: translateY(-2px); }

        /* ── stats strip ── */
        .stats-strip {
          display: flex; gap: 2rem; margin-top: 2.5rem; flex-wrap: wrap;
          animation: fadeSlideUp 0.7s 0.5s ease both;
        }
        .stat { text-align: left; }
        .stat-num {
          font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
          color: var(--cyan); line-height: 1;
        }
        .stat-label { font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }

        /* ── hero image col ── */
        .hero-img-col { position: relative; display: flex; justify-content: center; align-items: center; }
        .img-ring {
          position: relative; width: 320px; height: 320px;
          animation: fadeSlideUp 0.7s 0.2s ease both;
        }
        @media (max-width: 768px) { .img-ring { width: 220px; height: 220px; } }
        .img-ring::before {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: conic-gradient(var(--cyan), transparent, var(--cyan));
          animation: rotateBorder 4s linear infinite;
          z-index: 0;
        }
        @keyframes rotateBorder { to { transform: rotate(360deg); } }
        .img-ring::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, var(--cyan-dim) 0%, transparent 70%);
          z-index: 1;
        }
        .hero-img {
          position: relative; z-index: 2;
          width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
          border: 4px solid var(--bg);
          filter: drop-shadow(0 0 30px var(--cyan-glow));
        }
        .img-badge {
          position: absolute; bottom: 10px; right: -10px;
          background: var(--glass); backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 0.5rem 0.9rem;
          font-size: 0.75rem; z-index: 3; white-space: nowrap;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .badge-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #22c55e; margin-right: 5px; animation: pulse 1.5s infinite; }

        /* ── contact chips on hero ── */
        .hero-chips {
          position: relative; z-index: 1;
          display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;
          padding: 0 2rem 3rem;
        }
        .contact-chip {
          display: flex; align-items: center; gap: 0.75rem;
          background: var(--glass); border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 0.75rem 1.2rem;
          text-decoration: none; color: var(--text);
          backdrop-filter: blur(10px);
          transition: all 0.25s;
        }
        .contact-chip:hover { border-color: var(--cyan); transform: translateY(-3px); box-shadow: 0 0 20px var(--cyan-dim); }
        .chip-icon { font-size: 1.4rem; }
        .chip-label { font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .chip-value { font-size: 0.82rem; color: var(--text); font-weight: 500; }

        /* ── section wrapper ── */
        .section-wrap {
          position: relative; z-index: 1;
          padding: 4rem 2rem;
        }
        .section-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 2.5rem; padding: 0 0.5rem;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 800; position: relative;
          display: inline-block;
        }
        .section-title::after {
          content: ''; position: absolute; left: 0; bottom: -6px;
          width: 40px; height: 3px; border-radius: 2px;
          background: var(--cyan);
          transition: width 0.4s;
        }
        .section-title:hover::after { width: 100%; }
        .section-link {
          font-size: 0.85rem; color: var(--cyan);
          text-decoration: none; display: flex; align-items: center; gap: 0.3rem;
          transition: gap 0.2s;
        }
        .section-link:hover { gap: 0.6rem; }

        /* ── divider ── */
        .glow-divider {
          width: 100%; height: 1px; margin: 0;
          background: linear-gradient(90deg, transparent, var(--cyan-glow), transparent);
          position: relative; z-index: 1;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="portfolio-root">
        <Particles />

        <Helmet>
          <title>Home | Salal – MERN Stack & Web Developer</title>
          <meta name="description" content="I'm Salal, a MERN Stack web developer based in Lahore, Pakistan. Explore my portfolio, skills in React, Node.js, MongoDB, and modern web projects." />
        </Helmet>

        {/* ── HERO ── */}
        <section className="hero-section">
          {/* Left col */}
          <div>
            <span className="hero-eyebrow">
              <span className="eyebrow-dot" />
              Full Stack Developer
            </span>

            <h1 className="hero-name">
              Hi, I'm<br />
              <span className="highlight">Muhammad Salal</span>
            </h1>

            <p className="hero-role">MERN Stack · React · Node.js · Blazor · AI</p>

            <p className="hero-bio">
              Building clean, responsive, and interactive web applications tailored to client needs.
              Based in Lahore, Pakistan — let's bring your vision to life with fast and modern web solutions!
            </p>

            <div className="hero-cta">
              <a
                href="https://drive.google.com/file/d/1xlqqwojIZrxDYpFmZf1-76vAOf3fXViF/view?usp=drive_link"
                target="_blank" rel="noreferrer"
                className="btn-primary"
              >
                ↗ View Resume
              </a>
              <a
                href="https://drive.google.com/uc?export=download&id=1xlqqwojIZrxDYpFmZf1-76vAOf3fXViF"
                className="btn-outline"
              >
                ↓ Download CV
              </a>
            </div>

            <div className="stats-strip">
              <div className="stat">
                <div className="stat-num"><Counter to={10} suffix="+" /></div>
                <div className="stat-label">Projects Built</div>
              </div>
              <div className="stat">
                <div className="stat-num"><Counter to={3} suffix="+" /></div>
                <div className="stat-label">Years Learning</div>
              </div>
              <div className="stat">
                <div className="stat-num"><Counter to={5} suffix="+" /></div>
                <div className="stat-label">Technologies</div>
              </div>
            </div>
          </div>

          {/* Right col — image */}
          <div className="hero-img-col">
            <div className="img-ring">
              <img src={profile} alt="Muhammad Salal" className="hero-img" />
            </div>
            <div className="img-badge">
              <span className="badge-dot" />
              Open to Opportunities
            </div>
          </div>
        </section>

        {/* ── contact chips ── */}
        <div className="hero-chips">
          <Chip icon="✉️" label="Email" value="salalshabbir242@gmail.com" href="mailto:salalshabbir242@gmail.com" />
          <Chip icon="💼" label="LinkedIn" value="salal-shabbir" href="https://www.linkedin.com/in/salal-shabbir-a022172b6" />
          <Chip icon="📍" label="Location" value="Shahadara, Lahore" />
          <Chip icon="💬" label="WhatsApp" value="+92 336 4531083" href="https://wa.me/923364531083" />
        </div>

        <div className="glow-divider" />

        {/* ── SKILLS ── */}
        <section className="section-wrap">
          <div className="section-header">
            <h2 className="section-title">Skills</h2>
            <NavLink to="/Skills" className="section-link">View All →</NavLink>
          </div>
          <CardsList admin={false} />
        </section>

        <div className="glow-divider" />

        {/* ── PROJECTS ── */}
        <section className="section-wrap">
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
            <NavLink to="/Projects" className="section-link">View All →</NavLink>
          </div>
          <ProjectList />
        </section>
      </div>
    </>
  );
}

export default Dashboard;
