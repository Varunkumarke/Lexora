import { Link } from "react-router-dom";

export function LogoMark({ size = 34 }) {
  return (
    <svg className="ls-logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="10" fill="#6575E8" />
      <circle cx="16" cy="15" r="8" fill="none" stroke="#fff" strokeWidth="1.8" />
      <ellipse cx="16" cy="15" rx="3.6" ry="8" fill="none" stroke="#fff" strokeWidth="1.4" />
      <path d="M8.2 15h15.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.6 21.6 8.4 26l5-2.6z" fill="#fff" />
    </svg>
  );
}

export default function Logo({ to = "/", onClick, size }) {
  return (
    <Link to={to} className="ls-logo" aria-label="learnsphere home" onClick={onClick}>
      <LogoMark size={size} />
      <span className="ls-logo-word"><b>Lexora</b></span>
    </Link>
  );
}
