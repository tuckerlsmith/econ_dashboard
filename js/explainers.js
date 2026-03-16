/**
 * Explainers Module
 * Tooltip content, Bond Explainer tab, Energy Explainer tab
 */

import { getManualEntry } from './settings.js';
import { calculateImportShares } from './calculations.js';

// ============================================
// Indicator Explainer Content
// ============================================

export const EXPLAINERS = {
    'regime-classifier': {
        title: 'Dollar Regime Classifier',
        content: `The regime classifier uses a 60-day rolling correlation between US 10Y yield changes and dollar index changes, combined with yield direction (20-day MA), to identify four market regimes:

<strong>Regime 1 (Green):</strong> Yields up, dollar up — capital attracted by higher rates. Normal tightening cycle.

<strong>Regime 2 (Red):</strong> Yields up, dollar down — loss of sovereign confidence. Fiscal/institutional stress signal.

<strong>Regime 3 (Blue):</strong> Yields down, dollar up — risk-off safe haven demand. Flight to safety.

<strong>Regime 4 (Yellow):</strong> Yields down, dollar down — capital seeking returns elsewhere. Easing/stimulus environment.`,
        framework: 'Core regime signal for interpreting all other indicators.'
    },

    'correlation': {
        title: '60-Day Yield-Dollar Correlation',
        content: `Pearson correlation between daily changes in US 10Y yield and trade-weighted dollar index over the trailing 60 trading days.

<strong>Positive correlation (>+0.3):</strong> Traditional monetary policy transmission — higher rates attract capital, strengthening dollar.

<strong>Negative correlation (<-0.3):</strong> Potential credibility concern — rates rising but capital leaving, or rates falling with safe-haven inflows.

<strong>Near zero:</strong> Indeterminate regime, no clear signal.`,
        framework: 'Primary input to regime classification.'
    },

    'term-premium': {
        title: 'NY Fed ACM Term Premium',
        content: `The term premium is the extra yield investors require to hold long-term bonds instead of rolling short-term bonds. Calculated by the NY Fed using the Adrian-Crump-Moench model.

<strong>Low/negative:</strong> Strong demand for duration, often flight-to-safety or QE effects.

<strong>High (>100 bps):</strong> Investors demanding compensation for duration risk — fiscal concerns, inflation uncertainty, or reduced foreign demand.`,
        framework: 'Rising term premium with falling dollar = Regime 2 warning signal.'
    },

    '5y5y-forward': {
        title: '5Y5Y Forward Inflation Rate',
        content: `Market-implied inflation expectation for the 5-year period starting 5 years from now. Derived from TIPS breakevens.

<strong>Anchored (2.0-2.5%):</strong> Markets trust Fed's inflation target.

<strong>Elevated (>3.0%):</strong> Inflation expectations becoming unanchored — credibility concern.

<strong>Very low (<1.5%):</strong> Deflation fears or recession expectations.`,
        framework: 'De-anchoring inflation expectations amplify Regime 2 risk.'
    },

    'hy-oas': {
        title: 'High Yield Option-Adjusted Spread',
        content: `The spread between high-yield (junk) corporate bonds and Treasury yields, adjusted for embedded options. Measures credit risk appetite.

<strong>300-400 bps:</strong> Normal risk appetite, healthy credit conditions.

<strong>400-500 bps:</strong> Elevated caution, some stress emerging.

<strong>500-800 bps:</strong> Significant stress, risk-off environment.

<strong>>800 bps:</strong> Crisis conditions, credit markets seizing.`,
        framework: 'Widening spreads confirm risk-off; watch for divergence from equity signals.'
    },

    'yield-curve': {
        title: 'Yield Curve (10Y-2Y Spread)',
        content: `The difference between 10-year and 2-year Treasury yields. Classic recession indicator.

<strong>Positive (normal):</strong> Longer maturities yield more — healthy term structure.

<strong>Flat/Inverted:</strong> Short rates exceed long rates — historically precedes recessions by 12-18 months.

<strong>Steepening from inversion:</strong> Often occurs as recession begins, not ends.`,
        framework: 'Inversion + Regime 2 = elevated recession + credibility risk.'
    },

    'deficit-gdp': {
        title: 'Federal Deficit as % of GDP',
        content: `Trailing 12-month federal budget deficit relative to GDP. Measures fiscal sustainability.

<strong><5%:</strong> Sustainable range for developed economy.

<strong>5-8%:</strong> Elevated, requires favorable growth/rate conditions.

<strong>>8%:</strong> Approaching danger zone — debt spiral risk if rates rise.`,
        framework: 'High deficits + rising term premium = fiscal dominance concern.'
    },

    'credit-credibility': {
        title: 'Credit & Credibility Panel',
        content: `This panel monitors domestic financial conditions and fiscal credibility through credit spreads, yield curve shape, and deficit metrics.

Key relationships to watch:
- HY spreads widening + yield curve steepening = recession signal
- Deficit rising + term premium rising = fiscal credibility stress
- All three deteriorating = potential Regime 2 trigger`,
        framework: 'Composite view of domestic financial stress.'
    },

    'sector-matrix': {
        title: 'Sectoral Comparison Matrix',
        content: `Compares employment, wages, job openings, and output across key sectors to identify structural labor market signals.

<strong>Signals:</strong>
- <em>Cost Pathology:</em> Employment up, output flat — declining productivity
- <em>Earnings Concentration:</em> Output up, employment down — automation/efficiency
- <em>Skills Gap:</em> Openings up, employment flat — labor mismatch
- <em>AI Displacement:</em> Employment and openings both down — structural decline
- <em>Supply Capacity:</em> All metrics up — healthy expansion`,
        framework: 'Sectoral divergence can signal structural vs cyclical dynamics.'
    },

    'employment': {
        title: 'Employment (All Employees)',
        content: `Total number of employees in the sector, in thousands. From BLS Current Employment Statistics (CES).

YoY change indicates sector growth/contraction trend.`,
        framework: 'Compare with openings to identify skills gaps or displacement.'
    },

    'wages': {
        title: 'Average Annual Earnings',
        content: `Average annual earnings for all employees in the sector (weekly earnings × 52.14 weeks). Combines hourly wages and hours worked.

YoY change indicates wage pressure — high growth may signal labor shortages or inflation pressure.`,
        framework: 'Wage growth outpacing productivity = cost pathology signal.'
    },

    'openings': {
        title: 'Job Openings (JOLTS)',
        content: `Number of job openings in the sector, from the Job Openings and Labor Turnover Survey.

High openings relative to hiring = skills gap or labor shortage.`,
        framework: 'Openings up + employment down = skills mismatch signal.'
    },

    'output': {
        title: 'Industrial Production Index',
        content: `Output index for the sector (where available). Manufacturing uses the Industrial Production: Manufacturing index.

Compare with employment to assess productivity trends.`,
        framework: 'Output/employment ratio trends indicate productivity.'
    },

    'domestic-expenses': {
        title: 'Domestic Expenses (CPI Components)',
        content: `Key CPI components that drive household cost pressures:

<strong>Shelter:</strong> Largest CPI weight (~35%). Sticky, lags rent trends by 12-18 months.

<strong>Medical Care:</strong> Structurally rising due to demographics and technology.

<strong>Energy:</strong> Most volatile. Drives short-term CPI swings.`,
        framework: 'Shelter persistence can anchor core inflation even as goods deflate.'
    },

    'cpi-shelter': {
        title: 'Shelter CPI',
        content: `Consumer Price Index for shelter (rent + owners equivalent rent). Largest component of core CPI at ~35% weight.

Sticky and slow-moving — lags market rent trends by 12-18 months due to measurement methodology.`,
        framework: 'Key driver of core inflation persistence.'
    },

    'cpi-medical': {
        title: 'Medical Care CPI',
        content: `Consumer Price Index for medical care services and commodities.

Structurally trends higher than overall inflation due to demographics, technology costs, and insurance dynamics.`,
        framework: 'Contributes to long-term inflation floor.'
    },

    'cpi-energy': {
        title: 'Energy CPI',
        content: `Consumer Price Index for energy (gasoline, electricity, natural gas).

Most volatile CPI component — drives headline vs core divergence. Often leads turns in headline inflation.`,
        framework: 'Watch for second-round effects into core categories.'
    },

    'convergence': {
        title: 'Yield Convergence/Divergence',
        content: `Tracks whether global sovereign yields are moving together (convergence) or apart (divergence).

<strong>Convergence:</strong> Global growth synchronization, coordinated policy.

<strong>Divergence:</strong> Policy divergence, relative value opportunities, potential FX pressure.

US-Bund spread widening often strengthens dollar; narrowing weakens it.`,
        framework: 'Yield differentials drive FX carry trades.'
    },

    'us-bund': {
        title: 'US-Bund Spread',
        content: `Difference between US 10Y yield and German Bund yield. Primary transatlantic rate differential.

<strong>Widening:</strong> US yields rising faster — typically USD positive.

<strong>Narrowing:</strong> Convergence — may weaken USD vs EUR.`,
        framework: 'Key driver of EUR/USD movements.'
    },

    'bund-oat': {
        title: 'Bund-OAT Spread',
        content: `Difference between French OAT and German Bund yields. Measures eurozone peripheral stress.

<strong>Widening:</strong> France perceived as riskier — eurozone stress indicator.

<strong>Narrowing:</strong> Confidence in eurozone cohesion.`,
        framework: 'Watch during eurozone political events.'
    },

    'us-jgb': {
        title: 'US-JGB Spread',
        content: `Difference between US 10Y yield and Japanese JGB yield.

Japan's yield curve control (YCC) policy creates a floor under this spread. Changes in BOJ policy can cause sharp moves.`,
        framework: 'Wide spread + yen weakness = carry trade pressure.'
    }
};

