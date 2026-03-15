# Economic Monitoring Dashboard - Implementation Plan

**Tech Stack:** Vanilla JS (ES6 modules), Chart.js, static HTML/CSS, GitHub Pages
**Data Source:** FRED API (client-side fetching via CORS proxy)
**Design:** Bloomberg terminal aesthetic (dark theme)

---

## Current Status: Phase 1 Complete (with CORS issue)

- **Done:** HTML structure, CSS design system, fred.js API client, app.js orchestration, config.js
- **Blocked:** FRED API requires CORS proxy - need to deploy Cloudflare Worker (see `cloudflare-worker.js`)
- **Next:** Fix CORS proxy, then Phase 2 (regime classifier + charts)

---

## Architecture

```
[FRED API] → [CORS Proxy] → [fred.js] → [app.js] → [calculations.js] → [Panels]
                                             ↑                ↓
                                         [State]  ←───── [UI Updates]
```

---

## File Structure

```
/
├── index.html              # Single-page app
├── css/styles.css          # Full design system
├── js/
│   ├── app.js              # Event bus, state, init
│   ├── fred.js             # FRED API client (needs working CORS proxy)
│   ├── config.js           # Series IDs, thresholds, sectors
│   ├── calculations.js     # (Phase 2) Regime classifier
│   ├── charts.js           # (Phase 2) Chart.js sparklines
│   ├── sectors.js          # (Phase 5) Matrix signals
│   ├── settings.js         # (Phase 6) Manual entries
│   └── explainers.js       # (Phase 7) Tooltips
├── cloudflare-worker.js    # Deploy to Cloudflare Workers for CORS proxy
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation ✅ (CORS blocked)
- HTML structure, CSS, fred.js, app.js, config.js

### Phase 2: Regime Classifier + Panel 1
- `calculations.js`: Pearson correlation, regime classification
- `charts.js`: Sparkline factory, correlation chart
- Panel 1 rendering with live data

### Phase 3: Bottom Bar + Panel 2
- Persistent footer with key metrics
- Credit indicators (HY OAS, yield curve, deficit)

### Phase 4: Panel 5 - International
- Sovereign yield spreads, convergence chart, currencies

### Phase 5: Panel 3 - Sectoral Matrix
- Employment/wages/openings by sector, signal derivation

### Phase 6: Panel 4 + Settings
- CPI components, manual entry form

### Phase 7: Explainer System
- Tooltips (desktop), bottom-sheet (mobile), inline tabs

### Phase 8: Mobile Polish
- Responsive breakpoints, collapsed groups

### Phase 9: Testing
- Cross-browser, error scenarios, performance

---

## Regime Classifier Logic

```
1. Fetch 90 days DGS10 + DTWEXBGS
2. Compute daily changes
3. Rolling 60-day Pearson correlation
4. 20-day MA → yield direction
5. Classify:
   - Corr > +0.3, rising → Regime 1 (green)
   - Corr < -0.3, rising → Regime 2 (red/crisis)
   - Corr < -0.3, falling → Regime 3 (blue)
   - Corr > +0.3, falling → Regime 4 (yellow)
   - Else → Indeterminate
```

---

## Key FRED Series

| Indicator | ID | Freq |
|-----------|-----|------|
| 10Y Yield | DGS10 | Daily |
| Dollar Index | DTWEXBGS | Daily |
| HY OAS | BAMLH0A0HYM2 | Daily |
| Yield Curve | T10Y2Y | Daily |
| 5Y5Y Forward | T5YIFR | Daily |

Full list in `js/config.js`
