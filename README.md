# niehewang.github.io

Personal academic homepage for Hewang Nie. The public website itself remains a static GitHub Pages site; optional live research features use a small Cloudflare Worker and browser-side Google Drive OAuth.

## 2026-09 Refresh

- Reworked the visual system into a cleaner academic/editorial homepage.
- Added FakeMark (2026), NSFC Regional Science Fund 62661008, and NSFC Review Expert service.
- Added Google Scholar synchronization: one click updates citation counts and surfaces Scholar entries not yet present in the static publication list.
- Replaced the old generic workbench with **Research Radar**, a literature-first workflow designed around discovery, Drive deduplication, multi-paper archiving, and idea capture.
- Research Radar scans the most recent year of IEEE Transactions, CCF A venues, and arXiv, with three relevance lanes: core, adjacent security, and cross-domain inspiration.
- Added Focused / Balanced / Explore controls so discovery can be broader without becoming noisy.
- Added Google Drive `/paper` deduplication using identifiers, filename similarity, and indexed PDF full-text tokens.
- Added multi-select archiving of legally available open PDFs directly to Google Drive.

## Pages

- `index.html` — bilingual academic homepage, publication filters/BibTeX tools, and Google Scholar sync.
- `research-workbench.html` — Research Radar: discover → Drive dedupe → select → archive → capture inspiration.
- `ccf-2026.html` — CCF seventh-edition journal/conference lookup tool.
- `404.html` — GitHub Pages fallback.

## Important files

- `assets/research-config.js` — public integration config (Worker URL + Google OAuth Web Client ID only).
- `backend/research-worker/worker.js` — Cloudflare Worker for Scholar, OpenAlex/arXiv aggregation, and safe OA-PDF resolution.
- `RESEARCH_RADAR_SETUP.md` — one-time deployment/configuration instructions.

## Local preview

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`.

Google Drive OAuth only works from origins registered in the Google OAuth client. Add both the production GitHub Pages origin and your local origin when testing.

## Security / privacy

Never commit SerpAPI keys, Google OAuth client secrets, Google access tokens, unpublished research data, or review-confidential content.

- `SERPAPI_KEY` and `SCHOLAR_AUTHOR_ID` are Cloudflare Worker secrets/environment variables.
- The Google OAuth **Client ID** is public by design and may be committed.
- Google Drive Access Tokens remain only in the active browser tab's memory and are never stored in localStorage or sent to the Worker.
- The Worker can resolve only arXiv/OpenAlex paper identifiers to open-access PDFs; it is not an arbitrary URL proxy and does not bypass publisher paywalls.
