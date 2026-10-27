import { useEffect, useRef, useState } from "react";
import { Mic, RotateCw } from "lucide-react";
import { prefersReducedMotion } from "./hooks";

/*
  Hero art direction: "words → sentence → voice".
  Loose word tiles drift in a tray, drop one by one into a sentence line, and the finished
  sentence is "spoken" (waveform). The tile order in the tray is a fixed shuffle so the
  composition is deterministic.
*/
const SENTENCES = [
  { words: ["Good", "words", "give", "ideas", "a", "voice."], hi: 5, key: "voice", ipa: "/vɔɪs/", shuffle: [3, 0, 5, 2, 4, 1] },
  { words: ["Small", "phrases", "build", "real", "conversations."], hi: 4, key: "conversations", ipa: "/ˌkɒnvəˈseɪʃənz/", shuffle: [2, 4, 0, 3, 1] },
  { words: ["Say", "what", "you", "mean,", "clearly."], hi: 4, key: "clearly", ipa: "/ˈklɪəli/", shuffle: [3, 1, 4, 0, 2] },
];

const BARS = 22;

export default function HeroComposer() {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const timers = useRef([]);
  const reduced = useRef(prefersReducedMotion());
  const sentence = SENTENCES[idx];
  const total = sentence.words.length;
  const goTo = (i) => {
    setStep(0);
    setIdx(i);
  };
  // With reduced motion the finished sentence is shown statically.
  const shown = reduced.current ? total : step;
  const done = shown >= total;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (reduced.current) return clearTimers;
    let s = 0;
    const tick = () => {
      s += 1;
      setStep(s);
      if (s < total) timers.current.push(setTimeout(tick, 560));
      else timers.current.push(setTimeout(() => goTo((idx + 1) % SENTENCES.length), 4200));
    };
    timers.current.push(setTimeout(tick, 1500));
    return clearTimers;
  }, [idx, total]);

  const next = () => goTo((idx + 1) % SENTENCES.length);

  return (
    <div className="ls-composer" role="group" aria-label="Animated example: words assembling into a sentence">
      <span className="ls-sr">{sentence.words.join(" ")}</span>

      <svg className="ls-quote-bg" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M18 70c0-24 12-42 34-48l3 9c-12 5-18 13-18 22h15v35H18zM68 70c0-24 12-42 34-48l3 9c-12 5-18 13-18 22h15v35H68z" />
      </svg>

      <div className="ls-float ls-float-a" aria-hidden="true"><span>Aa</span></div>
      <div className="ls-float ls-float-b" aria-hidden="true"><i>/ˈaɪdiə/</i></div>
      <div className="ls-float ls-float-c" aria-hidden="true"><span>?</span></div>
      <div className="ls-float ls-float-d" aria-hidden="true"><span>“ ”</span></div>

      <div className="ls-composer-card">
        <div className="ls-composer-head">
          <div className="ls-steps" aria-hidden="true">
            <span className={shown > 0 ? "is-on" : "is-on is-now"}>Words</span>
            <span className={shown > 0 && !done ? "is-on is-now" : done ? "is-on" : ""}>Sentence</span>
            <span className={done ? "is-on is-now" : ""}>Voice</span>
          </div>
          <button type="button" className="ls-icon-btn" onClick={next} aria-label="Show another example sentence">
            <RotateCw size={15} />
          </button>
        </div>

        <div className="ls-stage" aria-hidden="true">
          <p className="ls-stage-label"><b>01</b> Pick the words</p>
          <div className="ls-tray" key={`tray-${idx}`}>
            {sentence.shuffle.map((wi, pos) => (
              <span
                key={wi}
                className={`ls-tile${wi < shown ? " is-used" : ""}`}
                style={{ "--r": `${[-4, 3, -2, 5, -5, 2][pos % 6]}deg`, "--bd": `${pos * 0.45}s` }}
              >
                {sentence.words[wi].replace(/[.,]/g, "")}
              </span>
            ))}
            <span className={`ls-tray-done${done ? " is-on" : ""}`}>✓ All {total} words placed</span>
          </div>
        </div>

        <div className="ls-link" aria-hidden="true" />

        <div className="ls-stage" aria-hidden="true">
          <p className="ls-stage-label"><b>02</b> Build the sentence</p>
          <div className="ls-sentence" key={`s-${idx}`}>
            {sentence.words.map((w, i) => (
              <span key={i} className="ls-slot" style={{ "--n": w.length }}>
                <span className={`ls-placed${i < shown ? " is-on" : ""}${i === sentence.hi ? " is-hi" : ""}`}>{w}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="ls-link" aria-hidden="true" />

        <div className={`ls-stage ls-voice${done ? " is-speaking" : ""}`} aria-hidden="true">
          <p className="ls-stage-label"><b>03</b> Say it out loud</p>
          <div className="ls-voice-row">
            <span className="ls-mic"><Mic size={16} /></span>
            <span className="ls-wave">
              {Array.from({ length: BARS }, (_, i) => (
                <i key={i} style={{ "--i": i, "--h": `${30 + ((i * 37) % 60)}%` }} />
              ))}
            </span>
            <span className="ls-ipa"><b>{sentence.key}</b> {sentence.ipa}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
