import { useEffect, useRef, useState } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Legacy dashboard CSS sets `html, body { height:100%; overflow-x:hidden }`, which turns <body>
 * into its own scroller. While a public page is mounted we neutralise that so window scrolling,
 * sticky/fixed navigation and smooth anchor scrolling behave normally.
 */
export function usePublicPage() {
  useEffect(() => {
    document.documentElement.classList.add("ls-public");
    return () => document.documentElement.classList.remove("ls-public");
  }, []);
}

/** Adds `is-visible` to every `.ls-reveal` inside the ref'd element once it scrolls into view. */
export function useScrollReveal() {
  const rootRef = useRef(null);
  const [ready] = useState(() => !prefersReducedMotion() && typeof IntersectionObserver !== "undefined");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const nodes = Array.from(root.querySelectorAll(".ls-reveal"));
    if (!ready) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ready]);

  return [rootRef, ready];
}

/** Tracks which section id is currently in the middle band of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-42% 0px -52% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return active;
}
