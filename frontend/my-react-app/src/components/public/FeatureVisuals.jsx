import { useState } from "react";
import { Check, Lightbulb, RotateCcw, Star, Volume2, X } from "lucide-react";

/* Small, honest interactive previews. They run entirely in the browser and call no backend. */

/* ---------- 1. Vocabulary ---------- */
const NATIVE = {
  hindi: { label: "Hindi", word: "एल्गोरिदम" },
  telugu: { label: "Telugu", word: "అల్గోరిథమ్" },
  tamil: { label: "Tamil", word: "அல்காரிதம்" },
};

export function VocabularyVisual() {
  const [lang, setLang] = useState("hindi");
  return (
    <div className="ls-vis ls-vis-vocab">
      <div className="ls-domain-row" aria-hidden="true">
        {["Programming", "Cloud Computing", "Cybersecurity"].map((d, i) => (
          <span key={d} className={i === 0 ? "is-active" : ""}>{d}</span>
        ))}
      </div>
      <div className="ls-wordcard">
        <div className="ls-wordcard-top">
          <div>
            <h4>algorithm</h4>
            <p className="ls-ipa-line">/ˈælɡərɪðəm/ <em>noun</em></p>
          </div>
          <span className="ls-audio-pill" aria-hidden="true">
            <Volume2 size={15} />
            <span className="ls-wave ls-wave-sm">
              {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--i": i, "--h": `${35 + ((i * 29) % 55)}%` }} />)}
            </span>
          </span>
        </div>
        <p className="ls-wordcard-def">A set of clear steps for solving a problem or completing a task.</p>
        <div className="ls-native">
          <div className="ls-native-tabs" role="tablist" aria-label="Native language">
            {Object.entries(NATIVE).map(([key, v]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={lang === key}
                className={lang === key ? "is-active" : ""}
                onClick={() => setLang(key)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="ls-native-word" key={lang} lang={lang === "hindi" ? "hi" : lang === "telugu" ? "te" : "ta"}>
            {NATIVE[lang].word}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Conversation ---------- */
export function ConversationVisual() {
  const [answer, setAnswer] = useState(null);
  const [hint, setHint] = useState(false);
  const options = ["Before lunch", "Tomorrow morning", "Next week"];
  const correct = 0;

  return (
    <div className="ls-vis ls-vis-convo">
      <div className="ls-dialogue">
        <div className="ls-bubble ls-bubble-a">
          <span className="ls-bubble-who">Priya</span>
          Could you send me the report by noon?
        </div>
        <div className="ls-bubble ls-bubble-b">
          <span className="ls-bubble-who">Sam</span>
          Sure, I’ll share it before lunch.
        </div>
        <div className="ls-listen" aria-hidden="true">
          <Volume2 size={14} /> Listen
          <span className="ls-wave ls-wave-sm">
            {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--i": i, "--h": `${30 + ((i * 41) % 60)}%` }} />)}
          </span>
        </div>
      </div>

      <div className="ls-quiz">
        <p className="ls-quiz-q">When will Sam share the report?</p>
        <div className="ls-quiz-opts">
          {options.map((o, i) => {
            const state = answer === null ? "" : i === correct ? "is-right" : answer === i ? "is-wrong" : "is-dim";
            return (
              <button key={o} type="button" className={state} onClick={() => setAnswer(i)} aria-pressed={answer === i}>
                <span>{o}</span>
                {answer !== null && i === correct && <Check size={15} />}
                {answer === i && i !== correct && <X size={15} />}
              </button>
            );
          })}
        </div>
        <div className="ls-quiz-foot">
          <button type="button" className="ls-link-btn" onClick={() => setHint((h) => !h)} aria-expanded={hint}>
            <Lightbulb size={14} /> {hint ? "Hide hint" : "Show hint"}
          </button>
          {answer !== null && (
            <button type="button" className="ls-link-btn" onClick={() => setAnswer(null)}>
              <RotateCcw size={13} /> Try again
            </button>
          )}
        </div>
        {hint && <p className="ls-hint">Listen for the time of day Sam mentions.</p>}
        {answer !== null && (
          <p className={`ls-quiz-result ${answer === correct ? "ok" : "no"}`} role="status">
            {answer === correct ? "Correct — “before lunch”." : "Not quite. Replay the dialogue and listen again."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- 3. Sentence composition ---------- */
const TILES = ["returns", "API", "quickly", "The", "slowly", "data"];
const ACCEPTED = ["the api returns data quickly", "the api returns data slowly"];

export function SentenceVisual() {
  const [picked, setPicked] = useState([]);
  const text = picked.map((i) => TILES[i]).join(" ").toLowerCase();
  const full = picked.length === 5;
  const ok = full && ACCEPTED.includes(text);

  const add = (i) => picked.length < 5 && !picked.includes(i) && setPicked([...picked, i]);
  const remove = (i) => setPicked(picked.filter((p) => p !== i));

  return (
    <div className="ls-vis ls-vis-sentence">
      <div className="ls-sc-head">
        <span>Arrange the words into a sentence</span>
        <span className="ls-stars" aria-label={ok ? "1 star earned" : "No stars earned yet"}>
          {[0, 1, 2].map((s) => <Star key={s} size={16} className={ok && s === 0 ? "is-on" : ""} />)}
        </span>
      </div>

      <div className={`ls-sc-line${ok ? " is-ok" : ""}${full && !ok ? " is-no" : ""}`} aria-live="polite">
        {Array.from({ length: 5 }, (_, slot) => {
          const i = picked[slot];
          return i === undefined ? (
            <span key={slot} className="ls-sc-slot" aria-hidden="true" />
          ) : (
            <button key={slot} type="button" className="ls-sc-chip is-placed" onClick={() => remove(i)} aria-label={`Remove ${TILES[i]}`}>
              {TILES[i]}
            </button>
          );
        })}
      </div>

      <div className="ls-sc-tray">
        {TILES.map((t, i) => (
          <button key={t} type="button" className="ls-sc-chip" disabled={picked.includes(i)} onClick={() => add(i)}>
            {t}
          </button>
        ))}
      </div>

      <div className="ls-sc-foot">
        <p className={ok ? "ok" : full ? "no" : ""} role="status">
          {ok ? "Correct — you earned a star." : full ? "Not quite. Tap a word to remove it and try again." : "Tap the words in order."}
        </p>
        {picked.length > 0 && (
          <button type="button" className="ls-link-btn" onClick={() => setPicked([])}>
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- 4. Text composition ---------- */
const RELATIONS = {
  and: "We practised every day, and our speaking improved.",
  so: "We practised every day, so our speaking improved.",
  because: "Our speaking improved because we practised every day.",
  after: "After we practised every day, our speaking improved.",
};

export function TextVisual() {
  const [rel, setRel] = useState("so");
  return (
    <div className="ls-vis ls-vis-text">
      <div className="ls-tx-pair">
        <p className="ls-tx-s">We practised every day.</p>
        <p className="ls-tx-s">Our speaking improved.</p>
      </div>

      <div className="ls-tx-rel" role="radiogroup" aria-label="Choose a logical relation">
        <span>Connect with</span>
        {Object.keys(RELATIONS).map((r) => (
          <button key={r} type="button" role="radio" aria-checked={rel === r} className={rel === r ? "is-active" : ""} onClick={() => setRel(r)}>
            {r}
          </button>
        ))}
      </div>

      <div className="ls-tx-out">
        <span className="ls-tx-label">Combined text</span>
        <p key={rel} aria-live="polite">{RELATIONS[rel]}</p>
      </div>
    </div>
  );
}
