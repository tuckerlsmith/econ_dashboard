# American Antifragility Dashboard

A Bloomberg-terminal-style monitoring dashboard for economic and financial indicators. Tracks bond yields, currencies, credit conditions, sectoral employment, and consumer prices to identify macro regime shifts.

**Live Dashboard:** [tuckerlsmith.github.io/econ_dashboard](https://tuckerlsmith.github.io/econ_dashboard/)

---

## Quick Start

### 1. Get a FRED API Key (Free)
- Visit [fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html)
- Click "Request API Key" (requires free FRED account)
- Copy your 32-character API key

### 2. Open the Dashboard
- **Online:** Visit the GitHub Pages URL above
- **Local:** Clone repo and open `index.html` (requires local server for ES6 modules)

### 3. Enter Your API Key
- The dashboard prompts for your key on first visit
- Key is stored in your browser's localStorage (never sent anywhere except FRED)
- To reset: Settings (gear icon) → "Clear API Key & Reload"

---

## Features

### Panel 1: Dollar Regime Diagnostic
Identifies four market regimes based on 60-day yield-dollar correlation:
- **Regime 1 (Green):** Yields up, dollar up — healthy tightening
- **Regime 2 (Red):** Yields up, dollar down — fiscal/credibility crisis
- **Regime 3 (Blue):** Yields down, dollar up — flight to safety
- **Regime 4 (Yellow):** Yields down, dollar down — easing/stimulus

Displays: US 10Y yield, Dollar Index (DXY), rolling correlation chart, 5Y5Y forward inflation

### Panel 2: Domestic Credit & Credibility
- **HY OAS:** High-yield credit spread (300-400 normal, 500+ stress, 800+ crisis)
- **Yield Curve:** 10Y-2Y spread with inversion highlighting
- **Deficit/GDP:** Trailing 12-month federal deficit ratio

### Panel 3: Sectoral Comparison Matrix
Compares five sectors across employment, wages, openings, and output with signal derivation:
- **Cost Pathology:** Employment up, output flat
- **Skills Gap:** Openings up, employment down
- **AI Displacement:** Employment and openings both down
- **Supply Capacity:** All metrics rising (healthy)

Sectors: Education & Health, Professional Services, Information, Manufacturing, Construction

### Panel 4: Domestic Expenses
CPI components with YoY% and 24-month sparklines:
- Shelter (largest CPI weight, sticky)
- Medical Care (structurally rising)
- Energy (most volatile)

### Panel 5: International Comparison
- **Sovereign 10Y Yields:** US, Germany, France, UK, Japan, South Korea (China via link)
- **Key Spreads:** US-Bund, Bund-OAT, US-JGB
- **Exchange Rates:** EUR/USD, GBP/USD, USD/JPY, USD/CNY, USD/KRW with daily/monthly changes
- **Convergence Chart:** 12-month yield trends across countries

### Explainer Tabs
- **Bond Explainer:** How to read yields, spreads, sovereign CDS, country context
- **Energy Explainer:** Oil benchmarks (WTI/Brent), natural gas regionalization

### Bottom Bar
Persistent footer showing: Regime badge, 10Y yield, DXY, HY OAS (with threshold coloring)

---

## Settings & Manual Entry

Click the gear icon to enter data not available via FRED API:
- NY Fed ACM 10Y Term Premium
- Dollar Reserve Share (IMF COFER)
- Dollar Invoicing Share
- NAFTA/China Import Shares
- RMB SWIFT Share

These values display in Panel 1 and the Bond Explainer's "Structural Baseline Data" section.

---

## Keyboard Shortcuts

- **Escape:** Close any open tooltip or modal

---

## Mobile Support

- Responsive layout for tablet (1024px) and mobile (768px)
- Groups B & C collapsed by default on mobile
- Horizontal scrolling tables with sticky first column
- Swipe down to dismiss explainer bottom sheets
- 44px touch targets throughout

---

## Investing.com Watchlists

For daily-resolution data not available through FRED, create these watchlists at [investing.com](https://www.investing.com/):

### Watchlist 1: Sovereign Bonds
| Instrument | Investing.com Path |
|------------|-------------------|
| US 10Y | Bonds → Government → United States → US 10Y |
| Germany 10Y | Bonds → Government → Germany → Germany 10Y |
| France 10Y | Bonds → Government → France → France 10Y |
| UK 10Y | Bonds → Government → United Kingdom → UK 10Y |
| Japan 10Y | Bonds → Government → Japan → Japan 10Y |
| South Korea 10Y | Bonds → Government → South Korea → South Korea 10Y |
| China 10Y | Bonds → Government → China → China 10Y |

### Watchlist 2: Energy Markets
| Instrument | Investing.com Path |
|------------|-------------------|
| WTI Crude | Commodities → Energy → Crude Oil WTI |
| Brent Crude | Commodities → Energy → Brent Oil |
| Henry Hub Natural Gas | Commodities → Energy → Natural Gas |
| Dutch TTF Gas | Commodities → Energy → Dutch TTF Gas |

### Watchlist 3: Sovereign CDS (Optional)
| Instrument | Path |
|------------|------|
| US 5Y CDS | Search "United States CDS" |
| Germany 5Y CDS | Search "Germany CDS" |
| (etc.) | |

---

## Data Sources

| Source | Data | Update Frequency |
|--------|------|-----------------|
| **FRED API** | Treasury yields, credit spreads, employment, wages, CPI, FX rates | Daily/Monthly |
| **Manual Entry** | Term premium, reserve shares, trade shares | As updated |
| **Investing.com** | Foreign sovereign yields (daily), energy prices, CDS | Manual check |
| **NY Fed** | ACM Term Premium model | Daily |
| **IMF COFER** | Currency reserve composition | Quarterly |

---

## Local Development

No build step required — pure ES6 modules.

```bash
# Start local server (required for ES6 module imports)
npx http-server -p 8000

# Or use VS Code Live Server extension
```

### File Structure
```
/
├── index.html           # Main SPA
├── css/
│   └── styles.css       # Full design system (~1900 lines)
├── js/
│   ├── app.js           # Event bus, state, orchestration
│   ├── fred.js          # FRED API client with caching
│   ├── config.js        # Series IDs, thresholds, sector config
│   ├── calculations.js  # Regime classifier algorithm
│   ├── charts.js        # Chart.js sparkline factory
│   ├── sectors.js       # Sectoral signal derivation
│   ├── settings.js      # Manual entry form
│   └── explainers.js    # Tooltip content, tab rendering
├── cloudflare-worker.js # CORS proxy (deployed separately)
├── CLAUDE.md            # AI assistant context
├── CLEANUP.md           # Known issues & enhancements
└── TESTING_PLAN.md      # QA checklist
```

---

## Troubleshooting

### "Failed to fetch" errors
- Check your FRED API key is valid
- The CORS proxy may be down — verify at `https://fred-proxy.tuckerlsmith.workers.dev/`

### Data showing "--"
- Some series update monthly; check FRED for latest data
- Clear cache: Settings → Clear API Key, or run `sessionStorage.clear()` in console

### Charts not rendering
- Ensure Chart.js CDN is loading (check console for errors)
- Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Mobile layout issues
- Force refresh to get latest CSS
- Ensure viewport meta tag is present

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ CORS Proxy   │────▶│  FRED API   │
│  (app.js)   │◀────│ (Cloudflare) │◀────│             │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│                    app.js                           │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ EventBus│  │   AppState   │  │ Panel Renders │  │
│  └─────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────┘
       │                │                    │
       ▼                ▼                    ▼
┌───────────┐    ┌─────────────┐    ┌──────────────┐
│ fred.js   │    │calculations │    │  charts.js   │
│ (fetch)   │    │   .js       │    │ (Chart.js)   │
└───────────┘    └─────────────┘    └──────────────┘
```

---

## License

MIT

---

## Contributing

Issues and PRs welcome at [github.com/tuckerlsmith/econ_dashboard](https://github.com/tuckerlsmith/econ_dashboard)
