# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs on port 3000)
npm run dev

# Type-check (no emit — this is the lint step)
npm run lint

# Production build
npm run build

# Deploy Cloud Functions (requires Blaze plan + firebase login)
cd functions && npm install
firebase deploy --only functions
```

There is no test suite. `npm run lint` (`tsc --noEmit`) is the only static check.

## Architecture

### Frontend

Single-page React 19 + TypeScript app bundled by Vite. **No React Router** — routing is entirely hash-based via `window.location.hash` (e.g. `#dashboard`, `#scenes:tab-name`). The `PageType` enum in `types.ts` is the authoritative list of routes. `App.tsx` owns the hash listener, maps it to `currentPage` state, and renders the matching page component via a switch statement.

All page components live flat in `components/`. They receive `navigateTo(page: PageType, tab?: string)` as a prop when they need to link elsewhere. The tab segment (after `:`) becomes `initialTab` passed into the target component.

### Styling

**Tailwind via CDN** (loaded in `index.html` — no `tailwind.config.js`). Custom utilities are defined in the `<style>` block in `index.html`:

| Class | Value |
|---|---|
| `bg-brand-gradient` | `linear-gradient(to right, #e53e3e, #f56500)` |
| `text-brand-gradient` | Same gradient, clip-text |
| `glass-card` | `bg-[#0f1628]/80` + backdrop blur + subtle border |
| `.no-scrollbar` | Hides scrollbar cross-browser |

Core palette: page background `#0a0e1a`, card background `#0f1628`, input background `#131b2e`, muted text `#8892a4`, amber accent `amber-500`.

Heading style throughout: `font-black italic uppercase tracking-tight`. Button labels: `text-[11px] font-black uppercase italic tracking-widest`.

### Auth & Firebase

`firebase.ts` exports `app` and `auth`. Firebase Functions is initialized via `getFunctions(app)` — done at module level in both `App.tsx` and `AuthPage.tsx`.

`onAuthStateChanged` in `App.tsx` gates `authUser`: unverified email/password users get `null` (treated as signed out). Google accounts are always verified.

**Signup flow** (email/password): user selects type (fan/comedian/organizer) → enters credentials → `createUserWithEmailAndPassword` → `sendEmailVerification` → modal closes, amber banner appears → App.tsx polls `auth.currentUser.reload()` every 3s → on `emailVerified`, calls `handleUserSignup` Cloud Function → navigates to `dashboard:edit-profile`. The selected type is persisted to `sessionStorage` as `loc_pending_user_type` and cleared after the function call.

**Signup flow** (Google): type selection still required → `signInWithPopup` → `getUserProfile` Cloud Function to detect returning users → `handleUserSignup` if new.

### Cloud Functions (`functions/index.js`)

CommonJS, Node 20, deployed to Firebase project `league-of-comedy-user-auth`.

| Export | Auth required | What it does |
|---|---|---|
| `handleUserSignup` | Verified | Creates profile in Firestore (`users`, `comedians`, or `organizers` collection). For comedians, attempts to claim an existing unclaimed doc matching `comedian_email`. Returns `status`: `created`, `claimed`, or `already_exists`. |
| `getUserProfile` | Auth only | Looks up user across all three collections, returns `found`, `userType`, `docId`. |

Cloud Functions require the Firebase project to be on the **Blaze plan** to deploy. They are called from the frontend via `httpsCallable` — if not yet deployed, calls fail silently (caught and ignored) and routing still proceeds.

### Key Data Collections (Firestore)

- `users` — fans and organizers (doc ID = Firebase UID)
- `comedians` — comedian profiles (doc ID = UID for new; legacy docs use a separate ID with `uid` field)
- `organizers` — organizer-specific data (doc ID = UID), always written alongside a `users` doc

### `@` Path Alias

`vite.config.ts` maps `@/` → project root. Both `@/` and relative `../` imports work.
