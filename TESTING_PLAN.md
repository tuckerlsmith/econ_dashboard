# Testing Plan - Economic Dashboard

Run these checks at the end of each phase. Items marked [AUTO] can be verified by Claude via code/console checks. Items marked [MANUAL] require browser interaction.

---

## Pre-Test Setup

```javascript
// Run in browser console to start fresh
sessionStorage.clear();
localStorage.removeItem('fred_api_key');
location.reload();
```

---

## Core Functionality (Run Every Phase)

### Data Loading
- [ ] [AUTO] No console errors on page load
- [ ] [AUTO] All FRED series fetch successfully (check for "failed to fetch" errors)
- [ ] [MANUAL] "Updated" timestamp shows in header
- [ ] [MANUAL] Refresh button triggers data reload

### API Key
- [ ] [MANUAL] First visit prompts for API key
- [ ] [MANUAL] Invalid key shows error message
- [ ] [MANUAL] Valid key saves and loads data
- [ ] [MANUAL] Key persists across page refresh

### Panel Groups
- [ ] [MANUAL] Click group header collapses/expands content
- [ ] [MANUAL] Collapse state persists visually

### Bottom Bar
- [ ] [MANUAL] Shows 10Y yield with arrow
- [ ] [MANUAL] Shows DXY with arrow
- [ ] [MANUAL] Shows HY OAS with arrow
- [ ] [MANUAL] Regime badge shows current regime

---

## Phase 2: Regime Classifier (Complete)

### Panel 1 - Dollar Regime Diagnostic
- [X] [MANUAL] US 10Y Yield displays value + delta + sparkline
- [X] [MANUAL] Dollar Index displays value + delta + sparkline
- [X] [MANUAL] 60-Day Correlation displays calculated value
- [X] [MANUAL] Term Premium shows "Not set" or manual value
- [X] [MANUAL] 5Y5Y Forward displays value + delta + sparkline
- [X] [MANUAL] Regime badge shows regime (1-4 or ?)
- [X] [MANUAL] Rolling Correlation chart renders with threshold bands
- [X] [MANUAL] Yield vs Dollar chart renders with dual axes

### Calculations Verification
- [ ] [AUTO] Correlation value is between -1 and +1
- [ ] [AUTO] Regime matches correlation/direction logic

---

## Phase 3: Bottom Bar + Panel 2

### Panel 2 - Domestic Credit & Credibility
- [X] [MANUAL] HY OAS displays in basis points (expect 300-500 range)
- [X] [MANUAL] HY OAS has threshold coloring (green/amber/red)
- [X] [MANUAL] Yield Curve displays in basis points
- [X] [MANUAL] Deficit/GDP shows calculated percentage
- [X] [MANUAL] Deficit/GDP has threshold coloring

### Bottom Bar Enhancements
- [ ] [MANUAL] HY OAS threshold color applied
- [X] [MANUAL] Values update on data refresh

---

## Phase 4: Panel 5 - International

### Sovereign Yields Table
- [X] [MANUAL] All 6 countries show yield values
- [X] [MANUAL] CHG (MoM) column shows changes
- [X] [MANUAL] Spread vs US calculated correctly
- [X] [MANUAL] Daily links work (open Investing.com)

### Key Spreads
- [X] [MANUAL] US-Bund spread displays
- [X] [MANUAL] Bund-OAT spread displays
- [X] [MANUAL] US-JGB spread displays

### Exchange Rates Table
- [X] [MANUAL] All 5 currency pairs display
- [X] [MANUAL] 1D CHG and 1M CHG show values
- [X] [MANUAL] 90D Trend sparklines render

### Convergence Chart
- [X] [MANUAL] Chart renders with multiple country lines
- [X] [MANUAL] Legend shows country colors

---

## Phase 5: Panel 3 - Sectoral Matrix

### Data Display
- [X] [MANUAL] All 5 sectors show employment data
- [X] [MANUAL] All 5 sectors show wage data
- [X] [MANUAL] Openings column shows data (4 sectors)
- [X] [MANUAL] Output shows for Manufacturing
- [X] [MANUAL] Signal column shows derived signals

