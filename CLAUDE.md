# American Antifragility Dashboard

## Project Overview
Economic monitoring dashboard tracking bond yields, currencies, credit conditions, sectoral employment, and CPI. Bloomberg terminal aesthetic, mobile-responsive.

## Tech Stack
- **Frontend:** Vanilla JS (ES6 modules), Chart.js
- **Data:** FRED API (requires CORS proxy for browser requests)
- **Hosting:** GitHub Pages at `tuckerlsmith.github.io/econ_dashboard`
- **Design:** Dark theme, JetBrains Mono + IBM Plex Sans fonts

## Current Status
**Phase 1 complete, blocked on CORS proxy**

The FRED API doesn't send CORS headers. Free proxies (corsproxy.io, allorigins.win) don't work reliably. Solution: Deploy `cloudflare-worker.js` to Cloudflare Workers (free), then update `CORS_PROXY` in `js/fred.js`.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main SPA structure |
| `css/styles.css` | Full design system (~800 lines) |
| `js/app.js` | Event bus, state management, init |
| `js/fred.js` | FRED API client with caching |
| `js/config.js` | All FRED series IDs, thresholds |
| `cloudflare-worker.js` | CORS proxy to deploy |
| `IMPLEMENTATION_PLAN.md` | Full 9-phase roadmap |
| `Dashboard_Requirements_IOC_v2.md` | Original requirements spec |

## Architecture

```
User → GitHub Pages → app.js → fred.js → CORS Proxy → FRED API
                         ↓
                   calculations.js → Panel Renderers
```

- **EventBus:** Pub/sub in app.js for module communication
- **AppState:** Global state object (data, regime, manualEntries, ui)
- **Caching:** sessionStorage with 1-hour TTL

## CORS Proxy Setup (BLOCKING ISSUE)

1. Go to `dash.cloudflare.com` → Workers & Pages → Create
2. Paste code from `cloudflare-worker.js`
3. Deploy, copy URL
4. Update `js/fred.js` line ~8:
   ```javascript
   const CORS_PROXY = 'https://YOUR-WORKER.workers.dev/?url=';
   ```
5. Commit and push

## Conventions

- **No build step** - ES6 modules loaded directly
- **localStorage:** API key (`fred_api_key`), manual entries
- **sessionStorage:** FRED data cache
- **CSS variables:** All colors/spacing in `:root`
- **Mobile-first collapsing:** Groups B+C collapsed on mobile

## Commands

```bash
# Local development (need server for ES6 modules)
npx http-server -p 8000

# Or use VS Code Live Server extension
```

## Next Steps

1. **Fix CORS:** Deploy Cloudflare Worker
2. **Phase 2:** Implement regime classifier in `calculations.js`
3. **Phase 2:** Create sparkline factory in `charts.js`
4. **Phase 2:** Wire up Panel 1 with live data and charts
