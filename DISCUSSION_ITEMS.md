# Dashboard Discussion Items

Items requiring further research or design decisions before implementation.
Bring this file to Claude Desktop for spec refinement, then return with a spec to implement.

---

## Item 1: Automate NAFTA & China Import Share from FRED

**Current state:** Both NAFTA Share and China Share of US Imports are manually entered via the Settings form. The data exists on FRED.

**Proposed automation:**
- Pull 4 FRED series: `IMP0004` (Total US Goods Imports), `IMPCH` (China), `IMPCA` (Canada), `IMPX` (Mexico)
- Calculate trailing 12-month sums (NSA) to smooth seasonality
- NAFTA Share = (IMPCA + IMPX) / IMP0004 × 100
- China Share = IMPCH / IMP0004 × 100
- Display auto-calculated value in Panel 1 / Bond Explainer alongside the existing display
- Keep manual entry field as an override in case FRED data lags

**Open questions:**
1. **Seasonal adjustment:** Are `IMP0004`, `IMPCH`, `IMPCA`, and `IMPX` all non-seasonally adjusted (NSA)? CLEANUP.md notes this needs verification before implementing. We need all four to be the same adjustment type, or the ratio will be distorted.
2. **Display:** Should the auto-calculated value *replace* the manual entry field, or sit alongside it with a label like "FRED (auto)" vs "Manual (override)"? The manual entry currently appears in Panel 1's structural baseline section.
3. **Update frequency:** FRED trade data lags by about 5-6 weeks. Should we show a "data as of [date]" label next to the computed value?
4. **Rounding:** Display to 1 decimal place (e.g., "14.3%") or whole number?

---

## Item 2: Split Education & Health into Separate Sectors

**Current state:** The Sectoral Comparison Matrix has one row called "Ed & Health" that mixes:
- Employment data: Healthcare & Social Assistance only (`CES6562000001`)
- Wages data: Education & Health Services combined (`CES6500000011`)
- Openings data: Healthcare & Social Assistance only (`JTS6200JOL`)

**Proposed split:** Create two separate rows — Health Care and Educational Services.

**Health Care (data likely available):**
- Employment: `CES6562000001` (Healthcare & Social Assistance — already in use)
- Wages: Need a healthcare-specific wages series (not the combined `CES6500000011`)
- Openings: `JTS6200JOL` (Healthcare & Social Assistance — already in use)

**Educational Services (needs verification):**
- Employment: `CES6561000001`? — needs FRED verification
- Wages: `CES6561000011`? — needs FRED verification
- Openings: No JOLTS series identified — CLEANUP.md flags this as unknown

**Open questions:**
1. **FRED series verification:** Do `CES6561000001` and `CES6561000011` exist on FRED with adequate history (5+ years)? What is the correct healthcare-specific wages series?
2. **Missing openings for Education:** JOLTS doesn't break out Education separately from Healthcare in the public data. Should the Education row show "--" for openings, or is there a workaround?
3. **Matrix layout:** Currently 5 sector rows. Adding a 6th will make the table taller. Does this fit well on mobile? Should we paginate or allow the table to scroll?
4. **Signal derivation:** With missing openings data for Education, the signal algorithm (`deriveSignal()`) may not fire correctly. Should Education use a simplified signal logic that excludes openings?

---

## Item 3: Consistent Currency Pair Convention

**Current state:** FX table in Panel 5 shows 5 currency pairs with inconsistent directionality:
- `EUR/USD` — expressed as "USD per EUR" (higher = stronger Euro, weaker dollar)
- `GBP/USD` — expressed as "USD per GBP" (higher = stronger Pound, weaker dollar)
- `USD/JPY` — expressed as "JPY per USD" (higher = stronger dollar, weaker Yen)
- `USD/CNY` — expressed as "CNY per USD" (higher = stronger dollar, weaker Yuan)
- `USD/KRW` — expressed as "KRW per USD" (higher = stronger dollar, weaker Won)

The code handles this with an `invertDisplay` flag, but the mixed convention can confuse users who expect a consistent "dollar strength" signal across all rows.

**Options:**
- **Option A: Keep market convention** — EUR/USD and GBP/USD are always quoted this way in markets; changing them would be unorthodox. Add a "Direction" column or tooltip note explaining the convention for each pair.
- **Option B: Normalize all to USD-as-base** — All pairs show "units of foreign per USD" (USD/EUR, USD/GBP, USD/JPY, USD/CNY, USD/KRW). Higher always = stronger dollar. Requires inverting EUR and GBP FRED values.
- **Option C: Normalize all to USD-as-quote** — All pairs show "USD per foreign" (EUR/USD, GBP/USD, JPY/USD, CNY/USD, KRW/USD). Higher always = weaker dollar. Requires inverting JPY, CNY, KRW FRED values.

**Open questions:**
1. Which convention is most intuitive for your target audience (macro-focused, Bloomberg-familiar users)?
2. Should direction arrows in the table be normalized to "green = dollar strengthening" regardless of pair convention, or should they reflect the raw pair movement?
3. If we normalize, do the pair labels in the table change (e.g., "JPY/USD" instead of "USD/JPY")?

---

## Item 4: Add Productivity Column to Sectoral Matrix

**Current state:** The Output column in the sectoral matrix shows "--" for all sectors except Manufacturing (which has BEA data via FRED). CLEANUP.md notes this as a gap.

**Proposed enhancement:** Add a Productivity column (Output per Worker, or Output per Hour).

**Open questions:**
1. **Data availability:** BLS publishes productivity data by sector, but is it available via an API? Does FRED carry BLS Major Sector Productivity series (`PRS85006092` for Nonfarm Business, etc.)? Are there sector-specific productivity series for the 5 sectors in the matrix?
2. **Definition:** Should "productivity" be output per worker (requires both employment and output data) or output per hour worked? The latter requires hours data as well.
3. **Frequency:** BLS productivity data is typically quarterly. The matrix currently uses monthly employment and openings data. Is mixing frequencies acceptable, or should productivity be a separate card/section?
4. **Alternative:** Could we simplify by showing just the BLS Labor Productivity index for Nonfarm Business as a single macro card in Panel 2 (Domestic Credit & Credibility) rather than per-sector columns?

---

## Item 5: Information Sector Openings (JOLTS)

**Current state:** The Information sector row in the Sectoral Matrix shows "--" for Openings because no JOLTS series ID is configured. CLEANUP.md flags this as needing research.

**JOLTS structure:** BLS JOLTS data uses NAICS codes. Information is NAICS 51.

**Candidate series:** `JTS5100JOL` (Information sector job openings) — needs FRED verification.

**Open questions:**
1. Does `JTS5100JOL` exist on FRED with adequate history?
2. If not, is the data available via direct BLS API, and is it worth adding a second data source beyond FRED?
3. The current Information sector config has `openings: null` — is this intentional (data known to be unavailable) or simply not yet researched?

---

## Implementation Priority Suggestion

Once specs are confirmed, suggested order:
1. **Item 5** (Information JOLTS) — smallest change, just add a series ID if it exists
2. **Item 1** (NAFTA/China automation) — self-contained, mainly needs SA/NSA confirmation
3. **Item 3** (Currency convention) — needs design decision, then straightforward to implement
4. **Item 2** (Ed/Health split) — most complex, depends on FRED series verification
5. **Item 4** (Productivity) — most uncertain, may require data source beyond FRED
