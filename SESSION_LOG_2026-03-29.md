# Axiom OS — Session Log (2026-03-29)
## Session ID: session_017i7r2SvSh2PS23o6fhE16V
## Repo: Axiom-by-juniper-rose/axiom-os
## Branch: claude/setup-code-review-ES0IE

---

## 1. CODE REVIEW (PR #2)

### Issues Found & Fixed

| # | Severity | Issue | File(s) | Fix |
|---|----------|-------|---------|-----|
| 1 | P0 | JWT fallback is static hardcoded string — forgeable tokens if env unset | `backend/axiom_engine/auth.py` | Crash in prod/staging if `JWT_SECRET` unset; random per-process fallback in dev only |
| 2 | P0 | Stripe webhook bypasses sig check when secret is empty | `backend/app.py` | Require explicit `DEV_MODE=true` env var to bypass |
| 3 | P1 | All deps unpinned (`>=`) — non-reproducible builds | `backend/requirements.txt` | Pinned all 19 deps with `==` |
| 4 | P1 | `starlette` listed explicitly (transitive of fastapi) | `backend/requirements.txt` | Removed |
| 5 | P2 | `str(e)` leaked in 4 JSON error responses | `backend/app.py` | Replaced with opaque error codes; internal details logged server-side |
| 6 | P2 | Dead `contexts/` dir + unused `useProjectState.js` | `frontend/src/contexts/`, `frontend/src/hooks/useProjectState.js` | Deleted (0 live imports confirmed) |

### What Was Already Good
- CORS properly scoped (whitelist, not `*`)
- Debug prints already replaced with `logging`
- bcrypt migration from passlib was clean
- Rate limiting via slowapi in place
- Supabase anon key reads from env var (not hardcoded in `lib/supabase.ts`)

### Commit
```
6b753f1 fix(security): harden auth, webhooks, deps, and error responses
```
Merged to main via PR #2 (squash merge → `720cc4c`).

---

## 2. WHITE SCREEN INVESTIGATION

### Symptoms
- `buildaxiom.dev` shows blank white page
- HTML loads (200 OK), CSS loads, JS bundle loads
- React never mounts — no error boundary visible

### Root Cause: Stale Service Worker
**File:** `frontend/public/service-worker.js`

The old SW cached `/` and `/index.html` with a **cache-first** strategy:
```js
// OLD — broken
caches.match(event.request).then((response) => {
    return response || fetch(event.request); // serves stale cache FOREVER
});
```
- Cache name `axiom-v3-cache-v1` never changes
- No `activate` handler to clear old caches
- No `skipWaiting` — new SW versions wait indefinitely
- Result: once installed, every deployment was invisible to returning users

### Red Herring: Trailing Space in Env Var
`VITE_SUPABASE_URL` in Vercel had a trailing space (`"https://...supabase.co "`). This was fixed (added `.trim()` to both supabase client files) but was NOT the root cause of the white screen — the stale SW was serving old HTML that predated the space issue.

### Fix (PR #3 — merged)

**1. Rewrote service worker** (`frontend/public/service-worker.js`):
- Network-first for HTML (deployments take effect immediately)
- Cache-first only for `/assets/*` (hashed, immutable)
- `skipWaiting()` + `clients.claim()` for instant activation
- `activate` handler deletes all old caches

**2. Inline cache purge** (`frontend/index.html`):
```html
<script>
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        if (name !== 'axiom-v4') caches.delete(name);
      });
    });
  }
</script>
```

**3. Unregister SW** (`frontend/src/main.tsx`):
```ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.unregister();
  });
}
```

### Commits
```
fbb7bce fix: trim VITE_SUPABASE_URL to prevent white screen from trailing space
66dbd43 fix: rewrite service worker — network-first HTML to prevent stale cache
e3363a3 fix: nuke stale service worker — unregister on load + purge old caches
```
Merged via PR #3 (squash merge → `edfab12`).

---

## 3. RAILWAY BUILD FIX

### Problem
Pinned dependency versions had conflicts:
1. `fastapi==0.135.2` requires `pydantic>=2.9.0` — we pinned `2.8.2`
2. `supabase==2.4.0` requires `httpx<0.26` — we pinned `0.27.0`

### Fix
```
pydantic==2.8.2 → 2.10.6  (PR #4 → ecef48c)
httpx==0.27.0   → 0.25.2  (PR #5 → 352c9c4)
```
Both merged to main. Railway build succeeds. Backend running on port 8008.

---

## 4. LOCAL DEV SETUP

Created `frontend/.env` (not committed — gitignored):
```
VITE_SUPABASE_URL=https://ubdhpacoqmlxudcvhyuu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_BACKEND_URL=http://localhost:8008
```
Note: dev server runs in cloud sandbox — `localhost:5173` not reachable from user's browser. Must use Vercel deployment.

---

## 5. ECOSYSTEM CONTEXT (for next session)

