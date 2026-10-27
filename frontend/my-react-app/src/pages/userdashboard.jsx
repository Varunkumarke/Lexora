


// import React, { useState, useEffect, useRef } from "react";
// import { LockKeyhole } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./userinterface.css";
// import SelectRelations from "./SelectRelations";
// import UserManual from "./UserManual";
// import Conversations from "./Conversations";
// import VocabularyCard from "./Vocabulary";
// import SentenceComposition from "./SentenceComposition";
// import { logout } from "../utils/auth";


// const API_BASE_URL = "http://localhost:8000";

// /*
//   The four primary learning categories, in display order.
//   `id` values are used by the API and the routing logic below — do not change them.
//   `tone` only selects the visual treatment of the card.
// */
// const CATEGORIES = [
//   {
//     id: "vocabulary",
//     name: "Word Studio",
//     tone: "ink",
//     description: "Discover words, meanings, and how to use them.",
//     action: "Explore Word Studio",
//   },
//   {
//     id: "Sentence Composition",
//     name: "Sentence Builder",
//     tone: "indigo",
//     description: "Learn to build clear, correct sentences.",
//     action: "Coming Soon",
//   },
//   {
//     id: "Text Composition",
//     name: "Writing Studio",
//     tone: "paper",
//     description: "Organize your ideas and express them in writing.",
//     action: "Coming Soon",
//   },
//   {
//     id: "Conversation",
//     name: "Conversation Lab",
//     tone: "lavender",
//     description: "Practise expressing yourself in conversations.",
//     action: "Coming Soon",
//   },
// ];

// /* Decorative greetings used by the ticker and the orbit (purely visual). */
// const GREETINGS = ["Hello", "नमस्ते", "నమస్కారం", "வணக்கம்", "Welcome", "స్వాగతం", "स्वागत है", "வரவேற்கிறோம்"];

// function getUserInfo() {
//   try {
//     const token = localStorage.getItem("token") || localStorage.getItem("authToken");
//     if (token) {
//       const parts = token.split(".");
//       if (parts.length === 3) {
//         const payload = JSON.parse(atob(parts[1]));
//         return {
//           name: payload.name || payload.username || payload.sub || "User",
//           email: payload.email || "",
//         };
//       }
//     }
//     const name = localStorage.getItem("userName") || localStorage.getItem("name") || "User";
//     const email = localStorage.getItem("userEmail") || localStorage.getItem("email") || "";
//     return { name, email };
//   } catch {
//     return { name: "User", email: "" };
//   }
// }

// function getInitials(name) {
//   return (name || "User")
//     .split(" ")
//     .filter(Boolean)
//     .map((w) => w[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);
// }

// function getGreeting() {
//   const hour = new Date().getHours();
//   if (hour < 12) return "Good morning";
//   if (hour < 17) return "Good afternoon";
//   return "Good evening";
// }

// /* ---------- Icons (inline SVG, no dependency) ---------- */

// const svgBase = {
//   viewBox: "0 0 24 24",
//   fill: "none",
//   stroke: "currentColor",
//   strokeWidth: 1.8,
//   strokeLinecap: "round",
//   strokeLinejoin: "round",
//   "aria-hidden": "true",
//   focusable: "false",
// };

// function MenuIcon() {
//   return (
//     <svg {...svgBase} width="22" height="22">
//       <path d="M4 8h16M4 16h10" />
//     </svg>
//   );
// }

// function CloseIcon() {
//   return (
//     <svg {...svgBase} width="20" height="20">
//       <path d="M6 6l12 12M18 6L6 18" />
//     </svg>
//   );
// }

// function BackIcon() {
//   return (
//     <svg {...svgBase} width="16" height="16">
//       <path d="M19 12H5M12 19l-7-7 7-7" />
//     </svg>
//   );
// }

// function ArrowIcon() {
//   return (
//     <svg className="ui-arrow" {...svgBase} width="16" height="16">
//       <path d="M5 12h14M13 6l6 6-6 6" />
//     </svg>
//   );
// }

// function HomeIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <path d="M4 11l8-7 8 7" />
//       <path d="M6 10v9h12v-9" />
//     </svg>
//   );
// }

// function UserIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <circle cx="12" cy="8" r="3.5" />
//       <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
//     </svg>
//   );
// }

// function ManualIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
//       <path d="M12 6v13.5" />
//     </svg>
//   );
// }

// function AssignmentsIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <rect x="5" y="4" width="14" height="16" rx="2" />
//       <path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
//     </svg>
//   );
// }

// function ProgressIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" />
//     </svg>
//   );
// }

// function BookmarkIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" />
//     </svg>
//   );
// }

// function HistoryIcon() {
//   return (
//     <svg {...svgBase} width="18" height="18">
//       <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
//       <path d="M3 3v5h5M12 7v5l3 2" />
//     </svg>
//   );
// }

// function PowerIcon() {
//   return (
//     <svg {...svgBase} width="17" height="17">
//       <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
//       <line x1="12" y1="2" x2="12" y2="12" />
//     </svg>
//   );
// }

// function CategoryGlyph({ id, size = 20 }) {
//   const props = { ...svgBase, width: size, height: size };
//   switch (id) {
//     case "vocabulary":
//       return (
//         <svg {...props}>
//           <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
//           <path d="M12 6v13.5" />
//         </svg>
//       );
//     case "Sentence Composition":
//       return (
//         <svg {...props}>
//           <rect x="3" y="8" width="7" height="8" rx="2" />
//           <rect x="14" y="8" width="7" height="8" rx="2" />
//           <path d="M10 12h4" />
//         </svg>
//       );
//     case "Text Composition":
//       return (
//         <svg {...props}>
//           <path d="M4 6h16M4 10h16M4 14h16M4 18h9" />
//         </svg>
//       );
//     case "Conversation":
//       return (
//         <svg {...props}>
//           <path d="M4 5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3.5 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
//           <path d="M19 9.5h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v3l-3.5-3H11" />
//         </svg>
//       );
//     default:
//       return (
//         <svg {...props}>
//           <circle cx="12" cy="12" r="8" />
//         </svg>
//       );
//   }
// }

// /* ---------- Decorative illustrations ---------- */

// /* Hero: a softly rotating globe ringed by greetings from the app's languages. */
// function WordOrbit() {
//   return (
//     <div className="ui-orbit" aria-hidden="true">
//       <span className="ui-orbit-ring ui-orbit-ring--a" />
//       <span className="ui-orbit-ring ui-orbit-ring--b" />
//       <div className="ui-orbit-globe">
//         <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
//           <circle cx="50" cy="50" r="46" />
//           <ellipse cx="50" cy="50" rx="18" ry="46" />
//           <ellipse cx="50" cy="50" rx="34" ry="46" />
//           <path d="M4 50h92M6.9 34h86.2M6.9 66h86.2" />
//           <path d="M50 4v92" />
//         </svg>
//         <span className="ui-orbit-glint" />
//       </div>
//       <span className="ui-orbit-chip ui-orbit-chip--1"><b>Hello</b><i>English</i></span>
//       <span className="ui-orbit-chip ui-orbit-chip--2"><b>नमस्ते</b><i>Hindi</i></span>
//       <span className="ui-orbit-chip ui-orbit-chip--3"><b>నమస్కారం</b><i>Telugu</i></span>
//       <span className="ui-orbit-chip ui-orbit-chip--4"><b>வணக்கம்</b><i>Tamil</i></span>
//     </div>
//   );
// }

// /* Learning-path cards: a tiny scene for each skill. */
// function PathArt({ id }) {
//   switch (id) {
//     case "vocabulary":
//       return (
//         <span className="ui-art ui-art--vocab" aria-hidden="true">
//           <span className="ui-vc ui-vc--3" />
//           <span className="ui-vc ui-vc--2" />
//           <span className="ui-vc ui-vc--1">
//             <b>Aa</b>
//             <i />
//             <i />
//           </span>
//         </span>
//       );
//     case "Sentence Composition":
//       return (
//         <span className="ui-art ui-art--sent" aria-hidden="true">
//           <span>I</span>
//           <span>learn</span>
//           <span>every</span>
//           <span>day</span>
//           <span className="ui-slot" />
//         </span>
//       );
//     case "Text Composition":
//       return (
//         <span className="ui-art ui-art--text" aria-hidden="true">
//           <i style={{ "--w": "62%" }} />
//           <i style={{ "--w": "100%" }} />
//           <i style={{ "--w": "88%" }} />
//           <i style={{ "--w": "96%" }} />
//           <i style={{ "--w": "46%" }} />
//         </span>
//       );
//     case "Conversation":
//       return (
//         <span className="ui-art ui-art--talk" aria-hidden="true">
//           <span className="ui-bubble ui-bubble--a">How was your day?</span>
//           <span className="ui-bubble ui-bubble--b">
//             <em /><em /><em />
//           </span>
//         </span>
//       );
//     default:
//       return null;
//   }
// }

