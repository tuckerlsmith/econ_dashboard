# Cleanup Items

Issues to address after all phases complete:

## Styling
- [x] Bottom bar HY OAS threshold coloring not applying (CSS selector issue) — was already fixed

## Enhancements
- [x] Regime duration tracking (days in current regime)
- [x] Regime 2 alert styling (amber >5 days, red pulse >30 days)
- [ ] Split Ed & Health into separate sectors in Sectoral Comparison Matrix (deferred — need to verify Education FRED series IDs)
- [x] Convert Avg Weekly Wage to Avg Annual Wage in Sectoral Comparison Matrix
- [x] Context when hovering over all small spark lines (e.g. HY OAS, US 10Y Yield), showing value and date
- [ ] Consistent USD/Other Currency relationships (e.g. all USD as numerator, or as denominator) (deferred — needs design decision)
- [x] Add Investing.com watchlists to tabs
    Yields & Currencies
        Currency Watchlist: https://www.investing.com/portfolio/?portfolioID=ZWcxYWYwYjw3Zzw0N2BiYA%3D%3D
    Bond Explainer
        CDS Watchlist: https://www.investing.com/portfolio/?portfolioID=MDJmNmYwMmxjM2xlZzI5Pw%3D%3D
        Bond Watchlist: https://www.investing.com/portfolio/?portfolioID=NzU2ZjRiN2llNTszbj02NA%3D%3D
    Energy Explainer
        Energy Watchlist: https://www.investing.com/portfolio/?portfolioID=NTc0ZGA2Yz0wYDw0ZzJkZA%3D%3D

## Data/Further Discussion
- [ ] Add productivity as a column to sectoral comparison matrix
- [ ] How to get openings for Information Technology Sector
- [ ] How to get output for Education, Health Care, Proffessional & Business Services, Informaiton Technology, and Construction
- [ ] Automate NAFTA and China share of imports via FRED data pulls and calculate over total trade (Total US Goods: IMP0004, China Imports: IMPCH, Canada Imports: IMPCA, Mexico Imports: IMPX) Need to ensure all are either seasonaly adjusted or not (think we want them to not be since we are using trailing 12 month sums)