### Architecture Discovery
- **This repo (axiom-os):** React+Vite+TS frontend, FastAPI+Python backend, Supabase DB. CRE development platform with 30+ modules.
- **lifeos-dashboard (separate repo):** Next.js app, "Life OS Command Center" — 12 routes (Command Center, Calendar, Goals, Projects, Ideas, etc.). Repo: `Axiom-by-juniper-rose/lifeos-dashboard` (private).
- **agent-revenue-os:** Another Vercel project, no details available.

### Vercel Projects (team: juniper-rose)
| Project | ID | Framework |
|---------|----|-----------|
| axiom-os | prj_iG9B2oTm4BbrQLqwGkf2I9apEXYJ | Vite |
| lifeos-dashboard | prj_z0wRJbjk8Wp0NoQ2PEBVzBpWGro1 | Next.js |
| agent-revenue-os | prj_j2qdLyRBzQRle5tHxcKuofaeUGWv | unknown |
| landing | prj_NlDhPlBGr3kMFMkastU47eQXV6mR | unknown |
| axiom | prj_q7SnoIxmNAxZDOLK1SDaNh0tmUGw | unknown |
| frontend | prj_JH3oxjUN2gtjZf0MdLxXI28vBkBI | unknown |

### Pending User Request
User wants to:
1. Add color scheme customization, font picker, light/dark mode to Life OS
2. Build "HOJ OS" and "Lumena" portions (undefined — not found anywhere)
3. Add Axiom and "ARO" as sub-apps within Life OS (ARO undefined)
4. Full backend capability for all systems
5. Control entire ecosystem from Life OS

**Blocker:** This session is scoped to `axiom-os` repo only. `lifeos-dashboard` repo access denied. HOJ OS, Lumena, and ARO are not defined in any accessible file. **User needs to start a new session scoped to `lifeos-dashboard`** to continue this work.

---

## 6. THEMING INFRASTRUCTURE (axiom-os — for reference)

### Current State
- **CSS Variables:** Defined in `frontend/src/v1/components/ui/theme.css` (`:root` with `--c-*` vars)
- **Light mode:** `body.light-mode` selector exists in theme.css with inverted palette
- **Toggle:** Sun/moon emoji in TopNav.tsx — no persistence (resets on reload), no context provider
- **Constants:** `frontend/src/jsx/constants.js` exports `C` (color refs), `S` (inline style factories)
- **Fonts loaded:** Only Inter via Google Fonts. Brand fonts (Syne, DM Mono, Instrument Sans) referenced in V5 code but NOT loaded.
- **Tailwind:** Configured but unused (empty `extend`). All styling via CSS vars + custom `.axiom-*` utility classes + inline styles.
- **No ThemeContext/ThemeProvider** — no design token system, no persistence.

### Brand Spec (from CLAUDE.md)
- BG: `#07070e` | Surface: `#0d0d1a` | Gold: `#e8b84b`
- Fonts: Syne 800, DM Mono, Instrument Sans

---

## 7. KEY FILES REFERENCE

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/main.tsx` | React root mount, SW unregister |
| `frontend/src/App.tsx` | Domain routing (app vs marketing), module loading |
| `frontend/src/jsx/AxiomApp.jsx` | Modular app shell, lazy loading, SECTIONS registry |
| `frontend/src/jsx/constants.js` | NAV array, color/style constants (C, S, RC, PP) |
| `frontend/src/v1/components/ui/theme.css` | CSS variables, light mode, utility classes |
| `frontend/src/context/AuthContext.tsx` | Supabase auth provider |
| `frontend/src/lib/supabase.ts` | SDK client (throws if env vars missing) |
| `frontend/src/lib/supabaseClient.ts` | SDK client (hardcoded fallbacks) |
| `frontend/public/service-worker.js` | Network-first SW (rewritten this session) |
| `frontend/index.html` | Entry HTML with inline cache purge script |

### Backend
| File | Purpose |
|------|---------|
| `backend/app.py` | FastAPI bootstrap, CORS, rate limiting, router inclusion |
| `backend/axiom_engine/auth.py` | JWT + bcrypt auth (hardened this session) |
| `backend/requirements.txt` | Pinned deps (pydantic 2.10.6, httpx 0.25.2) |
| `backend/axiom_engine/agents/orchestrator.py` | 8-agent LLM pipeline |

### Adding New Modules (pattern)
1. Add to `NAV` array in `constants.js`: `{ id: "mymod", label: "My Module", group: "GroupName" }`
2. Create component in `frontend/src/jsx/components/Modules/MyModule.jsx`
3. Lazy-load in `AxiomApp.jsx`: `const MyModule = lazy(() => import('./components/Modules/MyModule'))`
4. Register in `SECTIONS`: `mymod: MyModule`
5. (Optional) Backend router: create `backend/routers/mymod.py`, include in `app.py`

---

## PRs Created This Session
| PR | Title | Status | Merge SHA |
|----|-------|--------|-----------|
| #2 | Remove Phase 4 frontend auth/state and harden backend security | Merged | `720cc4c` |
| #3 | fix: nuke stale service worker + trim supabase env vars | Merged | `edfab12` |
| #4 | fix(deps): bump pydantic for fastapi compat | Merged | `ecef48c` |
| #5 | fix(deps): downgrade httpx for supabase compat | Merged | `352c9c4` |