// /* ---------- Shell: floating top bar + overlay drawer ---------- */

// function AppShell({ active, initials, user, onHome, onCategory, onFeature, onManual, onProfile, onLogout, children }) {
//   const [open, setOpen] = useState(false); // drawer is closed by default
//   const menuBtnRef = useRef(null);
//   const closeBtnRef = useRef(null);
//   const drawerRef = useRef(null);
//   const wasOpen = useRef(false);

//   // Escape closes the drawer.
//   useEffect(() => {
//     if (!open) return undefined;
//     const onKey = (e) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [open]);

//   // Lock page scroll while open; move focus in on open and back to the menu button on close.
//   useEffect(() => {
//     if (open) {
//       const previous = document.body.style.overflow;
//       document.body.style.overflow = "hidden";
//       closeBtnRef.current?.focus();
//       wasOpen.current = true;
//       return () => {
//         document.body.style.overflow = previous;
//       };
//     }
//     if (wasOpen.current) {
//       menuBtnRef.current?.focus();
//       wasOpen.current = false;
//     }
//     return undefined;
//   }, [open]);

//   // Keep Tab focus inside the drawer while it is open.
//   const handleDrawerKeyDown = (e) => {
//     if (e.key !== "Tab" || !drawerRef.current) return;
//     const focusable = drawerRef.current.querySelectorAll("button:not([disabled])");
//     if (focusable.length === 0) return;
//     const first = focusable[0];
//     const last = focusable[focusable.length - 1];
//     if (e.shiftKey && document.activeElement === first) {
//       e.preventDefault();
//       last.focus();
//     } else if (!e.shiftKey && document.activeElement === last) {
//       e.preventDefault();
//       first.focus();
//     }
//   };

//   // Every drawer action closes the drawer first, then runs the existing handler.
//   const choose = (fn) => () => {
//     setOpen(false);
//     fn();
//   };

//   const navItem = (key, label, icon, handler) => (
//     <li key={key}>
//       <button
//         type="button"
//         className={`ui-drawer-item${active === key ? " is-active" : ""}`}
//         aria-current={active === key ? "page" : undefined}
//         onClick={choose(handler)}
//       >
//         <span className="ui-drawer-item-icon">{icon}</span>
//         <span>{label}</span>
//       </button>
//     </li>
//   );

//   return (
//     <div className="user-interface-page">
//       <header className="ui-top-nav">
//         <div className="ui-top-nav-inner">
//           <button
//             type="button"
//             ref={menuBtnRef}
//             className="ui-icon-btn ui-menu-btn"
//             aria-label="Open navigation"
//             aria-expanded={open}
//             aria-controls="ui-drawer"
//             onClick={() => setOpen(true)}
//           >
//             <MenuIcon />
//           </button>

//           <button type="button" className="ui-brand" onClick={onHome} aria-label="Lexora — dashboard">
//             <span className="ui-brand-mark" aria-hidden="true" />
//             <span className="ui-brand-text">Lexora</span>
//           </button>

//           <nav className="ui-top-links" aria-label="Quick links">
//             <button
//               type="button"
//               className={`ui-top-link${active === "home" ? " is-active" : ""}`}
//               aria-current={active === "home" ? "page" : undefined}
//               onClick={onHome}
//             >
//               Dashboard
//             </button>
//             <button type="button" className="ui-top-link" onClick={onManual}>
//               User Manual
//             </button>
//           </nav>

//           <button
//             type="button"
//             className={`ui-avatar-btn${active === "profile" ? " is-active" : ""}`}
//             aria-label="Open profile"
//             aria-current={active === "profile" ? "page" : undefined}
//             onClick={onProfile}
//           >
//             {initials}
//           </button>
//         </div>
//       </header>

//       {open && <div className="ui-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

//       <aside
//         id="ui-drawer"
//         ref={drawerRef}
//         className={`ui-drawer${open ? " is-open" : ""}`}
//         aria-label="Navigation menu"
//         aria-hidden={!open}
//         onKeyDown={handleDrawerKeyDown}
//       >
//         <div className="ui-drawer-head">
//           <span className="ui-brand ui-brand--static">
//             <span className="ui-brand-mark" aria-hidden="true" />
//             <span className="ui-brand-text">Lexora</span>
//           </span>
//           <button
//             type="button"
//             ref={closeBtnRef}
//             className="ui-icon-btn ui-icon-btn--light"
//             aria-label="Close navigation"
//             onClick={() => setOpen(false)}
//           >
//             <CloseIcon />
//           </button>
//         </div>

//         <nav className="ui-drawer-nav" aria-label="Main navigation">
//           <p className="ui-drawer-label">Menu</p>
//           <ul className="ui-drawer-list">
//             {navItem("home", "Dashboard", <HomeIcon />, onHome)}
//           </ul>

//           <p className="ui-drawer-label">Learning workspace</p>
//           <ul className="ui-drawer-list">
//             {navItem("assignments", "Assignments", <AssignmentsIcon />, () => onFeature("assignments"))}
//             {navItem("progress", "My Progress", <ProgressIcon />, () => onFeature("progress"))}
//             {navItem("saved-words", "Saved Words", <BookmarkIcon />, () => onFeature("saved-words"))}
//             {navItem("history", "Learning History", <HistoryIcon />, () => onFeature("history"))}
//           </ul>

//           <p className="ui-drawer-label">Account & help</p>
//           <ul className="ui-drawer-list">
//             {navItem("profile", "My Profile", <UserIcon />, onProfile)}
//             {navItem("manual", "User Manual", <ManualIcon />, onManual)}
//           </ul>
//         </nav>

//         <div className="ui-drawer-foot">
//           <div className="ui-drawer-user">
//             <span className="ui-drawer-user-avatar" aria-hidden="true">{initials}</span>
//             <span className="ui-drawer-user-text">
//               <strong>{user.name}</strong>
//               {user.email && <span>{user.email}</span>}
//             </span>
//           </div>
//           <button type="button" className="ui-drawer-signout" onClick={choose(onLogout)}>
//             <PowerIcon />
//             Sign out
//           </button>
//         </div>
//       </aside>

//       {children}
//     </div>
//   );
// }

// function ErrorBanner({ message }) {
//   return (
//     <div className="ui-error-message" role="alert">
//       <span className="ui-error-mark" aria-hidden="true">!</span>
//       <span>{message}</span>
//     </div>
//   );
// }

// export default function UserInterface() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [infoMessage, setInfoMessage] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedLevel, setSelectedLevel] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showSelectRelations, setShowSelectRelations] = useState(false);
//   const [showUserManual, setShowUserManual] = useState(false);
//   const [showConversations, setShowConversations] = useState(false);
//   const [showVocabulary, setShowVocabulary] = useState(false);
//   const [showSentenceComposition, setShowSentenceComposition] = useState(false);
//   const [showUserProfile, setShowUserProfile] = useState(false);
//   const [selectedFeaturePage, setSelectedFeaturePage] = useState(null);
//   const [vocabularyData, setVocabularyData] = useState([]);
//   const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
//   const [hasData, setHasData] = useState(true);
//   const [userInfo] = useState(getUserInfo);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   const handleVocabularyNext = () => {
//     if (currentVocabIndex < vocabularyData.length - 1) {
//       setCurrentVocabIndex(currentVocabIndex + 1);
//     } else {
//       handleBackToCategories();
//     }
//   };

//   const handleVocabularyPrevious = () => {
//     if (currentVocabIndex > 0) setCurrentVocabIndex(currentVocabIndex - 1);
//   };

//   const handleBackToCategories = () => {
//     // Clear every secondary screen so Home/Dashboard always returns to the dashboard.
//     setSelectedFeaturePage(null);
//     setShowUserManual(false);
//     setShowUserProfile(false);
//     setSelectedCategory(null);
//     setSelectedLevel(null);
//     setTasks([]);
//     setSelectedTask(null);
//     setShowSelectRelations(false);
//     setShowConversations(false);
//     setShowVocabulary(false);
//     setShowSentenceComposition(false);
//     setShowUserProfile(false);
//     setVocabularyData([]);
//     setCurrentVocabIndex(0);
//     setError("");
//     setInfoMessage("");
//     setHasData(true);
//   };

//   // Kept for compatibility with the original component (currently unused by the UI).
//   // eslint-disable-next-line no-unused-vars
//   const handleBackToLevels = () => {
//     setSelectedLevel(null);
//     setTasks([]);
//     setSelectedTask(null);
//     setShowSelectRelations(false);
//     setShowConversations(false);
//     setShowVocabulary(false);
//     setShowSentenceComposition(false);
//     setVocabularyData([]);
//     setCurrentVocabIndex(0);
//     setError("");
//     setInfoMessage("");
//     setHasData(true);
//   };

