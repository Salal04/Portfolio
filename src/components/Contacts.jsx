import React from "react";
import { Helmet } from "react-helmet";

const contacts = [
  {
    icon: "📍",
    label: "Location",
    title: "Based In",
    value: "Shahadara, Lahore, Pakistan",
    href: null,
    linkText: null,
  },
  {
    icon: "📞",
    label: "Phone",
    title: "Call Me",
    value: "+92 336 4531083",
    href: "tel:+923364531083",
    linkText: "Click to call",
  },
  {
    icon: "✉️",
    label: "Email",
    title: "Email Me",
    value: "salalshabbir242@gmail.com",
    href: "mailto:salalshabbir242@gmail.com",
    linkText: "Send an email",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    title: "WhatsApp",
    value: "+92 336 4531083",
    href: "https://wa.me/923364531083",
    linkText: "Message on WhatsApp",
    external: true,
  },
  {
    icon: "🐙",
    label: "GitHub",
    title: "GitHub",
    value: "github.com/Salal04",
    href: "https://github.com/Salal04",
    linkText: "View my repositories",
    external: true,
  },
  {
    icon: "💼",
    label: "LinkedIn",
    title: "LinkedIn",
    value: "salal-shabbir-a022172b6",
    href: "https://www.linkedin.com/in/salal-shabbir-a022172b6",
    linkText: "Connect with me",
    external: true,
  },
];

function Contact() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --cyan: #08BDBA;
          --cyan-dim: rgba(8,189,186,0.12);
          --cyan-glow: rgba(8,189,186,0.28);
          --glass: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.08);
          --text: #e8f0f8;
          --muted: #7a8fa6;
        }
        .contact-hero {
          text-align: center; padding: 4rem 2rem 2.5rem;
        }
        .page-tag {
          display: inline-block; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 0.15em; color: var(--cyan); background: var(--cyan-dim);
          border: 1px solid rgba(8,189,186,0.25); padding: 0.3rem 1rem;
          border-radius: 100px; margin-bottom: 1rem; font-family: 'DM Sans', sans-serif;
        }
        .contact-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
          color: var(--text); margin-bottom: 0.8rem; line-height: 1.1;
        }
        .contact-title span {
          background: linear-gradient(135deg, var(--cyan), #00e5ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .contact-sub {
          color: var(--muted); font-size: 0.95rem; max-width: 460px;
          margin: 0 auto; font-family: 'DM Sans', sans-serif; line-height: 1.7;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.2rem;
          padding: 2rem 2rem 5rem;
          max-width: 1000px; margin: 0 auto;
        }

        .contact-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 16px; padding: 1.5rem;
          backdrop-filter: blur(12px);
          display: flex; align-items: flex-start; gap: 1.1rem;
          transition: all 0.3s ease;
          text-decoration: none; color: inherit;
          animation: fadeUp 0.5s ease both;
          position: relative; overflow: hidden;
        }
        .contact-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .contact-card:hover {
          border-color: var(--cyan);
          transform: translateY(-5px);
          box-shadow: 0 0 28px var(--cyan-dim), 0 16px 32px rgba(0,0,0,0.3);
        }
        .contact-card:hover::before { opacity: 1; }

        .card-icon-wrap {
          width: 48px; height: 48px; flex-shrink: 0;
          border-radius: 12px;
          background: var(--cyan-dim); border: 1px solid var(--cyan-glow);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          transition: transform 0.3s;
        }
        .contact-card:hover .card-icon-wrap { transform: scale(1.1) rotate(-3deg); }

        .card-body { flex: 1; min-width: 0; }
        .card-tag {
          font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--cyan); font-family: 'DM Sans', sans-serif;
          margin-bottom: 0.25rem;
        }
        .card-title-text {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700; color: var(--text);
          margin-bottom: 0.25rem;
        }
        .card-val {
          font-size: 0.82rem; color: var(--muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: 'DM Sans', sans-serif;
        }
        .card-cta {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.78rem; color: var(--cyan); margin-top: 0.5rem;
          font-weight: 500; font-family: 'DM Sans', sans-serif;
          transition: gap 0.2s;
        }
        .contact-card:hover .card-cta { gap: 0.5rem; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Helmet>
        <title>Contact | Salal - Web Developer in Lahore</title>
        <meta name="description" content="Get in touch with Salal, a full-stack web developer from Lahore. Available for freelance, collaborations, or job opportunities." />
      </Helmet>

      <div className="contact-hero">
        <div className="page-tag">Get In Touch</div>
        <h1 className="contact-title">Let's <span>Connect</span></h1>
        <p className="contact-sub">
          Always open to new opportunities, collaborations, or freelance work. Let's build something great together!
        </p>
      </div>

      <div className="contact-grid">
        {contacts.map((c, i) => (
          <ContactCard key={c.label} {...c} delay={i * 0.07} />
        ))}
      </div>
    </>
  );
}

function ContactCard({ icon, label, title, value, href, linkText, external, delay }) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      className="contact-card"
      href={href || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="card-icon-wrap">{icon}</div>
      <div className="card-body">
        <p className="card-tag">{label}</p>
        <p className="card-title-text">{title}</p>
        <p className="card-val">{value}</p>
        {linkText && <span className="card-cta">{linkText} →</span>}
      </div>
    </Tag>
  );
}

export default Contact;
