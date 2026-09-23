# v5.1.1 Hotfix — 2026-09-23

- 修复论文扫描时 `Spread syntax requires ...iterable[Symbol.iterator] to be a function`。
- OpenAlex / arXiv / Drive 的列表型返回全部改为防御式数组转换；单个 API 返回异常结构时跳过该批次，不再导致整个扫描失败。
- 对旧版 localStorage 状态做数组归一化，避免历史缓存结构影响新版。
- 工作台脚本增加 `?v=5.1.1` 缓存破坏参数，覆盖 GitHub 后可强制浏览器加载新 JS。
- 保留 v5 的密码门禁、预置 Google OAuth Client ID、ACM Transactions、扩大检索主题与 Drive 去重。

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

## Research Radar v5 — 2026-09-23

- Added a client-side password gate for `research-workbench.html` with session-only unlock and manual relock.
- Preconfigured the Google OAuth Web Client ID for the production GitHub Pages origin.
- Added all ACM Transactions journals as an independent Radar source family, in addition to IEEE Transactions, CCF A, and arXiv.
- Greatly broadened discovery topics across ML/LLM/generative-model security, privacy, poisoning/backdoors, model extraction, forensics, provenance, trustworthy AI, federated-learning security, and transferable methods from cryptography, statistics, information theory, OOD/anomaly detection, representation learning, causality, influence functions, and data valuation.
- Increased OpenAlex/arXiv retrieval volume and Balanced/Explore quotas while batching OpenAlex calls to reduce burst rate-limit risk.
- Versioned Radar preferences to ensure the broader v5 defaults are used instead of stale v4 keyword settings.
