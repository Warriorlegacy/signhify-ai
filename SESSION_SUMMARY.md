# Signhify AI — Pre-Launch QA Session Summary

**Date:** June 19, 2026
**Scope:** Comprehensive pre-launch testing, bug fixing, and E2E automation for the Signhify AI multi-agent workspace

---

## 1. Session Objective

Conduct a complete pre-launch test and analysis of the Signhify AI project to ensure every feature and function is fully operational before public launch on social media (X/Twitter, LinkedIn, Instagram). This included:

- Automated E2E testing using Python + Playwright with network interception
- Running all existing quality gates (typecheck, lint, build, unit tests)
- Fixing bugs discovered during testing
- Documenting results for launch readiness

---

## 2. Bugs Discovered & Fixed

### Bug 1: Empty `VITE_API_URL` in `.env.local`

**File:** `apps/web/.env.local`
**Root Cause:** `VITE_API_URL=""` — The `??` nullish coalescing operator in `api.ts` treats `""` as defined (not null/undefined), so all API calls went to bare paths like `/auth/register` instead of `/api/auth/register`. This broke the Vite proxy which only proxies `/api` to the backend.

**Fix:** Changed `VITE_API_URL=""` → `VITE_API_URL="/api"`.

### Bug 2: OnboardingGuard Auto-Transition

**File:** `apps/web/src/App.tsx`
**Root Cause:** `OnboardingGuard` reactively watched `hasKeys` from the Zustand store. When a user saved API keys during onboarding step 1, the guard immediately auto-transitioned to the Dashboard, unmounting the Onboarding component before the user could see "1 provider connected" or click through the remaining steps.

**Fix:** Changed `OnboardingGuard` to capture `hasKeys` via `useRef` on mount only (not reactive), and added `dismissed` state toggled by an `onComplete` callback. Keys saved during onboarding no longer cause auto-dismissal.

### Bug 3: SSE Stream Tokens Not Persisted to Thread

**File:** `apps/web/src/views/Chat.tsx`
**Root Cause:** The streamed assistant response (tokens) was only rendered inside `{isStreaming && (...)}`. When the SSE stream completed and `isStreaming` became `false`, the tokens disappeared from the DOM. The response was never saved to the thread's message array.

**Fix:** Added a `useEffect` in `Chat.tsx` that watches `isStreaming` — when streaming completes and tokens are present, the assistant response is appended to `activeThread.messages` via `setActiveThread`. This ensures the response persists after the stream ends.

---

## 3. Playwright Test Infrastructure Fixes

### Fix 1: Route Pattern Case-Insensitivity on Windows

**Problem:** On Windows, Playwright's `page.route()` glob matching is case-insensitive (via minimatch). Mock patterns like `**/schedule**` and `**/skills**` intercepted Vite module requests for `Schedule.tsx` and `Skills.tsx` — serving them as `application/json` instead of `text/javascript`. This broke the lazy-loaded Dashboard import.

**Fix:** Removed all non-`/api` prefix patterns. Only `/api/`-prefixed patterns are now used.

### Fix 2: Playwright 1.49+ Routing Priority

**Problem:** Playwright 1.49+ evaluates routes in reverse registration order — the last registered route has the highest priority. The catch-all `**/api/**` was registered last, giving it the highest priority. It intercepted `/api/threads` requests before the more specific `**/api/threads` pattern could match, returning `{}` instead of `[]`, causing `threads.map is not a function`.

**Fix:** Moved the catch-all `**/api/**` to be registered **first** (lowest priority), with all specific routes registered after (higher priority). This ensures specific routes match first.

---

## 4. Quality Gate Results

All quality gates pass cleanly:

| Gate                 | Command              |             Result              |
| :------------------- | :------------------- | :-----------------------------: |
| TypeScript Typecheck | `pnpm typecheck`     |        9/9 packages pass        |
| Linter               | `pnpm lint`          |              Clean              |
| Build                | `pnpm build`         | Full transitive build succeeds  |
| Unit Tests           | `pnpm test`          |  31 tests across 7 files pass   |
| E2E Tests            | `python test_e2e.py` | 19/19 tests pass — LAUNCH READY |

---

## 5. E2E Test Results

