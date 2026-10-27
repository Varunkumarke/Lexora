// import { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { ArrowDown, ArrowRight, BookOpen, FileText, Headphones, Layers, Languages, Menu, MessagesSquare, PenLine, X } from "lucide-react";
// import Logo from "../components/public/Logo";
// import HeroComposer from "../components/public/HeroComposer";
// import ContactForm from "../components/public/ContactForm";
// import { ConversationVisual, SentenceVisual, TextVisual, VocabularyVisual } from "../components/public/FeatureVisuals";
// import { prefersReducedMotion, useActiveSection, usePublicPage, useScrollReveal } from "../components/public/hooks";

// const NAV = [
//   { id: "home", label: "Home" },
//   { id: "features", label: "Features" },
//   { id: "about", label: "About" },
//   { id: "contact", label: "Contact" },
// ];

// const HEADLINE = ["Say", "exactly", "what", "you"];

// const FEATURES = [
//   {
//     id: "vocabulary",
//     icon: BookOpen,
//     title: "Vocabulary",
//     lead: "Meet new words in context.",
//     text: "Explore words by domain, hear how they’re pronounced, and check the meaning in your own language.",
//     points: ["Words organised by domain", "Audio pronunciation", "Meanings in Hindi, Telugu and Tamil"],
//     Visual: VocabularyVisual,
//   },
//   {
//     id: "conversation",
//     icon: MessagesSquare,
//     title: "Conversation",
//     lead: "Listen first. Then respond.",
//     text: "Follow short dialogues, answer questions about what you heard, and take a hint when you need one.",
//     points: ["Audio dialogues", "Questions on what you heard", "Hints when you’re stuck"],
//     Visual: ConversationVisual,
//   },
//   {
//     id: "sentence-composition",
//     icon: PenLine,
//     title: "Sentence Composition",
//     lead: "Turn loose words into clear sentences.",
//     text: "Arrange word tiles into correct, natural sentences, guided by picture and video prompts.",
//     points: ["Word-tile sentence building", "Image and video prompts", "Earn stars to unlock new cards"],
//     Visual: SentenceVisual,
//   },
//   {
//     id: "text-composition",
//     icon: FileText,
//     title: "Text Composition",
//     lead: "Connect ideas into connected writing.",
//     text: "Join sentences with logical relations, generate the combined text, and see how well it works.",
//     points: ["Choose how sentences relate", "Generate the combined text", "Receive a score on your text"],
//     Visual: TextVisual,
//   },
// ];

// const LADDER = [
//   { tag: "Word", example: <b>algorithm</b> },
//   { tag: "Sentence", example: <>The <b>API</b> returns data.</> },
//   { tag: "Text", example: <>We practised every day, <b>so</b> our speaking improved.</> },
//   { tag: "Conversation", example: <>“Could you send it by <b>noon</b>?”</> },
// ];

// const PRINCIPLES = [
//   { icon: Headphones, title: "Hear the language", text: "Pronunciation and dialogues come with audio, so learning isn’t only visual." },
//   { icon: Layers, title: "Progress by level", text: "Tasks are grouped into levels, so you can start simple and build up." },
//   { icon: Languages, title: "Your own language, too", text: "Vocabulary meanings are available in Hindi, Telugu and Tamil." },
// ];

// function Home() {
//   usePublicPage();
//   const location = useLocation();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [rootRef, jsReady] = useScrollReveal();
//   const active = useActiveSection(NAV.map((n) => n.id));

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 8);
//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // Honour /#features style links on first load.
//   useEffect(() => {
//     if (location.hash) {
//       const el = document.getElementById(location.hash.slice(1));
//       if (el) setTimeout(() => el.scrollIntoView({ behavior: "auto", block: "start" }), 50);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     document.body.style.overflow = menuOpen ? "hidden" : "";
//     return () => { document.body.style.overflow = ""; };
//   }, [menuOpen]);

//   const goTo = (id) => (e) => {
//     e.preventDefault();
//     setMenuOpen(false);
//     const behavior = prefersReducedMotion() ? "auto" : "smooth";
//     if (id === "home") {
//       window.scrollTo({ top: 0, behavior });
//       window.history.replaceState(null, "", window.location.pathname);
//       return;
//     }
//     document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
//     window.history.replaceState(null, "", `#${id}`);
//   };

//   return (
//     <div className={`ls-site ls-home${jsReady ? " ls-js" : ""}`} ref={rootRef}>
//       <a className="ls-skip" href="#features" onClick={goTo("features")}>Skip to content</a>

