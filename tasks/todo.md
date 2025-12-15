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
