import React, { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleHelp, Compass, Layers3, LockKeyhole, Printer, X } from "lucide-react";
import "./UserManual.css";

const sections = [
  {
    id: "welcome",
    title: "Welcome to Lexora",
    icon: Compass,
    eyebrow: "GETTING STARTED",
    heading: "Your language-learning workspace",
    intro: "Lexora helps you build language skills step by step. The dashboard is your starting point for exploring the learning activities currently available.",
    bullets: [
      ["Sign in", "Create an account or sign in to open your personal dashboard."],
      ["Explore the dashboard", "Your dashboard greets you by first name and presents the learning paths."],
      ["Start with Word Studio", "Word Studio is the learning path currently available to use."],
    ],
    note: "Other learning paths are being prepared and are marked Coming Soon in the dashboard."
  },
  {
    id: "word-studio",
    title: "Word Studio",
    icon: BookOpen,
    eyebrow: "AVAILABLE NOW",
    heading: "Explore vocabulary",
    intro: "Word Studio is Lexora’s currently available learning path. Use it to explore vocabulary items and review the information provided for each word.",
    bullets: [
      ["Open Word Studio", "From the dashboard, select the Word Studio card or choose Start with Word Studio."],
      ["Review a word", "Read the word, pronunciation guide when available, word type, meaning, and related details."],
      ["Explore examples", "When provided, review example sentences, word forms, synonyms, antonyms, and language support."],
      ["Move between cards", "Use the available navigation controls to move through the vocabulary cards."],
    ],
    note: "The details shown depend on the vocabulary data available for that word."
  },
  {
    id: "dashboard",
    title: "Using the dashboard",
    icon: Layers3,
    eyebrow: "NAVIGATION",
    heading: "Find your way around",
    intro: "The dashboard brings together your learning paths, navigation menu, account profile, and help information.",
    bullets: [
      ["Learning paths", "Choose Word Studio to begin exploring vocabulary."],
      ["Navigation menu", "Use the menu button to open the navigation drawer and access the available sections."],
      ["My Profile", "Open your profile to view the name and email associated with your account."],
      ["User Manual", "Reopen this guide whenever you need help understanding the current application."],
      ["Sign out", "Use Sign out in the navigation drawer or profile area when you finish."],
    ],
    note: "Assignments, progress, saved words, and learning history are planned workspace areas; they may not yet contain functional data."
  },
  {
    id: "coming-soon",
    title: "Coming Soon",
    icon: LockKeyhole,
    eyebrow: "IN DEVELOPMENT",
    heading: "More ways to practise are planned",
    intro: "Lexora’s dashboard previews additional learning paths and workspace sections. These are not currently available for full use.",
    bullets: [
      ["Sentence Builder", "Planned support for practising sentence construction."],
      ["Writing Studio", "Planned support for organising ideas and writing text."],
      ["Conversation Lab", "Planned support for practising everyday conversations."],
      ["Assignments and progress", "Planned areas for viewing learning activities and progress."],
      ["Saved Words and history", "Planned areas for revisiting vocabulary and previous activity."],
    ],
    note: "If a dashboard item is marked Coming Soon or appears locked, it is not ready to use yet."
  },
  {
    id: "help",
    title: "Help & troubleshooting",
    icon: CircleHelp,
    eyebrow: "NEED A HAND?",
    heading: "Common questions",
    intro: "Try these checks if something in Lexora does not behave as expected.",
    bullets: [
      ["The dashboard does not open", "Check that you have signed in successfully. If needed, return to the login page and sign in again."],
      ["Vocabulary does not load", "Check your internet connection and try opening Word Studio again."],
      ["A feature is unavailable", "Check whether it is marked Coming Soon; planned features are not yet active."],
      ["Your name is not shown correctly", "Check that the name on your account is correct, then sign out and sign in again."],
    ],
    note: "This manual describes the current Lexora interface. Instructions may change as new features are released."
  },
];

export default function UserManual({ onClose }) {
  const [activeSection, setActiveSection] = useState("welcome");
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const section = sections[activeIndex] || sections[0];
  const Icon = section.icon;

  const goTo = (index) => {
    if (index >= 0 && index < sections.length) setActiveSection(sections[index].id);
  };

  return (
    <div className="user-manual-overlay" role="dialog" aria-modal="true" aria-labelledby="manual-title">
      <div className="user-manual-container">
        <header className="manual-header">
          <div className="manual-brand">
            <span className="manual-brand-mark"><BookOpen size={20} /></span>
            <div>
              <p className="manual-kicker">LEXORA GUIDE</p>
              <h1 id="manual-title" className="manual-title">User Manual</h1>
            </div>
          </div>
          <button className="close-manual-btn" type="button" onClick={onClose} aria-label="Close user manual">
            <X size={18} /> <span>Close</span>
          </button>
        </header>

        <div className="manual-content">
          <aside className="manual-sidebar" aria-label="Manual sections">
            <div className="sidebar-heading">
              <span>GUIDE</span>
              <p>Browse topics</p>
            </div>
            <nav className="sidebar-nav">
              {sections.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={activeSection === item.id ? "page" : undefined}
                  >
                    <ItemIcon size={18} />
                    <span>{item.title}</span>
                    {activeSection === item.id && <span className="nav-active-dot" />}
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-footer">
              <div className="support-box">
                <span className="support-icon"><CircleHelp size={18} /></span>
                <strong>Need help?</strong>
                <p>Start with the troubleshooting guide or return to the dashboard.</p>
                <button type="button" className="print-btn" onClick={() => window.print()}>
                  <Printer size={16} /> Print guide
                </button>
              </div>
              <p className="manual-version">LEXORA · USER GUIDE</p>
            </div>
          </aside>

          <main className="manual-main">
            <div className="section-header">
              <div className="section-heading-icon"><Icon size={24} /></div>
              <div>
                <p className="section-eyebrow">{section.eyebrow}</p>
                <h2>{section.title}</h2>
                <p className="breadcrumb">Lexora <span>/</span> {section.title}</p>
              </div>
            </div>

            <article className="section-content">
              <h3>{section.heading}</h3>
              <p className="section-intro">{section.intro}</p>
              <div className="manual-steps">
                {section.bullets.map(([title, description], index) => (
                  <div className="manual-step" key={title}>
                    <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                    {section.id === "coming-soon" && index < 3 && <span className="coming-soon-tag">Planned</span>}
                    {section.id === "word-studio" && <CheckCircle2 className="step-check" size={18} />}
                  </div>
                ))}
              </div>
              <div className="tip-box">
                <span className="tip-mark">i</span>
                <p>{section.note}</p>
              </div>
            </article>

            <footer className="section-footer">
              <div className="section-progress">
                <span>SECTION {String(activeIndex + 1).padStart(2, "0")} OF {String(sections.length).padStart(2, "0")}</span>
                <div className="progress-track"><span style={{ width: `${((activeIndex + 1) / sections.length) * 100}%` }} /></div>
              </div>
              <div className="nav-buttons">
                <button type="button" className="manual-nav-btn secondary" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}>
                  <ArrowLeft size={16} /> Previous
                </button>
                {activeIndex < sections.length - 1 ? (
                  <button type="button" className="manual-nav-btn primary" onClick={() => goTo(activeIndex + 1)}>
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="button" className="manual-nav-btn primary" onClick={onClose}>
                    Back to Lexora <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
