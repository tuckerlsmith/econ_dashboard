# American Antifragility Dashboard

## Project Overview
Economic monitoring dashboard tracking bond yields, currencies, credit conditions, sectoral employment, and CPI. Identifies macro regime shifts using yield-dollar correlation analysis. Bloomberg terminal aesthetic, fully mobile-responsive.

**Status:** IOC Complete (all 9 phases implemented)
**Live:** [tuckerlsmith.github.io/econ_dashboard](https://tuckerlsmith.github.io/econ_dashboard/)

## Tech Stack
- **Frontend:** Vanilla JS (ES6 modules), Chart.js 4.x
- **Data:** FRED API via Cloudflare Workers CORS proxy
- **Hosting:** GitHub Pages
- **Design:** Dark theme, JetBrains Mono (monospace) + IBM Plex Sans (body)

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single-page application structure |
| `css/styles.css` | Full design system (~1900 lines) |
| `js/app.js` | Main orchestrator: EventBus, AppState, panel rendering |
| `js/fred.js` | FRED API client with caching and rate limiting |
| `js/config.js` | FRED series IDs, thresholds, sector/country configs |
| `js/calculations.js` | Regime classifier algorithm (correlation, direction) |
| `js/charts.js` | Chart.js factory for sparklines and multi-series charts |
| `js/sectors.js` | Sectoral signal derivation (Cost Pathology, Skills Gap, etc.) |
| `js/settings.js` | Manual entry form and localStorage persistence |
| `js/explainers.js` | Tooltip content, Bond/Energy explainer tab rendering |
| `cloudflare-worker.js` | CORS proxy (deployed to Cloudflare Workers) |
| `CLEANUP.md` | Known issues and future enhancements |
| `TESTING_PLAN.md` | QA checklist for all features |

## Architecture

```
Browser (GitHub Pages)
    │
    ├── app.js (orchestrator)
    │   ├── EventBus (pub/sub)
    │   ├── AppState (data, regime, manualEntries, ui)
    │   └── Panel Renderers (1-5 + explainer tabs)
    │
    ├── fred.js ──► CORS Proxy ──► FRED API
    │   └── sessionStorage cache (1-hour TTL)
    │
    ├── calculations.js (regime classifier)
    ├── charts.js (Chart.js wrappers)
    ├── sectors.js (signal derivation)
    ├── settings.js (manual entries)
    └── explainers.js (tooltips + tab content)
```

## Data Flow

1. **Init:** `app.js` checks for API key → prompts if missing
2. **Fetch:** `fred.js` fetches all series (rate-limited, 10/chunk, 600ms delay)
3. **Cache:** Data stored in sessionStorage with timestamp
4. **Calculate:** `calculations.js` computes regime from yield/dollar correlation
5. **Render:** Each panel function pulls from `AppState.data` and renders
6. **Manual:** `settings.js` loads/saves to localStorage, updates AppState

## CORS Proxy

The FRED API doesn't support CORS. We use a Cloudflare Worker:
- **URL:** `https://fred-proxy.tuckerlsmith.workers.dev/?url=`
- **Source:** `cloudflare-worker.js` in repo root
- **Config:** `CORS_PROXY` constant in `js/fred.js` line ~8

If proxy goes down, redeploy from Cloudflare dashboard.

## Conventions

### Code Style
- **No build step** — pure ES6 modules, edit and refresh
- **No frameworks** — vanilla JS for simplicity and performance
- **Functional approach** — pure functions where possible, minimal classes

### State Management
- **AppState** in `app.js` — single source of truth
- **EventBus** — pub/sub for loose coupling between modules
- **getSeriesData(id)** — access function to get FRED data by series ID

### Storage
- **localStorage:** `fred_api_key`, `dashboard_manual_entries`
- **sessionStorage:** `fred_data_cache` (1-hour TTL)

### CSS
- **Variables in `:root`** — colors, spacing, radii, shadows
- **BEM-lite naming** — `.panel-header`, `.metric-card`, `.regime-badge`
- **Mobile breakpoints:** 1024px (tablet), 768px (mobile), 480px (small)

### Charts
- Use `createSparkline()` for inline mini-charts
- Use `createCorrelationChart()`, `createYieldDollarChart()`, `createConvergenceChart()` for larger charts
- Always destroy existing chart instance before recreating

## Panel Structure

| Panel | Location | Key Data |
|-------|----------|----------|
| 1 | Group A | Regime badge, 10Y yield, DXY, correlation, 5Y5Y forward |
| 2 | Group A | HY OAS, yield curve, deficit/GDP |
| 3 | Group B | Sectoral matrix (5 sectors × 5 columns + signal) |
| 4 | Group B | CPI components (shelter, medical, energy) with YoY% |
| 5 | Group C | Sovereign yields, spreads, FX rates, convergence chart |
| Tabs | Group C | Bond Explainer, Energy Explainer (collapsible sections) |

## Regime Classifier Logic

```javascript
// In calculations.js
1. Align yield (DGS10) and dollar (DTWEXBGS) daily data
2. Compute first differences (daily changes)
3. Calculate 60-day rolling Pearson correlation
4. Compute 20-day MA of yield changes for direction
5. Classify:
   - Corr > +0.3 && rising → Regime 1 (Healthy Tightening)
   - Corr < -0.3 && rising → Regime 2 (Crisis)
   - Corr < -0.3 && falling → Regime 3 (Flight to Safety)
   - Corr > +0.3 && falling → Regime 4 (Easing)
   - Else → Indeterminate
```

## Signal Derivation Logic

```javascript
// In sectors.js
- Supply Capacity: employment↑, openings↑, wages↑
- AI Displacement: employment↓, openings↓
- Skills Gap: openings↑, employment flat/↓
- Cost Pathology: employment↑, output flat/↓
- Earnings Concentration: output↑, employment↓
- Neutral: no clear pattern
```

## Adding New Features

### New FRED Series
1. Add to `SERIES_CONFIG` in `config.js` with `{ limit, frequency }`
2. Access via `getSeriesData('SERIES_ID')` in render functions
3. Use `getLatestValue()`, `getChange()`, `getSparklineData()` helpers

### New Panel/Card
1. Add HTML structure in `index.html`
2. Create render function in `app.js` (e.g., `renderPanelX()`)
3. Call from `renderAllPanels()`
4. Add styles to `css/styles.css`

### New Explainer
1. Add entry to `EXPLAINERS` object in `explainers.js`
2. Add `data-explainer="key"` to info icon in HTML
3. Content supports HTML (`<strong>`, `<em>`, `<ul>`)

### New Manual Entry
1. Add to `MANUAL_ENTRIES` array in `config.js`
2. Settings form auto-generates from this config
3. Access via `getManualEntry('key')` in render functions

## Known Issues (CLEANUP.md)

- Bottom bar HY OAS threshold coloring not applying
- Regime duration tracking not implemented
- No sparkline hover context (value + date)
- Missing JOLTS data for Information sector
- Missing output data for most sectors (not on FRED)

## Testing

Run smoke test after changes:
1. Page loads without console errors
2. Data values appear (not "--")
3. Regime badge shows
4. Charts render
5. Bottom bar has values
6. Mobile layout works

See `TESTING_PLAN.md` for full checklist.

## Local Development

```bash
# Start local server (required for ES6 modules)
npx http-server -p 8000

# Clear cache for fresh data
# In browser console:
sessionStorage.clear(); location.reload();

# Reset API key
localStorage.removeItem('fred_api_key'); location.reload();
```

## Deployment

Push to `main` branch → GitHub Pages auto-deploys. No build step needed.

## Future Enhancement Ideas

From CLEANUP.md and requirements doc:
- Regime duration tracking with alert styling (amber >5 days, red >30 days)
- Sparkline tooltips showing value and date on hover
- Split Education & Health into separate sectors
- Convert weekly wage to annual wage
- Add productivity column to sectoral matrix
- Consistent currency pair conventions (USD always numerator or denominator)
- Historical regime tracking and charting
