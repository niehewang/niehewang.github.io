# 2026-09 Homepage Refresh

## Homepage

- Reworked the visual language from a generic card/dashboard style to a restrained academic/editorial layout.
- Improved responsive behavior, spacing, typography, portrait treatment, navigation, projects, services, and publication cards.
- Preserved bilingual Chinese/English switching and dark mode.
- Added ORCID and DBLP identity shortcuts.

## Academic Content

- Added: *FakeMark: Gradient-Guided False Watermark Claims via Robust Feature Fusion*, Cybersecurity, 2026, DOI: 10.1186/s42400-026-00654-8.
- Added NSFC Regional Science Fund project 62661008 as Participant.
- Added National Natural Science Foundation of China (NSFC) Review Expert to Academic Service.
- Publication count updated to 21+ and FakeMark receives the same DOI/BibTeX workflow as existing publications.

## Research Workbench

The old generic personal workspace was replaced with a research-oriented local cockpit containing:

1. Today dashboard: paper / experiment / deadline / reading metrics and action aggregation.
2. Paper pipeline: target venue, stage, round, deadline, next action, notes.
3. Experiment ledger: project/run, status, seed, machine/GPU, exact command, result/log path, notes.
4. Grant/project milestones: role, project code, deadline, next milestone, expected output.
5. Literature radar: DOI/URL, topic, reading state, one-line takeaway, impact on current work.
6. Review/meeting tracker: type, venue, due date, state, next action, notes.
7. Research delivery packages: reusable experiment-return and camera-ready checklists.
8. Weekly review: finished outputs, evidence, blockers, and next Top 3.
9. Quick academic links: Scholar, DBLP, ORCID, NSFC ISIS, Overleaf, GitHub, Semantic Scholar, OpenReview, Crossref.

All personal workbench content is stored locally in the browser and can be backed up/restored as JSON.

## Deployment

This remains a plain static GitHub Pages project. Replace the repository contents with this folder (or copy the changed files), commit, and push. No build command is needed.

## 2026-09-23 — Research Radar v3

- Replaced the generic research cockpit with a literature-first Research Radar.
- Added three discovery lanes: core relevance, adjacent security, and cross-domain inspiration.
- Added Focused / Balanced / Explore breadth controls.
- Added one-year discovery from IEEE Transactions, CCF A venues, and arXiv.
- Added Google Drive `/paper` deduplication (identifier → filename → indexed full-text tokens).
- Added multi-select upload of open-access PDFs directly to Google Drive using browser-only Google OAuth tokens.
- Added an Inspiration Basket with Markdown export.
- Added homepage Google Scholar sync, citation-count badges, and dynamically surfaced new Scholar entries.
- Added Cloudflare Worker backend for Scholar, discovery aggregation, and safe OA-PDF resolution.
- Added `RESEARCH_RADAR_SETUP.md` with one-time deployment instructions.