//       {/* ---------------- Navigation ---------------- */}
//       <header className={`ls-nav${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-open" : ""}`}>
//         <div className="ls-wrap ls-nav-inner">
//           <Logo onClick={() => setMenuOpen(false)} />
//           <nav id="ls-menu" className="ls-nav-links" aria-label="Main">
//             {NAV.map((n) => (
//               <a key={n.id} href={`#${n.id}`} onClick={goTo(n.id)} className={active === n.id ? "is-active" : ""} aria-current={active === n.id ? "true" : undefined}>
//                 {n.label}
//               </a>
//             ))}
//             <div className="ls-nav-cta">
//               <Link to="/login" className="ls-btn ls-btn-ghost" onClick={() => setMenuOpen(false)}>Log in</Link>
//               <Link to="/signup" className="ls-btn ls-btn-primary" onClick={() => setMenuOpen(false)}>Sign up</Link>
//             </div>
//           </nav>
//           <button type="button" className="ls-burger" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="ls-menu" onClick={() => setMenuOpen((o) => !o)}>
//             {menuOpen ? <X size={22} /> : <Menu size={22} />}
//           </button>
//         </div>
//       </header>

//       <main>
//         {/* ---------------- Hero ---------------- */}
//         <section id="home" className="ls-hero">
//           <div className="ls-wrap ls-hero-grid">
//             <div className="ls-hero-copy">
//               <p className="ls-eyebrow ls-rise" style={{ "--d": "0ms" }}>Vocabulary · Conversation · Sentences · Text</p>
//               <h1 className="ls-h1" aria-label="Say exactly what you mean.">
//                 {HEADLINE.map((w, i) => (
//                   <span key={w} className="ls-word" aria-hidden="true" style={{ "--i": i }}><span>{w}</span></span>
//                 ))}
//                 <span className="ls-word ls-word-hi" aria-hidden="true" style={{ "--i": HEADLINE.length }}>
//                   <span>mean.</span>
//                   <svg viewBox="0 0 200 14" preserveAspectRatio="none"><path d="M3 9c40-8 90-9 194-3" pathLength="1" /></svg>
//                 </span>
//               </h1>
//               <p className="ls-lead ls-rise" style={{ "--d": "620ms" }}>
//                 learnsphere is a place to build the language you need — from a single new word to a well-formed sentence, a
//                 connected piece of writing, and a confident conversation.
//               </p>
//               <div className="ls-hero-cta ls-rise" style={{ "--d": "760ms" }}>
//                 <Link to="/signup" className="ls-btn ls-btn-primary ls-btn-lg">Start learning <ArrowRight size={18} /></Link>
//                 <a href="#features" onClick={goTo("features")} className="ls-btn ls-btn-outline ls-btn-lg">Explore features <ArrowDown size={17} /></a>
//               </div>
//               <ul className="ls-areas ls-rise" style={{ "--d": "920ms" }} aria-label="Practice areas">
//                 {FEATURES.map((f) => (
//                   <li key={f.id}>
//                     <a href={`#${f.id}`} onClick={goTo(f.id)}><f.icon size={16} /> {f.title}</a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="ls-hero-art ls-rise" style={{ "--d": "300ms" }}>
//               <HeroComposer />
//             </div>
//           </div>
//         </section>

//         {/* ---------------- Features ---------------- */}
//         <section id="features" className="ls-section ls-features">
//           <div className="ls-wrap">
//             <header className="ls-section-head ls-reveal">
//               <p className="ls-kicker">Features</p>
//               <h2 className="ls-h2">Four ways to practise <em>language</em>.</h2>
//               <p className="ls-sub">Each area focuses on one skill. Together they move you from words to confident expression.</p>
//             </header>

