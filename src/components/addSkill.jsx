import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { addDoc, collection } from "firebase/firestore";
import { db } from '../Js/firebase.config';
import { createRipple, rippleCSS } from '../Js/ripple';

const AddSkill = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [status, setStatus] = useState(null);

  const sendData = async (data) => {
    try {
      await addDoc(collection(db, "skills"), {
        skill: data.skill,
        level: data.level,
      });
      setStatus({ type: 'ok', msg: '✅ Skill added!' });
      reset();
    } catch {
      setStatus({ type: 'err', msg: '❌ Failed to add skill.' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="as-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root {
          --cyan: #08BDBA; --blueprint-blue: #4F9DFF; --pulse: #FFA94D; --schematic-line: rgba(79,157,255,0.15); --cyan-dim: rgba(8,189,186,0.12); --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04); --glass-border: rgba(255,255,255,0.1);
          --text: #e8f0f8; --muted: #7a8fa6;
        }
        ${rippleCSS}
        .as-wrap {
          font-family: 'DM Sans', sans-serif;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.4rem;
          backdrop-filter: blur(12px);
        }
        .as-heading {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem;
          color: var(--text); margin: 0 0 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .as-heading::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan-glow); }
        .as-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
        .as-field label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .as-field input {
          background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
          border-radius: 8px; padding: 0.6rem 0.8rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .as-field input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px var(--cyan-dim); }
        .as-hint { font-size: 0.68rem; color: var(--muted); opacity: 0.75; }
        .as-error { font-size: 0.7rem; color: #ef4444; }
        .as-submit {
          position: relative; overflow: hidden;
          width: 100%; margin-top: 0.4rem;
          background: var(--cyan); color: #0b0f17;
          border: none; border-radius: 10px;
          padding: 0.7rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 0 16px var(--cyan-glow);
        }
        .as-submit:hover { background: #00e5ff; transform: translateY(-2px); }
        .as-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .as-status { margin-top: 0.8rem; font-size: 0.8rem; text-align: center; }
        .as-status.ok { color: #22c55e; }
        .as-status.err { color: #ef4444; }
      `}</style>

      <p className="as-heading">Add Skill</p>

      <form onSubmit={handleSubmit(sendData)}>
        <div className="as-field">
          <label>Skill Name</label>
          <input autoComplete="off" placeholder="e.g. React.js" {...register("skill", { required: true })} />
          {errors.skill && <span className="as-error">Skill name is required</span>}
        </div>

        <div className="as-field">
          <label>Level</label>
          <input autoComplete="off" placeholder="Beginner / Intermediate / Advanced / Expert" {...register("level", { required: true })} />
          <span className="as-hint">Controls the progress bar fill on the Skills page.</span>
          {errors.level && <span className="as-error">Level is required</span>}
        </div>

        <button type="submit" className="as-submit ripple-parent" onMouseDown={createRipple} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Skill'}
        </button>

        {status && <p className={`as-status ${status.type}`}>{status.msg}</p>}
      </form>
    </div>
  );
};

export default AddSkill;
