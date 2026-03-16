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
- [X] [AUTO] No console errors on page load
- [X] [AUTO] All FRED series fetch successfully (check for "failed to fetch" errors)
- [X] [MANUAL] "Updated" timestamp shows in header
- [X] [MANUAL] Refresh button triggers data reload

### API Key
- [X] [MANUAL] First visit prompts for API key
- [X] [MANUAL] Invalid key shows error message
- [X] [MANUAL] Valid key saves and loads data
- [X] [MANUAL] Key persists across page refresh

### Panel Groups
- [X] [MANUAL] Click group header collapses/expands content
- [X] [MANUAL] Collapse state persists visually

### Bottom Bar
- [X] [MANUAL] Shows 10Y yield with arrow
- [X] [MANUAL] Shows DXY with arrow
- [X] [MANUAL] Shows HY OAS with arrow
- [X] [MANUAL] Regime badge shows current regime

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
- [X] [AUTO] Correlation value is between -1 and +1
- [X] [AUTO] Regime matches correlation/direction logic

---

## Phase 3: Bottom Bar + Panel 2 (Complete)

### Panel 2 - Domestic Credit & Credibility
- [X] [MANUAL] HY OAS displays in basis points (expect 300-500 range)
- [X] [MANUAL] HY OAS has threshold coloring (green/amber/red)
- [X] [MANUAL] Yield Curve displays in basis points
- [X] [MANUAL] Deficit/GDP shows calculated percentage
- [X] [MANUAL] Deficit/GDP has threshold coloring

### Bottom Bar Enhancements
- [ ] [MANUAL] HY OAS threshold color applied (see CLEANUP.md)
- [X] [MANUAL] Values update on data refresh

---

## Phase 4: Panel 5 - International (Complete)

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

## Phase 5: Panel 3 - Sectoral Matrix (Complete)

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

## Phase 6: Panel 4 + Settings (Complete)

### Panel 4 - Domestic Expenses
- [X] [MANUAL] Shelter CPI shows index + YoY%
- [X] [MANUAL] Medical Care CPI shows index + YoY%
- [X] [MANUAL] Energy CPI shows index + YoY%
- [X] [MANUAL] Sparklines render for each

### Settings/Manual Entry
- [X] [MANUAL] Settings modal opens from gear icon
- [X] [MANUAL] Can enter Term Premium value
- [X] [MANUAL] Can enter other manual values
- [X] [MANUAL] Values save to localStorage
- [X] [MANUAL] Values persist across refresh
- [X] [MANUAL] Values display in appropriate panels

---

## Phase 7: Explainer System (Complete)

### Tooltips
- [X] [MANUAL] Info icons (i) are clickable
- [X] [MANUAL] Desktop: tooltip appears near icon
- [X] [MANUAL] Tooltip content is relevant
- [X] [MANUAL] Click outside dismisses tooltip

### Mobile
- [X] [MANUAL] Info icon tap opens bottom sheet
- [X] [MANUAL] Bottom sheet shows content
- [X] [MANUAL] Can dismiss by swipe or tap outside

### Inline Tabs (Panel 5)
- [X] [MANUAL] Three tabs visible: Yields & Currencies, Bond Explainer, Energy Explainer
- [X] [MANUAL] Tab switching works
- [X] [MANUAL] Content changes appropriately

---

## Phase 8: Mobile Responsiveness (Complete)

### Breakpoints
- [X] [MANUAL] Desktop (>1024px): 2-column layout
- [X] [MANUAL] Tablet (768-1024px): single column
- [X] [MANUAL] Mobile (<768px): compact mode

### Mobile-Specific
- [X] [MANUAL] Groups B and C collapsed by default on mobile
- [X] [MANUAL] Sectoral matrix scrolls horizontally
- [X] [MANUAL] Touch targets are 44px minimum
- [X] [MANUAL] Bottom bar is compressed
- [X] [MANUAL] International tab doesn't expand viewport width

---

## Phase 9: Final Testing (IOC Complete)

### Cross-Browser
- [X] [MANUAL] Chrome - all features work
- [ ] [MANUAL] Firefox - all features work
- [ ] [MANUAL] Safari - all features work
- [X] [MANUAL] Edge - all features work

### Error Scenarios
- [X] [MANUAL] Handles network failure gracefully
- [X] [MANUAL] Shows cached data when available
- [X] [MANUAL] Partial API failures show error message

### Performance
- [X] [MANUAL] Initial load < 5 seconds
- [X] [MANUAL] No jank during scrolling
- [X] [MANUAL] Charts render smoothly

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

1. [X] Page loads without console errors
2. [X] Data values appear (not all "--")
3. [X] Regime badge shows something
4. [X] Charts render
5. [X] Bottom bar has values
6. [X] Collapse/expand works

---

## IOC Status: COMPLETE

All phases implemented and tested. See CLEANUP.md for known issues and future enhancements.