//             <div className="ls-feature-list">
//               {FEATURES.map((f, i) => (
//                 <article key={f.id} id={f.id} className="ls-feature">
//                   <div className="ls-feature-copy ls-reveal">
//                     <span className="ls-feature-no">0{i + 1}</span>
//                     <h3 className="ls-h3"><f.icon size={22} aria-hidden="true" /> {f.title}</h3>
//                     <p className="ls-feature-lead">{f.lead}</p>
//                     <p className="ls-feature-text">{f.text}</p>
//                     <ul className="ls-points">
//                       {f.points.map((p) => <li key={p}>{p}</li>)}
//                     </ul>
//                   </div>
//                   <div className="ls-feature-visual ls-reveal" style={{ "--d": "120ms" }}>
//                     <span className="ls-preview-tag">Interactive preview</span>
//                     <f.Visual />
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ---------------- About ---------------- */}
//         <section id="about" className="ls-section ls-about">
//           <div className="ls-wrap">
//             <div className="ls-about-top">
//               <div className="ls-reveal">
//                 <p className="ls-kicker">About</p>
//                 <h2 className="ls-h2 ls-h2-xl">A calm space to build the language you need to be <em>understood</em>.</h2>
//               </div>
//               <div className="ls-about-text ls-reveal" style={{ "--d": "120ms" }}>
//                 <p>
//                   learnsphere is a learning space for language and communication skills. It treats language as something you
//                   build in layers: words become sentences, sentences become text, and text becomes conversation.
//                 </p>
//                 <p>
//                   Whether you’re learning for study, work, or everyday life, the aim is the same — to say what you mean,
//                   clearly.
//                 </p>
//               </div>
//             </div>

//             <ol className="ls-ladder-row ls-reveal" aria-label="From words to conversation">
//               {LADDER.map((s, i) => (
//                 <li key={s.tag} style={{ "--i": i }}>
//                   <span className="ls-ladder-no">{i + 1}</span>
//                   <small>{s.tag}</small>
//                   <p>{s.example}</p>
//                 </li>
//               ))}
//             </ol>

//             <div className="ls-principles">
//               {PRINCIPLES.map((p, i) => (
//                 <div key={p.title} className="ls-principle ls-reveal" style={{ "--d": `${i * 100}ms` }}>
//                   <span className="ls-principle-icon"><p.icon size={20} /></span>
//                   <h3>{p.title}</h3>
//                   <p>{p.text}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ---------------- Contact ---------------- */}
//         <section id="contact" className="ls-section ls-contact">
//           <div className="ls-wrap ls-contact-grid">
//             <div className="ls-reveal">
//               <p className="ls-kicker">Contact</p>
//               <h2 className="ls-h2">Questions or <em>feedback</em>?</h2>
//               <p className="ls-sub">Tell us what you’re curious about, or what would make learnsphere better for you.</p>
//               <p className="ls-contact-note">A message is only shown as sent once it has actually been delivered.</p>
//             </div>
//             <div className="ls-contact-card ls-reveal" style={{ "--d": "120ms" }}>
//               <ContactForm />
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ---------------- Footer ---------------- */}
//       <footer className="ls-footer">
//         <div className="ls-wrap ls-footer-inner">
//           <div className="ls-footer-brand">
//             <Logo />
//             <p>Build vocabulary. Practise conversation. Compose with confidence.</p>
//           </div>
//           <nav aria-label="Footer" className="ls-footer-links">
//             {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={goTo(n.id)}>{n.label}</a>)}
//             <Link to="/login">Log in</Link>
//             <Link to="/signup">Sign up</Link>
//           </nav>
//         </div>
//         <div className="ls-wrap ls-footer-bottom">© {new Date().getFullYear()} learnsphere. All rights reserved.</div>
//       </footer>
//     </div>
//   );
// }

// export default Home;


import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  FileText,
  Headphones,
  Layers,
  Languages,
  Menu,
  MessagesSquare,
  PenLine,
  X,
} from "lucide-react";
import Logo from "../components/public/Logo";
import HeroComposer from "../components/public/HeroComposer";
import ContactForm from "../components/public/ContactForm";
import {
  ConversationVisual,
  SentenceVisual,
  TextVisual,
  VocabularyVisual,
} from "../components/public/FeatureVisuals";
import {
  prefersReducedMotion,
  useActiveSection,
  usePublicPage,
  useScrollReveal,
} from "../components/public/hooks";

const NAV = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const HEADLINE = ["Say", "exactly", "what", "you"];