//   const handleBackToTasks = () => {
//     setSelectedTask(null);
//     setShowSelectRelations(false);
//     setShowConversations(false);
//     setShowVocabulary(false);
//     setShowSentenceComposition(false);
//     setVocabularyData([]);
//     setCurrentVocabIndex(0);
//   };

//   const toVocabularyCard = (wordDoc) => ({
//     data: {
//       word: wordDoc.word,
//       phonetic: wordDoc.phonetic,
//       wordType: wordDoc.wordType,
//       meaning: wordDoc.meaning,
//       domain: wordDoc.domain,
//       forms: wordDoc.forms || [],
//       examples: wordDoc.examples || [],
//       synonyms: wordDoc.synonyms || [],
//       antonyms: wordDoc.antonyms || [],
//       imageUrl: wordDoc.image_url || null,
//       nativeLanguages: {
//         hindi: { word: wordDoc.native?.hindi?.word || wordDoc.word, description: wordDoc.native?.hindi?.meaning || "" },
//         telugu: { word: wordDoc.native?.telugu?.word || wordDoc.word, description: wordDoc.native?.telugu?.meaning || "" },
//         tamil: { word: wordDoc.native?.tamil?.word || wordDoc.word, description: wordDoc.native?.tamil?.meaning || "" },
//       },
//     },
//   });

//   const handleFeaturePage = (page) => {
//     setSelectedFeaturePage(page);
//     setShowUserProfile(false);
//     setShowUserManual(false);
//     setSelectedCategory(null);
//     setSelectedLevel(null);
//     setTasks([]);
//     setSelectedTask(null);
//     setShowSelectRelations(false);
//     setShowConversations(false);
//     setShowVocabulary(false);
//     setShowSentenceComposition(false);
//     setError("");
//     setInfoMessage("");
//   };

//   const handleCategorySelect = async (category) => {
//     // Switching to a learning path must leave any Coming Soon screen.
//     setSelectedFeaturePage(null);
//     setShowUserProfile(false);
//     setShowUserManual(false);
//     setSelectedCategory(category);
//     setSelectedTask(null);
//     setTasks([]);
//     setError("");
//     setInfoMessage("");
//     setHasData(true);
//     setShowSelectRelations(false);
//     setShowConversations(false);
//     setShowVocabulary(false);
//     setShowSentenceComposition(false);

//     if (category === "Sentence Composition") {
//       setSelectedLevel("all");
//       setShowSentenceComposition(true);
//       return;
//     }

//     setLoading(true);
//     try {
//       // Merge the existing backend data across levels, without showing levels to users.
//       const results = await Promise.all(["easy", "medium", "hard"].map(async (levelName) => {
//         const response = await fetch(`${API_BASE_URL}/api/tasks/${encodeURIComponent(category)}/${levelName}`);
//         if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
//         const data = await response.json();
//         return { levelName, data };
//       }));

//       if (category === "vocabulary") {
//         const wordDocs = results.flatMap(({ data }) =>
//           (data.tasks || []).flatMap((task) => task.words || [])
//         );
//         const cards = wordDocs.map(toVocabularyCard);
//         setVocabularyData(cards);
//         setCurrentVocabIndex(0);
//         setSelectedLevel("all");
//         if (cards.length > 0) {
//           setShowVocabulary(true);
//           setHasData(true);
//         } else {
//           // Keep the vocabulary search interface available even when no words are saved yet.
//           setVocabularyData([toVocabularyCard({
//             word: "", phonetic: "", wordType: "", meaning: "", domain: "",
//             forms: [], examples: [], synonyms: [], antonyms: [], native: {},
//           })]);
//           setCurrentVocabIndex(0);
//           setShowVocabulary(true);
//           setHasData(true);
//         }
//         return;
//       }

//       const allTasks = results.flatMap(({ levelName, data }) =>
//         (data.tasks || []).map((task) => {
//           const taskNumber = task.id?.split("_").slice(1).join("_") || "";
//           const isConversation = category === "Conversation";
//           return {
//             ...task,
//             level: levelName,
//             title: !task.title || task.title.includes("task.title")
//               ? `${isConversation ? "Conversation" : "Story"} ${taskNumber}`
//               : task.title,
//             description: task.description || `${task.sentenceCount || task.sentences?.length || 0} sentences`,
//             category,
//           };
//         })
//       ).sort((a, b) => a.title.localeCompare(b.title));

//       setTasks(allTasks);
//       setSelectedLevel("all");
//       setHasData(allTasks.length > 0);
//       if (allTasks.length === 0) {
//         const comingSoon = results.find(({ data }) => data.coming_soon)?.data;
//         setInfoMessage(comingSoon?.message || `No tasks available for ${category} yet.`);
//       }
//     } catch (err) {
//       console.error("Error loading category content:", err);
//       setError("Failed to load content. Please check your connection.");
//       setHasData(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTaskSelect = (task) => {
//     setSelectedTask(task);

//     if (selectedCategory === "Conversation") {
//       setShowConversations(true);
//     } else if (selectedCategory === "Text Composition") {
//       setShowSelectRelations(true);
//     } else if (selectedCategory === "vocabulary") {
//       const vocabCards = (task.words || []).map(toVocabularyCard);
//       setVocabularyData(vocabCards);
//       setCurrentVocabIndex(0);
//       setShowVocabulary(vocabCards.length > 0);
//     }
//   };

//   /* ---------- Full-screen activity components (unchanged behaviour) ---------- */

//   if (showUserManual) {
//     return <UserManual onClose={() => setShowUserManual(false)} />;
//   }

//   if (showSentenceComposition && selectedCategory === "Sentence Composition") {
//     return (
//       <SentenceComposition
//         level="easy"
//         onBack={handleBackToCategories}
//       />
//     );
//   }

//   if (showConversations && selectedTask && selectedCategory === "Conversation") {
//     return <Conversations onBack={handleBackToTasks} level={selectedTask.level || selectedLevel} task={selectedTask} />;
//   }

//   if (showSelectRelations && selectedTask && selectedCategory === "Text Composition") {
//     return (
//       <SelectRelations
//         task={selectedTask}
//         level={selectedTask.level || selectedLevel}
//         category={selectedCategory}
//         taskId={selectedTask.id}
//         onBack={handleBackToCategories}
//       />
//     );
//   }

//   if (showVocabulary && vocabularyData.length > 0) {
//     const currentVocab = vocabularyData[currentVocabIndex];
//     return (
//       <VocabularyCard
//         data={currentVocab.data}
//         onNext={handleVocabularyNext}
//         onPrevious={handleVocabularyPrevious}
//         currentIndex={currentVocabIndex}
//         totalCards={vocabularyData.length}
//         onBack={handleBackToCategories}
//       />
//     );
//   }

//   /* ---------- Shared values for the screens below ---------- */

//   const initials = getInitials(userInfo.name);
//   const firstName = (userInfo.name || "User").split(" ").filter(Boolean)[0] || "User";
//   const categoryInfo = CATEGORIES.find((cat) => cat.id === selectedCategory);
//   const categoryName = categoryInfo?.name || selectedCategory;
//   const activeKey = showUserProfile ? "profile" : selectedFeaturePage || selectedCategory || "home";

//   const shellProps = {
//     active: activeKey,
//     initials,
//     user: userInfo,
//     onHome: handleBackToCategories,
//     // From the drawer, leave the profile screen first, then run the unchanged category handler.
//     onCategory: (id) => {
//       setShowUserProfile(false);
//       handleCategorySelect(id);
//     },
//     onFeature: handleFeaturePage,
//     onManual: () => {
//       setSelectedFeaturePage(null);
//       setShowUserProfile(false);
//       setShowUserManual(true);
//     },
//     onProfile: () => {
//       setSelectedFeaturePage(null);
//       setShowUserManual(false);
//       setShowUserProfile(true);
//     },
//     onLogout: handleLogout,
//   };

//   /* ---------- Planned learner workspace pages ---------- */

//   const FEATURE_PAGE_CONTENT = {
//     assignments: {
//       title: "Assignments",
//       description: "View tasks assigned by your teacher, check due dates, and track submissions.",
//       detail: "Teacher-assigned activities will appear here once assignment management is connected.",
//       icon: <AssignmentsIcon />,
//     },
//     progress: {
//       title: "My Progress",
//       description: "Understand your learning activity and see how your skills develop over time.",
//       detail: "Your progress will be calculated from real activity attempts and results.",
//       icon: <ProgressIcon />,
//     },
//     "saved-words": {
//       title: "Saved Words",
//       description: "Keep useful vocabulary in one place so you can revise it later.",
//       detail: "Saved vocabulary will appear here after word bookmarking is implemented.",
//       icon: <BookmarkIcon />,
//     },
//     history: {
//       title: "Learning History",
//       description: "Return to previous activities and review your completed attempts.",
//       detail: "Your learning history will be populated from recorded activity attempts.",
//       icon: <HistoryIcon />,
//     },
//   };

