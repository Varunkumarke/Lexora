import { LogoMark } from "./Logo";

/*
  Two distinct illustrations, built from HTML + SVG so they stay crisp and need no assets.
  - LoginArt:  "hello" in four languages orbiting a central sphere (conversation).
  - SignupArt: word → phrase → sentence → paragraph growing on a thread (construction).
*/

const GREETINGS = [
  { text: "Hello", lang: "en", angle: -90 },
  { text: "नमस्ते", lang: "hi", angle: -18 },
  { text: "வணக்கம்", lang: "ta", angle: 54 },
  { text: "నమస్కారం", lang: "te", angle: 126 },
  { text: "Hi!", lang: "en", angle: 198 },
];

export function LoginArt({ title = "Every conversation starts with a word.", text = "Practise vocabulary, conversation and writing in one calm place." }) {
  return (
    <div className="ls-art ls-art-login">
      <div className="ls-art-grid" aria-hidden="true" />
      <div className="ls-orbit" aria-hidden="true">
        <svg className="ls-orbit-svg" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" className="ls-ring ls-ring-1" />
          <circle cx="200" cy="200" r="98" className="ls-ring ls-ring-2" />
          {GREETINGS.map((g) => {
            const a = (g.angle * Math.PI) / 180;
            return (
              <line key={g.text} x1="200" y1="200" x2={200 + 150 * Math.cos(a)} y2={200 + 150 * Math.sin(a)} className="ls-spoke" />
            );
          })}
        </svg>
        <div className="ls-orbit-spin">
          {GREETINGS.map((g, i) => (
            <span
              key={g.text}
              lang={g.lang}
              className="ls-greet"
              style={{ "--a": `${g.angle}deg`, "--i": i }}
            >
              <span className="ls-greet-in">{g.text}</span>
            </span>
          ))}
        </div>
        <div className="ls-core"><span className="ls-core-ring" /><span className="ls-core-ring ls-core-ring-2" /><LogoMark size={56} /></div>
      </div>

      <div className="ls-art-caption">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="ls-art-dots" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </div>
  );
}

const RUNGS = [
  { tag: "Word", node: <span className="ls-rung-word">voice</span> },
  { tag: "Phrase", node: <span className="ls-rung-phrase">a clear <b>voice</b></span> },
  { tag: "Sentence", node: <span className="ls-rung-sentence">Good words give ideas a <b>voice.</b></span> },
  {
    tag: "Text",
    node: (
      <span className="ls-rung-text">
        <i style={{ width: "92%" }} /><i style={{ width: "78%" }} /><i style={{ width: "86%" }} /><i style={{ width: "46%" }} />
      </span>
    ),
  },
];

export function SignupArt({ title = "Begin with a word. Build toward a voice.", text = "Create your account and start composing — one word, one sentence, one idea at a time." }) {
  return (
    <div className="ls-art ls-art-signup">
      <div className="ls-art-grid" aria-hidden="true" />
      <div className="ls-ladder" aria-hidden="true">
        <span className="ls-thread"><span className="ls-thread-dot" /></span>
        {RUNGS.map((r, i) => (
          <div key={r.tag} className="ls-rung" style={{ "--i": i }}>
            <span className="ls-rung-node">{i + 1}</span>
            <span className="ls-rung-card">
              <small>{r.tag}</small>
              {r.node}
            </span>
          </div>
        ))}
        <span className="ls-punct ls-punct-a">,</span>
        <span className="ls-punct ls-punct-b">“</span>
        <span className="ls-punct ls-punct-c">;</span>
      </div>

      <div className="ls-art-caption">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="ls-art-dots" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </div>
  );
}
