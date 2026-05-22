import React from "react";
import ProjectList from "./ProjectCard";
import { Helmet } from "react-helmet";

function Projects() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap');
        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.12);
          --muted: #7a8fa6;
          --text: #e8f0f8;
        }
        .page-hero {
          text-align: center;
          padding: 4rem 2rem 3rem;
          position: relative;
        }
        .page-tag {
          display: inline-block;
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em;
          color: var(--cyan); background: var(--cyan-dim);
          border: 1px solid rgba(8,189,186,0.25);
          padding: 0.3rem 1rem; border-radius: 100px;
          margin-bottom: 1rem; font-family: 'DM Sans', sans-serif;
        }
        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
          color: var(--text); margin-bottom: 0.8rem; line-height: 1.1;
        }
        .page-title span {
          background: linear-gradient(135deg, var(--cyan), #00e5ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .page-sub {
          color: var(--muted); font-size: 0.95rem; max-width: 500px;
          margin: 0 auto; font-family: 'DM Sans', sans-serif; line-height: 1.7;
        }
        .page-content { padding: 0 1.5rem 4rem; }
      `}</style>

      <Helmet>
        <title>Projects | Salal</title>
        <meta name="description" content="Browse Salal's featured React, MERN Stack, Blazor, and AI-powered web development projects." />
      </Helmet>

      <div className="page-hero">
        <div className="page-tag">Portfolio</div>
        <h1 className="page-title">What I've <span>Created</span></h1>
        <p className="page-sub">
          Web projects built with Node.js or .NET, Computer Vision, DeepLearning and other modern technologies — each one solving a real problem.
        </p>
      </div>

      <div className="page-content">
        <ProjectList admin={false} />
      </div>
    </>
  );
}

export default Projects;
