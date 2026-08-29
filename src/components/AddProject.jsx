import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { addDoc, collection } from "firebase/firestore";
import { db } from '../Js/firebase.config';
import { createRipple, rippleCSS } from '../Js/ripple';

function AddProject() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [status, setStatus] = useState(null); // {type:'ok'|'err', msg}

  const sendData = async (data) => {
    try {
      await addDoc(collection(db, "Projects"), {
        Status: data.Status,
        Title: data.title,
        description: data.Description,
        gitLink: data.GitLink || "",
        liveLink: data.liveLink || "",       // optional — card only shows it if filled
        Framework: data.Framework || "",     // comma separated e.g. "React, Firebase, Tailwind"
        Priority: data.Priority ? Number(data.Priority) : 9999, // lower = shows first
      });
      setStatus({ type: 'ok', msg: '✅ Project added successfully!' });
      reset();
    } catch {
      setStatus({ type: 'err', msg: '❌ Failed to add project.' });
    }
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <div className="ap-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        :root {
          --cyan: #08BDBA; --cyan-dim: rgba(8,189,186,0.12); --cyan-glow: rgba(8,189,186,0.3);
          --glass: rgba(255,255,255,0.04); --glass-border: rgba(255,255,255,0.1);
          --text: #e8f0f8; --muted: #7a8fa6;
        }
        ${rippleCSS}
        .ap-wrap {
          font-family: 'DM Sans', sans-serif;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.4rem;
          backdrop-filter: blur(12px);
        }
        .ap-heading {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem;
          color: var(--text); margin: 0 0 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .ap-heading::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan-glow); }
        .ap-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
        .ap-field label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .ap-field input, .ap-field textarea {
          background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
          border-radius: 8px; padding: 0.6rem 0.8rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ap-field input:focus, .ap-field textarea:focus {
          border-color: var(--cyan); box-shadow: 0 0 0 3px var(--cyan-dim);
        }
        .ap-hint { font-size: 0.68rem; color: var(--muted); opacity: 0.75; }
        .ap-error { font-size: 0.7rem; color: #ef4444; }
        .ap-row { display: flex; gap: 0.7rem; }
        .ap-row .ap-field { flex: 1; }
        .ap-submit {
          position: relative; overflow: hidden;
          width: 100%; margin-top: 0.4rem;
          background: var(--cyan); color: #070d14;
          border: none; border-radius: 10px;
          padding: 0.7rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 0 16px var(--cyan-glow);
        }
        .ap-submit:hover { background: #00e5ff; transform: translateY(-2px); }
        .ap-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .ap-status { margin-top: 0.8rem; font-size: 0.8rem; text-align: center; }
        .ap-status.ok { color: #22c55e; }
        .ap-status.err { color: #ef4444; }
      `}</style>

      <p className="ap-heading">Add Project</p>

      <form onSubmit={handleSubmit(sendData)}>
        <div className="ap-field">
          <label>Title</label>
          <input autoComplete="off" placeholder="e.g. AI Resume Analyzer" {...register("title", { required: true })} />
          {errors.title && <span className="ap-error">Title is required</span>}
        </div>

        <div className="ap-field">
          <label>Description</label>
          <textarea rows={3} placeholder="What does this project do?" {...register("Description", { required: true })} />
          {errors.Description && <span className="ap-error">Description is required</span>}
        </div>

        <div className="ap-row">
          <div className="ap-field">
            <label>Status</label>
            <input autoComplete="off" placeholder="Live / In Development" {...register("Status", { required: true })} />
            {errors.Status && <span className="ap-error">Required</span>}
          </div>
          <div className="ap-field">
            <label>Priority</label>
            <input type="number" min="1" autoComplete="off" placeholder="1 = shows first" {...register("Priority")} />
          </div>
        </div>

        <div className="ap-field">
          <label>Framework / Tech Stack</label>
          <input autoComplete="off" placeholder="React, Node.js, Firebase" {...register("Framework")} />
          <span className="ap-hint">Comma separated — used for tags & the sort filter on the Projects page.</span>
        </div>

        <div className="ap-field">
          <label>GitHub Link</label>
          <input autoComplete="off" placeholder="https://github.com/..." {...register("GitLink")} />
        </div>

        <div className="ap-field">
          <label>Live Link (optional)</label>
          <input autoComplete="off" placeholder="Leave blank to hide the Live Demo button" {...register("liveLink")} />
        </div>

        <button type="submit" className="ap-submit ripple-parent" onMouseDown={createRipple} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Project'}
        </button>

        {status && <p className={`ap-status ${status.type}`}>{status.msg}</p>}
      </form>
    </div>
  );
}

export default AddProject;
