# Requirements Document: American Antifragility Monitoring Dashboard — IOC

**Date:** 2026-03-13
**Version:** 2.1
**Purpose:** Implementation specification for Claude Code. Defines data sources, calculations, layout, and behavior for the Initial Operating Capability (IOC) of the framework's quantitative monitoring dashboard.

---

## 1. Project Overview

### 1.1 What This Is

A monitoring dashboard for the American Antifragility analytical framework. The dashboard tracks bond yields, currencies, credit conditions, sectoral employment and output, consumer price components, and comparative sovereign yields across the US and key foreign economies. It serves two functions: (1) a monitoring tool that operationalizes the indicators defined in the framework's monitoring briefs, and (2) a learning instrument that builds fluency in reading financial and economic signals through contextual explainers integrated into every panel.

**The dashboard serves these framework documents:**
- [[MB_US_Economic_Conditions]] — domestic cyclical indicators and institutional credibility signals
- [[MB_Global_Financial_Conditions_Trade]] — currency/reserve system health, sovereign credit comparisons, bond-currency regime diagnostic
- [[HYP_Dollar_Resilience]] — the bond-currency regime classification is the hypothesis's primary quantitative diagnostic
- [[MB_Affordability_Workforce_Conditions]] — sectoral employment, wages, CPI components
- [[MB_Structural_Economic_Transitions]] — earnings-employment divergence, sectoral output trends

**The dashboard is complemented by three Investing.com watchlists** that provide daily-resolution data for instruments not available through FRED (energy futures, sovereign CDS) and daily drill-down for instruments where FRED provides only monthly data (foreign sovereign yields, currencies).

### 1.2 Design Philosophy

- **Dense, functional aesthetic.** Bloomberg terminal / military command center style. Dark background, high information density, no wasted space. Data-forward, not decorative.
- **Mobile-responsive from the start.** Must be usable on a phone screen — panels stack vertically, text remains readable, charts remain interpretable. This is a daily-check tool.
- **Lightweight contextual explainers.** Every indicator, spread, and derived metric has a small info icon (ⓘ) that triggers a tooltip (desktop hover/click) or bottom-sheet modal (mobile tap) explaining what the metric is, why it matters, and what movements signal. Written for someone building fluency, not an expert.
- **Organized by function, not data source.** Panels group data by analytical purpose. Data frequency differences (daily vs. monthly vs. quarterly) are noted via "last updated / next update" indicators, not used as an organizational principle.
- **Sparklines everywhere the data supports them.** Any indicator backed by a time series should show its trailing trajectory as a sparkline, not just its current value. The structural stories this dashboard tracks (healthcare employment accelerating, manufacturing declining, fiscal trajectory worsening, yield spreads widening) are trend stories — a number alone doesn't tell them. See §4.5 for the complete sparkline inventory.
- **Static site.** Deployed on GitHub Pages. No backend server. All data fetched client-side from FRED API.

### 1.3 Technology Stack

- **HTML/CSS/JavaScript** — single-page application, vanilla JS (lightweight framework like Preact acceptable if it simplifies reactivity)
- **Charts:** Chart.js or TradingView Lightweight Charts for sparklines and time series
- **Hosting:** GitHub Pages (static files only)
- **Data:** FRED API (sole automated data source for IOC)

---

## 2. Architecture Summary

### 2.1 Dashboard Panels (Native, FRED-Automated)

| # | Panel | Primary Data | Frequency | Framework Connection |
|---|-------|-------------|-----------|---------------------|
| 1 | Dollar Regime Diagnostic | 10Y yield, DXY, rolling correlation, 5Y5Y forward | Daily | HYP_Dollar_Resilience |
| 2 | Domestic Credit & Credibility | HY OAS, yield curve, deficit/GDP, term premium (manual) | Daily/Monthly | MB_US_Economic_Conditions |
| 3 | Sectoral Comparison Matrix | Employment, wages, openings, output by sector | Monthly/Quarterly | MB_Affordability_Workforce, MB_Structural_Economic_Transitions, SA_US_Domestic_Governance |
| 4 | Domestic Expenses | Shelter CPI, Medical CPI, Energy CPI | Monthly | MB_Affordability_Workforce_Conditions |
| 5 | Comparative Sovereign Yields & Currencies | 6 foreign 10Y yields, 3 spreads, 5 exchange rates, convergence chart | Monthly (yields) / Daily (FX) | MB_Global_Financial_Conditions_Trade, HYP_Dollar_Resilience |

### 2.2 Reference/Explainer Tabs (Content + Links)

| # | Tab | Purpose |
|---|-----|---------|
| 6 | Bond & Sovereign Yield Explainer | Conceptual foundation for reading bond markets, spread interpretation guide, sovereign CDS explainer, convergence/divergence framework, country-specific context. Links to Investing.com bond, currency, and CDS watchlists and WorldGovernmentBonds.com |
| 7 | Energy Markets Explainer | Benchmark definitions, regionalization diagnostic, dollar invoicing connection, spread interpretation. Links to Investing.com energy watchlist |

### 2.3 Panel Grouping & Collapsing

Panels are organized into three collapsible groups that reflect the analytical information flow:

**Group A — Dollar & Credit (Panels 1 + 2)**
The regime diagnostic and the domestic credit conditions that contextualize it. When the regime classifier fires, Panel 2 shows whether credit spreads, yield curve, and fiscal trajectory confirm or contradict. These answer: "Is something wrong with the US sovereign picture right now?"

**Group B — Domestic Structure (Panels 3 + 4)**
The sectoral comparison matrix and CPI components. The earnings-employment divergence in Panel 3 and the cost pathology in Panel 4 are two views of the same structural problem (restrict-supply/subsidize-demand). These answer: "What's happening in the real economy beneath the financial signals?"

**Group C — International & Energy (Panels 5 + Tabs 6 & 7)**
Sovereign yields, currencies, computed spreads, and the explainer/reference tabs with Investing.com watchlist links. These answer: "How does the US picture compare to the rest of the world?"

**Collapsing behavior:**
- Desktop: all groups expanded by default. Click group header to collapse/expand.
- Mobile: Group A expanded by default; Groups B and C collapsed. Daily phone check starts at the regime classifier without scrolling past other panels. Tap group header to expand.
- Collapsed state shows only the group header with a compact summary line (e.g., Group A collapsed: "Regime 1 · 10Y 4.37% · HY OAS 342 bps").

### 2.4 Persistent Bottom Bar

