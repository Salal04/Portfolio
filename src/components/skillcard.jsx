import { db } from "../Js/firebase.config";
import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, getDocs, doc } from 'firebase/firestore';
import Loader from "./loader";
import { createRipple, rippleCSS } from "../Js/ripple";

/* level label → numeric fill % (fallback for old skills saved without a proficiency number) */
const levelMap = {
  'beginner': 30, 'basic': 35,
  'intermediate': 60, 'mid': 55,
  'advanced': 80, 'expert': 95,
  'proficient': 70, 'familiar': 45,
};
function levelToPercent(level = '') {
  const key = level.toLowerCase().trim();
  return levelMap[key] ?? 65;
}

function slug(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* a friendly word for the proficiency number, for people who don't think in percentages */
function fillLabel(pct) {
  if (pct >= 90) return 'Expert';
  if (pct >= 70) return 'Advanced';
  if (pct >= 50) return 'Intermediate';
  if (pct >= 30) return 'Familiar';
  return 'Learning';
}

/* stable-ish accent color per category, purely cosmetic */
const ACCENTS = ['#7C5CFF', '#2DD4BF', '#FF6FB0', '#FFB454', '#5EA1FF', '#9BE15D'];
function accentFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

/* ── normalized readers, so old docs (saved before category/proficiency/order/featured existed) still work ── */
const getCategory = (s) => (s.category && s.category.trim()) ? s.category : 'Uncategorized';
const getProficiency = (s) => (typeof s.proficiency === 'number' ? s.proficiency : levelToPercent(s.level));
const getOrder = (s) => (typeof s.order === 'number' ? s.order : 0);
const getCreatedMs = (s) => (s.createdAt && typeof s.createdAt.toMillis === 'function' ? s.createdAt.toMillis() : 0);

function sortSkills(list, sortBy) {
  const arr = [...list];
  switch (sortBy) {
    case 'proficiency-desc':
      return arr.sort((a, b) => getProficiency(b) - getProficiency(a));
    case 'proficiency-asc':
      return arr.sort((a, b) => getProficiency(a) - getProficiency(b));
    case 'az':
      return arr.sort((a, b) => (a.skill || '').localeCompare(b.skill || ''));
    case 'newest':
      return arr.sort((a, b) => getCreatedMs(b) - getCreatedMs(a));
    case 'order':
    default:
      return arr.sort((a, b) => getOrder(a) - getOrder(b) || (a.skill || '').localeCompare(b.skill || ''));
  }
}

const CardsList = (props) => {
  const [skills, setSkills] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('order');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const snap = await getDocs(collection(db, "skills"));
        setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching skills:", e);
      }
    };
    fetchSkills();
  }, []);

  const OnDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "skills", id));
      setSkills(prev => prev.filter(item => item.id !== id));
      alert("✅ Skill deleted!");
    } catch {
      alert("❌ Delete failed!");
    }
  };

  const categories = useMemo(() => {
    if (!Array.isArray(skills)) return ['All'];
    const set = new Set(skills.map(getCategory));
    return ['All', ...Array.from(set).sort()];
  }, [skills]);

  const onlyFeatured = !!props.onlyFeatured;

  const visibleSkills = useMemo(() => {
    if (!Array.isArray(skills)) return [];
    const base = onlyFeatured ? skills.filter(s => s.featured) : skills;
    const filtered = activeCategory === 'All'
      ? base
      : base.filter(s => getCategory(s) === activeCategory);
    return sortSkills(filtered, sortBy);
  }, [skills, activeCategory, sortBy, onlyFeatured]);

  if (!skills) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
        <Loader />
        <p style={{ color: '#8891a7', marginTop: '1rem', fontFamily: 'Inter, sans-serif' }}>Loading skills...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        :root {
          --violet: #7C5CFF;
          --mint: #2DD4BF;
          --bg-card: rgba(255,255,255,0.045);
          --border: rgba(255,255,255,0.09);
          --border-hover: rgba(124,92,255,0.55);
          --text: #EDEFF7;
          --muted: #8891a7;
          --track: rgba(255,255,255,0.08);
        }
        ${rippleCSS}

        /* ── toolbar ── */
        .skills-toolbar {
          display: flex; flex-wrap: wrap; align-items: center;
          justify-content: space-between; gap: 0.9rem;
          margin-bottom: 1.6rem;
          font-family: 'Inter', sans-serif;
        }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .chip {
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--muted); font-family: 'Inter', sans-serif; font-weight: 500;
          font-size: 0.8rem; padding: 0.45rem 0.95rem; border-radius: 100px;
          cursor: pointer; transition: all 0.2s ease;
        }
        .chip:hover { border-color: var(--violet); color: var(--text); }
        .chip.active {
          background: linear-gradient(135deg, var(--violet), var(--mint));
          border-color: transparent; color: #0b0d16; font-weight: 600;
          box-shadow: 0 4px 16px rgba(124,92,255,0.35);
        }
        .sort-select-wrap {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; color: var(--muted); flex-shrink: 0;
          font-family: 'Inter', sans-serif;
        }
        .sort-select {
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--text); font-family: 'Inter', sans-serif;
          font-size: 0.78rem; padding: 0.4rem 0.7rem; border-radius: 8px;
          cursor: pointer; outline: none;
        }
        .sort-select:focus { border-color: var(--violet); }
        .empty-state {
          font-family: 'Inter', sans-serif; color: var(--muted);
          font-size: 0.95rem; padding: 3.5rem 1rem; text-align: center;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }

        /* ── card ── */
        .skill-card {
          --accent: #7C5CFF;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid var(--border);
          border-radius: 22px;
          backdrop-filter: blur(16px);
          padding: 1.6rem 1.4rem 1.3rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.9rem;
          font-family: 'Inter', sans-serif;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1), border-color 0.35s, box-shadow 0.4s;
          animation: cardIn 0.55s cubic-bezier(.22,1,.36,1) both;
          position: relative; overflow: hidden;
          text-align: center;
        }
        .skill-card::before {
          /* soft glow blob behind the ring, colored per-category */
          content: '';
          position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
          width: 140px; height: 140px; border-radius: 50%;
          background: var(--accent); opacity: 0.22; filter: blur(38px);
          pointer-events: none; transition: opacity 0.4s;
        }
        .skill-card:hover {
          transform: translateY(-8px);
          border-color: var(--border-hover);
          box-shadow: 0 20px 40px -16px rgba(124,92,255,0.4);
        }
        .skill-card:hover::before { opacity: 0.36; }

        .card-top {
          display: flex; align-items: center; gap: 0.4rem;
          position: relative; z-index: 1;
        }
        .cat-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
          background: var(--accent); box-shadow: 0 0 8px var(--accent);
        }
        .cat-name {
          font-size: 0.68rem; color: var(--muted); text-transform: uppercase;
          letter-spacing: 0.09em; font-weight: 500;
        }

        .ring-wrap {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 0.7rem;
        }
        .ring-svg { transform: rotate(-90deg); flex-shrink: 0; }
        .ring-track { fill: none; stroke: var(--track); stroke-width: 6; }
        .ring-fill {
          fill: none; stroke: var(--accent); stroke-width: 6; stroke-linecap: round;
          transition: stroke-dashoffset 0.15s linear;
          filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 60%, transparent));
        }
        .ring-pct {
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.3rem;
          fill: var(--text);
        }

        .skill-info { display: flex; flex-direction: column; align-items: center; gap: 0.45rem; min-width: 0; width: 100%; }
        .skill-name {
          font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 1.15rem;
          color: var(--text); line-height: 1.25;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
        }
        .skill-level-pill {
          font-size: 0.7rem; font-weight: 600; color: var(--accent);
          background: color-mix(in srgb, var(--accent) 16%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          padding: 0.22rem 0.7rem; border-radius: 100px;
        }

        .skill-actions { display: flex; gap: 0.5rem; margin-top: 0.2rem; width: 100%; position: relative; z-index: 1; }
        .skill-btn {
          flex: 1; padding: 0.5rem 0.6rem; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.75rem;
          cursor: pointer; transition: all 0.2s; text-align: center;
          position: relative; z-index: 1; border: 1px solid transparent;
        }
        .skill-edit-btn {
          border-color: rgba(94,161,255,0.35); background: rgba(94,161,255,0.08); color: #5EA1FF;
        }
        .skill-edit-btn:hover { background: rgba(94,161,255,0.18); }
        .skill-delete-btn {
          border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.07); color: #f87171;
        }
        .skill-delete-btn:hover { background: rgba(239,68,68,0.17); }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .skill-card, .ring-fill { animation: none !important; transition: none !important; }
        }
      `}</style>

      {!onlyFeatured && (
        <div className="skills-toolbar">
          <div className="filter-chips">
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>
          <label className="sort-select-wrap">
            Sort by
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="order">Priority</option>
              <option value="proficiency-desc">Skill level (high → low)</option>
              <option value="proficiency-asc">Skill level (low → high)</option>
              <option value="az">A–Z</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      )}

      {visibleSkills.length === 0 ? (
        <p className="empty-state">
          {onlyFeatured ? 'Mark a skill as featured to show it here.' : 'No skills match this filter.'}
        </p>
      ) : (
        <div className="skills-grid">
          {visibleSkills.map((skill, idx) => (
            <SkillCard
              key={skill.id}
              skill={skill.skill}
              level={level_or_dash(skill.level)}
              category={getCategory(skill)}
              fill={getProficiency(skill)}
              showDelete={props.des}
              onDelete={() => OnDelete(skill.id)}
              onEdit={props.onEdit ? () => props.onEdit(skill) : undefined}
              delay={idx * 0.06}
            />
          ))}
        </div>
      )}
    </>
  );
};

function level_or_dash(level) {
  return level || '';
}

function SkillCard({ skill, level, category, fill, showDelete, onDelete, onEdit, delay }) {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const ref = React.useRef();
  const accent = useMemo(() => accentFor(category || skill || ''), [category, skill]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let raf;
    const duration = 800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * fill));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [visible, fill]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (count / 100) * circumference;

  return (
    <div
      ref={ref}
      className="skill-card"
      style={{ '--accent': accent, animationDelay: `${delay}s` }}
    >
      <div className="card-top">
        <span className="cat-dot" />
        <span className="cat-name">{category}</span>
      </div>

      <div className="ring-wrap">
        <svg className="ring-svg" width="104" height="104" viewBox="0 0 104 104">
          <circle className="ring-track" cx="52" cy="52" r={radius} />
          <circle
            className="ring-fill"
            cx="52" cy="52" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <text
            className="ring-pct"
            x="52" y="52"
            textAnchor="middle"
            dominantBaseline="central"
            transform="rotate(90 52 52)"
          >
            {count}%
          </text>
        </svg>

        <div className="skill-info">
          <span className="skill-name">{skill}</span>
          <span className="skill-level-pill">{level || fillLabel(fill)}</span>
        </div>
      </div>

      {showDelete && (
        <div className="skill-actions">
          {onEdit && (
            <button
              className="skill-btn skill-edit-btn ripple-parent"
              onMouseDown={createRipple}
              onClick={onEdit}
            >
              Edit
            </button>
          )}
          <button
            className="skill-btn skill-delete-btn ripple-parent"
            onMouseDown={createRipple}
            onClick={() => { if (window.confirm(`Delete "${skill}"?`)) onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default CardsList;
