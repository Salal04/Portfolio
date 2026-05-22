import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

const education = [
  {
    degree: "BS Software Engineering",
    institution: "Punjab University College of Information Technology (PUCIT)",
    period: "2022 – 2026",
    current: true,
    courses: [
      "Web Engineering",
      "Machine Learning",
      "Computer Vision",
      "Software Construction",
      "Data Structures & Algorithms",
      "Object Oriented Programming (OOP)"

    ],
  },
  {
    degree: "FSc Pre-Engineering",
    institution: "Government Islamia College Civilianes, Lahore",
    period: "2020 – 2022",
    current: false,
    courses: [],
  },
  {
    degree: "Matriculation",
    institution: "Quaid Educational Complex",
    period: "2018 – 2020",
    current: false,
    courses: [],
  },
];

function useVisible(threshold = 0.2) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function EduCard({ item, index }) {
  const [ref, visible] = useVisible();
  return (
    <div
      ref={ref}
      className={`edu-card${visible ? ' edu-visible' : ''}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      {/* Timeline dot */}
      <div className="timeline-dot">
        {item.current && <span className="dot-ring" />}
      </div>

      <div className="edu-card-inner">
        <div className="edu-card-top">
          <div>
            <span className={`edu-badge${item.current ? ' badge-current' : ''}`}>
              {item.current ? '🎓 Current' : '✓ Completed'}
            </span>
            <h3 className="edu-degree">{item.degree}</h3>
            <p className="edu-institution">{item.institution}</p>
          </div>
          <span className="edu-period">{item.period}</span>
        </div>

        {item.courses.length > 0 && (
          <div className="courses-wrap">
            <p className="courses-label">Key Courses</p>
            <div className="courses-grid">
              {item.courses.map(c => (
                <span key={c} className="course-chip">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Education() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.28);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }

        .edu-hero {
          text-align: center; padding: 4rem 2rem 2.5rem;
        }
        .page-tag {
          display: inline-block; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 0.15em; color: var(--cyan); background: var(--cyan-dim);
          border: 1px solid rgba(8,189,186,0.25); padding: 0.3rem 1rem;
          border-radius: 100px; margin-bottom: 1rem; font-family: 'DM Sans', sans-serif;
        }
        .edu-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
          color: var(--text); margin-bottom: 0.8rem; line-height: 1.1;
        }
        .edu-title span {
          background: linear-gradient(135deg, var(--cyan), #00e5ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .edu-sub {
          color: var(--muted); font-size: 0.95rem; max-width: 460px;
          margin: 0 auto; font-family: 'DM Sans', sans-serif; line-height: 1.7;
        }

        /* timeline */
        .timeline-wrap {
          max-width: 780px; margin: 0 auto;
          padding: 2rem 2rem 5rem;
          position: relative;
        }
        .timeline-wrap::before {
          content: '';
          position: absolute; left: 2.8rem; top: 2rem; bottom: 5rem;
          width: 2px;
          background: linear-gradient(180deg, var(--cyan), rgba(8,189,186,0.1));
        }
        @media (max-width: 600px) {
          .timeline-wrap::before { left: 1.5rem; }
        }

        .edu-card {
          display: flex; gap: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0; transform: translateX(-24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .edu-card.edu-visible { opacity: 1; transform: translateX(0); }

        .timeline-dot {
          flex-shrink: 0; margin-top: 1.2rem;
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 12px var(--cyan-glow);
          position: relative;
          z-index: 1;
        }
        .dot-ring {
          position: absolute; inset: -5px; border-radius: 50%;
          border: 2px solid var(--cyan-glow);
          animation: ringPulse 2s ease infinite;
        }
        @keyframes ringPulse {
          0%,100%{ transform: scale(1); opacity: 1; }
          50%    { transform: scale(1.5); opacity: 0.3; }
        }

        .edu-card-inner {
          flex: 1;
          background: var(--glass); border: 1px solid var(--glass-border);
          border-radius: 16px; padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .edu-card-inner:hover {
          border-color: var(--cyan);
          box-shadow: 0 0 24px var(--cyan-dim);
        }

        .edu-card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 1rem; flex-wrap: wrap;
        }
        .edu-badge {
          font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em;
          padding: 0.2rem 0.7rem; border-radius: 100px;
          border: 1px solid var(--glass-border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          margin-bottom: 0.5rem; display: inline-block;
        }
        .badge-current {
          color: var(--cyan); border-color: var(--cyan-glow);
          background: var(--cyan-dim);
        }
        .edu-degree {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem; font-weight: 800; color: var(--text);
          margin-bottom: 0.3rem;
        }
        .edu-institution {
          font-size: 0.85rem; color: var(--muted); font-family: 'DM Sans', sans-serif;
        }
        .edu-period {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem; color: var(--cyan); font-weight: 600;
          white-space: nowrap; padding-top: 0.2rem;
        }

        .courses-wrap { margin-top: 1.2rem; }
        .courses-label {
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted); margin-bottom: 0.6rem;
          font-family: 'DM Sans', sans-serif;
        }
        .courses-grid {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
        }
        .course-chip {
          font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 6px;
          background: var(--cyan-dim); border: 1px solid var(--cyan-glow);
          color: var(--cyan); font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <Helmet>
        <title>Education | Salal</title>
      </Helmet>

      <div className="edu-hero">
        <div className="page-tag">Background</div>
        <h1 className="edu-title">Learning <span>Journey</span></h1>
        <p className="edu-sub">
          My academic background and the degrees I've earned — building a strong foundation in software engineering.
        </p>
      </div>

      <div className="timeline-wrap">
        {education.map((item, i) => (
          <EduCard key={item.degree} item={item} index={i} />
        ))}
      </div>
    </>
  );
}

export default Education;
