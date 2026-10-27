# learnsphere — public-site redesign

Landing page (`/`), Login, Signup, Forgot/Reset password were redesigned in place.
Dashboards, API services, auth utilities, role values (`user` / `admin`) and redirects are unchanged.

## Run
```bash
cd frontend/my-react-app
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```
The backend is still expected at `http://localhost:8000/api/auth` (unchanged).

## Design system
- `src/styles/learnsphere.css` — all public-site styles, scoped under `.ls-site` (no collisions with dashboard CSS).
  While a public page is mounted, `<html>` gets `ls-public`, which neutralises the legacy `html, body { height:100%; overflow-x:hidden }`.
- Palette: white `#FFFFFF`, lavender `#F4F6FF`, indigo `#6575E8`, slate `#292E45`.
- Fonts (Manrope headings, Inter body) are bundled via `@fontsource-variable/*` — no external font requests.
- Icons: `lucide-react` (already a dependency). Respects `prefers-reduced-motion`.
- `src/components/public/` — Logo, HeroComposer (hero animation), FeatureVisuals (4 interactive previews),
  AuthArt (login + signup illustrations), Fields (inputs, alerts, Google button), ContactForm, hooks.

## Still required / not available
**Google sign-in** — the button is shown but never fakes success; it explains it is unavailable. To enable it you need:
1. A Google Cloud OAuth 2.0 *Web* client ID (authorised JS origins for your site) -> `VITE_GOOGLE_CLIENT_ID`.
2. A backend endpoint (none exists today) that verifies Google's ID token and returns the same `{ token, user }` as `/api/auth/login`.
3. Then wire Google Identity Services in `GoogleButton` (`src/components/public/Fields.jsx`) to call that endpoint.

**Contact form** — no contact endpoint exists in the project, and no email/phone was invented.
Without configuration the form validates, then states plainly that nothing was sent (and offers "Copy your message").
Set `VITE_CONTACT_ENDPOINT` (see `.env.example`) to a URL accepting `POST {name,email,message}` JSON; "sent" is shown only on a 2xx reply.

**Remember me** — omitted: auth state is stored in `localStorage` throughout the app, so a session-only option would not be meaningful without wider changes.

## Other fixes
- `Conversations.jsx` imported `./conversations.css` but the file is `Conversations.css`; this broke builds on case-sensitive systems (Linux/CI). Fixed.
