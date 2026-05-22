import { db } from "../Js/firebase.config";
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, getDocs, doc } from 'firebase/firestore';
import Loader from "./loader";

/* level label → numeric fill % */
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

const CardsList = (props) => {
  const [skills, setSkills] = useState('');

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
    } catch (e) {
      alert("❌ Delete failed!");
    }
  };

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.2rem;
        }
        .skill-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 14px; padding: 1.4rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
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
          opacity: 0; transition: opacity 0.3s;
        }
        .skill-card:hover::after { opacity: 1; }

        .skill-icon-wrap {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--cyan-dim); border: 1px solid var(--cyan-glow);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; margin-bottom: 0.9rem;
        }
        .skill-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: var(--text);
          margin-bottom: 0.25rem;
        }
        .skill-level-text {
          font-size: 0.72rem; color: var(--muted);
          text-transform: capitalize; margin-bottom: 0.75rem;
        }
        .skill-bar-bg {
          width: 100%; height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .skill-bar-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--cyan), #00e5ff);
          width: 0%;
          transition: width 1s cubic-bezier(0.4,0,0.2,1) 0.3s;
          box-shadow: 0 0 8px var(--cyan-glow);
        }
        .skill-card:hover .skill-bar-fill,
        .skill-card.visible .skill-bar-fill {
          width: var(--fill);
        }

        .skill-delete-btn {
          margin-top: 0.9rem; width: 100%;
          padding: 0.4rem; border-radius: 6px;
          font-size: 0.75rem; cursor: pointer;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08); color: #ef4444;
          transition: all 0.2s;
        }
        .skill-delete-btn:hover { background: rgba(239,68,68,0.2); }

        @keyframes skillIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="skills-grid">
        {skills.map((skill, idx) => (
          <SkillCard
            key={skill.id}
            skill={skill.skill}
            level={skill.level}
            showDelete={props.des}
            onDelete={() => OnDelete(skill.id)}
            delay={idx * 0.06}
          />
        ))}
      </div>
    </>
  );
};

function SkillCard({ skill, level, showDelete, onDelete, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef();
  const fill = levelToPercent(level);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`skill-card${visible ? ' visible' : ''}`}
      style={{ animationDelay: `${delay}s`, '--fill': `${fill}%` }}
    >
      <div className="skill-icon-wrap">⚡</div>
      <p className="skill-name">{skill}</p>
      <p className="skill-level-text">{level}</p>
      <div className="skill-bar-bg">
        <div className="skill-bar-fill" style={{ width: visible ? `${fill}%` : '0%' }} />
      </div>
      {showDelete && (
        <button className="skill-delete-btn" onClick={onDelete}>🗑 Delete</button>
      )}
    </div>
  );
}

export default CardsList;
