import React, { useEffect, useMemo, useState } from 'react';
import { db } from "../Js/firebase.config";
import Loader from './loader';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { createRipple, rippleCSS } from '../Js/ripple';

/* split "React, Node.js, MongoDB" -> ["React","Node.js","MongoDB"] */
function parseFrameworks(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/* lower number = shown first. Missing/invalid priority sinks to the bottom */
function priorityValue(item) {
  const n = Number(item.Priority);
  return Number.isFinite(n) && n > 0 ? n : 9999;
}

const ProjectList = (props) => {
  const [data, setData] = useState('');
  const [activeFramework, setActiveFramework] = useState('All');
  const [selected, setSelected] = useState(null); // project open in modal

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const col = collection(db, "Projects");
        const snap = await getDocs(col);
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.log('Error:', e.message);
      }
    };
    fetchProjects();
  }, []);

  /* close modal on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* lock page scroll while modal is open */
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Projects", id));
      setData(prev => prev.filter(item => item.id !== id));
      setSelected(null);
    } catch {
      alert("❌ Delete failed!");
    }
  };

  const onlyFeatured = !!props.onlyFeatured;

  /* home page passes onlyFeatured — everything else (Projects page, admin) sees the full list */
  const baseData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return onlyFeatured ? data.filter((item) => item.Featured) : data;
  }, [data, onlyFeatured]);

  const sorted = useMemo(() => {
    return [...baseData].sort((a, b) => priorityValue(a) - priorityValue(b));
  }, [baseData]);

  const frameworks = useMemo(() => {
    const set = new Set();
    baseData.forEach((item) => parseFrameworks(item.Framework).forEach((f) => set.add(f)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [baseData]);

  const filtered = useMemo(() => {
    if (activeFramework === 'All') return sorted;
    return sorted.filter((item) => parseFrameworks(item.Framework).includes(activeFramework));
  }, [sorted, activeFramework]);

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
        <Loader />
        <p style={{ color: '#7a8fa6', marginTop: '1rem', fontFamily: 'DM Sans, sans-serif' }}>Loading projects...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root {
          --cyan: #08BDBA; --blueprint-blue: #4F9DFF; --pulse: #FFA94D; --schematic-line: rgba(79,157,255,0.15);
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --bg: #0b0f17;
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }
        ${rippleCSS}

        /* ── filter bar ── */
        .filter-bar {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          margin-bottom: 1.8rem; padding: 0 0.5rem;
          font-family: 'DM Sans', sans-serif;
          align-items: center;
        }
        .filter-label {
          font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted); margin-right: 0.3rem;
        }
        .filter-chip {
          position: relative; overflow: hidden;
          font-size: 0.8rem; font-weight: 500;
          color: var(--muted); background: var(--glass);
          border: 1px solid var(--glass-border);
          padding: 0.4rem 1rem; border-radius: 100px;
          cursor: pointer; transition: all 0.25s;
        }
        .filter-chip:hover { color: var(--text); border-color: var(--cyan-glow); transform: translateY(-1px); }
        .filter-chip.active {
          color: #0b0f17; background: var(--cyan);
          border-color: var(--cyan); font-weight: 700;
          box-shadow: 0 0 16px var(--cyan-glow);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 0 0.5rem;
        }
        .empty-state {
          text-align: center; color: var(--muted);
          padding: 3rem 1rem; font-family: 'DM Sans', sans-serif;
          grid-column: 1 / -1;
        }
        .project-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.6rem;
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          font-family: 'DM Sans', sans-serif;
          animation: cardIn 0.5s ease both;
          cursor: pointer;
        }
        .project-card:hover {
          transform: translateY(-6px);
          border-color: var(--cyan);
          box-shadow: 0 0 30px var(--cyan-dim), 0 20px 40px rgba(0,0,0,0.3);
        }
        .project-card:active { transform: translateY(-3px) scale(0.99); }
        .project-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .project-card:hover::before { opacity: 1; }

        /* ── blueprint-style corner brackets on hover ── */
        .card-corner {
          position: absolute; width: 16px; height: 16px;
          border: 2px solid var(--blueprint-blue);
          opacity: 0; transition: opacity 0.25s, transform 0.25s;
          pointer-events: none;
        }
        .corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; transform: translate(4px, 4px); }
        .corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; transform: translate(-4px, -4px); }
        .project-card:hover .card-corner { opacity: 0.85; transform: translate(0, 0); }

        .card-top .card-mono-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem; color: var(--pulse);
          letter-spacing: 0.02em; text-transform: none;
        }

        .card-top {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .card-label {
          font-size: 0.7rem; color: var(--muted); text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .card-badge {
          font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; padding: 0.25rem 0.75rem; border-radius: 100px;
          border: 1px solid;
        }
        .badge-live   { color: #22c55e; border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.1); }
        .badge-dev    { color: #f59e0b; border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.1); }
        .badge-other  { color: var(--cyan); border-color: var(--cyan-glow); background: var(--cyan-dim); }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem; font-weight: 700;
          color: var(--text); margin-bottom: 0.6rem;
        }
        .card-desc {
          font-size: 0.85rem; color: var(--muted); line-height: 1.7;
          margin-bottom: 1rem;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .tag-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.2rem; }
        .tag-chip {
          font-size: 0.68rem; font-weight: 500; color: var(--cyan);
          background: var(--cyan-dim); border: 1px solid rgba(8,189,186,0.25);
          padding: 0.2rem 0.65rem; border-radius: 100px;
        }

        .card-links {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
          border-top: 1px solid var(--glass-border);
          padding-top: 1rem; margin-top: auto;
        }
        .card-link {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.78rem; font-weight: 500;
          text-decoration: none; border-radius: 6px;
          padding: 0.4rem 0.85rem;
          transition: all 0.2s; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .link-github {
          color: var(--text); background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
        }
        .link-github:hover { border-color: var(--cyan); color: var(--cyan); }
        .link-live {
          color: #0b0f17; background: var(--cyan);
          border: 1px solid var(--cyan);
        }
        .link-live:hover { background: #00e5ff; box-shadow: 0 0 16px var(--cyan-glow); }
        .link-view {
          color: var(--text); background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
        }
        .link-view:hover { border-color: var(--cyan); color: var(--cyan); }
        .link-delete {
          color: #ef4444; background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25); cursor: pointer;
        }
        .link-delete:hover { background: rgba(239,68,68,0.2); }

        .card-number {
          position: absolute; top: 1.2rem; right: 1.2rem;
          font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800;
          color: rgba(255,255,255,0.03); pointer-events: none; user-select: none;
          line-height: 1;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── modal ── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(3,7,12,0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: overlayIn 0.25s ease both;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          position: relative;
          background: #0a121c;
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          max-width: 560px; width: 100%;
          max-height: 85vh; overflow-y: auto;
          padding: 2.2rem;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(8,189,186,0.08);
          animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-close {
          position: absolute; top: 1.2rem; right: 1.2rem;
          width: 34px; height: 34px; border-radius: 50%;
          background: var(--glass); border: 1px solid var(--glass-border);
          color: var(--text); font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { border-color: var(--cyan); color: var(--cyan); transform: rotate(90deg); }

        .modal-top { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 1rem; }
        .modal-title {
          font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800;
          color: var(--text); margin: 0.8rem 0 1rem; line-height: 1.2;
        }
        .modal-desc {
          font-size: 0.92rem; line-height: 1.85; color: #a9bdd1;
          margin-bottom: 1.5rem; white-space: pre-line;
        }
        .modal-links { display: flex; gap: 0.8rem; flex-wrap: wrap; }

        @media (max-width: 600px) {
          .modal-box { padding: 1.6rem; border-radius: 16px; }
        }
      `}</style>

      {!onlyFeatured && frameworks.length > 0 && (
        <div className="filter-bar">
          <span className="filter-label">Filter:</span>
          <button
            className={`filter-chip ripple-parent${activeFramework === 'All' ? ' active' : ''}`}
            onMouseDown={createRipple}
            onClick={() => setActiveFramework('All')}
          >
            All
          </button>
          {frameworks.map((fw) => (
            <button
              key={fw}
              className={`filter-chip ripple-parent${activeFramework === fw ? ' active' : ''}`}
              onMouseDown={createRipple}
              onClick={() => setActiveFramework(fw)}
            >
              {fw}
            </button>
          ))}
        </div>
      )}

      <div className="projects-grid">
        {filtered.length === 0 && (
          <p className="empty-state">
            {onlyFeatured
              ? 'No featured projects yet — mark one as featured in the admin panel.'
              : 'No projects match this filter yet.'}
          </p>
        )}
        {filtered.map((item, idx) => (
          <ProjectCard
            key={item.id}
            index={idx + 1}
            status={item.Status}
            title={item.Title}
            link={item.gitLink}
            host={item.liveLink}
            des={item.description}
            frameworks={parseFrameworks(item.Framework)}
            admin={props.admin}
            onDelete={() => handleDelete(item.id)}
            onOpen={() => setSelected(item)}
          />
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box" role="dialog" aria-modal="true">
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>

            <div className="modal-top">
              <span
                className={`card-badge ${
                  selected.Status?.toLowerCase() === 'live' ? 'badge-live' :
                  selected.Status?.toLowerCase() === 'in development' ? 'badge-dev' : 'badge-other'
                }`}
              >
                {selected.Status || 'Complete'}
              </span>
            </div>

            <h2 className="modal-title">{selected.Title}</h2>

            {parseFrameworks(selected.Framework).length > 0 && (
              <div className="tag-row">
                {parseFrameworks(selected.Framework).map((fw) => (
                  <span key={fw} className="tag-chip">{fw}</span>
                ))}
              </div>
            )}

            <p className="modal-desc">{selected.description}</p>

            <div className="modal-links">
              {selected.gitLink && (
                <a
                  href={selected.gitLink} target="_blank" rel="noreferrer"
                  className="card-link link-github ripple-parent" onMouseDown={createRipple}
                >
                  ↗ View Code
                </a>
              )}
              {selected.liveLink && (
                <a
                  href={selected.liveLink} target="_blank" rel="noreferrer"
                  className="card-link link-live ripple-parent" onMouseDown={createRipple}
                >
                  ⚡ Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function ProjectCard({ status, title, link, host, des, frameworks, admin, onDelete, onOpen, index }) {
  const badgeClass =
    status?.toLowerCase() === 'live' ? 'badge-live' :
    status?.toLowerCase() === 'in development' ? 'badge-dev' : 'badge-other';

  return (
    <div
      className="project-card ripple-parent"
      style={{ animationDelay: `${(index - 1) * 0.08}s` }}
      onMouseDown={createRipple}
      onClick={onOpen}
    >
      <span className="card-number">{String(index).padStart(2, '0')}</span>
      <span className="card-corner corner-tl" />
      <span className="card-corner corner-br" />

      <div className="card-top">
        <span className="card-label card-mono-tag">[ {String(index).padStart(2, '0')} ]</span>
        <span className={`card-badge ${badgeClass}`}>{status || 'Complete'}</span>
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{des}</p>

      {frameworks.length > 0 && (
        <div className="tag-row">
          {frameworks.slice(0, 4).map((fw) => (
            <span key={fw} className="tag-chip">{fw}</span>
          ))}
          {frameworks.length > 4 && <span className="tag-chip">+{frameworks.length - 4}</span>}
        </div>
      )}

      <div className="card-links">
        {link && (
          <a
            href={link} target="_blank" rel="noreferrer" className="card-link link-github ripple-parent"
            onMouseDown={(e) => { e.stopPropagation(); createRipple(e); }}
            onClick={(e) => e.stopPropagation()}
          >
            ↗ GitHub
          </a>
        )}
        {host && (
          <a
            href={host} target="_blank" rel="noreferrer" className="card-link link-live ripple-parent"
            onMouseDown={(e) => { e.stopPropagation(); createRipple(e); }}
            onClick={(e) => e.stopPropagation()}
          >
            ⚡ Live App
          </a>
        )}
        <button
          className="card-link link-view ripple-parent"
          onMouseDown={(e) => { e.stopPropagation(); createRipple(e); }}
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          🔎 Details
        </button>
        {admin && (
          <button
            className="card-link link-delete ripple-parent"
            onMouseDown={(e) => { e.stopPropagation(); createRipple(e); }}
            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this project?')) onDelete(); }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectList;