//   if (selectedFeaturePage && FEATURE_PAGE_CONTENT[selectedFeaturePage]) {
//     const feature = FEATURE_PAGE_CONTENT[selectedFeaturePage];
//     return (
//       <AppShell {...shellProps}>
//         <main className="ui-page ui-page--narrow">
//           {/* <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
//             <BackIcon /> Back to Home
//           </button> */}
//           <section className="ui-empty-state ui-empty-state--wide" aria-labelledby="feature-page-heading">
//             <span className="ui-icon-tile ui-icon-tile--lg" aria-hidden="true">
//               {feature.icon}
//             </span>
//             <span className="ui-eyebrow-tag">{feature.title}</span>
//             <h1 id="feature-page-heading" className="ui-empty-state-title">Coming Soon!</h1>
//             <p className="ui-empty-state-description">
//               We're working on this feature. It will be available here soon.
//             </p>
//             <div className="ui-empty-state-actions">
//               <button type="button" className="ui-primary-btn" onClick={handleBackToCategories}>
//                 Explore learning paths
//               </button>
//             </div>
//           </section>
//         </main>
//       </AppShell>
//     );
//   }

//   /* ---------- Profile ---------- */

//   if (showUserProfile) {
//     return (
//       <AppShell {...shellProps}>
//         <main className="ui-page ui-page--narrow">
//           <button type="button" className="ui-back-btn" onClick={() => setShowUserProfile(false)}>
//             <BackIcon /> Back
//           </button>

//           <section className="ui-profile-head" aria-labelledby="profile-heading">
//             <div className="ui-profile-avatar-lg" aria-hidden="true">{initials}</div>
//             <div>
//               <h1 id="profile-heading" className="ui-page-title">{userInfo.name}</h1>
//               {userInfo.email && <p className="ui-page-subtitle">{userInfo.email}</p>}
//             </div>
//           </section>

//           <section className="ui-panel" aria-labelledby="profile-details-heading">
//             <h2 id="profile-details-heading" className="ui-panel-heading">Account details</h2>
//             <dl className="ui-detail-list">
//               <div className="ui-detail-row">
//                 <dt>Name</dt>
//                 <dd>{userInfo.name}</dd>
//               </div>
//               {userInfo.email && (
//                 <div className="ui-detail-row">
//                   <dt>Email</dt>
//                   <dd>{userInfo.email}</dd>
//                 </div>
//               )}
//               <div className="ui-detail-row">
//                 <dt>Status</dt>
//                 <dd><span className="ui-status-badge">Active</span></dd>
//               </div>
//             </dl>
//           </section>

//           <section className="ui-panel" aria-labelledby="profile-help-heading">
//             <h2 id="profile-help-heading" className="ui-panel-heading">Help</h2>
//             <button
//               type="button"
//               className="ui-action-row"
//               onClick={() => { setShowUserProfile(false); setShowUserManual(true); }}
//             >
//               <span className="ui-action-icon"><ManualIcon /></span>
//               <span className="ui-action-text">
//                 <strong>User Manual</strong>
//                 <span>How to use each learning path</span>
//               </span>
//               <ArrowIcon />
//             </button>
//           </section>

//           <button type="button" className="ui-signout-btn" onClick={handleLogout}>
//             <PowerIcon />
//             Sign out
//           </button>
//         </main>
//       </AppShell>
//     );
//   }

//   /* ---------- Loading a category ---------- */

//   if (selectedCategory && loading) {
//     return (
//       <AppShell {...shellProps}>
//         <main className="ui-page" aria-busy="true">
//           <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
//             <BackIcon /> Dashboard
//           </button>
//           <div className="ui-loading-status" role="status" aria-live="polite">
//             <div className="ui-spinner" aria-hidden="true"></div>
//             <p className="ui-loading-text">Loading {categoryName} activities…</p>
//           </div>
//           <div className="ui-task-grid" aria-hidden="true">
//             {[0, 1, 2, 3].map((n) => (
//               <div key={n} className="ui-skeleton-card">
//                 <div className="ui-skeleton ui-skeleton--icon" />
//                 <div className="ui-skeleton-card-text">
//                   <div className="ui-skeleton ui-skeleton--line" />
//                   <div className="ui-skeleton ui-skeleton--line short" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </main>
//       </AppShell>
//     );
//   }

//   /* ---------- Activities for a category ---------- */

//   if (selectedCategory && tasks.length > 0 && hasData && !loading) {
//     return (
//       <AppShell {...shellProps}>
//         <main className="ui-page">
//           <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
//             <BackIcon /> Dashboard
//           </button>

//           <header className="ui-banner">
//             <span className="ui-banner-glow" aria-hidden="true" />
//             <span className="ui-banner-icon">
//               <CategoryGlyph id={selectedCategory} size={26} />
//             </span>
//             <div className="ui-banner-text">
//               <p className="ui-banner-eyebrow">Learning path</p>
//               <h1 className="ui-page-title">{categoryName}</h1>
//               {categoryInfo && <p className="ui-page-subtitle">{categoryInfo.description}</p>}
//             </div>
//             <span className="ui-count">
//               <b>{tasks.length}</b> {tasks.length === 1 ? "activity" : "activities"}
//             </span>
//           </header>

//           {error && <ErrorBanner message={error} />}

//           <ol className="ui-task-grid" aria-label={`${categoryName} activities`}>
//             {tasks.map((task, index) => (
//               <li key={task.id || index} style={{ "--i": index }}>
//                 <button type="button" className="ui-task" onClick={() => handleTaskSelect(task)}>
//                   <span className="ui-task-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
//                   <span className="ui-task-text">
//                     <span className="ui-task-title">{task.title || "Task"}</span>
//                     <span className="ui-task-desc">{task.description || "Click to start"}</span>
//                   </span>
//                   <span className="ui-task-go">
//                     <span className="ui-task-go-label">Start</span>
//                     <span className="ui-task-go-dot"><ArrowIcon /></span>
//                   </span>
//                 </button>
//               </li>
//             ))}
//           </ol>
//         </main>
//       </AppShell>
//     );
//   }

//   /* ---------- Empty / error state for a category ---------- */

//   if (selectedCategory && (!hasData || tasks.length === 0) && !loading && !showVocabulary && !showSentenceComposition) {
//     return (
//       <AppShell {...shellProps}>
//         <main className="ui-page ui-page--center">
//           <div className="ui-empty-state" role={error ? "alert" : "status"}>
//             <span className="ui-icon-tile ui-icon-tile--lg">
//               <CategoryGlyph id={selectedCategory} size={26} />
//             </span>
//             <h1 className="ui-empty-state-title">
//               {error ? "We couldn't load this content" : "Coming soon"}
//             </h1>
//             <p className="ui-empty-state-description">
//               {error || infoMessage || "No tasks available."}
//             </p>
//             <div className="ui-empty-state-actions">
//               {error && (
//                 <button type="button" className="ui-primary-btn" onClick={() => handleCategorySelect(selectedCategory)}>
//                   Try again
//                 </button>
//               )}
//               <button
//                 type="button"
//                 className={error ? "ui-secondary-btn" : "ui-primary-btn"}
//                 onClick={handleBackToCategories}
//               >
//                 Back to dashboard
//               </button>
//             </div>
//           </div>
//         </main>
//       </AppShell>
//     );
//   }

//   /* ---------- Dashboard home ---------- */

//   return (
//     <AppShell {...shellProps}>
//       <main className="ui-page ui-page--home">
//         <section className="ui-hero" aria-labelledby="intro-heading">
//           <div className="ui-hero-copy">
//             <p className="ui-eyebrow">
//               <span className="ui-eyebrow-dot" aria-hidden="true" />
//               {getGreeting()}, {firstName}
//             </p>
//             <h1 id="intro-heading" className="ui-hero-title">
//               Build your language skills, <span className="ui-hero-accent">one step</span> at a time.
//             </h1>
//             <p className="ui-hero-subtitle">
//               Explore words, build sentences, write with confidence, and practise everyday conversations.
//             </p>
//             <div className="ui-hero-actions">
//               {/* <button type="button" className="ui-primary-btn ui-primary-btn--lg" onClick={() => shellProps.onCategory("vocabulary")}>
//                 Start with Word Studio <ArrowIcon />
//               </button> */}
//               <button type="button" className="ui-primary-btn ui-primary-btn--lg" onClick={() => shellProps.onCategory("vocabulary")}>
//                 <span>Start with Word Studio</span>
//                 <ArrowIcon />
//               </button>
//               <button type="button" className="ui-ghost-btn" onClick={shellProps.onManual}>
//                 <ManualIcon /> User Manual
//               </button>
//             </div>
//           </div>