The automated Playwright test suite covers 10 categories:

|  #  | Test                      | Status  | Details                                                          |
| :-: | :------------------------ | :-----: | :--------------------------------------------------------------- |
|  1  | **Landing Page Load**     | ✅ PASS | Title loads, "START FOR FREE" CTA visible                        |
|  2  | **Registration Flow**     | ✅ PASS | Register → redirect → onboarding welcome step renders            |
|  3  | **Dashboard View**        | ✅ PASS | "Nexus Online" status + "Command Center" sidebar visible         |
|  4  | **Settings (BYOK)**       | ✅ PASS | Groq key saved, "Saved Securely" confirmation shown              |
|  5  | **SSE Chat Stream**       | ✅ PASS | `POST /api/agents/chat` SSE stream renders tokens in chat bubble |
|  6  | **Navigation & Views**    | ✅ PASS | Memory Vault, Skills, Scheduler all open without crash           |
|  7  | **Mobile Responsiveness** | ✅ PASS | 375x812 viewport renders landing and dashboard                   |
|  8  | **Route Protection**      | ✅ PASS | Unauthenticated `/app` access redirects to landing               |
|  9  | **Logout**                | ✅ PASS | Sign Out (title="Sign Out") clears session, redirects to landing |
| 10  | **3D Scene Detection**    | ✅ PASS | Soft check — headless SwiftShader skips GPU render (expected)    |

**19/19 tests passed — 0 failures.**

---

## 6. Key Architecture Details Learned

- **Auth flow:** `Auth.tsx` → `fetchApi("/auth/register", ...)` → `/api/auth/register` → mock returns JWT → `navigate("/app")`
- **Onboarding:** 5 steps (Welcome, Provider, Agents, Channels, Ready). Keys saved via `settingsStore.saveKeys()` → `KeyVault.save()` (XOR + base64 obfuscation in localStorage)
- **Dashboard:** Lazy-loaded with `React.lazy()`. `ThreadList` calls `useThreadStore().loadThreads()` → `GET /api/threads`. SSE chat via `useAgentStream()` → `POST /api/agents/chat`
- **Route protection:** `ProtectedRoute` checks `localStorage.getItem("signhify_token")` — redirects to `/` if missing

### Relevant Files

| File                                          | Purpose                                  |
| :-------------------------------------------- | :--------------------------------------- |
| `test_e2e.py`                                 | E2E test script (Playwright, 505 lines)  |
| `apps/web/.env.local`                         | VITE_API_URL="/api"                      |
| `apps/web/src/App.tsx`                        | Routes, ProtectedRoute, OnboardingGuard  |
| `apps/web/src/views/Chat.tsx`                 | ChatView with SSE stream persistence fix |
| `apps/web/src/views/Dashboard.tsx`            | Main dashboard layout                    |
| `apps/web/src/views/Onboarding.tsx`           | 5-step onboarding flow                   |
| `apps/web/src/views/Auth.tsx`                 | Registration/login form                  |
| `apps/web/src/stores/threadStore.ts`          | Threads Zustand store                    |
| `apps/web/src/stores/settingsStore.ts`        | Settings/keys store                      |
| `apps/web/src/hooks/useAgentStream.ts`        | SSE stream parser with retry logic       |
| `apps/web/src/components/chat/ThreadList.tsx` | Thread list (was error source)           |
| `apps/web/src/components/3d/Scene.tsx`        | WebGL scene with GPU detection           |
| `pre_launch_qa_framework.md`                  | QA framework with updated results        |

---

## 7. Screenshots

Test phase screenshots saved in `artifacts/`:

- `01-landing-page.png` — Landing page with CTA
- `02-onboarding-welcome.png` — Onboarding step 0 (Welcome)
- `02b-onboarding-key.png` — Onboarding step 1 (API key saved)
- `03-dashboard.png` — Dashboard with Nexus Online
- `04-settings-keys.png` — Settings (BYOK) page
- `05-chat-stream-verified.png` — SSE chat stream response
- `06-views.png` — Navigation views
- `07-mobile-landing.png` — Mobile landing (375x812)
- `07b-mobile-dashboard.png` — Mobile dashboard (375x812)
- `08-logout.png` — Logout redirect
