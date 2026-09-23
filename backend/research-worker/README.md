# NHW Research Radar Worker

Cloudflare Worker used by the static GitHub Pages site.

Endpoints:

- `GET /health` — health check.
- `GET /scholar` — fixed-author Google Scholar profile via SerpAPI, cached for six hours.
- `POST /discover` — OpenAlex + arXiv discovery, constrained to IEEE Transactions / CCF A / arXiv.
- `GET /pdf?id=...` — resolves only arXiv IDs or OpenAlex Work IDs to open-access PDF bytes; it is not an arbitrary URL proxy.

Secrets:

```bash
wrangler secret put SERPAPI_KEY
wrangler secret put SCHOLAR_AUTHOR_ID
```

See `../../RESEARCH_RADAR_SETUP.md` for full setup.
