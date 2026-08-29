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

/* "React Native" → "reactNative" — used as the variable name in the snippet */
function toVarName(skill = '') {
  const cleaned = skill.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!cleaned) return 'skill';
  return cleaned
    .split(' ')
    .map((w, i) => (i === 0
      ? w.charAt(0).toLowerCase() + w.slice(1)
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}

function slug(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

const BAR_TICKS = 10;

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
        <p style={{ color: '#7a8fa6', marginTop: '1rem', fontFamily: 'DM Sans, sans-serif' }}>Loading skills...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root {
          --cyan: #08BDBA; --blueprint-blue: #4F9DFF; --pulse: #FFA94D; --schematic-line: rgba(79,157,255,0.15);
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --text: #e8f0f8;
          --muted: #7a8fa6;
          --tok-kw: #C792EA;
          --tok-var: #89DDFF;
          --tok-prop: var(--blueprint-blue);
          --tok-str: var(--pulse);
          --tok-num: var(--cyan);
          --tok-punct: #5a7086;
          --tok-comment: #56728c;
        }
        ${rippleCSS}

        /* ── filter + sort toolbar ── */
        .skills-toolbar {
          display: flex; flex-wrap: wrap; align-items: center;
          justify-content: space-between; gap: 0.9rem;
          margin-bottom: 1.4rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .chip {
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          color: var(--muted); font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; padding: 0.35rem 0.8rem; border-radius: 100px;
          cursor: pointer; transition: all 0.2s;
        }
        .chip:hover { border-color: var(--cyan); color: var(--text); }
        .chip.active {
          background: var(--cyan-dim); border-color: var(--cyan); color: var(--cyan);
          box-shadow: 0 0 10px var(--cyan-dim);
        }
        .sort-select-wrap {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; color: var(--muted); flex-shrink: 0;
        }
        .sort-select {
          background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border);
          color: var(--text); font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; padding: 0.35rem 0.6rem; border-radius: 6px;
          cursor: pointer; outline: none;
        }
        .sort-select:focus { border-color: var(--cyan); }
        .empty-state {
          font-family: 'JetBrains Mono', monospace; color: var(--muted);
          font-size: 0.85rem; padding: 3rem 1rem; text-align: center; font-style: italic;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
          gap: 1.2rem;
        }
        .skill-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
          animation: skillIn 0.4s ease both;
          cursor: default;
        }
        .skill-card:hover {
          border-color: var(--cyan);
          transform: translateY(-4px);
          box-shadow: 0 0 24px var(--cyan-dim);
        }
        .skill-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at top left, var(--cyan-dim) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .skill-card:hover::after { opacity: 1; }

        /* ── editor tab bar ── */
        .card-tab {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 0.8rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.02);
        }
        .tab-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
          background: var(--pulse);
          box-shadow: 0 0 6px var(--pulse);
          animation: pulse 2s ease infinite;
        }
        .tab-index {
          font-size: 0.68rem; color: var(--blueprint-blue); opacity: 0.85;
          flex-shrink: 0;
        }
        .tab-name {
          font-size: 0.68rem; color: var(--muted); font-style: italic;
          margin-left: auto; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; min-width: 0;
        }

        /* ── code body ── */
        .code-body { padding: 0.8rem 0.7rem 0.9rem; }
        .code-line {
          display: flex; align-items: baseline; gap: 0.65rem;
          overflow-x: auto; scrollbar-width: none;
        }
        .code-line::-webkit-scrollbar { display: none; }
        .ln {
          flex-shrink: 0; width: 1rem; text-align: right;
          font-size: 0.68rem; color: rgba(122,143,166,0.4);
          user-select: none;
        }
        .code {
          font-size: 0.78rem; line-height: 1.85; white-space: nowrap;
        }
        .code.indent { padding-left: 1rem; }
        .tok-kw { color: var(--tok-kw); }
        .tok-var { color: var(--tok-var); font-weight: 600; }
        .tok-prop { color: var(--tok-prop); }
        .tok-str { color: var(--tok-str); }
        .tok-num { color: var(--tok-num); font-weight: 600; }
        .tok-punct { color: var(--tok-punct); }
        .tok-comment { color: var(--tok-comment); font-style: italic; }

        .bar-filled { color: var(--cyan); text-shadow: 0 0 8px var(--cyan-glow); letter-spacing: -1px; }
        .bar-empty { color: rgba(255,255,255,0.1); letter-spacing: -1px; }

        .cursor {
          color: var(--cyan); margin-left: 2px;
          animation: blink 1s step-end infinite;
        }

        .skill-delete-btn {
          display: block; width: calc(100% - 1.4rem);
          margin: 0 0.7rem 0.8rem; padding: 0.4rem 0.5rem;
          border-radius: 6px; text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; cursor: pointer;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.06); color: #ef4444;
          transition: all 0.2s;
          position: relative; z-index: 1;
        }
        .skill-delete-btn .tok-comment { color: rgba(239,68,68,0.55); }
        .skill-delete-btn:hover { background: rgba(239,68,68,0.16); }

        @keyframes skillIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
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
                {cat === 'All' ? 'all' : `#${slug(cat)}`}
              </button>
            ))}
          </div>
          <label className="sort-select-wrap">
            sort:
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="order">priority</option>
              <option value="proficiency-desc">proficiency ↓</option>
              <option value="proficiency-asc">proficiency ↑</option>
              <option value="az">a–z</option>
              <option value="newest">newest</option>
            </select>
          </label>
        </div>
      )}

      {visibleSkills.length === 0 ? (
        <p className="empty-state">
          {onlyFeatured ? '// mark a skill as featured to show it here' : '// no skills match this filter'}
        </p>
      ) : (
        <div className="skills-grid">
          {visibleSkills.map((skill, idx) => (
            <SkillCard
              key={skill.id}
              skill={skill.skill}
              level={skill.level}
              category={getCategory(skill)}
              fill={getProficiency(skill)}
              showDelete={props.des}
              onDelete={() => OnDelete(skill.id)}
              delay={idx * 0.06}
              index={idx}
            />
          ))}
        </div>
      )}
    </>
  );
};