// ============================================
// Bond Explainer Tab Content
// ============================================

export const BOND_EXPLAINER_SECTIONS = [
    {
        id: 'quick-links',
        title: 'Quick Links',
        content: `
            <div class="quick-links-grid">
                <a href="https://www.newyorkfed.org/research/data_indicators/term-premia-tabs" target="_blank" rel="noopener">NY Fed Term Premium</a>
                <a href="https://fred.stlouisfed.org/series/DGS10" target="_blank" rel="noopener">FRED 10Y Yield</a>
                <a href="https://www.investing.com/rates-bonds/government-bond-spreads" target="_blank" rel="noopener">Investing.com Spreads</a>
                <a href="https://www.worldgovernmentbonds.com/" target="_blank" rel="noopener">World Government Bonds</a>
                <a href="https://data.imf.org/COFER" target="_blank" rel="noopener">IMF COFER (Reserves)</a>
                <a href="https://www.swift.com/our-solutions/compliance-and-shared-services/business-intelligence/renminbi/rmb-tracker" target="_blank" rel="noopener">SWIFT RMB Tracker</a>
            </div>
        `
    },
    {
        id: 'reading-yields',
        title: 'Reading Sovereign Yields',
        content: `
            <p>Sovereign bond yields reflect the market's assessment of:</p>
            <ul>
                <li><strong>Policy rate expectations:</strong> Where the central bank is heading</li>
                <li><strong>Inflation expectations:</strong> Compensation for purchasing power loss</li>
                <li><strong>Term premium:</strong> Extra yield for duration risk</li>
                <li><strong>Credit risk:</strong> Default probability (minimal for G7, higher for EM)</li>
            </ul>
            <p>When yields rise, watch <em>why</em> — growth optimism (healthy) vs. fiscal concerns (unhealthy) have opposite implications.</p>
        `
    },
    {
        id: 'reading-spreads',
        title: 'Reading Yield Spreads',
        content: `
            <p>Spreads between sovereign yields reveal relative value and risk perceptions:</p>
            <ul>
                <li><strong>US-Bund:</strong> Transatlantic rate differential, key EUR/USD driver</li>
                <li><strong>Bund-OAT:</strong> Eurozone cohesion stress gauge</li>
                <li><strong>US-JGB:</strong> BOJ policy sensitivity, yen carry pressure</li>
                <li><strong>EM spreads:</strong> Global risk appetite indicator</li>
            </ul>
            <p>Spread changes often matter more than absolute levels for FX movements.</p>
        `
    },
    {
        id: 'sovereign-cds',
        title: 'Sovereign CDS Context',
        content: `
            <p>Credit default swaps provide market-implied default probabilities. For major sovereigns:</p>
            <ul>
                <li><strong>US CDS:</strong> Typically 10-30 bps, spikes during debt ceiling drama</li>
                <li><strong>Germany CDS:</strong> Eurozone safe haven, usually lowest in EU</li>
                <li><strong>Japan CDS:</strong> Low despite high debt/GDP due to domestic ownership</li>
            </ul>
            <p>CDS widening without yield moves suggests credit concern distinct from rate expectations.</p>
        `
    },
    {
        id: 'convergence-framework',
        title: 'Convergence/Divergence Framework',
        content: `
            <p>Global yield convergence or divergence signals different market regimes:</p>
            <ul>
                <li><strong>Convergence (yields moving together):</strong> Synchronized global growth, coordinated policy, risk-on</li>
                <li><strong>Divergence (yields moving apart):</strong> Policy divergence, relative value trades, FX volatility</li>
            </ul>
            <p>The US often leads global yield direction. Watch for "decoupling" narratives as potential turning points.</p>
        `
    },
    {
        id: 'country-context',
        title: 'Country Context',
        content: `
            <p><strong>United States:</strong> Global risk-free benchmark, reserve currency issuer</p>
            <p><strong>Germany:</strong> Eurozone anchor, safe haven within EU</p>
            <p><strong>France:</strong> Core eurozone but higher debt, political risk</p>
            <p><strong>United Kingdom:</strong> Post-Brexit repricing, gilt market volatility</p>
            <p><strong>Japan:</strong> YCC policy, massive BOJ holdings, aging demographics</p>
            <p><strong>South Korea:</strong> EM proxy, tech cycle sensitive</p>
            <p><strong>China:</strong> Capital controls limit price discovery, watch for policy signals</p>
        `
    },
    {
        id: 'structural-baseline',
        title: 'Structural Baseline Data',
        content: 'DYNAMIC' // Will be replaced with manual entry values
    }
];