//           <WordOrbit />
//         </section>

//         <div className="ui-ticker" aria-hidden="true">
//           <div className="ui-ticker-track">
//             {[...GREETINGS, ...GREETINGS].map((word, i) => (
//               <span className="ui-ticker-item" key={`${word}-${i}`}>{word}</span>
//             ))}
//           </div>
//         </div>

//         {error && <ErrorBanner message={error} />}

//         <section className="ui-paths" aria-labelledby="paths-heading">
//           <div className="ui-section-head">
//             <p className="ui-section-kicker">Four ways to grow</p>
//             <h2 id="paths-heading" className="ui-section-title">Choose your learning path</h2>
//             <p className="ui-section-sub">Pick a skill to explore and get started.</p>
//           </div>

//           {loading ? (
//             <div className="ui-loading-status ui-loading-status--wide" role="status" aria-live="polite">
//               <div className="ui-spinner" aria-hidden="true"></div>
//               <p className="ui-loading-text">Loading learning categories…</p>
//             </div>
//           ) : (
//             <div className="ui-path-grid">
//               {CATEGORIES.map((category, i) => (
//                 // <button
//                 //   key={category.id}
//                 //   type="button"
//                 //   className={`ui-path tone-${category.tone}`}
//                 //   style={{ "--i": i }}
//                 //   onClick={() => handleCategorySelect(category.id)}
//                 // >

//                 <button
//                   key={category.id}
//                   type="button"
//                   className={`ui-path tone-${category.tone} ${
//                     ["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)
//                       ? "ui-path--locked"
//                       : ""
//                   }`}
//                   style={{ "--i": i }}
//                   onClick={() => {
//                     if (["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)) return;
//                     handleCategorySelect(category.id);
//                   }}
//                   disabled={["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)}
//                   aria-label={
//                     ["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)
//                       ? `${category.name} locked`
//                       : category.name
//                   }
//                 >
//                   {["Conversation", "Sentence Composition", "Text Composition"].includes(category.id) && (
//                     <span className="ui-path-lock" aria-hidden="true">
//                       <LockKeyhole size={76} strokeWidth={1.5} />
//                     </span>
//                 )}
//                   <span className="ui-path-glow" aria-hidden="true" />
//                   <PathArt id={category.id} />
//                   <span className="ui-path-top">
//                     <span className="ui-path-icon">
//                       <CategoryGlyph id={category.id} />
//                     </span>
//                     <span className="ui-path-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
//                   </span>
//                   <span className="ui-path-body">
//                     <span className="ui-path-title">{category.name}</span>
//                     <span className="ui-path-desc">{category.description}</span>
//                   </span>
//                   <span className="ui-path-action">
//                     {category.action}
//                     <span className="ui-path-arrow"><ArrowIcon /></span>
//                   </span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </section>
//       </main>
//     </AppShell>
//   );
// }






import React, { useState, useEffect, useRef } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./userinterface.css";
import SelectRelations from "./SelectRelations";
import UserManual from "./UserManual";
import Conversations from "./Conversations";
import VocabularyCard from "./Vocabulary";
import SentenceComposition from "./SentenceComposition";
import { logout } from "../utils/auth";


const API_BASE_URL = "http://localhost:8000";

/*
  The four primary learning categories, in display order.
  `id` values are used by the API and the routing logic below — do not change them.
  `tone` only selects the visual treatment of the card.
*/
const CATEGORIES = [
  {
    id: "vocabulary",
    name: "Word Studio",
    tone: "ink",
    description: "Discover words, meanings, and how to use them.",
    action: "Explore Word Studio",
  },
  {
    id: "Sentence Composition",
    name: "Sentence Builder",
    tone: "indigo",
    description: "Learn to build clear, correct sentences.",
    action: "Coming Soon",
  },
  {
    id: "Text Composition",
    name: "Writing Studio",
    tone: "paper",
    description: "Organize your ideas and express them in writing.",
    action: "Coming Soon",
  },
  {
    id: "Conversation",
    name: "Conversation Lab",
    tone: "lavender",
    description: "Practise expressing yourself in conversations.",
    action: "Coming Soon",
  },
];

/* Decorative greetings used by the ticker and the orbit (purely visual). */
const GREETINGS = ["Hello", "नमस्ते", "నమస్కారం", "வணக்கம்", "Welcome", "స్వాగతం", "स्वागत है", "வரவேற்கிறோம்"];

function getUserInfo() {
  const firstNonEmpty = (...values) =>
    values.find((value) => typeof value === "string" && value.trim())?.trim();

  try {
    // Login and Google signup commonly store the returned user object separately
    // from the JWT. Prefer that object because the JWT may contain only userId/exp.
    let storedUser = null;
    for (const key of ["user", "currentUser", "userData", "authUser"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          storedUser = parsed.user && typeof parsed.user === "object"
            ? parsed.user
            : parsed;
          break;
        }
      } catch {
        // Ignore keys that are plain strings rather than JSON.
      }
    }

    let tokenPayload = {};
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          tokenPayload = JSON.parse(atob(parts[1]));
        } catch {
          // A malformed or non-standard token should not block profile fallback.
        }
      }
    }

    const name = firstNonEmpty(
      storedUser?.name,
      storedUser?.fullName,
      storedUser?.username,
      localStorage.getItem("userName"),
      localStorage.getItem("name"),
      tokenPayload.name,
      tokenPayload.username,
    ) || "User";

    const email = firstNonEmpty(
      storedUser?.email,
      localStorage.getItem("userEmail"),
      localStorage.getItem("email"),
      tokenPayload.email,
    ) || "";

    return { name, email };
  } catch {
    return { name: "User", email: "" };
  }
}

