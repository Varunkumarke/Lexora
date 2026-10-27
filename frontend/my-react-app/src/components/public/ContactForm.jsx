import { useState } from "react";
import { Copy, Send } from "lucide-react";
import { Alert, Field } from "./Fields";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT;
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * No contact backend exists in this project. If VITE_CONTACT_ENDPOINT is set, the message is POSTed
 * and "sent" is shown only after a 2xx reply. Otherwise we validate, then say plainly that nothing
 * was delivered and let the visitor copy their message.
 */
export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | unavailable | failed
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!emailOk(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.message.trim().length < 10) next.message = "Your message should be at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setCopied(false);
    if (!validate()) return;
    if (!ENDPOINT) {
      setStatus("unavailable");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim() }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("sent");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus("failed");
    }
  };

  const copy = async () => {
    const text = `From: ${values.name} <${values.email}>\n\n${values.message}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <form className="ls-contact-form" onSubmit={submit} noValidate>
      <div className="ls-form-2">
        <Field label="Name" name="name" autoComplete="name" placeholder="Your name" value={values.name} onChange={set("name")} error={errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set("email")} error={errors.email} />
      </div>
      <Field label="Message" error={errors.message}>
        {(fid, eid) => (
          <textarea
            id={fid}
            name="message"
            rows={5}
            placeholder="How can we help?"
            value={values.message}
            onChange={set("message")}
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={errors.message ? eid : undefined}
          />
        )}
      </Field>

      {status === "sent" && <Alert kind="success">Thank you — your message was sent.</Alert>}
      {status === "failed" && <Alert kind="error">We couldn’t send your message. Please try again in a moment.</Alert>}
      {status === "unavailable" && (
        <Alert kind="info">
          Messages can’t be delivered from this site yet, so nothing was sent.{" "}
          <button type="button" className="ls-inline-btn" onClick={copy}>
            <Copy size={13} /> {copied ? "Copied" : "Copy your message"}
          </button>
        </Alert>
      )}

      <button type="submit" className="ls-btn ls-btn-primary" disabled={status === "sending"}>
        {status === "sending" ? <><span className="ls-spin" /> Sending…</> : <>Send message <Send size={16} /></>}
      </button>
    </form>
  );
}
