# American Antifragility Dashboard

A monitoring dashboard for economic and financial indicators, tracking bond yields, currencies, credit conditions, sectoral employment, and consumer prices. Built with vanilla JavaScript and the FRED API.

## Quick Start

1. **Get a FRED API Key** (free)
   - Visit [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)
   - Click "Request API Key" (requires free account)
   - Copy your API key

2. **Open the Dashboard**
   - Visit the GitHub Pages URL, or
   - Open `index.html` locally in a browser

3. **Enter Your API Key**
   - The dashboard will prompt for your key on first visit
   - Your key is stored locally in your browser (never sent anywhere except FRED)

## Features

- **Regime Classifier**: Tracks bond-currency relationship (yields vs. dollar)
- **Credit Indicators**: HY spreads, yield curve, deficit tracking
- **Sectoral Matrix**: Employment, wages, and openings by sector
- **Domestic Expenses**: CPI components (shelter, medical, energy)
- **International Comparison**: Sovereign yields and currency rates

## GitHub Pages Deployment

1. Go to your repo Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Select `main` branch and `/ (root)` folder
4. Click Save
5. Wait a few minutes, then visit `https://[username].github.io/econ_dashboard/`

## Development

No build step required. Edit files directly and refresh.

```
/
├── index.html          # Main application
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js          # Main orchestration
│   ├── fred.js         # FRED API client
│   └── config.js       # Series configuration
└── config.example.js   # Setup documentation
```

## Investing.com Watchlists

For daily-resolution data not available through FRED, set up these watchlists:

### Watchlist 1: Bonds & Currencies
- US, Germany, France, UK, Japan, South Korea, China 10Y yields
- DXY, EUR/USD, GBP/USD, USD/JPY, USD/CNY, USD/KRW

### Watchlist 2: Energy Markets
- WTI Crude, Brent Crude
- Henry Hub Natural Gas
- Dutch TTF Natural Gas
- LNG Japan/Korea Marker

### Watchlist 3: Sovereign CDS
- US, Germany, France, UK, Japan, South Korea, China 5Y CDS

## Data Sources

- **FRED API**: All automated data (Treasury yields, credit spreads, employment, CPI)
- **Manual Entry**: NY Fed term premium, IMF reserve shares
- **Investing.com**: Daily foreign yields, energy, sovereign CDS (via watchlists)

## License

MIT