// ============================================
// Energy Explainer Tab Content
// ============================================

export const ENERGY_EXPLAINER_SECTIONS = [
    {
        id: 'quick-links',
        title: 'Quick Links',
        content: `
            <div class="quick-links-grid">
                <a href="https://www.eia.gov/petroleum/data.php" target="_blank" rel="noopener">EIA Petroleum Data</a>
                <a href="https://www.investing.com/commodities/crude-oil" target="_blank" rel="noopener">WTI Crude (Investing.com)</a>
                <a href="https://www.investing.com/commodities/brent-oil" target="_blank" rel="noopener">Brent Crude</a>
                <a href="https://www.investing.com/commodities/natural-gas" target="_blank" rel="noopener">Henry Hub Natural Gas</a>
                <a href="https://tradingeconomics.com/commodity/eu-natural-gas" target="_blank" rel="noopener">TTF European Gas</a>
            </div>
        `
    },
    {
        id: 'three-benchmarks',
        title: 'Three Oil Benchmarks',
        content: `
            <p>Global oil pricing revolves around three key benchmarks:</p>
            <ul>
                <li><strong>WTI (West Texas Intermediate):</strong> US benchmark, Cushing OK delivery, lighter/sweeter crude</li>
                <li><strong>Brent:</strong> Global benchmark, North Sea origin, prices ~60% of world's traded crude</li>
                <li><strong>Dubai/Oman:</strong> Asian benchmark, heavier/sourer crude, Middle East exports</li>
            </ul>
            <p>Brent-WTI spread reflects US export capacity and Atlantic basin dynamics.</p>
        `
    },
    {
        id: 'wti-brent-spread',
        title: 'WTI-Brent Spread Dynamics',
        content: `
            <p>The WTI-Brent spread historically:</p>
            <ul>
                <li><strong>Pre-2011:</strong> WTI at premium (US demand, import dependence)</li>
                <li><strong>2011-2015:</strong> WTI discount (shale boom, export ban, Cushing glut)</li>
                <li><strong>Post-2015:</strong> Narrowed with US export capacity, typically Brent at small premium</li>
            </ul>
            <p>Wide Brent premium = US oversupply or export constraints. WTI premium = global stress, US safe haven.</p>
        `
    },
    {
        id: 'gas-regionalization',
        title: 'Natural Gas Regionalization',
        content: `
            <p>Unlike oil, natural gas markets remain regional due to transport constraints:</p>
            <ul>
                <li><strong>Henry Hub (US):</strong> Lowest prices globally, shale abundance, limited LNG export</li>
                <li><strong>TTF (Europe):</strong> Higher prices, pipeline dependence (Russia), LNG competition</li>
                <li><strong>JKM (Asia):</strong> Premium pricing, LNG import dependence, demand growth</li>
            </ul>
            <p>LNG expansion is gradually linking these markets. Watch TTF-Henry Hub spread for arbitrage pressure.</p>
        `
    },
    {
        id: 'energy-framework',
        title: 'Framework Connection',
        content: `
            <p>Energy prices connect to the macro framework through:</p>
            <ul>
                <li><strong>Inflation:</strong> Direct CPI impact, second-round effects on wages</li>
                <li><strong>Dollar:</strong> Oil priced in USD creates natural correlation</li>
                <li><strong>Growth:</strong> Energy as input cost, consumer spending power</li>
                <li><strong>Geopolitics:</strong> Supply disruption risk, sanctions effects</li>
            </ul>
            <p>Energy shocks can trigger regime changes — watch for Regime 2 risk if supply shock meets weak credibility.</p>
        `
    }
];