function SkillCard({ skill, level, category, fill, showDelete, onDelete, delay, index }) {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const ref = React.useRef();
  const varName = toVarName(skill);
  const idxTag = String(index).padStart(2, '0');

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  /* count up like a little build log once the card scrolls into view */
  useEffect(() => {
    if (!visible) return;
    let raf;
    const duration = 700;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(p * fill));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [visible, fill]);

  const filledTicks = Math.round(count / (100 / BAR_TICKS));

  return (
    <div
      ref={ref}
      className={`skill-card${visible ? ' visible' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="card-tab">
        <span className="tab-dot" />
        <span className="tab-index">[{idxTag}]</span>
        <span className="tab-name">{varName}.skill</span>
      </div>

      <div className="code-body">
        <div className="code-line">
          <span className="ln">1</span>
          <span className="code">
            <span className="tok-kw">const</span>{' '}
            <span className="tok-var">{varName}</span>{' '}
            <span className="tok-punct">= {'{'}</span>
          </span>
        </div>
        <div className="code-line">
          <span className="ln">2</span>
          <span className="code indent">
            <span className="tok-prop">category:</span>{' '}
            <span className="tok-str">"{category}"</span>
            <span className="tok-punct">,</span>
          </span>
        </div>
        <div className="code-line">
          <span className="ln">3</span>
          <span className="code indent">
            <span className="tok-prop">level:</span>{' '}
            <span className="tok-str">"{level}"</span>
            <span className="tok-punct">,</span>
          </span>
        </div>
        <div className="code-line">
          <span className="ln">4</span>
          <span className="code indent">
            <span className="tok-prop">proficiency:</span>{' '}
            <span className="tok-num">{count}</span>
            <span className="tok-punct">,</span>
          </span>
        </div>
        <div className="code-line">
          <span className="ln">5</span>
          <span className="code indent">
            <span className="tok-comment">// </span>
            <span className="bar-filled">{'█'.repeat(filledTicks)}</span>
            <span className="bar-empty">{'░'.repeat(BAR_TICKS - filledTicks)}</span>
          </span>
        </div>
        <div className="code-line">
          <span className="ln">6</span>
          <span className="code">
            <span className="tok-punct">{'}'}</span>
            <span className="cursor">▍</span>
          </span>
        </div>
      </div>

      {showDelete && (
        <button
          className="skill-delete-btn ripple-parent"
          onMouseDown={createRipple}
          onClick={() => { if (window.confirm(`Delete "${skill}"?`)) onDelete(); }}
        >
          <span className="tok-comment">// </span>{varName}.delete()
        </button>
      )}
    </div>
  );
}

export default CardsList;
