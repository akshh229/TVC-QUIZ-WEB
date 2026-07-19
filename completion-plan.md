# Spin to Lead — Completion Plan

## Objective

Turn the implemented kiosk app into a release-ready, verifiable project without exercising destructive operations against the live event database during routine UI tests.

## Completion status

Completed:

- Participant and admin screens, mock mode, schema, seed data, and live Supabase connection.
- Repository safeguards, Playwright configuration, eight end-to-end tests, favicon, Vercel SPA configuration, and event-day documentation.
- Eight locally bundled, attributed Guess the Leader portraits; the mock data, seed data, and live Supabase records all use the same paths.
- Production build and the full Playwright suite pass.

Remaining release action:

- Import the repository in Vercel, add the three documented `VITE_*` environment variables, and deploy. This needs the project owner's Vercel authentication; no authenticated Vercel tool is available in this session.

## Implementation sequence

1. Add repository safeguards.
   - Add `.gitignore` for environment files (while retaining `.env.example`), dependencies, builds, Playwright output, and local visual artifacts.
   - Remove only generated/secrets files from Git's index while preserving their local copies. Do not rewrite history automatically; rotate any exposed credentials before sharing the repository.

2. Add the automated acceptance harness.
   - Add `@playwright/test`, `playwright.config.ts`, and `test:e2e` scripts.
   - Start Vite with Supabase variables blank so ordinary E2E runs use deterministic in-memory mock data and never alter the event database.
   - Capture traces/screenshots only on failure and run desktop kiosk plus a compact viewport smoke project.

3. Cover the participant experience.
   - Test required-name validation, details submission, spin, each of the four challenge renderers, answer submission, both result states, finish/restart, and guard redirects.
   - Make the wheel deterministic in tests through an init script and use reduced-motion emulation to avoid waiting for the production animation.

4. Cover the admin experience in mock mode.
   - Test auth failure/success, dashboard, question search/filter/create/duplicate/toggle/delete, participant log/leaderboard/CSV, and media upload/preview/delete.
   - Keep live Supabase operations out of the regular suite. A separate manual smoke procedure verifies one submitted participant is readable in the admin log, then the record is cleaned up.

5. Resolve browser polish and document the handoff.
   - Add a local SVG favicon to remove the current 404.
   - Update the README with test commands, mock-versus-live behaviour, event-day smoke checks, and the pending real QR/logo/portrait assets.

6. Verify and fix only defects exposed by the suite.
   - Run type checking, production build, the full E2E suite, and a browser console pass.
   - Preserve the existing client-side kiosk-admin trust model as documented. Moving writes behind authenticated Supabase roles is a deliberate security redesign and needs a separate product decision.

## Planned files

- `.gitignore`
- `package.json`, `package-lock.json`
- `playwright.config.ts`
- `tests/e2e/participant.spec.ts`, `tests/e2e/admin.spec.ts`, `tests/e2e/live-smoke.md`
- `public/favicon.svg`, `index.html`, `README.md`

## Completion criteria

- Build and typecheck pass.
- The Playwright suite passes against mock mode without requiring or mutating live credentials/data.
- A separate documented live smoke check confirms question read, participant write/readback, and storage access before the event.
- The repository no longer tracks `.env`, dependencies, builds, or temporary browser artifacts; local files remain intact.