// ============================================
// Tooltip/Explainer Display Functions
// ============================================

let activeTooltip = null;
let activeBottomSheet = null;

/**
 * Show an explainer tooltip (desktop) or bottom sheet (mobile)
 * @param {string} explainerId - Key from EXPLAINERS object
 * @param {HTMLElement} triggerElement - The element that triggered the explainer
 * @param {boolean} isMobile - Whether to show mobile bottom sheet
 */
export function showExplainer(explainerId, triggerElement, isMobile = false) {
    const explainer = EXPLAINERS[explainerId];
    if (!explainer) {
        console.warn('Unknown explainer:', explainerId);
        return;
    }

    // Close any existing tooltip/sheet
    hideExplainer();

    if (isMobile) {
        showBottomSheet(explainer);
    } else {
        showTooltip(explainer, triggerElement);
    }
}

/**
 * Show a tooltip near the trigger element
 */
function showTooltip(explainer, triggerElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'explainer-tooltip';
    tooltip.innerHTML = `
        <div class="explainer-tooltip-header">
            <span class="explainer-tooltip-title">${explainer.title}</span>
            <button class="explainer-tooltip-close">&times;</button>
        </div>
        <div class="explainer-tooltip-content">${explainer.content}</div>
        ${explainer.framework ? `<div class="explainer-tooltip-framework">${explainer.framework}</div>` : ''}
    `;

    document.body.appendChild(tooltip);

    // Position tooltip near trigger
    const rect = triggerElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.bottom + 8;

    // Keep tooltip within viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight - 10) {
        top = rect.top - tooltipRect.height - 8;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Add close handler
    tooltip.querySelector('.explainer-tooltip-close').addEventListener('click', hideExplainer);

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 10);

    activeTooltip = tooltip;
}