Always visible regardless of which panel/tab is active:
- **Current regime** (1-4 or Indeterminate) with color and duration
- **US 10Y yield** current value with direction arrow
- **DXY** current value with direction arrow
- **HY OAS** current value with threshold color

### 2.5 Settings/Input Page

Manual entry form for infrequently-updated indicators. Values propagate to wherever they display in panels. Stored in localStorage.

| Field | Displayed In | Update Frequency |
|-------|-------------|-----------------|
| NY Fed ACM 10Y Term Premium | Panel 1 (regime), Panel 2 (credit) | Daily (manual) |
| Dollar Reserve Share (IMF COFER) | Bond Explainer Tab §Structural Baseline | Quarterly |
| Dollar Invoicing Share (BIS/SWIFT) | Bond Explainer Tab §Structural Baseline | Annual |
| NAFTA Share of US Imports | Bond Explainer Tab §Structural Baseline | Monthly |
| China Share of US Imports | Bond Explainer Tab §Structural Baseline | Monthly |
| RMB Share of SWIFT Payments | Bond Explainer Tab §Structural Baseline | Monthly |

### 2.6 Investing.com Watchlists (External, Daily Resolution)

Three pre-configured watchlists on Investing.com providing daily data for instruments the dashboard cannot automate.

**Watchlist 1 — Bonds & Currencies (daily complement to Panel 5 monthly data):**
US 10Y, Germany 10Y, France 10Y, UK 10Y, Japan 10Y, South Korea 10Y, China 10Y, DXY, EUR/USD, GBP/USD, USD/JPY, USD/CNY, USD/KRW

**Watchlist 2 — Energy Markets:**
WTI Crude, Brent Crude, Henry Hub Natural Gas, Dutch TTF Natural Gas Futures, LNG Japan/Korea Marker PLATTS Future

**Watchlist 3 — Sovereign CDS (convergence/divergence framework):**
US 5Y CDS, Germany 5Y CDS, France 5Y CDS, UK 5Y CDS, Japan 5Y CDS, South Korea 5Y CDS, China 5Y CDS

---

## 3. Data Sources

### 3.1 FRED API