const FEATURES = [
  {
    id: "vocabulary",
    icon: BookOpen,
    title: "Word Studio",
    lead: "Meet new words in context.",
    text: "Explore words by domain, hear how they’re pronounced, and check the meaning in your own language.",
    points: [
      "Words organised by domain",
      "Audio pronunciation",
      "Meanings in Hindi, Telugu and Tamil",
    ],
    Visual: VocabularyVisual,
  },
  {
    id: "conversation",
    icon: MessagesSquare,
    title: "Conversation Lab",
    lead: "Listen first. Then respond.",
    text: "Follow short dialogues, answer questions about what you heard, and take a hint when you need one.",
    points: [
      "Audio dialogues",
      "Questions on what you heard",
      "Hints when you’re stuck",
    ],
    Visual: ConversationVisual,
  },
  {
    id: "sentence-composition",
    icon: PenLine,
    title: "Sentence Builder",
    lead: "Turn loose words into clear sentences.",
    text: "Arrange word tiles into correct, natural sentences, guided by picture and video prompts.",
    points: [
      "Word-tile sentence building",
      "Image and video prompts",
      "Earn stars to unlock new cards",
    ],
    Visual: SentenceVisual,
  },
  {
    id: "text-composition",
    icon: FileText,
    title: "Writing Studio",
    lead: "Connect ideas into connected writing.",
    text: "Join sentences with logical relations, generate the combined text, and see how well it works.",
    points: [
      "Choose how sentences relate",
      "Generate the combined text",
      "Receive a score on your text",
    ],
    Visual: TextVisual,
  },
];

const LADDER = [
  { tag: "Word", example: <b>algorithm</b> },
  { tag: "Sentence", example: <>The <b>API</b> returns data.</> },
  {
    tag: "Text",
    example: <>We practised every day, <b>so</b> our speaking improved.</>,
  },
  {
    tag: "Conversation",
    example: <>“Could you send it by <b>noon</b>?”</>,
  },
];

const PRINCIPLES = [
  {
    icon: Headphones,
    title: "Hear the language",
    text: "Pronunciation and dialogues come with audio, so learning isn’t only visual.",
  },
  {
    icon: Layers,
    title: "Progress by level",
    text: "Tasks are grouped into levels, so you can start simple and build up.",
  },
  {
    icon: Languages,
    title: "Your own language, too",
    text: "Vocabulary meanings are available in Hindi, Telugu and Tamil.",
  },
];