/**
 * Show a bottom sheet (mobile)
 */
function showBottomSheet(explainer) {
    const sheet = document.createElement('div');
    sheet.className = 'explainer-bottom-sheet';
    sheet.innerHTML = `
        <div class="bottom-sheet-overlay"></div>
        <div class="bottom-sheet-content">
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <span class="bottom-sheet-title">${explainer.title}</span>
                <button class="bottom-sheet-close">&times;</button>
            </div>
            <div class="bottom-sheet-body">${explainer.content}</div>
            ${explainer.framework ? `<div class="bottom-sheet-framework">${explainer.framework}</div>` : ''}
        </div>
    `;

    document.body.appendChild(sheet);

    // Trigger animation
    requestAnimationFrame(() => {
        sheet.classList.add('visible');
    });

    // Add close handlers
    sheet.querySelector('.bottom-sheet-close').addEventListener('click', hideExplainer);
    sheet.querySelector('.bottom-sheet-overlay').addEventListener('click', hideExplainer);

    // Swipe-to-dismiss handling
    const content = sheet.querySelector('.bottom-sheet-content');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    content.addEventListener('touchstart', (e) => {
        // Only start drag from handle or header area
        const touch = e.touches[0];
        const rect = content.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;

        // Allow drag from top 60px (handle + header area)
        if (touchY < 60) {
            startY = touch.clientY;
            isDragging = true;
            content.style.transition = 'none';
        }
    }, { passive: true });

    content.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Only allow dragging down
        if (deltaY > 0) {
            content.style.transform = `translateY(${deltaY}px)`;
        }
    }, { passive: true });

    content.addEventListener('touchend', () => {
        if (!isDragging) return;

        isDragging = false;
        content.style.transition = '';

        const deltaY = currentY - startY;

        // If dragged more than 100px down, dismiss
        if (deltaY > 100) {
            hideExplainer();
        } else {
            // Snap back
            content.style.transform = '';
        }
    });

    activeBottomSheet = sheet;
}

