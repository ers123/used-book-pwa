# TODO

- [x] Summarize key requirements from PRD.md for quick reference.
- [x] List open questions/assumptions needing clarification.
- [x] Propose lightweight implementation plan for MVP (frontend + backend).
- [x] Confirm next actions with user before making any code changes.

### Key requirements (from PRD)
- MVP: scan or enter ISBN; fetch Aladin + YES24 buyback availability/price; deterministic recommendation; local list with filters/sorting/stats.
- API: `/api/quote?isbn=...` scrapes both sites, validates ISBN, caches responses, returns partial data with errors.
- Frontend: PWA with home/scan, result display, list view; minimal service worker + manifest; iOS installable.
- Storage: local-only (LocalStorage/IndexedDB), re-lookups update entries; show totals for Aladin vs YES24.

### Open questions / assumptions
- Use React (per structure) vs Svelte? Proceeding with React + Vite unless directed otherwise.
- Prefer service worker under `src/service-worker.ts` or simple static `public/sw.js`?
- Barcode lib choice: `zxing-js` vs `QuaggaJS`; default to zxing unless you prefer otherwise.
- Caching strategy for API: in-memory vs KV (Cloudflare) — assume basic in-memory first.
- Any need for offline-ready UI beyond static asset caching (e.g., queue lookups when offline)?

### Lightweight implementation plan
- Frontend skeleton (done): Vite React scaffold with `main.tsx`, `App.tsx`, pages/components placeholders, manifest.
- Wire ISBN input + scanner component; call `/api/quote`; render result card; allow “Add to list”.
- Local storage helpers to save/update quotes; List page to show table/cards with filters/sorting + totals.
- Add minimal service worker + PWA polish (icons/manifest fill-in); ensure iOS meta tags.
- Backend: implement `/api/quote` serverless function with ISBN validation, scrape Aladin/YES24 via cheerio, simple cache, and recommendation logic.

## Review
- Created project folder structure and placeholder files for public assets, React app shell, library stubs, and `/api/quote` stub.
- Summarized PRD requirements, captured open questions, and noted next implementation steps.

## Next tasks
- [x] Install core dependencies (React, Vite, types, barcode lib, cheerio/fetch).
- [x] Add simple navigation toggle between Scan and List views.
- [x] Implement Scan flow: manual ISBN input, call `/api/quote`, show result card, add-to-list using storage.
- [x] Implement List view: render stored quotes with filters/sorting and totals.
- [ ] Add PWA polish: service worker, icons, ensure manifest wired.
- [ ] Implement real barcode scanning with `zxing-js` (replace placeholder).
- [ ] Implement `/api/quote` scraping + caching (Aladin + YES24) and align response types.

## Design / UX improvements (proposal)
- [ ] Add neobrutalist theme via a single global CSS file (colors, borders, type, spacing).
- [ ] Make it one page: scan/input + result + saved list (no routing).
- [ ] Replace inline styles with CSS classes for consistency and easier tweaking.
- [ ] Make list + result UI “finished”: consistent card/table styling, spacing, and empty/error states.
- [ ] Make `dev-mock-api` plugin run only in dev (so production builds aren’t affected).

## Plan (confirm before I implement)
- [x] Restrict the `dev-mock-api` middleware to dev only (`vite dev`) and leave production builds clean.
- [x] Add a single global neobrutalist stylesheet (`src/styles.css`) and import it in `src/main.tsx`.
- [x] Refactor `src/App.tsx` into a one-page layout: header (utilitarian copy) + scan/input section + result card + saved list section.
- [x] Replace remaining inline styles across pages/components with CSS classes (keep markup minimal).
- [x] Tighten copy for fast “shelf-clearing mode” scanning and clarity of recommendation.
- [x] Quick sanity check: run `npm run dev` and verify basic flows still work.

## Review (updates)
- Added a minimal in-app navigation toggle (no router) in `src/App.tsx`.
- Implemented the manual ISBN lookup + save flow in `src/pages/ScanPage.tsx` (scanner still placeholder).
- Implemented list rendering with filter/sort + totals in `src/pages/ListPage.tsx`.
- Added minimal `index.html`, `tsconfig.json`, and `src/vite-env.d.ts` so the Vite app can run cleanly.
- Added a dev-only mock `/api/quote` handler in `vite.config.ts` so lookups work during local development.
- Switched to a one-page layout with a neobrutalist theme and improved copy.
- Fixed “Saved list doesn’t refresh after saving” by dispatching a `book-quotes-updated` event from `saveQuote()`.
