import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Js/firebase.config";
import { createRipple, rippleCSS } from '../Js/ripple';

const RegisterForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      localStorage.setItem("username", username);
      localStorage.setItem("Password", password);
      onSuccess?.(userCredential.user);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="si-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root {
          --cyan: #08BDBA; --blueprint-blue: #4F9DFF; --pulse: #FFA94D; --schematic-line: rgba(79,157,255,0.15); --cyan-dim: rgba(8,189,186,0.12); --cyan-glow: rgba(8,189,186,0.3);
          --bg: #0b0f17; --glass: rgba(255,255,255,0.04); --glass-border: rgba(255,255,255,0.1);
          --text: #e8f0f8; --muted: #7a8fa6;
        }
        ${rippleCSS}
        .si-page {
          min-height: calc(100vh - 64px);
          display: flex; align-items: center; justify-content: center;
          background: var(--bg); padding: 2rem;
        }
        .si-wrap {
          font-family: 'DM Sans', sans-serif;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 2.4rem;
          width: 100%; max-width: 380px;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: siIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes siIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .si-badge {
          width: 44px; height: 44px; border-radius: 12px; margin: 0 auto 1.2rem;
          background: var(--cyan-dim); border: 1px solid var(--cyan-glow);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }
        .si-heading {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem;
          color: var(--text); text-align: center; margin: 0 0 0.3rem;
        }
        .si-sub { text-align: center; color: var(--muted); font-size: 0.82rem; margin-bottom: 1.8rem; }
        .si-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .si-field label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .si-field input {
          background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
          border-radius: 8px; padding: 0.7rem 0.9rem; color: var(--text);
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .si-field input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px var(--cyan-dim); }
        .si-error {
          color: #ef4444; font-size: 0.8rem; text-align: center;
          margin: -0.3rem 0 0.9rem; animation: shake 0.3s;
        }
        @keyframes shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .si-submit {
          position: relative; overflow: hidden;
          width: 100%; margin-top: 0.4rem;
          background: var(--cyan); color: #0b0f17;
          border: none; border-radius: 10px;
          padding: 0.75rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 0 16px var(--cyan-glow);
        }
        .si-submit:hover { background: #00e5ff; transform: translateY(-2px); }
        .si-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="si-badge">🔒</div>
      <h2 className="si-heading">Admin Login</h2>
      <p className="si-sub">Sign in to manage projects & skills</p>

      <form onSubmit={handleSubmit}>
        <div className="si-field">
          <label>Email</label>
          <input
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@example.com"
            type="text"
          />
        </div>
        <div className="si-field">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />
        </div>

        {error && <p className="si-error">{error}</p>}

        <button type="submit" className="si-submit ripple-parent" onMouseDown={createRipple} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