/**
 * Hide any active explainer
 */
export function hideExplainer() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }

    if (activeBottomSheet) {
        activeBottomSheet.classList.remove('visible');
        setTimeout(() => {
            activeBottomSheet?.remove();
            activeBottomSheet = null;
        }, 300);
    }

    document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(e) {
    if (activeTooltip && !activeTooltip.contains(e.target) && !e.target.classList.contains('info-icon')) {
        hideExplainer();
    }
}

// ============================================
// Tab Content Rendering
// ============================================

/**
 * Render the Bond Explainer tab content
 * @param {HTMLElement} container - Container element
 */
export function renderBondExplainerTab(container, getSeriesData) {
    const html = BOND_EXPLAINER_SECTIONS.map(section => {
        let content = section.content;

        // Handle dynamic structural baseline section
        if (section.id === 'structural-baseline') {
            content = renderStructuralBaseline(getSeriesData);
        }

        return `
            <div class="explainer-section" data-section="${section.id}">
                <button class="explainer-section-header">
                    <span class="explainer-section-title">${section.title}</span>
                    <span class="explainer-section-toggle">+</span>
                </button>
                <div class="explainer-section-content">
                    ${content}
                </div>
            </div>
        `;
    }).join('');

    const watchlistBar = `
        <div class="watchlist-bar">
            <span class="watchlist-bar-label">Watchlists</span>
            <a class="watchlist-link" href="https://www.investing.com/portfolio/?portfolioID=MDJmNmYwMmxjM2xlZzI5Pw%3D%3D" target="_blank" rel="noopener noreferrer">CDS Watchlist</a>
            <a class="watchlist-link" href="https://www.investing.com/portfolio/?portfolioID=NzU2ZjRiN2llNTszbj02NA%3D%3D" target="_blank" rel="noopener noreferrer">Bond Watchlist</a>
        </div>
    `;

    container.innerHTML = `<div class="explainer-content">${html}${watchlistBar}</div>`;

    // Add toggle handlers
    container.querySelectorAll('.explainer-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.explainer-section');
            section.classList.toggle('expanded');
            header.querySelector('.explainer-section-toggle').textContent =
                section.classList.contains('expanded') ? '−' : '+';
        });
    });

    // Expand first section by default
    const firstSection = container.querySelector('.explainer-section');
    if (firstSection) {
        firstSection.classList.add('expanded');
        firstSection.querySelector('.explainer-section-toggle').textContent = '−';
    }
}

