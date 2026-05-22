import React, { useEffect, useState } from 'react';
import { db } from "../Js/firebase.config";
import Loader from './loader';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ProjectList = (props) => {
  const [data, setData] = useState('');

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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Projects", id));
      setData(prev => prev.filter(item => item.id !== id));
      alert("✅ Project deleted!");
    } catch (e) {
      alert("❌ Delete failed!");
    }
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --bg: #070d14;
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 0 0.5rem;
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
        }
        .project-card:hover {
          transform: translateY(-6px);
          border-color: var(--cyan);
          box-shadow: 0 0 30px var(--cyan-dim), 0 20px 40px rgba(0,0,0,0.3);
        }
        .project-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .project-card:hover::before { opacity: 1; }

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
          margin-bottom: 1.2rem;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .card-links {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
          border-top: 1px solid var(--glass-border);
          padding-top: 1rem; margin-top: auto;
        }
        .card-link {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.78rem; font-weight: 500;
          text-decoration: none; border-radius: 6px;
          padding: 0.4rem 0.85rem;
          transition: all 0.2s;
        }
        .link-github {
          color: var(--text); background: rgba(255,255,255,0.06);
          border: 1px solid var(--glass-border);
        }
        .link-github:hover { border-color: var(--cyan); color: var(--cyan); }
        .link-live {
          color: #070d14; background: var(--cyan);
          border: 1px solid var(--cyan);
        }
        .link-live:hover { background: #00e5ff; box-shadow: 0 0 16px var(--cyan-glow); }
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
      `}</style>

      <div className="projects-grid">
        {data.map((item, idx) => (
          <ProjectCard
            key={item.id}
            index={idx + 1}
            status={item.Status}
            title={item.Title}
            link={item.gitLink}
            host={item.liveLink}
            des={item.description}
            admin={props.admin}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>
    </>
  );
};

function ProjectCard({ status, title, link, host, des, admin, onDelete, index }) {
  const badgeClass =
    status?.toLowerCase() === 'live' ? 'badge-live' :
    status?.toLowerCase() === 'in development' ? 'badge-dev' : 'badge-other';

  return (
    <div className="project-card" style={{ animationDelay: `${(index - 1) * 0.08}s` }}>
      <span className="card-number">{String(index).padStart(2, '0')}</span>

      <div className="card-top">
        <span className="card-label">Project</span>
        <span className={`card-badge ${badgeClass}`}>{status || 'Complete'}</span>
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{des}</p>

      <div className="card-links">
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="card-link link-github">
            ↗ GitHub
          </a>
        )}
        {host && (
          <a href={host} target="_blank" rel="noreferrer" className="card-link link-live">
            ⚡ Live App
          </a>
        )}
        {admin && (
          <button className="card-link link-delete" onClick={onDelete}>
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectList;