**Base endpoint:** `https://api.stlouisfed.org/fred/series/observations`
**Authentication:** Free API key (register at https://fred.stlouisfed.org/docs/api/api_key.html)
**Rate limits:** 120 requests/minute. Batch on load, cache in sessionStorage.
**Standard parameters:** `?series_id={ID}&api_key={KEY}&file_type=json&sort_order=desc&limit={N}`

### 3.2 Complete FRED Series Reference

**Panel 1 — Dollar Regime Diagnostic:**

| Indicator | FRED Series ID | Frequency |
|-----------|---------------|-----------|
| US 10Y Treasury Yield | `DGS10` | Daily |
| Trade-Weighted US Dollar Index (Broad) | `DTWEXBGS` | Daily |
| 5Y5Y Forward Inflation Expectation | `T5YIFR` | Daily |

**Panel 2 — Domestic Credit & Credibility:**

| Indicator | FRED Series ID | Frequency |
|-----------|---------------|-----------|
| ICE BofA US High Yield OAS | `BAMLH0A0HYM2` | Daily |
| 10Y-2Y Treasury Spread | `T10Y2Y` | Daily |
| Federal Surplus/Deficit (monthly) | `MTSDS133FMS` | Monthly |

*NY Fed ACM Term Premium: manual entry. Source: https://www.newyorkfed.org/research/data_indicators/term-premia-tabs#/overview*

**Panel 3 — Sectoral Comparison Matrix:**

| Metric | Sector | FRED Series ID | Frequency |
|--------|--------|---------------|-----------|
| Employment | Healthcare & Social Assistance | `CES6562000001` | Monthly |
| Employment | Professional & Business Services | `USPBS` | Monthly |
| Employment | Information | `USINFO` | Monthly |
| Employment | Manufacturing | `MANEMP` | Monthly |
| Employment | Construction | `USCONS` | Monthly |
| Avg Weekly Earnings | Healthcare | `CES6562000011` | Monthly |
| Avg Weekly Earnings | Prof & Business Services | `CES6054000011` | Monthly |
| Avg Weekly Earnings | Information | `CES5000000011` | Monthly |
| Avg Weekly Earnings | Manufacturing | `CES3000000011` | Monthly |
| Avg Weekly Earnings | Construction | `CES2000000011` | Monthly |
| Job Openings | Healthcare & Social Assistance | `JTS6200JOL` | Monthly (~2mo lag) |
| Job Openings | Professional & Business Services | `JTS540099000000000JOL` | Monthly (~2mo lag) |
| Job Openings | Manufacturing | `JTS3000JOL` | Monthly (~2mo lag) |
| Job Openings | Construction | `JTS2300JOL` | Monthly (~2mo lag) |
| Output Index | Manufacturing (Industrial Production) | `IPMAN` | Monthly |

*Notes: JOLTS series IDs for Information sector and output indices for non-manufacturing sectors should be verified during implementation. JOLTS may use different sector codes. BEA value-added by industry (quarterly) is the output measure for services sectors but is not on FRED in a conveniently sectoral form — mark as "Q" (quarterly, manual or deferred) in the matrix. Construction and healthcare output can initially display as "—" with a quarterly frequency note.*

**Panel 4 — Domestic Expenses:**

| Indicator | FRED Series ID | Frequency |
|-----------|---------------|-----------|
| CPI: Shelter | `CUSR0000SAH1` | Monthly |
| CPI: Medical Care | `CUSR0000SAM` | Monthly |
| CPI: Energy | `CUSR0000SA0E` | Monthly |

*Display as index level with 12-month percentage change (YoY inflation rate for each component).*

**Panel 5 — Comparative Sovereign Yields & Currencies:**

Sovereign 10Y Yields (all monthly, OECD via FRED):

| Country | FRED Series ID |
|---------|---------------|
| United States | `IRLTLT01USM156N` |
| Germany | `IRLTLT01DEM156N` |
| France | `IRLTLT01FRM156N` |
| United Kingdom | `IRLTLT01GBM156N` |
| Japan | `IRLTLT01JPM156N` |
| South Korea | `IRLTLT01KRM156N` |
| China | Not on FRED — Investing.com watchlist only |

Exchange Rates (all daily, FRED):

| Pair | FRED Series ID | Convention |
|------|---------------|------------|
| EUR/USD | `DEXUSEU` | Dollars per euro |
| GBP/USD | `DEXUSUK` | Dollars per pound |
| USD/JPY | `DEXJPUS` | Yen per dollar |
| USD/CNY | `DEXCHUS` | Yuan per dollar |
| USD/KRW | `DEXKOUS` | Won per dollar |

---

## 4. Derived Calculations

### 4.1 Bond-Currency Regime Classifier (PRIMARY DIAGNOSTIC)

The analytical centerpiece of the dashboard. Implements the four-regime framework from HYP_Dollar_Resilience.

**Calculation:**
1. Fetch last 90 calendar days of `DGS10` and `DTWEXBGS` daily data
2. Compute daily changes (first differences) for both, aligned by date
3. Compute rolling 60-business-day Pearson correlation between the two change series
4. Determine yield direction: 20-day moving average of yield changes (positive = rising, negative = falling)
5. Classify:

| Regime | Correlation | Yield Direction | Color | Meaning |
|--------|-----------|----------------|-------|---------|
| 1: Healthy Tightening | > +0.3 | Rising | Green | Yields up, dollar up — capital attracted by higher rates |
| 2: Fiscal/Institutional Crisis | < −0.3 | Rising | Red | Yields up, dollar down — loss of sovereign confidence |
| 3: Flight to Safety | < −0.3 | Falling | Blue | Yields down, dollar up — risk-off safe haven demand |
| 4: Easing/Stimulus | > +0.3 | Falling | Yellow | Yields down, dollar down — capital seeking return elsewhere |
| Indeterminate | −0.3 to +0.3 | Either | Gray | No clear regime signal |

**Display:**
- Large regime badge: number, name, color, duration ("X business days in current regime")
- Correlation sparkline: 180 days with +0.3 / −0.3 threshold lines, colored background bands
- Mini dual-axis chart: 90-day overlay of 10Y yield and dollar index

**Threshold alerts:**
- Regime 2 sustained >5 days → amber border
- Regime 2 sustained >30 days → red border with text "REGIME 2 SUSTAINED — Review HYP_Dollar_Resilience"
- 5Y5Y forward >2.5% sustained → amber flag
- 5Y5Y forward >3.0% sustained → red flag

### 4.2 Sovereign Yield Spreads

Calculated from FRED monthly OECD data. Display in basis points. Use the monthly US OECD series (`IRLTLT01USM156N`) for spread calculations to ensure consistent frequency.

| Spread | Calculation | Analytical Meaning |
|--------|------------|-------------------|
| US-Bund | US − Germany | Transatlantic rate differential; capital flow driver |
| Bund-OAT | France − Germany | Eurozone fiscal cohesion; French fiscal credibility |
| US-JGB | US − Japan | Carry trade dynamic; BOJ policy transmission |

Display each as: current value in bps, direction arrow, 12-month sparkline.

### 4.3 Other Derived Indicators

| Indicator | Calculation | Panel |
|-----------|------------|-------|
| Federal Deficit % GDP | Trailing 12-month sum of `MTSDS133FMS` ÷ GDP | Panel 2 |
| CPI YoY % Change | (Current index − index 12 months ago) ÷ index 12 months ago × 100 | Panel 4 |
| Employment YoY Change | Current level − level 12 months ago | Panel 3 |
| Wage YoY % Change | (Current − 12 months ago) ÷ 12 months ago × 100 | Panel 3 |

### 4.4 Convergence/Divergence Visual (Panel 5)

Multi-line sparkline chart showing all six FRED sovereign yields (US, Germany, France, UK, Japan, South Korea) on the same axes over the last 12 months. Color-coded by country. Purpose is visual pattern recognition:
- All lines moving together → convergent
- US diverging from pack → divergent (check direction for positive vs. negative)

Monthly frequency means 12 data points per line. Sufficient for trend identification.

### 4.5 Sparkline Inventory

**Principle:** Every indicator backed by a time series displays a trailing sparkline alongside its current value. The structural stories this dashboard tracks are trend stories — a number alone doesn't communicate them.

**Panel 1 — Dollar Regime Diagnostic:**

| Indicator | Sparkline Period | Notes |
|-----------|-----------------|-------|
| 60-day rolling correlation | 180 days | Already specified; primary regime visual |
| US 10Y yield | 90 days | On the metric card; shows whether yields are grinding up or spiked today |
| DXY / trade-weighted dollar | 90 days | On the metric card; complements the correlation chart |
| 5Y5Y forward inflation | 90 days | On the metric card; shows anchoring trajectory |
| Mini yield/dollar overlay | 90 days, dual axis | Already specified; shows the two series relationship visually |

**Panel 2 — Domestic Credit & Credibility:**

| Indicator | Sparkline Period | Notes |
|-----------|-----------------|-------|
| HY OAS | 90 days | Already specified |
| Yield curve (10Y-2Y) | 1 year | Already specified; longer period captures inversion episodes |
| Deficit/GDP | 12 months | Trailing 12-month calculation produces monthly series; shows fiscal trajectory direction |
| 5Y5Y forward | 90 days | Already specified (shared with Panel 1) |
| Term premium | If historical values stored | Depends on whether manual entry captures a time series in localStorage vs. just current value. If storing history: 12-month sparkline. If not: defer to future iteration |

**Panel 3 — Sectoral Comparison Matrix:**

| Indicator | Sparkline Period | Notes |
|-----------|-----------------|-------|
| Employment by sector | 12 months | Small inline sparkline in each employment cell. Highest-value addition — makes the structural divergence stories (healthcare accelerating, manufacturing declining, information flattening) instantly visible |
| Avg weekly earnings by sector | 12 months | Inline sparkline showing wage trajectory per sector |
| Job openings by sector | 12 months | Inline sparkline; rising openings with declining employment sparkline = visual skills gap |

*Output index sparklines deferred — mixed frequency (monthly for manufacturing, quarterly for services) makes inline sparklines less clean.*

**Panel 4 — Domestic Expenses:**

| Indicator | Sparkline Period | Notes |
|-----------|-----------------|-------|
| Shelter CPI YoY % | 24 months | Already specified; longer period shows the shelter inflation arc |
| Medical Care CPI YoY % | 24 months | Already specified |
| Energy CPI YoY % | 24 months | Already specified; more volatile, sparkline shows the swing amplitude |

**Panel 5 — Comparative Sovereign Yields & Currencies:**

| Indicator | Sparkline Period | Notes |
|-----------|-----------------|-------|
| US-Bund spread | 12 months | Already specified |
| Bund-OAT spread | 12 months | Already specified |
| US-JGB spread | 12 months | Already specified |
| Individual sovereign yields (DE, FR, UK, JP, KR) | 12 months | In the yield table, one sparkline per country row. Makes the convergence/divergence pattern visible at row level without needing the multi-line chart |
| EUR/USD | 90 days | Already specified |
| GBP/USD | 90 days | Already specified |
| USD/JPY | 90 days | Already specified |
| USD/CNY | 90 days | Already specified |
| USD/KRW | 90 days | Already specified |
| Convergence/divergence multi-line | 12 months | Already specified; all 6 yields overlaid |

**Implementation guidance:** Sparklines are small (60-80px height on desktop, 40-60px on mobile), no axis labels, no gridlines — just the line shape with optional endpoint dot showing current value. Use consistent color coding (green line if trailing direction is favorable for that indicator, red if unfavorable, neutral gray if directional interpretation is context-dependent). Sparkline data should be fetched in the same FRED API call as the current value — request enough historical observations to populate the longest sparkline period needed (typically `limit=365` for daily series, `limit=24` for monthly series).

---

## 5. Panel Specifications

### 5.1 Panel 1: Dollar Regime Diagnostic

**Position:** Full width, top of page. Most prominent visual element.

**Contents:**
- Regime badge (large, colored)
- Key metrics row: US 10Y yield, DXY, current 60-day correlation, term premium (manual), 5Y5Y forward — each as compact card with value, direction arrow, change
- Correlation sparkline (180 days)
- Mini yield/dollar overlay chart (90 days, dual axis)

**Explainer (ⓘ on regime badge):**
> **Bond-Currency Regime Classifier**
>
> Tracks the relationship between US Treasury yields and the dollar. Normally (Regime 1), higher yields attract foreign capital, strengthening the dollar. The danger signal is Regime 2: yields rising while the dollar falls — investors demanding higher compensation AND selling the currency, a loss of confidence in the sovereign. This is what happened to UK gilts during the Truss crisis in September 2022. Persistent Regime 2 (>30 days) triggers a review of the dollar resilience hypothesis. Regime 3 (flight to safety) reinforces dollar reserve status each time it occurs.
>
> **Framework connection:** HYP_Dollar_Resilience primary diagnostic

### 5.2 Panel 2: Domestic Credit & Credibility

**Contents:**
- **HY OAS:** current bps, 90-day sparkline, threshold zones (300-400 green, 400-500 amber, 500+ red, 800+ dark red)
- **Yield Curve (10Y-2Y):** current bps, 1-year sparkline, inversion highlighted in red
- **Term Premium (manual):** current bps, threshold zones (<75 green, 75-100 amber, >100 red)
- **Deficit/GDP:** current %, trailing 12-month, threshold (<5% green, 5-8% amber, >8% red)
- **5Y5Y Forward:** current %, 90-day sparkline (also in Panel 1; repeated here for credit context)

**Explainers needed for:** HY OAS, yield curve, term premium, deficit/GDP, 5Y5Y forward. See §7 for content.

### 5.3 Panel 3: Sectoral Comparison Matrix

**Design:** See sector_matrix_mockup.html for visual reference.

**Contents:**
- Table with rows: Healthcare, Professional & Business Services, Information, Manufacturing, Construction
- Columns: Employment (level + YoY Δ), Avg Weekly Earnings (level + YoY % Δ), Job Openings (level + YoY Δ), Output Index (level + YoY % Δ where available), Signal
- **Signal column:** Algorithmically derived flags based on data patterns:
  - Employment ↑ while output/productivity flat → "Cost Pathology" (amber)
  - Output ↑ while employment ↓ → "Earnings Concentration" or "Automation" (amber)
  - Openings ↑ while employment ↓ → "Skills Gap" (amber)
  - Employment ↑ and openings ↑ and wages ↑ → "Supply Capacity" (green)
  - Employment ↓ and openings ↓ → "AI Displacement" or "Contraction" (red)
- **Divergence summary row** at bottom: narrative sentence for the 2-3 most significant cross-sector divergence patterns
- **Summary cards** below table: Top Employment Growth, Top Wage Growth, Largest Skills Gap
- **Last updated / next update** in panel header with frequency legend

**Explainers needed for:** each column header (Employment, Wages, Openings, Output), overall matrix concept, each signal type. See §7 for content.

### 5.4 Panel 4: Domestic Expenses

**Contents:**
- Three CPI components displayed as:
  - Current index level
  - 12-month YoY % change (the inflation rate for that component)
  - 24-month sparkline of YoY % change
  - Direction arrow and magnitude
- Visual emphasis on relative rates: which component is inflating fastest

**Explainers needed for:** each CPI component, overall panel concept (restrict-supply/subsidize-demand pathology manifesting as cost inflation). See §7.

**Explainer (ⓘ on panel title):**
> **Domestic Expenses**
>
> Tracks the cost components most affected by the restrict-supply/subsidize-demand pathology identified in SA_US_Domestic_Governance. Shelter, medical care, and energy represent the categories where regulatory barriers restrict supply while subsidies inflate demand, driving costs above general inflation. Shelter CPI is the single largest contributor to headline inflation and the most direct measure of the housing affordability crisis. Medical care CPI reflects the healthcare cost pathology visible in Panel 3's sectoral data. Energy CPI is more volatile and driven by global commodity markets, but domestic energy policy (permitting, transmission) affects the translation of abundant US production into affordable consumer energy.
>
> **Framework connection:** ASS_Abundance_Affordability, MB_Affordability_Workforce_Conditions

### 5.5 Panel 5: Comparative Sovereign Yields & Currencies

**Contents:**

**Sovereign Yields Table (monthly FRED data):**

| Country | 10Y Yield | Δ (prev month) | Spread vs US (bps) | Daily (link) |
|---------|-----------|----------------|--------------------|----|
| United States | {auto} | {auto} | — | 🔗 |
| Germany | {auto} | {auto} | {US-Bund, auto} | 🔗 |
| France | {auto} | {auto} | {US-OAT, auto} | 🔗 |
| United Kingdom | {auto} | {auto} | {US-Gilt, auto} | 🔗 |
| Japan | {auto} | {auto} | {US-JGB, auto} | 🔗 |
| South Korea | {auto} | {auto} | {US-Korea, auto} | 🔗 |
| China | — | — | — | 🔗 (Investing.com) |

Each 🔗 links to the Investing.com page for that country's 10Y yield. US yields use daily data from `DGS10` for the current value; the spread calculations use the monthly OECD series for consistency.

Note displayed in panel: "Yields are monthly (OECD/FRED). For daily resolution, use the Investing.com watchlist →" with link to watchlist.

**Key Spreads Row:** Three cards:
- US-Bund: value in bps, 12-month sparkline, direction arrow
- Bund-OAT: value in bps, 12-month sparkline, direction arrow
- US-JGB: value in bps, 12-month sparkline, direction arrow

**Convergence/Divergence Chart:** Multi-line sparkline, all 6 OECD yields on same axes, 12 months, color-coded

**Currencies Table (daily FRED data):**

| Pair | Rate | Δ (1 day) | Δ (1 month) | 90-day Sparkline |
|------|------|-----------|-------------|-----------------|
| EUR/USD | {auto} | {auto} | {auto} | {auto} |
| GBP/USD | {auto} | {auto} | {auto} | {auto} |
| USD/JPY | {auto} | {auto} | {auto} | {auto} |
| USD/CNY | {auto} | {auto} | {auto} | {auto} |
| USD/KRW | {auto} | {auto} | {auto} | {auto} |

**Explainers needed for:** US-Bund spread, Bund-OAT spread, US-JGB spread, convergence/divergence chart, each currency pair. See §7.

---

## 6. Reference/Explainer Tabs

These are static content pages with external links. No API calls, no data rendering. They serve the learning function for data that lives in the Investing.com watchlists.

### 6.1 Tab 6: Bond & Sovereign Yield Explainer

**Structure (collapsible sections):**

**§1 — Quick Links**
- 🔗 Investing.com Bonds & Currencies Watchlist (daily yields + currencies)
- 🔗 Investing.com Sovereign CDS Watchlist (daily credit risk — see §4a)
- 🔗 Investing.com World CDS Overview: investing.com/rates-bonds/world-cds
- 🔗 WorldGovernmentBonds.com (sovereign spreads, CDS, ratings, inverted curves)
- 🔗 WorldGovernmentBonds.com — Spread Table: worldgovernmentbonds.com/spread-historical-data/
- 🔗 WorldGovernmentBonds.com — Sovereign CDS: worldgovernmentbonds.com/sovereign-cds/
- 🔗 TradingView Bond Screener (filtered view)

**§2 — How to Read Sovereign Bond Yields**
Conceptual foundation: yield = expected short-term rates + term premium + credit risk premium. Why the decomposition matters — when the 10Y rises, which component is driving it changes the interpretation entirely. Rising expected rates (healthy growth) vs. rising term premium (fiscal uncertainty) vs. rising credit risk (institutional credibility erosion). Connection to the ACM term premium in Panel 2.

**§3 — How to Read Sovereign Spreads**
What a spread isolates (credit differentiation, relative fiscal credibility, monetary policy divergence). Detailed interpretation for each of the three key spreads:
- **US-Bund:** what widening and narrowing mean in each direction; how to distinguish rate-differential widening from credibility-differential widening
- **Bund-OAT:** why it isolates credit risk (shared currency); the 2024 French political crisis as case study; historical stress thresholds (80-100 bps)
- **US-JGB:** carry trade mechanics; BOJ yield curve control exit as the most consequential ongoing central bank shift; August 2024 carry trade unwind as case study

**§4 — Sovereign CDS: The Clean Credit Signal**
CDS isolates what yield spreads cannot: the pure market assessment of sovereign default probability, stripped of monetary policy expectations, inflation pricing, and term premium effects. This makes CDS the preferred metric for the convergence/divergence framework defined in [[MB_Global_Financial_Conditions_Trade]].

**What CDS measures:** The annual cost (in basis points) of insuring $10 million of sovereign debt for 5 years. Higher CDS = higher perceived default risk. Normal developed-economy range: 5-60 bps. Above 100 bps signals meaningful stress. Above 200 bps for a G7 country would be extraordinary.

**Why CDS is better than yields for country comparison:** Germany and France share the same currency and central bank (ECB), so their yield spread isolates credit risk reasonably well. But comparing the US to Japan using yields blends credit risk with completely different monetary policy regimes, inflation environments, and term premium dynamics. CDS strips all of that away. When US CDS is 35 bps and Germany CDS is 8 bps, the market is saying the US is roughly 4x riskier to lend to than Germany — a statement invisible in raw yield comparisons where the US yields more than Germany for many non-credit reasons.

**Connection to the regime classifier (Panel 1):** CDS and the regime classifier measure related but distinct things. The regime classifier tracks the *dynamic relationship* between yields and the dollar — whether they're moving together or apart. CDS tracks the *level* of credit risk pricing. A Regime 2 episode (yields up, dollar down) accompanied by rising US CDS is a much more serious signal than Regime 2 without CDS movement, because it confirms the yield increase is credit-driven rather than reflecting growth expectations or global rate repricing.

**Current baseline note (March 2026):** US CDS (~35-40 bps) is elevated above all tracked peers — higher than Germany (~8), UK (~18), France (~25), Japan (~25), and South Korea (~25-27). China highest at ~44-45 bps. The US premium likely reflects recurring debt ceiling risk and fiscal trajectory concerns — a quantitative signature of the congressional dysfunction described in [[SA_US_Domestic_Governance]]. US CDS has historically spiked during debt limit standoffs (>175 bps during the 2023 X-date crisis). Between episodes it settles but never converges fully to peer levels, because the market prices the recurring probability of future standoffs. Watch whether this gap narrows (institutional improvement) or widens (accelerating credibility erosion).

**§5 — The Convergence/Divergence Framework**
The four patterns from MB_Global_Financial_Conditions_Trade, readable in both the yield-based Panel 5 convergence chart (monthly, trend) and the CDS watchlist (daily, real-time signal):
- Convergent-Deteriorating (all rising) → "cleanest dirty shirt" supports dollar, but systemic risk rises
- Convergent-Improving (all declining) → benign, low priority
- Divergent-Negative (US rising, peers stable/falling) → directly threatens dollar thesis; cross-check with regime classifier
- Divergent-Positive (US stable/falling, peers rising) → strengthens thesis; may signal governance improvement translating to credibility

**§6 — Country Context**
Brief section on each sovereign and its analytical relevance:
- **Germany:** Eurozone risk-free benchmark. Bund yield reflects ECB policy + eurozone aggregate conditions. Post-2025 defense spending shift and fiscal rule reform may alter the structural story.
- **France:** Eurozone fiscal stress indicator. Operating within eurozone constraint (can't devalue or monetize). ECB TPI provides conditional backstop. Political fragmentation constraining consolidation. → HYP_European_Strategic_Coordination
- **UK:** Post-Truss institutional credibility case study. The September 2022 gilt crisis is the canonical example of Regime 2 in a G7 economy — yields spiking while sterling collapsed. Demonstrates that developed-economy institutional credibility can crack quickly.
- **Japan:** The BOJ yield curve control exit is reshaping global capital flows. Debt-to-GDP >260% sustained by financial repression. Yen trajectory directly relevant to defense spending calculus and carry trade dynamics. → HYP_Japan_Korea_Strategic_Partnership
- **South Korea:** Indo-Pacific capital flow proxy. Won sensitivity to China risk and US rate differentials. Bond market reflects both domestic economic conditions and regional geopolitical risk.
- **China:** Most opaque sovereign. True fiscal trajectory likely worse than stated (LGFV debt, property sector contingent liabilities). Yield at ~1.8% reflects both deflation risk and managed financial system. Gap between onshore and offshore yuan (CNY vs. CNH) as capital control pressure indicator — deferred to future iteration. → SA_Global_Economic_Architecture

**§7 — Structural Baseline Data**
Display area for the manual-entry slow-moving indicators, rendered from Settings/Input page values:
- Dollar Reserve Share: {value} (IMF COFER, {last updated}) — threshold: <55% amber, <50% red
- Dollar Invoicing Share: {value} (BIS/SWIFT, {last updated}) — threshold: <50% amber, <45% red
- Foreign Official Treasury Holdings: {value} (FRED auto, {last updated}) — direction indicator
- NAFTA Share of US Imports: {value} ({last updated}) — threshold: <28% red
- China Share of US Imports: {value} ({last updated}) — direction indicator
- RMB Share of SWIFT Payments: {value} ({last updated}) — threshold: >5% amber

### 6.2 Tab 7: Energy Markets Explainer

**Structure (collapsible sections):**

**§1 — Quick Links**
- 🔗 Investing.com Energy Watchlist (daily prices: WTI, Brent, Henry Hub, TTF, JKM)

**§2 — The Three Benchmarks**
What each represents:
- **WTI (West Texas Intermediate):** US domestic crude benchmark. Priced at Cushing, Oklahoma delivery. Reflects US production conditions and domestic demand.
- **Brent:** International crude benchmark. Priced for North Sea delivery but referenced globally. The pricing reference for ~80% of globally traded crude.
- **Henry Hub:** US natural gas benchmark. Priced at the Henry Hub pipeline interconnection in Louisiana, in USD/MMBtu. Reflects abundant US shale gas production — structurally lower than international gas prices.
- **TTF (Title Transfer Facility):** European natural gas benchmark. Dutch virtual trading hub, in EUR/MWh. Reflects European import dependency and pipeline/LNG supply dynamics. Became the de facto European benchmark after the 2022 Russia-Ukraine supply disruption.
- **JKM (Japan-Korea Marker):** Asian spot LNG benchmark. Assessed by S&P Global Platts, in USD/MMBtu. Reflects Northeast Asian LNG import costs. Northeast Asia is the world's largest LNG consuming region.

**§3 — Oil Market Integration (WTI-Brent)**
Oil is a globally integrated commodity — WTI and Brent normally move in near-lockstep. The spread typically ranges from -$2 to +$5, driven by quality differences and transportation logistics. Persistent widening beyond historical norms could signal market fragmentation along geopolitical lines — relevant because oil is predominantly invoiced in dollars, and dollar invoicing is a structural pillar of reserve currency status.

What to watch: WTI-Brent spread widening beyond $5 sustained. Changes in oil invoicing currency (e.g., major sales in yuan or euros). Both would be early indicators of the trade architecture fragmentation described in SA_Global_Economic_Architecture.

**§4 — Natural Gas Regionalization (Henry Hub vs. TTF vs. JKM)**
Unlike oil, natural gas markets are already partially regionalized because gas is constrained by pipeline infrastructure and LNG liquefaction/regasification capacity. The three benchmarks represent distinct regional markets connected by LNG trade.

Key dynamics:
- **Henry Hub-TTF spread:** structurally wide due to transportation costs + European import dependency. Spiked dramatically in 2022 when Russian pipeline gas was cut off. Convergence signals LNG capacity globalizing the market. Persistent wide spread signals continued European supply vulnerability.
- **TTF-JKM relationship:** tend to move together since Asia and Europe compete for flexible LNG cargoes. JKM premium over TTF typically widens during Asian winter heating season (Dec-Feb).
- **Unit conversion note:** Henry Hub and JKM are both in USD/MMBtu (directly comparable). TTF is in EUR/MWh. Approximate conversion: TTF (EUR/MWh) ÷ 3.4 × EUR/USD rate ≈ equivalent USD/MMBtu. Rough mental shortcut: divide TTF by ~3 for a ballpark USD/MMBtu equivalent.

**§5 — Energy and the Framework**
How energy connects to the analytical pillars:
- **Dollar hypothesis:** Oil invoiced in dollars globally. Non-dollar energy contracts gaining market share would be a leading indicator for HYP_Dollar_Resilience.
- **Energy independence:** US net energy exporter status (SA_US_Economic_Position) means the US is structurally insulated from supply shocks that constrain every other major economy. Henry Hub price stability while TTF/JKM spike is the direct market expression of this advantage.
- **Alliance leverage:** US LNG exports reduce allied dependence on adversary suppliers. The Henry Hub-TTF spread represents the cost of that diversification for European allies.
- **Chokepoints:** Hormuz, Malacca, Suez/Bab el-Mandeb (SA_Maritime_Geography_Chokepoints) remain critical for energy flows. Energy market disruptions at these chokepoints would show up as TTF and JKM spikes before they appear in WTI/Brent.

---

## 7. Explainer Content Specifications

### 7.1 Interaction Pattern

- **Desktop:** ⓘ icon next to indicator labels. Hover shows tooltip; click pins it open. Click elsewhere to dismiss.
- **Mobile:** ⓘ icon. Tap opens bottom-sheet modal (slides up, partial overlay, swipe/tap backdrop to dismiss).
- **Minimum touch target:** 44×44px for ⓘ icons (Apple HIG)

### 7.2 Explainer Content Structure

Every explainer follows:
1. **Bold title** — what is this metric?
2. **One paragraph** — plain-terms explanation
3. **What to watch** — directional interpretation (what does rising/falling mean?)
4. **Framework connection** — which hypothesis or monitoring brief this feeds

### 7.3 Explainer Content Store

All content in a single `explainers.js` file as a keyed object. Easy to edit, extend, maintain.

### 7.4 Explainer Content for Panel Indicators

*Detailed explainer content for key indicators (content written in full for the most analytically important; brief guidance for remaining):*

**Regime Classifier:** See §5.1

**HY OAS:**
> **High-Yield Credit Spread (ICE BofA Option-Adjusted Spread)**
> Measures the extra yield investors demand to hold risky corporate bonds versus safe Treasuries. A real-time fear gauge for credit markets. Normal mid-cycle: 300-400 bps. Above 500 bps: recessionary stress. Above 800 bps: crisis territory (COVID, 2008). When this spikes simultaneously with Regime 2, it confirms broad institutional stress rather than a transient episode.
> **Connection:** MB_US_Economic_Conditions indicator #1

**Yield Curve:**
> **10-Year minus 2-Year Treasury Spread**
> Normally positive — investors demand more yield for locking up money longer. Inversion (negative) has preceded every US recession since the 1960s, typically by 6-18 months. The signal to watch is the un-inversion (steepening from inverted): this often occurs as a recession begins, when the Fed cuts short rates while long rates stay elevated.
> **Connection:** MB_US_Economic_Conditions indicator #2

**Term Premium:**
> **NY Fed ACM 10-Year Term Premium**
> Extra yield for holding long-term bonds versus rolling short-term — compensation for duration risk and uncertainty. During QE, term premium was negative (the Fed suppressed it). Normalized to 50-75 bps. Above 100 bps sustained signals elevated inflation uncertainty or institutional credibility concerns. Rising term premium is the market saying "we're less sure about the US fiscal/institutional trajectory."
> **Connection:** MB_US_Economic_Conditions indicator #8, HYP_Dollar_Resilience leading indicator #2

**5Y5Y Forward:**
> **5-Year, 5-Year Forward Inflation Expectation**
> Market expectation of inflation 5 years from now, 5 years forward — strips out near-term noise to measure anchoring of long-run expectations. Anchored range: 2.0-2.3%. Above 2.5% sustained: de-anchoring, signals Fed credibility concern. Above 3.0%: serious de-anchoring.
> **Connection:** MB_US_Economic_Conditions indicator #9

**Deficit/GDP:**
> **Federal Deficit as % of GDP (Trailing 12-Month)**
> Outside recession, deficits above 6-7% of GDP are historically unusual for a developed economy at full employment. Widening above 8% outside recession signals structural fiscal deterioration — not cyclical spending but permanent mismatch between outlays and revenue. The marginal buyer of Treasuries is shifting from price-insensitive central banks to price-sensitive private investors, making the market more reactive to fiscal trajectory signals.
> **Connection:** MB_US_Economic_Conditions indicator #7, HYP_Dollar_Resilience institutional credibility dimension

**Sovereign Spreads:** See §4.2 and §6.1 for detailed content

**Currency Pairs:** Brief guidance for implementation:
- EUR/USD: transatlantic capital flows; cross-ref with US-Bund spread
- GBP/USD: sterling as secondary developed-market currency; Truss crisis precedent
- USD/JPY: carry trade dynamic; BOJ policy transmission; sharp yen strengthening = carry unwind risk
- USD/CNY: onshore yuan; PBOC management; capital control pressure
- USD/KRW: Indo-Pacific risk sentiment; Japan-Korea hypothesis connection

**Sectoral Matrix:** Explainers for overall concept (earnings-employment divergence), each column header (employment, wages, openings, output), and each signal type (Cost Pathology, Skills Gap, Earnings Concentration, AI Displacement, Supply Capacity). See sector_matrix_mockup.html for reference styling.

**CPI Components:**
- Shelter CPI: largest contributor to headline inflation; most direct measure of housing affordability crisis; restrict-supply pathology
- Medical Care CPI: healthcare cost pathology; cross-ref with Panel 3 healthcare sector data
- Energy CPI: more volatile; global commodity driven; domestic permitting/transmission policy affects translation of US production abundance to consumer affordability

---

## 8. Mobile Responsiveness

### 8.1 Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop | >1024px | Panel 1 full width; Panels 2-5 in 2-column grid; tabs as sidebar or header nav |
| Tablet | 768-1024px | Single column, panels stacked |
| Mobile | <768px | Single column, compact mode |

### 8.2 Mobile Compact Mode

- Charts: sparklines compress to full width, 60px height. Tap to expand overlay.
- Tables: horizontal scroll with fixed first column (sector/country name)
- Explainers: bottom-sheet modals (slide up, 60% screen height max, swipe to dismiss)
- Panel headers: sticky within scroll
- Regime badge: simplified to color bar across top with regime number and name; tap to expand
- Bottom bar: compressed to regime color + 10Y + DXY only
- Minimum font: 14px for values, 12px for labels
- Touch targets: 44×44px minimum for all interactive elements

---

## 9. Data Refresh & Caching

- **On page load:** fetch all FRED data. Display loading skeleton per panel.
- **Auto-refresh:** None. Manual refresh button only.
- **Cache:** sessionStorage with timestamp. Use cache if <1 hour old.
- **Error handling:** Display last cached data with "Data from {timestamp} — refresh failed" message. Never show empty panels.
- **API key management:** Prompt for FRED API key on first visit, save to localStorage. Configurable via Settings page.

---

## 10. Implementation Priority for Claude Code

1. **FRED API client** with caching and error handling
2. **Regime classifier** calculation and Panel 1 — the analytical centerpiece
3. **Persistent bottom bar** — regime, 10Y, DXY, HY OAS
4. **Panel 2** — credit & credibility (straightforward FRED daily data)
5. **Panel 5** — sovereign yields & currencies (FRED monthly + daily, spread calculations, convergence chart)
6. **Panel 3** — sectoral matrix (most FRED series, signal derivation logic)
7. **Panel 4** — domestic expenses (three CPI series, YoY calculation)
8. **Settings/Input page** — manual entry form
9. **Explainer tabs** (6 & 7) — static content with links
10. **Explainer tooltips/modals** — ⓘ system across all panels
11. **Mobile responsiveness pass** — verify all panels at phone width

---

## 11. File Structure

```
/
├── index.html              # Single-page application
├── css/
│   └── styles.css          # All styles including responsive breakpoints
├── js/
│   ├── app.js              # Main application logic, panel rendering, routing
│   ├── fred.js             # FRED API client, data fetching, caching
│   ├── calculations.js     # Regime classifier, spreads, YoY, derived metrics
│   ├── charts.js           # Chart rendering (sparklines, correlation, convergence)
│   ├── explainers.js       # All explainer content as keyed object
│   ├── sectors.js          # Sectoral matrix logic and signal derivation
│   ├── settings.js         # Manual entry management, localStorage
│   └── bottombar.js        # Persistent bottom bar state management
├── tabs/
│   ├── bonds-explainer.html    # Static content for bond/sovereign tab
│   └── energy-explainer.html   # Static content for energy tab
├── config.example.js       # Template for API key
└── README.md               # Setup, deployment, watchlist configuration instructions
```

---

## 12. Investing.com Watchlist Setup Instructions

*Include in README.md for reference:*

### Watchlist 1: Bonds & Currencies

Create free Investing.com account → Portfolio & Watchlist → New Watchlist → Name: "AA Bonds & Currencies"

Add these instruments (search by name):
1. United States 10-Year Bond Yield
2. Germany 10-Year Bond Yield
3. France 10-Year Bond Yield
4. United Kingdom 10-Year Bond Yield
5. Japan 10-Year Bond Yield
6. South Korea 10-Year Bond Yield
7. China 10-Year Bond Yield
8. US Dollar Index (DXY)
9. EUR/USD
10. GBP/USD
11. USD/JPY
12. USD/CNY
13. USD/KRW

### Watchlist 2: Energy Markets

New Watchlist → Name: "AA Energy"

Add these instruments:
1. WTI Oil (Crude Oil WTI Futures)
2. Brent Oil (Brent Oil Futures)
3. Natural Gas (Henry Hub Natural Gas Futures)
4. Dutch TTF Natural Gas Futures
5. LNG Japan/Korea Marker PLATTS Future

### Watchlist 3: Sovereign CDS

New Watchlist → Name: "AA Sovereign CDS"

Add these instruments (use ticker if search is unreliable):

| # | Country | Investing.com Ticker | Direct URL |
|---|---------|---------------------|------------|
| 1 | United States 5Y CDS | `USGV5YUSAB=R` | investing.com/rates-bonds/united-states-cds-5-years-usd |
| 2 | Germany 5Y CDS | `DEGV5YUSAC=R` | investing.com/rates-bonds/germany-cds-5-year-usd |
| 3 | France 5Y CDS | `FRGV5YUSAC=R` | investing.com/rates-bonds/france-cds-5-years-usd |
| 4 | UK 5Y CDS | `GBGV5YUSAC=R` | investing.com/rates-bonds/uk-cds-5-years-usd |
| 5 | Japan 5Y CDS | `JPGV5YUSAC=R` | investing.com/rates-bonds/japan-cds-5-year-usd |
| 6 | South Korea 5Y CDS | `KRGV5YUSAC=R` | investing.com/rates-bonds/south-korea-cds-5-year-usd |
| 7 | China 5Y CDS | `CNGV5YUSAC=R` | investing.com/rates-bonds/china-cds-5-years-usd |

*Ticker pattern: `[country code]GV5YUSA[B or C]=R` — US uses B, all others use C.*

### Supplementary Bookmarks

- WorldGovernmentBonds.com — sovereign spreads, CDS, ratings: https://www.worldgovernmentbonds.com/
- WorldGovernmentBonds.com — spread table: https://www.worldgovernmentbonds.com/spread-historical-data/
- WorldGovernmentBonds.com — sovereign CDS: https://www.worldgovernmentbonds.com/sovereign-cds/
- Investing.com — World CDS overview table: https://www.investing.com/rates-bonds/world-cds

---

## 13. Known Limitations & Future Iteration Path

### IOC Limitations
- Foreign sovereign yields are monthly (OECD/FRED), not daily. Investing.com watchlist provides daily resolution.
- China 10Y not on FRED — Investing.com only.
- Energy data (WTI, Brent, Henry Hub, TTF, JKM) not in dashboard — Investing.com watchlist only. Energy spreads (WTI-Brent, Henry Hub-TTF with unit conversion) cannot be computed natively.
- Sovereign CDS not in dashboard — Investing.com watchlist with explainer tab provides the convergence/divergence framework. Free daily data available through Investing.com resolves previous assumption that CDS required a commercial data feed.
- NY Fed ACM term premium requires manual entry (no API).
- Some sectoral JOLTS and output series need verification during implementation.
- CNY-CNH spread (onshore-offshore yuan, capital control pressure indicator) deferred.

### Future Iterations
1. **Investing.com embeddable widgets (near-term, post-launch):** Investing.com offers free iframe-based widgets (https://www.investing.com/webmaster-tools/) that could upgrade the explainer tabs from link-outs to embedded live data. Most relevant: Interest Rates streaming table (live sovereign yields in-dashboard), Technical HTML5 Charts (multi-instrument comparison chart for convergence/divergence visual with daily resolution — supports ~5,000 instruments including bonds and commodities), Exchange Rates table, and Economic Calendar (upcoming BLS releases, FOMC meetings, etc.). These render on GitHub Pages but come with Investing.com styling/branding. Recommended approach: experiment with embedding into the explainer tabs post-launch. If they integrate cleanly with the dark theme and don't introduce layout or dependency issues, keep them as an upgrade over the watchlist link-out approach.
2. **Energy panel (native):** If free TTF/JKM API sources emerge, or if a GitHub Actions daily fetch via yfinance for TTF becomes feasible, bring energy into the dashboard with computed spreads and unit conversion
3. **Daily foreign yields:** Paid API (Finnworlds ~$99/mo) or central bank website scraping
4. **CDS integration into dashboard:** If Investing.com data can be scraped or an API identified, bring CDS into the native convergence/divergence chart alongside the yield-based version
5. **Automated term premium:** NY Fed CSV scraper via GitHub Actions
6. **Observation log:** Text input per panel for logging observations (connecting dashboard to monitoring brief format)
7. **Historical regime backtest:** Overlay historical regime episodes on charts
8. **Additional domestic panels:** Governance reform tracking, immigration/demographics
9. **Alert notifications:** Email or push when threshold breaches occur