/**
 * Render the Energy Explainer tab content
 * @param {HTMLElement} container - Container element
 */
export function renderEnergyExplainerTab(container) {
    const html = ENERGY_EXPLAINER_SECTIONS.map(section => `
        <div class="explainer-section" data-section="${section.id}">
            <button class="explainer-section-header">
                <span class="explainer-section-title">${section.title}</span>
                <span class="explainer-section-toggle">+</span>
            </button>
            <div class="explainer-section-content">
                ${section.content}
            </div>
        </div>
    `).join('');

    const watchlistBar = `
        <div class="watchlist-bar">
            <span class="watchlist-bar-label">Watchlists</span>
            <a class="watchlist-link" href="https://www.investing.com/portfolio/?portfolioID=NTc0ZGA2Yz0wYDw0ZzJkZA%3D%3D" target="_blank" rel="noopener noreferrer">Energy Watchlist</a>
        </div>
    `;

    container.innerHTML = `<div class="explainer-content">${html}${watchlistBar}</div>`;

    // Add toggle handlers
    container.querySelectorAll('.explainer-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.explainer-section');
            section.classList.toggle('expanded');
            header.querySelector('.explainer-section-toggle').textContent =
                section.classList.contains('expanded') ? '−' : '+';
        });
    });

    // Expand first section by default
    const firstSection = container.querySelector('.explainer-section');
    if (firstSection) {
        firstSection.classList.add('expanded');
        firstSection.querySelector('.explainer-section-toggle').textContent = '−';
    }
}

/**
 * Render structural baseline data.
 * NAFTA and China import shares are auto-calculated from FRED when available;
 * falls back to manual entry if FRED data is missing.
 * @param {Function} getSeriesData - Series data accessor from app.js
 */
function renderStructuralBaseline(getSeriesData) {
    // Auto-calculate import shares from FRED if data is available
    const importShares = getSeriesData ? calculateImportShares(getSeriesData) : null;

    const formatDataThrough = (isoDate) => {
        if (!isoDate) return '';
        const d = new Date(isoDate + 'T00:00:00'); // avoid timezone shift
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const rows = [
        { key: 'dollarReserveShare', label: 'USD Share of Global Reserves', unit: '%', auto: null },
        { key: 'dollarInvoicingShare', label: 'USD Invoicing Share', unit: '%', auto: null },
        {
            key: 'naftaShareImports',
            label: 'NAFTA Share of US Imports',
            unit: '%',
            auto: importShares ? { value: importShares.nafta, dataThrough: importShares.dataThrough } : null
        },
        {
            key: 'chinaShareImports',
            label: 'China Share of US Imports',
            unit: '%',
            auto: importShares ? { value: importShares.china, dataThrough: importShares.dataThrough } : null
        },
        { key: 'rmbSwiftShare', label: 'RMB Share of SWIFT Payments', unit: '%', auto: null }
    ].map(entry => {
        let value, updated;

        if (entry.auto) {
            value = `${entry.auto.value.toFixed(1)}${entry.unit}`;
            updated = `<span class="baseline-auto">FRED auto · Data through ${formatDataThrough(entry.auto.dataThrough)}</span>`;
        } else {
            const data = getManualEntry(entry.key);
            value = data ? `${data.value}${entry.unit}` : '<span class="no-data">Not set</span>';
            updated = data ? formatDate(data.lastUpdated) : '';
        }

        return `
            <tr>
                <td>${entry.label}</td>
                <td class="baseline-value">${value}</td>
                <td class="baseline-updated">${updated}</td>
            </tr>
        `;
    }).join('');

    return `
        <p>Import shares auto-calculated from FRED (trailing 12-month sums). Other values via Settings.</p>
        <table class="baseline-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Source / Updated</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