function getInitials(name) {
  return (name || "User")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------- Icons (inline SVG, no dependency) ---------- */

const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

function MenuIcon() {
  return (
    <svg {...svgBase} width="22" height="22">
      <path d="M4 8h16M4 16h10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...svgBase} width="20" height="20">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg {...svgBase} width="16" height="16">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="ui-arrow" {...svgBase} width="16" height="16">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
      <path d="M12 6v13.5" />
    </svg>
  );
}

function AssignmentsIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg {...svgBase} width="18" height="18">
      <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg {...svgBase} width="17" height="17">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function CategoryGlyph({ id, size = 20 }) {
  const props = { ...svgBase, width: size, height: size };
  switch (id) {
    case "vocabulary":
      return (
        <svg {...props}>
          <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
          <path d="M12 6v13.5" />
        </svg>
      );
    case "Sentence Composition":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="7" height="8" rx="2" />
          <rect x="14" y="8" width="7" height="8" rx="2" />
          <path d="M10 12h4" />
        </svg>
      );
    case "Text Composition":
      return (
        <svg {...props}>
          <path d="M4 6h16M4 10h16M4 14h16M4 18h9" />
        </svg>
      );
    case "Conversation":
      return (
        <svg {...props}>
          <path d="M4 5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3.5 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
          <path d="M19 9.5h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v3l-3.5-3H11" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

/* ---------- Decorative illustrations ---------- */

/* Hero: a softly rotating globe ringed by greetings from the app's languages. */
function WordOrbit() {
  return (
    <div className="ui-orbit" aria-hidden="true">
      <span className="ui-orbit-ring ui-orbit-ring--a" />
      <span className="ui-orbit-ring ui-orbit-ring--b" />
      <div className="ui-orbit-globe">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <circle cx="50" cy="50" r="46" />
          <ellipse cx="50" cy="50" rx="18" ry="46" />
          <ellipse cx="50" cy="50" rx="34" ry="46" />
          <path d="M4 50h92M6.9 34h86.2M6.9 66h86.2" />
          <path d="M50 4v92" />
        </svg>
        <span className="ui-orbit-glint" />
      </div>
      <span className="ui-orbit-chip ui-orbit-chip--1"><b>Hello</b><i>English</i></span>
      <span className="ui-orbit-chip ui-orbit-chip--2"><b>नमस्ते</b><i>Hindi</i></span>
      <span className="ui-orbit-chip ui-orbit-chip--3"><b>నమస్కారం</b><i>Telugu</i></span>
      <span className="ui-orbit-chip ui-orbit-chip--4"><b>வணக்கம்</b><i>Tamil</i></span>
    </div>
  );
}

/* Learning-path cards: a tiny scene for each skill. */
function PathArt({ id }) {
  switch (id) {
    case "vocabulary":
      return (
        <span className="ui-art ui-art--vocab" aria-hidden="true">
          <span className="ui-vc ui-vc--3" />
          <span className="ui-vc ui-vc--2" />
          <span className="ui-vc ui-vc--1">
            <b>Aa</b>
            <i />
            <i />
          </span>
        </span>
      );
    case "Sentence Composition":
      return (
        <span className="ui-art ui-art--sent" aria-hidden="true">
          <span>I</span>
          <span>learn</span>
          <span>every</span>
          <span>day</span>
          <span className="ui-slot" />
        </span>
      );
    case "Text Composition":
      return (
        <span className="ui-art ui-art--text" aria-hidden="true">
          <i style={{ "--w": "62%" }} />
          <i style={{ "--w": "100%" }} />
          <i style={{ "--w": "88%" }} />
          <i style={{ "--w": "96%" }} />
          <i style={{ "--w": "46%" }} />
        </span>
      );
    case "Conversation":
      return (
        <span className="ui-art ui-art--talk" aria-hidden="true">
          <span className="ui-bubble ui-bubble--a">How was your day?</span>
          <span className="ui-bubble ui-bubble--b">
            <em /><em /><em />
          </span>
        </span>
      );
    default:
      return null;
  }
}

/* ---------- Shell: floating top bar + overlay drawer ---------- */

function AppShell({ active, initials, user, onHome, onCategory, onFeature, onManual, onProfile, onLogout, children }) {
  const [open, setOpen] = useState(false); // drawer is closed by default
  const menuBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const wasOpen = useRef(false);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock page scroll while open; move focus in on open and back to the menu button on close.
  useEffect(() => {
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeBtnRef.current?.focus();
      wasOpen.current = true;
      return () => {
        document.body.style.overflow = previous;
      };
    }
    if (wasOpen.current) {
      menuBtnRef.current?.focus();
      wasOpen.current = false;
    }
    return undefined;
  }, [open]);

  // Keep Tab focus inside the drawer while it is open.
  const handleDrawerKeyDown = (e) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll("button:not([disabled])");
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Every drawer action closes the drawer first, then runs the existing handler.
  const choose = (fn) => () => {
    setOpen(false);
    fn();
  };

  const navItem = (key, label, icon, handler) => (
    <li key={key}>
      <button
        type="button"
        className={`ui-drawer-item${active === key ? " is-active" : ""}`}
        aria-current={active === key ? "page" : undefined}
        onClick={choose(handler)}
      >
        <span className="ui-drawer-item-icon">{icon}</span>
        <span>{label}</span>
      </button>
    </li>
  );

  return (
    <div className="user-interface-page">
      <header className="ui-top-nav">
        <div className="ui-top-nav-inner">
          <button
            type="button"
            ref={menuBtnRef}
            className="ui-icon-btn ui-menu-btn"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="ui-drawer"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>

          <button type="button" className="ui-brand" onClick={onHome} aria-label="Lexora — dashboard">
            <span className="ui-brand-mark" aria-hidden="true" />
            <span className="ui-brand-text">Lexora</span>
          </button>

          <nav className="ui-top-links" aria-label="Quick links">
            <button
              type="button"
              className={`ui-top-link${active === "home" ? " is-active" : ""}`}
              aria-current={active === "home" ? "page" : undefined}
              onClick={onHome}
            >
              Dashboard
            </button>
            <button type="button" className="ui-top-link" onClick={onManual}>
              User Manual
            </button>
          </nav>

          <button
            type="button"
            className={`ui-avatar-btn${active === "profile" ? " is-active" : ""}`}
            aria-label="Open profile"
            aria-current={active === "profile" ? "page" : undefined}
            onClick={onProfile}
          >
            {initials}
          </button>
        </div>
      </header>

      {open && <div className="ui-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        id="ui-drawer"
        ref={drawerRef}
        className={`ui-drawer${open ? " is-open" : ""}`}
        aria-label="Navigation menu"
        aria-hidden={!open}
        onKeyDown={handleDrawerKeyDown}
      >
        <div className="ui-drawer-head">
          <span className="ui-brand ui-brand--static">
            <span className="ui-brand-mark" aria-hidden="true" />
            <span className="ui-brand-text">Lexora</span>
          </span>
          <button
            type="button"
            ref={closeBtnRef}
            className="ui-icon-btn ui-icon-btn--light"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="ui-drawer-nav" aria-label="Main navigation">
          <p className="ui-drawer-label">Menu</p>
          <ul className="ui-drawer-list">
            {navItem("home", "Dashboard", <HomeIcon />, onHome)}
          </ul>

          <p className="ui-drawer-label">Learning workspace</p>
          <ul className="ui-drawer-list">
            {navItem("assignments", "Assignments", <AssignmentsIcon />, () => onFeature("assignments"))}
            {navItem("progress", "My Progress", <ProgressIcon />, () => onFeature("progress"))}
            {navItem("saved-words", "Saved Words", <BookmarkIcon />, () => onFeature("saved-words"))}
            {navItem("history", "Learning History", <HistoryIcon />, () => onFeature("history"))}
          </ul>

          <p className="ui-drawer-label">Account & help</p>
          <ul className="ui-drawer-list">
            {navItem("profile", "My Profile", <UserIcon />, onProfile)}
            {navItem("manual", "User Manual", <ManualIcon />, onManual)}
          </ul>
        </nav>

        <div className="ui-drawer-foot">
          <div className="ui-drawer-user">
            <span className="ui-drawer-user-avatar" aria-hidden="true">{initials}</span>
            <span className="ui-drawer-user-text">
              <strong>{user.name}</strong>
              {user.email && <span>{user.email}</span>}
            </span>
          </div>
          <button type="button" className="ui-drawer-signout" onClick={choose(onLogout)}>
            <PowerIcon />
            Sign out
          </button>
        </div>
      </aside>

      {children}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="ui-error-message" role="alert">
      <span className="ui-error-mark" aria-hidden="true">!</span>
      <span>{message}</span>
    </div>
  );
}

export default function UserInterface() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSelectRelations, setShowSelectRelations] = useState(false);
  const [showUserManual, setShowUserManual] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showSentenceComposition, setShowSentenceComposition] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedFeaturePage, setSelectedFeaturePage] = useState(null);
  const [vocabularyData, setVocabularyData] = useState([]);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [hasData, setHasData] = useState(true);
  const [userInfo] = useState(getUserInfo);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleVocabularyNext = () => {
    if (currentVocabIndex < vocabularyData.length - 1) {
      setCurrentVocabIndex(currentVocabIndex + 1);
    } else {
      handleBackToCategories();
    }
  };

  const handleVocabularyPrevious = () => {
    if (currentVocabIndex > 0) setCurrentVocabIndex(currentVocabIndex - 1);
  };

  const handleBackToCategories = () => {
    // Clear every secondary screen so Home/Dashboard always returns to the dashboard.
    setSelectedFeaturePage(null);
    setShowUserManual(false);
    setShowUserProfile(false);
    setSelectedCategory(null);
    setSelectedLevel(null);
    setTasks([]);
    setSelectedTask(null);
    setShowSelectRelations(false);
    setShowConversations(false);
    setShowVocabulary(false);
    setShowSentenceComposition(false);
    setShowUserProfile(false);
    setVocabularyData([]);
    setCurrentVocabIndex(0);
    setError("");
    setInfoMessage("");
    setHasData(true);
  };

  // Kept for compatibility with the original component (currently unused by the UI).
  // eslint-disable-next-line no-unused-vars
  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setTasks([]);
    setSelectedTask(null);
    setShowSelectRelations(false);
    setShowConversations(false);
    setShowVocabulary(false);
    setShowSentenceComposition(false);
    setVocabularyData([]);
    setCurrentVocabIndex(0);
    setError("");
    setInfoMessage("");
    setHasData(true);
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
    setShowSelectRelations(false);
    setShowConversations(false);
    setShowVocabulary(false);
    setShowSentenceComposition(false);
    setVocabularyData([]);
    setCurrentVocabIndex(0);
  };

  const toVocabularyCard = (wordDoc) => ({
    data: {
      word: wordDoc.word,
      phonetic: wordDoc.phonetic,
      wordType: wordDoc.wordType,
      meaning: wordDoc.meaning,
      domain: wordDoc.domain,
      forms: wordDoc.forms || [],
      examples: wordDoc.examples || [],
      synonyms: wordDoc.synonyms || [],
      antonyms: wordDoc.antonyms || [],
      imageUrl: wordDoc.image_url || null,
      nativeLanguages: {
        hindi: { word: wordDoc.native?.hindi?.word || wordDoc.word, description: wordDoc.native?.hindi?.meaning || "" },
        telugu: { word: wordDoc.native?.telugu?.word || wordDoc.word, description: wordDoc.native?.telugu?.meaning || "" },
        tamil: { word: wordDoc.native?.tamil?.word || wordDoc.word, description: wordDoc.native?.tamil?.meaning || "" },
      },
    },
  });

  const handleFeaturePage = (page) => {
    setSelectedFeaturePage(page);
    setShowUserProfile(false);
    setShowUserManual(false);
    setSelectedCategory(null);
    setSelectedLevel(null);
    setTasks([]);
    setSelectedTask(null);
    setShowSelectRelations(false);
    setShowConversations(false);
    setShowVocabulary(false);
    setShowSentenceComposition(false);
    setError("");
    setInfoMessage("");
  };

  const handleCategorySelect = async (category) => {
    // Switching to a learning path must leave any Coming Soon screen.
    setSelectedFeaturePage(null);
    setShowUserProfile(false);
    setShowUserManual(false);
    setSelectedCategory(category);
    setSelectedTask(null);
    setTasks([]);
    setError("");
    setInfoMessage("");
    setHasData(true);
    setShowSelectRelations(false);
    setShowConversations(false);
    setShowVocabulary(false);
    setShowSentenceComposition(false);

    if (category === "Sentence Composition") {
      setSelectedLevel("all");
      setShowSentenceComposition(true);
      return;
    }

    setLoading(true);
    try {
      // Merge the existing backend data across levels, without showing levels to users.
      const results = await Promise.all(["easy", "medium", "hard"].map(async (levelName) => {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${encodeURIComponent(category)}/${levelName}`);
        if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
        const data = await response.json();
        return { levelName, data };
      }));

      if (category === "vocabulary") {
        const wordDocs = results.flatMap(({ data }) =>
          (data.tasks || []).flatMap((task) => task.words || [])
        );
        const cards = wordDocs.map(toVocabularyCard);
        setVocabularyData(cards);
        setCurrentVocabIndex(0);
        setSelectedLevel("all");
        if (cards.length > 0) {
          setShowVocabulary(true);
          setHasData(true);
        } else {
          // Keep the vocabulary search interface available even when no words are saved yet.
          setVocabularyData([toVocabularyCard({
            word: "", phonetic: "", wordType: "", meaning: "", domain: "",
            forms: [], examples: [], synonyms: [], antonyms: [], native: {},
          })]);
          setCurrentVocabIndex(0);
          setShowVocabulary(true);
          setHasData(true);
        }
        return;
      }

      const allTasks = results.flatMap(({ levelName, data }) =>
        (data.tasks || []).map((task) => {
          const taskNumber = task.id?.split("_").slice(1).join("_") || "";
          const isConversation = category === "Conversation";
          return {
            ...task,
            level: levelName,
            title: !task.title || task.title.includes("task.title")
              ? `${isConversation ? "Conversation" : "Story"} ${taskNumber}`
              : task.title,
            description: task.description || `${task.sentenceCount || task.sentences?.length || 0} sentences`,
            category,
          };
        })
      ).sort((a, b) => a.title.localeCompare(b.title));

      setTasks(allTasks);
      setSelectedLevel("all");
      setHasData(allTasks.length > 0);
      if (allTasks.length === 0) {
        const comingSoon = results.find(({ data }) => data.coming_soon)?.data;
        setInfoMessage(comingSoon?.message || `No tasks available for ${category} yet.`);
      }
    } catch (err) {
      console.error("Error loading category content:", err);
      setError("Failed to load content. Please check your connection.");
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);

    if (selectedCategory === "Conversation") {
      setShowConversations(true);
    } else if (selectedCategory === "Text Composition") {
      setShowSelectRelations(true);
    } else if (selectedCategory === "vocabulary") {
      const vocabCards = (task.words || []).map(toVocabularyCard);
      setVocabularyData(vocabCards);
      setCurrentVocabIndex(0);
      setShowVocabulary(vocabCards.length > 0);
    }
  };

  /* ---------- Full-screen activity components (unchanged behaviour) ---------- */

  if (showUserManual) {
    return <UserManual onClose={() => setShowUserManual(false)} />;
  }

  if (showSentenceComposition && selectedCategory === "Sentence Composition") {
    return (
      <SentenceComposition
        level="easy"
        onBack={handleBackToCategories}
      />
    );
  }

  if (showConversations && selectedTask && selectedCategory === "Conversation") {
    return <Conversations onBack={handleBackToTasks} level={selectedTask.level || selectedLevel} task={selectedTask} />;
  }

  if (showSelectRelations && selectedTask && selectedCategory === "Text Composition") {
    return (
      <SelectRelations
        task={selectedTask}
        level={selectedTask.level || selectedLevel}
        category={selectedCategory}
        taskId={selectedTask.id}
        onBack={handleBackToCategories}
      />
    );
  }

  if (showVocabulary && vocabularyData.length > 0) {
    const currentVocab = vocabularyData[currentVocabIndex];
    return (
      <VocabularyCard
        data={currentVocab.data}
        onNext={handleVocabularyNext}
        onPrevious={handleVocabularyPrevious}
        currentIndex={currentVocabIndex}
        totalCards={vocabularyData.length}
        onBack={handleBackToCategories}
      />
    );
  }

  /* ---------- Shared values for the screens below ---------- */

  const initials = getInitials(userInfo.name);
  const firstName = (userInfo.name || "User").split(" ").filter(Boolean)[0] || "User";
  const categoryInfo = CATEGORIES.find((cat) => cat.id === selectedCategory);
  const categoryName = categoryInfo?.name || selectedCategory;
  const activeKey = showUserProfile ? "profile" : selectedFeaturePage || selectedCategory || "home";

  const shellProps = {
    active: activeKey,
    initials,
    user: userInfo,
    onHome: handleBackToCategories,
    // From the drawer, leave the profile screen first, then run the unchanged category handler.
    onCategory: (id) => {
      setShowUserProfile(false);
      handleCategorySelect(id);
    },
    onFeature: handleFeaturePage,
    onManual: () => {
      setSelectedFeaturePage(null);
      setShowUserProfile(false);
      setShowUserManual(true);
    },
    onProfile: () => {
      setSelectedFeaturePage(null);
      setShowUserManual(false);
      setShowUserProfile(true);
    },
    onLogout: handleLogout,
  };

  /* ---------- Planned learner workspace pages ---------- */

  const FEATURE_PAGE_CONTENT = {
    assignments: {
      title: "Assignments",
      description: "View tasks assigned by your teacher, check due dates, and track submissions.",
      detail: "Teacher-assigned activities will appear here once assignment management is connected.",
      icon: <AssignmentsIcon />,
    },
    progress: {
      title: "My Progress",
      description: "Understand your learning activity and see how your skills develop over time.",
      detail: "Your progress will be calculated from real activity attempts and results.",
      icon: <ProgressIcon />,
    },
    "saved-words": {
      title: "Saved Words",
      description: "Keep useful vocabulary in one place so you can revise it later.",
      detail: "Saved vocabulary will appear here after word bookmarking is implemented.",
      icon: <BookmarkIcon />,
    },
    history: {
      title: "Learning History",
      description: "Return to previous activities and review your completed attempts.",
      detail: "Your learning history will be populated from recorded activity attempts.",
      icon: <HistoryIcon />,
    },
  };

  if (selectedFeaturePage && FEATURE_PAGE_CONTENT[selectedFeaturePage]) {
    const feature = FEATURE_PAGE_CONTENT[selectedFeaturePage];
    return (
      <AppShell {...shellProps}>
        <main className="ui-page ui-page--narrow">
          {/* <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
            <BackIcon /> Back to Home
          </button> */}
          <section className="ui-empty-state ui-empty-state--wide" aria-labelledby="feature-page-heading">
            <span className="ui-icon-tile ui-icon-tile--lg" aria-hidden="true">
              {feature.icon}
            </span>
            <span className="ui-eyebrow-tag">{feature.title}</span>
            <h1 id="feature-page-heading" className="ui-empty-state-title">Coming Soon!</h1>
            <p className="ui-empty-state-description">
              We're working on this feature. It will be available here soon.
            </p>
            <div className="ui-empty-state-actions">
              <button type="button" className="ui-primary-btn" onClick={handleBackToCategories}>
                Explore learning paths
              </button>
            </div>
          </section>
        </main>
      </AppShell>
    );
  }

  /* ---------- Profile ---------- */

  if (showUserProfile) {
    return (
      <AppShell {...shellProps}>
        <main className="ui-page ui-page--narrow">
          <button type="button" className="ui-back-btn" onClick={() => setShowUserProfile(false)}>
            <BackIcon /> Back
          </button>

          <section className="ui-profile-head" aria-labelledby="profile-heading">
            <div className="ui-profile-avatar-lg" aria-hidden="true">{initials}</div>
            <div>
              <h1 id="profile-heading" className="ui-page-title">{firstName}</h1>
              {userInfo.email && <p className="ui-page-subtitle">{userInfo.email}</p>}
            </div>
          </section>

          <section className="ui-panel" aria-labelledby="profile-details-heading">
            <h2 id="profile-details-heading" className="ui-panel-heading">Account details</h2>
            <dl className="ui-detail-list">
              <div className="ui-detail-row">
                <dt>Name</dt>
                <dd>{userInfo.name}</dd>
              </div>
              {userInfo.email && (
                <div className="ui-detail-row">
                  <dt>Email</dt>
                  <dd>{userInfo.email}</dd>
                </div>
              )}
              <div className="ui-detail-row">
                <dt>Status</dt>
                <dd><span className="ui-status-badge">Active</span></dd>
              </div>
            </dl>
          </section>

          <section className="ui-panel" aria-labelledby="profile-help-heading">
            <h2 id="profile-help-heading" className="ui-panel-heading">Help</h2>
            <button
              type="button"
              className="ui-action-row"
              onClick={() => { setShowUserProfile(false); setShowUserManual(true); }}
            >
              <span className="ui-action-icon"><ManualIcon /></span>
              <span className="ui-action-text">
                <strong>User Manual</strong>
                <span>How to use each learning path</span>
              </span>
              <ArrowIcon />
            </button>
          </section>

          <button type="button" className="ui-signout-btn" onClick={handleLogout}>
            <PowerIcon />
            Sign out
          </button>
        </main>
      </AppShell>
    );
  }

  /* ---------- Loading a category ---------- */

  if (selectedCategory && loading) {
    return (
      <AppShell {...shellProps}>
        <main className="ui-page" aria-busy="true">
          <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
            <BackIcon /> Dashboard
          </button>
          <div className="ui-loading-status" role="status" aria-live="polite">
            <div className="ui-spinner" aria-hidden="true"></div>
            <p className="ui-loading-text">Loading {categoryName} activities…</p>
          </div>
          <div className="ui-task-grid" aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="ui-skeleton-card">
                <div className="ui-skeleton ui-skeleton--icon" />
                <div className="ui-skeleton-card-text">
                  <div className="ui-skeleton ui-skeleton--line" />
                  <div className="ui-skeleton ui-skeleton--line short" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </AppShell>
    );
  }

  /* ---------- Activities for a category ---------- */

  if (selectedCategory && tasks.length > 0 && hasData && !loading) {
    return (
      <AppShell {...shellProps}>
        <main className="ui-page">
          <button type="button" className="ui-back-btn" onClick={handleBackToCategories}>
            <BackIcon /> Dashboard
          </button>

          <header className="ui-banner">
            <span className="ui-banner-glow" aria-hidden="true" />
            <span className="ui-banner-icon">
              <CategoryGlyph id={selectedCategory} size={26} />
            </span>
            <div className="ui-banner-text">
              <p className="ui-banner-eyebrow">Learning path</p>
              <h1 className="ui-page-title">{categoryName}</h1>
              {categoryInfo && <p className="ui-page-subtitle">{categoryInfo.description}</p>}
            </div>
            <span className="ui-count">
              <b>{tasks.length}</b> {tasks.length === 1 ? "activity" : "activities"}
            </span>
          </header>

          {error && <ErrorBanner message={error} />}

          <ol className="ui-task-grid" aria-label={`${categoryName} activities`}>
            {tasks.map((task, index) => (
              <li key={task.id || index} style={{ "--i": index }}>
                <button type="button" className="ui-task" onClick={() => handleTaskSelect(task)}>
                  <span className="ui-task-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ui-task-text">
                    <span className="ui-task-title">{task.title || "Task"}</span>
                    <span className="ui-task-desc">{task.description || "Click to start"}</span>
                  </span>
                  <span className="ui-task-go">
                    <span className="ui-task-go-label">Start</span>
                    <span className="ui-task-go-dot"><ArrowIcon /></span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </main>
      </AppShell>
    );
  }

  /* ---------- Empty / error state for a category ---------- */

  if (selectedCategory && (!hasData || tasks.length === 0) && !loading && !showVocabulary && !showSentenceComposition) {
    return (
      <AppShell {...shellProps}>
        <main className="ui-page ui-page--center">
          <div className="ui-empty-state" role={error ? "alert" : "status"}>
            <span className="ui-icon-tile ui-icon-tile--lg">
              <CategoryGlyph id={selectedCategory} size={26} />
            </span>
            <h1 className="ui-empty-state-title">
              {error ? "We couldn't load this content" : "Coming soon"}
            </h1>
            <p className="ui-empty-state-description">
              {error || infoMessage || "No tasks available."}
            </p>
            <div className="ui-empty-state-actions">
              {error && (
                <button type="button" className="ui-primary-btn" onClick={() => handleCategorySelect(selectedCategory)}>
                  Try again
                </button>
              )}
              <button
                type="button"
                className={error ? "ui-secondary-btn" : "ui-primary-btn"}
                onClick={handleBackToCategories}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  /* ---------- Dashboard home ---------- */

  return (
    <AppShell {...shellProps}>
      <main className="ui-page ui-page--home">
        <section className="ui-hero" aria-labelledby="intro-heading">
          <div className="ui-hero-copy">
            <p className="ui-eyebrow">
              <span className="ui-eyebrow-dot" aria-hidden="true" />
              {getGreeting()}, {firstName}
            </p>
            <h1 id="intro-heading" className="ui-hero-title">
              Build your language skills, <span className="ui-hero-accent">one step</span> at a time.
            </h1>
            <p className="ui-hero-subtitle">
              Explore words, build sentences, write with confidence, and practise everyday conversations.
            </p>
            <div className="ui-hero-actions">
              {/* <button type="button" className="ui-primary-btn ui-primary-btn--lg" onClick={() => shellProps.onCategory("vocabulary")}>
                Start with Word Studio <ArrowIcon />
              </button> */}
              <button type="button" className="ui-primary-btn ui-primary-btn--lg" onClick={() => shellProps.onCategory("vocabulary")}>
                <span>Start with Word Studio</span>
                <ArrowIcon />
              </button>
              <button type="button" className="ui-ghost-btn" onClick={shellProps.onManual}>
                <ManualIcon /> User Manual
              </button>
            </div>
          </div>

          <WordOrbit />
        </section>

        <div className="ui-ticker" aria-hidden="true">
          <div className="ui-ticker-track">
            {[...GREETINGS, ...GREETINGS].map((word, i) => (
              <span className="ui-ticker-item" key={`${word}-${i}`}>{word}</span>
            ))}
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <section className="ui-paths" aria-labelledby="paths-heading">
          <div className="ui-section-head">
            <p className="ui-section-kicker">Four ways to grow</p>
            <h2 id="paths-heading" className="ui-section-title">Choose your learning path</h2>
            <p className="ui-section-sub">Pick a skill to explore and get started.</p>
          </div>

          {loading ? (
            <div className="ui-loading-status ui-loading-status--wide" role="status" aria-live="polite">
              <div className="ui-spinner" aria-hidden="true"></div>
              <p className="ui-loading-text">Loading learning categories…</p>
            </div>
          ) : (
            <div className="ui-path-grid">
              {CATEGORIES.map((category, i) => (
                // <button
                //   key={category.id}
                //   type="button"
                //   className={`ui-path tone-${category.tone}`}
                //   style={{ "--i": i }}
                //   onClick={() => handleCategorySelect(category.id)}
                // >

                <button
                  key={category.id}
                  type="button"
                  className={`ui-path tone-${category.tone} ${
                    ["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)
                      ? "ui-path--locked"
                      : ""
                  }`}
                  style={{ "--i": i }}
                  onClick={() => {
                    if (["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)) return;
                    handleCategorySelect(category.id);
                  }}
                  disabled={["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)}
                  aria-label={
                    ["Conversation", "Sentence Composition", "Text Composition"].includes(category.id)
                      ? `${category.name} locked`
                      : category.name
                  }
                >
                  {["Conversation", "Sentence Composition", "Text Composition"].includes(category.id) && (
                    <span className="ui-path-lock" aria-hidden="true">
                      <LockKeyhole size={76} strokeWidth={1.5} />
                    </span>
                )}
                  <span className="ui-path-glow" aria-hidden="true" />
                  <PathArt id={category.id} />
                  <span className="ui-path-top">
                    <span className="ui-path-icon">
                      <CategoryGlyph id={category.id} />
                    </span>
                    <span className="ui-path-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="ui-path-body">
                    <span className="ui-path-title">{category.name}</span>
                    <span className="ui-path-desc">{category.description}</span>
                  </span>
                  <span className="ui-path-action">
                    {category.action}
                    <span className="ui-path-arrow"><ArrowIcon /></span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}