function Home() {
  usePublicPage();

  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rootRef, jsReady] = useScrollReveal();
  const active = useActiveSection(NAV.map((n) => n.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Honour /#features style links on first load.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));

      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: "auto", block: "start" }),
          50
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const goTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);

    const behavior = prefersReducedMotion() ? "auto" : "smooth";

    if (id === "home") {
      window.scrollTo({ top: 0, behavior });
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior,
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div
      className={`ls-site ls-home${jsReady ? " ls-js" : ""}`}
      ref={rootRef}
    >
      <a
        className="ls-skip"
        href="#features"
        onClick={goTo("features")}
      >
        Skip to content
      </a>

      {/* Navigation */}
      <header
        className={`ls-nav${scrolled ? " is-scrolled" : ""}${
          menuOpen ? " is-open" : ""
        }`}
      >
        <div className="ls-wrap ls-nav-inner">
          <Logo onClick={() => setMenuOpen(false)} />

          <nav id="ls-menu" className="ls-nav-links" aria-label="Main">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={goTo(n.id)}
                className={active === n.id ? "is-active" : ""}
                aria-current={active === n.id ? "true" : undefined}
              >
                {n.label}
              </a>
            ))}

            <div className="ls-nav-cta">
              <Link
                to="/login"
                className="ls-btn ls-btn-ghost"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="ls-btn ls-btn-primary"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>

          <button
            type="button"
            className="ls-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="ls-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="home" className="ls-hero">
          <div className="ls-wrap ls-hero-grid">
            <div className="ls-hero-copy">
              <p
                className="ls-eyebrow ls-rise"
                style={{ "--d": "0ms" }}
              >
                Word Studio · Conversation Lab · Sentence Builder · Writing
                Studio
              </p>

              <h1
                className="ls-h1"
                aria-label="Say exactly what you mean."
              >
                {HEADLINE.map((w, i) => (
                  <span
                    key={w}
                    className="ls-word"
                    aria-hidden="true"
                    style={{ "--i": i }}
                  >
                    <span>{w}</span>
                  </span>
                ))}

                <span
                  className="ls-word ls-word-hi"
                  aria-hidden="true"
                  style={{ "--i": HEADLINE.length }}
                >
                  <span>mean.</span>
                  <svg
                    viewBox="0 0 200 14"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3 9c40-8 90-9 194-3"
                      pathLength="1"
                    />
                  </svg>
                </span>
              </h1>

              <p
                className="ls-lead ls-rise"
                style={{ "--d": "620ms" }}
              >
                Lexora is a place to build the language you need — from a
                single new word to a well-formed sentence, a connected piece
                of writing, and a confident conversation.
              </p>

              <div
                className="ls-hero-cta ls-rise"
                style={{ "--d": "760ms" }}
              >
                <Link
                  to="/signup"
                  className="ls-btn ls-btn-primary ls-btn-lg"
                >
                  Start learning <ArrowRight size={18} />
                </Link>

                <a
                  href="#features"
                  onClick={goTo("features")}
                  className="ls-btn ls-btn-outline ls-btn-lg"
                >
                  Explore features <ArrowDown size={17} />
                </a>
              </div>

              <ul
                className="ls-areas ls-rise"
                style={{ "--d": "920ms" }}
                aria-label="Practice areas"
              >
                {FEATURES.map((f) => (
                  <li key={f.id}>
                    <a
                      href={`#${f.id}`}
                      onClick={goTo(f.id)}
                    >
                      <f.icon size={16} /> {f.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="ls-hero-art ls-rise"
              style={{ "--d": "300ms" }}
            >
              <HeroComposer />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="ls-section ls-features">
          <div className="ls-wrap">
            <header className="ls-section-head ls-reveal">
              <p className="ls-kicker">Features</p>
              <h2 className="ls-h2">
                Four ways to practise <em>language</em>.
              </h2>
              <p className="ls-sub">
                Each area focuses on one skill. Together they move you from
                words to confident expression.
              </p>
            </header>

            <div className="ls-feature-list">
              {FEATURES.map((f, i) => (
                <article
                  key={f.id}
                  id={f.id}
                  className="ls-feature"
                >
                  <div className="ls-feature-copy ls-reveal">
                    <span className="ls-feature-no">0{i + 1}</span>

                    <h3 className="ls-h3">
                      <f.icon size={22} aria-hidden="true" /> {f.title}
                    </h3>

                    <p className="ls-feature-lead">{f.lead}</p>
                    <p className="ls-feature-text">{f.text}</p>

                    <ul className="ls-points">
                      {f.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="ls-feature-visual ls-reveal"
                    style={{ "--d": "120ms" }}
                  >
                    <span className="ls-preview-tag">
                      Interactive preview
                    </span>
                    <f.Visual />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="ls-section ls-about">
          <div className="ls-wrap">
            <div className="ls-about-top">
              <div className="ls-reveal">
                <p className="ls-kicker">About</p>

                <h2 className="ls-h2 ls-h2-xl">
                  A calm space to build the language you need to be{" "}
                  <em>understood</em>.
                </h2>
              </div>

              <div
                className="ls-about-text ls-reveal"
                style={{ "--d": "120ms" }}
              >
                <p>
                  Lexora is a learning space for language and communication
                  skills. It treats language as something you build in layers:
                  words become sentences, sentences become text, and text
                  becomes conversation.
                </p>

                <p>
                  Whether you’re learning for study, work, or everyday life,
                  the aim is the same — to say what you mean, clearly.
                </p>
              </div>
            </div>

            <ol
              className="ls-ladder-row ls-reveal"
              aria-label="From words to conversation"
            >
              {LADDER.map((s, i) => (
                <li key={s.tag} style={{ "--i": i }}>
                  <span className="ls-ladder-no">{i + 1}</span>
                  <small>{s.tag}</small>
                  <p>{s.example}</p>
                </li>
              ))}
            </ol>

            <div className="ls-principles">
              {PRINCIPLES.map((p, i) => (
                <div
                  key={p.title}
                  className="ls-principle ls-reveal"
                  style={{ "--d": `${i * 100}ms` }}
                >
                  <span className="ls-principle-icon">
                    <p.icon size={20} />
                  </span>

                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="ls-section ls-contact">
          <div className="ls-wrap ls-contact-grid">
            <div className="ls-reveal">
              <p className="ls-kicker">Contact</p>

              <h2 className="ls-h2">
                Questions or <em>feedback</em>?
              </h2>

              <p className="ls-sub">
                Tell us what you’re curious about, or what would make Lexora
                better for you.
              </p>

              <p className="ls-contact-note">
                A message is only shown as sent once it has actually been
                delivered.
              </p>
            </div>

            <div
              className="ls-contact-card ls-reveal"
              style={{ "--d": "120ms" }}
            >
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="ls-footer">
        <div className="ls-wrap ls-footer-inner">
          <div className="ls-footer-brand">
            <Logo />
            <p>
              Build vocabulary. Practise conversation. Compose with confidence.
            </p>
          </div>

          <nav aria-label="Footer" className="ls-footer-links">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={goTo(n.id)}
              >
                {n.label}
              </a>
            ))}

            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </nav>
        </div>

        <div className="ls-wrap ls-footer-bottom">
          © {new Date().getFullYear()} Lexora. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;