### Signal Logic
- [X] [AUTO] Signal derivation matches defined rules
- [X] [MANUAL] Signal badges have appropriate colors

---

## Phase 6: Panel 4 + Settings

### Panel 4 - Domestic Expenses
- [ ] [MANUAL] Shelter CPI shows index + YoY%
- [ ] [MANUAL] Medical Care CPI shows index + YoY%
- [ ] [MANUAL] Energy CPI shows index + YoY%
- [ ] [MANUAL] Sparklines render for each

### Settings/Manual Entry
- [ ] [MANUAL] Settings modal opens from gear icon
- [ ] [MANUAL] Can enter Term Premium value
- [ ] [MANUAL] Can enter other manual values
- [ ] [MANUAL] Values save to localStorage
- [ ] [MANUAL] Values persist across refresh
- [ ] [MANUAL] Values display in appropriate panels

---

## Phase 7: Explainer System

### Tooltips
- [ ] [MANUAL] Info icons (i) are clickable
- [ ] [MANUAL] Desktop: tooltip appears near icon
- [ ] [MANUAL] Tooltip content is relevant
- [ ] [MANUAL] Click outside dismisses tooltip

### Mobile
- [ ] [MANUAL] Info icon tap opens bottom sheet
- [ ] [MANUAL] Bottom sheet shows content
- [ ] [MANUAL] Can dismiss by swipe or tap outside

### Inline Tabs (Panel 5)
- [ ] [MANUAL] Three tabs visible: Yields & Currencies, Bond Explainer, Energy Explainer
- [ ] [MANUAL] Tab switching works
- [ ] [MANUAL] Content changes appropriately

---

## Phase 8: Mobile Responsiveness

### Breakpoints
- [ ] [MANUAL] Desktop (>1024px): 2-column layout
- [ ] [MANUAL] Tablet (768-1024px): single column
- [ ] [MANUAL] Mobile (<768px): compact mode

### Mobile-Specific
- [ ] [MANUAL] Groups B and C collapsed by default on mobile
- [ ] [MANUAL] Sectoral matrix scrolls horizontally
- [ ] [MANUAL] Touch targets are 44px minimum
- [ ] [MANUAL] Bottom bar is compressed

---

## Phase 9: Final Testing

### Cross-Browser
- [ ] [MANUAL] Chrome - all features work
- [ ] [MANUAL] Firefox - all features work
- [ ] [MANUAL] Safari - all features work
- [ ] [MANUAL] Edge - all features work

### Error Scenarios
- [ ] [MANUAL] Handles network failure gracefully
- [ ] [MANUAL] Shows cached data when available
- [ ] [MANUAL] Partial API failures show error message

### Performance
- [ ] [MANUAL] Initial load < 5 seconds
- [ ] [MANUAL] No jank during scrolling
- [ ] [MANUAL] Charts render smoothly

---

## Console Commands for Testing

```javascript
// Check all loaded series
Object.keys(JSON.parse(sessionStorage.getItem('fred_data_cache')).data)

// Check regime state
// (run after importing - or check via debugger)

// Force cache expiry
sessionStorage.clear()

// Check for any null data
const cache = JSON.parse(sessionStorage.getItem('fred_data_cache'));
Object.entries(cache.data).filter(([k,v]) => v === null)

// Verify HY OAS is in correct range (should be ~3-5% raw, 300-500 bps displayed)
const cache = JSON.parse(sessionStorage.getItem('fred_data_cache'));
cache.data.BAMLH0A0HYM2?.observations[0]
```

---

## Quick Smoke Test (2 minutes)

For rapid validation after any change:

1. [ ] Page loads without console errors
2. [ ] Data values appear (not all "--")
3. [ ] Regime badge shows something
4. [ ] Charts render
5. [ ] Bottom bar has values
6. [ ] Collapse/expand works
