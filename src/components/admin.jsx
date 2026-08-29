import React, { useEffect, useState } from "react";
import AddSkill from "./addSkill";
import CardsList from "./skillcard";
import AddProject from "./AddProject";
import ProjectList from "./ProjectCard";
import RegisterForm from "./SignIn";
import { auth, db } from "../Js/firebase.config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { createRipple, rippleCSS } from "../Js/ripple";
import { Helmet } from "react-helmet";

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("projects"); // "projects" | "skills"
  const [counts, setCounts] = useState({ projects: 0, skills: 0, live: 0 });
  const [email, setEmail] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [projectsKey, setProjectsKey] = useState(0);
  const [skillsKey, setSkillsKey] = useState(0);

  /* silent auto-login on refresh */
  useEffect(() => {
    async function tryStoredLogin() {
      const storedUsername = localStorage.getItem("username");
      const storedPassword = localStorage.getItem("Password");
      if (storedUsername && storedPassword) {
        try {
          await signInWithEmailAndPassword(auth, storedUsername, storedPassword);
          setEmail(storedUsername);
          setAuthenticated(true);
        } catch {
          localStorage.clear();
          setAuthenticated(false);
        }
      }
      setChecking(false);
    }
    tryStoredLogin();
  }, []);

  /* pull quick stats once authenticated */
  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      try {
        const [projSnap, skillSnap] = await Promise.all([
          getDocs(collection(db, "Projects")),
          getDocs(collection(db, "skills")),
        ]);
        const liveCount = projSnap.docs.filter(
          (d) => (d.data().Status || "").toLowerCase() === "live"
        ).length;
        setCounts({ projects: projSnap.size, skills: skillSnap.size, live: liveCount });
      } catch (e) {
        console.log("stat fetch error", e.message);
      }
    })();
  }, [authenticated, tab]);

  async function logOut() {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.clear();
    setAuthenticated(false);
    setEmail("");
  }

  const sharedStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    :root {
      --cyan: #08BDBA; --blueprint-blue: #4F9DFF; --pulse: #FFA94D; --schematic-line: rgba(79,157,255,0.15); --cyan-dim: rgba(8,189,186,0.12); --cyan-glow: rgba(8,189,186,0.3);
      --bg: #0b0f17; --glass: rgba(255,255,255,0.04); --glass-border: rgba(255,255,255,0.09);
      --text: #e8f0f8; --muted: #7a8fa6;
    }
    ${rippleCSS}
  `;

  if (checking) {
    return (
      <>
        <style>{sharedStyle}</style>
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
          Checking session...
        </div>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <style>{sharedStyle}</style>
        <Helmet><title>Admin Login | Salal</title></Helmet>
        <div className="si-page">
          <RegisterForm onSuccess={(user) => { setEmail(user?.email || ""); setAuthenticated(true); }} />
        </div>
      </>
    );
  }

  return (
    <div className="admin-root">
      <style>{`
        ${sharedStyle}
        .admin-root { min-height: calc(100vh - 64px); background: var(--bg); font-family: 'DM Sans', sans-serif; }

        /* ── top bar ── */
        .admin-topbar {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1rem;
          padding: 2.2rem 2.5rem 1.5rem;
          max-width: 1300px; margin: 0 auto;
        }
        .admin-title {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem; color: var(--text);
        }
        .admin-sub { color: var(--muted); font-size: 0.85rem; margin-top: 0.2rem; }
        .admin-logout {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(239,68,68,0.1); color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3); border-radius: 10px;
          padding: 0.6rem 1.3rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .admin-logout:hover { background: rgba(239,68,68,0.2); transform: translateY(-2px); }

        /* ── stats ── */
        .admin-stats {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem; max-width: 1300px; margin: 0 auto; padding: 0 2.5rem 2rem;
        }
        .stat-card {
          background: var(--glass); border: 1px solid var(--glass-border); border-radius: 14px;
          padding: 1.2rem 1.4rem; backdrop-filter: blur(10px);
          animation: fadeUp 0.5s ease both;
        }
        .stat-card .num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.9rem; color: var(--cyan); line-height: 1; }
        .stat-card .lbl { font-size: 0.75rem; color: var(--muted); margin-top: 0.4rem; }

        /* ── tabs ── */
        .admin-tabs {
          display: flex; gap: 0.5rem; max-width: 1300px; margin: 0 auto;
          padding: 0 2.5rem; border-bottom: 1px solid var(--glass-border);
        }
        .admin-tab {
          position: relative; overflow: hidden;
          background: none; border: none; cursor: pointer;
          color: var(--muted); font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
          padding: 0.9rem 1.4rem; transition: color 0.2s;
        }
        .admin-tab:hover { color: var(--text); }
        .admin-tab.active { color: var(--cyan); }
        .admin-tab.active::after {
          content: ''; position: absolute; left: 1.2rem; right: 1.2rem; bottom: 0; height: 2px;
          background: var(--cyan); box-shadow: 0 0 8px var(--cyan-glow); border-radius: 2px;
        }

        /* ── content ── */
        .admin-content {
          max-width: 1300px; margin: 0 auto; padding: 2.2rem 2.5rem 4rem;
          display: grid; grid-template-columns: 320px 1fr; gap: 2rem;
          align-items: start;
          animation: fadeUp 0.4s ease both;
        }
        @media (max-width: 900px) { .admin-content { grid-template-columns: 1fr; } }

        .admin-panel-heading {
          font-family: 'Syne', sans-serif; font-weight: 800; color: var(--text);
          font-size: 1.2rem; margin-bottom: 1rem;
        }
        .admin-list-wrap .skills-grid, .admin-list-wrap .projects-grid { padding: 0; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Helmet><title>Admin Dashboard | Salal</title></Helmet>

      <div className="admin-topbar">
        <div>
          <div className="admin-title">Admin Dashboard</div>
          <div className="admin-sub">{email ? `Signed in as ${email}` : "Manage your portfolio content"}</div>
        </div>
        <button className="admin-logout ripple-parent" onMouseDown={createRipple} onClick={logOut}>
          ⎋ Log Out
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat-card"><div className="num">{counts.projects}</div><div className="lbl">Total Projects</div></div>
        <div className="stat-card" style={{ animationDelay: "0.06s" }}><div className="num">{counts.live}</div><div className="lbl">Live Projects</div></div>
        <div className="stat-card" style={{ animationDelay: "0.12s" }}><div className="num">{counts.skills}</div><div className="lbl">Total Skills</div></div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === "projects" ? " active" : ""}`} onClick={() => { setTab("projects"); setEditingSkill(null); }}>Projects</button>
        <button className={`admin-tab${tab === "skills" ? " active" : ""}`} onClick={() => { setTab("skills"); setEditingProject(null); }}>Skills</button>
      </div>

      {tab === "projects" && (
        <div className="admin-content">
          <div>
            <p className="admin-panel-heading">{editingProject ? "Edit Project" : "Add New Project"}</p>
            <AddProject
              editing={editingProject}
              onDone={() => { setEditingProject(null); setProjectsKey((k) => k + 1); }}
            />
          </div>
          <div className="admin-list-wrap">
            <p className="admin-panel-heading">All Projects</p>
            <ProjectList key={projectsKey} admin={true} onEdit={(item) => setEditingProject(item)} />
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div className="admin-content">
          <div>
            <p className="admin-panel-heading">{editingSkill ? "Edit Skill" : "Add New Skill"}</p>
            <AddSkill
              editing={editingSkill}
              onDone={() => { setEditingSkill(null); setSkillsKey((k) => k + 1); }}
            />
          </div>
          <div className="admin-list-wrap">
            <p className="admin-panel-heading">All Skills</p>
            <CardsList key={skillsKey} des={true} onEdit={(item) => setEditingSkill(item)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
