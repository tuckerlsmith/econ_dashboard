/**
 * American Antifragility Dashboard - Main Application
 * Orchestrates data flow, state management, and UI rendering
 */

console.log('=== American Antifragility Dashboard ===');
console.log('app.js loading...');
console.log('To reset API key, run in console: localStorage.removeItem("fred_api_key"); location.reload();');

import {
    fetchAllSeries,
    isCacheValid,
    getCachedData,
    getCacheTimestamp,
    getApiKey,
    saveApiKey,
    validateApiKey,
    clearCache,
    getLatestValue,
    getChange,
    getSparklineData
} from './fred.js';

import { SERIES_CONFIG, REGIMES, THRESHOLDS, COUNTRIES, CURRENCIES, SECTORS } from './config.js';

import { calculateRegime as calcRegime } from './calculations.js';

import {
    calculateSectorMetrics,
    formatYoY,
    createSignalBadge
} from './sectors.js';

import {
    createSparkline,
    createCorrelationChart,
    createYieldDollarChart,
    createConvergenceChart
} from './charts.js';

import {
    loadManualEntries as loadManualEntriesFromStorage,
    saveManualEntries as saveManualEntriesToStorage,
    renderSettingsForm as renderSettingsFormFromModule
} from './settings.js';

import {
    showExplainer,
    hideExplainer,
    renderBondExplainerTab,
    renderEnergyExplainerTab
} from './explainers.js';

// ============================================
// Event Bus - Pub/Sub Pattern
// ============================================

export const EventBus = {
    events: {},

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    },

    publish(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in event handler for ${event}:`, e);
                }
            });
        }
    }
};

// ============================================
// Application State
// ============================================

const AppState = {
    // FRED data (keyed by series ID)
    data: {},

    // Regime classifier results
    regime: {
        current: 'indeterminate',
        correlation: null,
        yieldDirection: null,
        duration: 0,
        history: []
    },

    // Manual entries (from localStorage)
    manualEntries: {},

    // UI state
    ui: {
        collapsedGroups: new Set(),
        lastRefresh: null,
        isLoading: false,
        isMobile: window.innerWidth < 768
    },

    // Cache metadata
    cache: {
        timestamp: null,
        isStale: false
    }
};

// State access functions (prevent direct mutation)
export function getState() {
    return { ...AppState };
}

export function getSeriesData(seriesId) {
    return AppState.data[seriesId] || null;
}

export function getRegimeState() {
    return { ...AppState.regime };
}

export function getManualEntry(key) {
    return AppState.manualEntries[key] || null;
}

// State update function
export function updateState(path, value) {
    const keys = path.split('.');
    let target = AppState;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
            target[keys[i]] = {};
        }
        target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    EventBus.publish(`state:${keys[0]}`, AppState[keys[0]]);
}

// ============================================
// Initialization
// ============================================

async function init() {
    console.log('Initializing American Antifragility Dashboard...');

    // Check viewport and set mobile state
    checkMobileViewport();
    window.addEventListener('resize', debounce(checkMobileViewport, 250));

    // Load manual entries from localStorage
    loadManualEntries();

    // Set up UI interactions first (so they work while waiting for API key)
    initEventListeners();
    initPanelGroups();
    initTabs();

    // Check for API key
    const apiKey = getApiKey();
    console.log('API key check:', apiKey ? 'Key found (length: ' + apiKey.length + ')' : 'No key');

    if (!apiKey) {
        console.log('No API key found, showing modal...');
        showApiKeyModal();
        return; // Wait for API key to be entered
    }

    // Initialize the dashboard with data
    await loadDashboardData(apiKey);

    console.log('Dashboard initialized.');
}

// ============================================
// Data Loading
// ============================================

async function loadDashboardData(apiKey, forceRefresh = false) {
    updateState('ui.isLoading', true);
    showLoadingState();

    let data;
    let fromCache = false;

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && isCacheValid()) {
        console.log('Using cached data...');
        data = getCachedData();
        fromCache = true;
        updateState('cache.timestamp', getCacheTimestamp());
        updateState('cache.isStale', false);
    } else {
        // Fetch fresh data
        console.log('Fetching fresh data from FRED...');
        try {
            const result = await fetchAllSeries(SERIES_CONFIG, apiKey, onFetchProgress);
            data = result.data;

            if (result.errors.length > 0) {
                console.warn('Some series failed to fetch:', result.errors);
                showErrorBanner(`${result.errors.length} series failed to load. Using available data.`);
            }

            updateState('cache.timestamp', Date.now());
            updateState('cache.isStale', false);
        } catch (error) {
            console.error('Failed to fetch data:', error);

            // Try to fall back to stale cache
            const staleData = getCachedData();
            if (staleData) {
                data = staleData;
                updateState('cache.isStale', true);
                showErrorBanner('Failed to refresh data. Using cached data.');
            } else {
                showErrorBanner('Failed to load data. Check your API key and connection.');
                updateState('ui.isLoading', false);
                return;
            }
        }
    }

    // Populate state with fetched data
    AppState.data = data;

    // Run calculations (will be expanded in Phase 2)
    runCalculations();

    // Render all panels
    renderAllPanels();

    // Update bottom bar
    updateBottomBar();

    // Update last refresh time display
    updateLastRefreshDisplay(fromCache);

    updateState('ui.isLoading', false);
    hideLoadingState();

    EventBus.publish('data:ready', data);
}

function onFetchProgress(completed, total) {
    const percent = Math.round((completed / total) * 100);
    const progressEl = document.querySelector('.loading-progress');
    if (progressEl) {
        progressEl.textContent = `Loading data... ${percent}%`;
    }
}

// ============================================
// Calculations (Placeholder - expanded in Phase 2)
// ============================================

function runCalculations() {
    // Calculate regime using full algorithm
    calculateRegimeFromData();

    // Additional calculations can be added here
}

function calculateRegimeFromData() {
    const yieldData = getSeriesData('DGS10');
    const dollarData = getSeriesData('DTWEXBGS');

    if (!yieldData || !dollarData) {
        updateState('regime.current', 'indeterminate');
        updateState('regime.correlation', null);
        updateState('regime.yieldDirection', null);
        updateState('regime.correlationHistory', []);
        return;
    }

    // Calculate regime using the full algorithm
    const result = calcRegime(yieldData, dollarData);

    updateState('regime.current', result.regime);
    updateState('regime.correlation', result.correlation);
    updateState('regime.yieldDirection', result.direction);
    updateState('regime.correlationHistory', result.correlationHistory);
    updateState('regime.correlationDates', result.dates);

    // Calculate duration (how long in current regime)
    // For now, just set to 0 - would need historical tracking for accurate duration
    updateState('regime.duration', 0);

    console.log('Regime calculated:', result.regime, 'Correlation:', result.correlation?.toFixed(3));
}

// ============================================
// Rendering
// ============================================

function renderAllPanels() {
    renderPanel1();
    renderPanel2();
    renderPanel3();
    renderPanel4();
    renderPanel5();
    renderExplainerTabs();
}

function renderPanel1() {
    // Regime badge
    const regimeBadge = document.getElementById('regime-badge');
    const regime = AppState.regime.current;
    const regimeConfig = REGIMES[regime] || REGIMES.indeterminate;

    regimeBadge.className = `regime-badge regime-${regime}`;
    regimeBadge.querySelector('.regime-number').textContent =
        regime === 'indeterminate' ? '?' : regime;
    regimeBadge.querySelector('.regime-name').textContent = regimeConfig.name;
    regimeBadge.querySelector('.regime-duration').textContent =
        AppState.regime.duration > 0 ? `${AppState.regime.duration} days` : '';

    // Metric cards
    renderMetricCard('dgs10', 'DGS10', { suffix: '%', decimals: 2 });
    renderMetricCard('dxy', 'DTWEXBGS', { decimals: 2 });
    renderMetricCard('correlation', null, {
        value: AppState.regime.correlation,
        decimals: 2,
        prefix: AppState.regime.correlation > 0 ? '+' : ''
    });
    renderMetricCard('5y5y', 'T5YIFR', { suffix: '%', decimals: 2 });

    // Term premium (manual entry)
    const termPremium = getManualEntry('termPremium');
    const termPremiumCard = document.getElementById('metric-term-premium');
    if (termPremiumCard) {
        termPremiumCard.querySelector('.metric-value').textContent =
            termPremium ? `${termPremium.value} bps` : '--';
        termPremiumCard.querySelector('.metric-delta').textContent =
            termPremium ? `Updated ${formatDate(termPremium.lastUpdated)}` : 'Not set';
    }

    // Render charts
    renderPanel1Charts();
}

function renderPanel1Charts() {
    // Correlation chart (180 days)
    const correlationHistory = AppState.regime.correlationHistory || [];
    const correlationDates = AppState.regime.correlationDates || [];

    if (correlationHistory.length > 0) {
        createCorrelationChart('chart-correlation', correlationHistory, correlationDates);
    }

    // Yield vs Dollar chart (90 days)
    const yieldData = getSeriesData('DGS10');
    const dollarData = getSeriesData('DTWEXBGS');

    if (yieldData && dollarData) {
        // Get last 90 observations (data is sorted desc, so reverse for chronological)
        const yieldObs = yieldData.observations.slice(0, 90).reverse();
        const dollarObs = dollarData.observations.slice(0, 90).reverse();

        createYieldDollarChart('chart-yield-dollar', {
            dates: yieldObs.map(o => o.date),
            values: yieldObs.map(o => o.value)
        }, {
            dates: dollarObs.map(o => o.date),
            values: dollarObs.map(o => o.value)
        });
    }

    // Sparklines for metric cards
    renderMetricSparklines();
}

function renderMetricSparklines() {
    // 10Y Yield sparkline
    const yieldData = getSeriesData('DGS10');
    if (yieldData) {
        const sparklineData = getSparklineData(yieldData, 90);
        if (sparklineData.length > 0) {
            createSparkline('spark-dgs10', sparklineData, { color: '#22c55e', showEndpoint: true });
        }
    }

    // DXY sparkline
    const dollarData = getSeriesData('DTWEXBGS');
    if (dollarData) {
        const sparklineData = getSparklineData(dollarData, 90);
        if (sparklineData.length > 0) {
            createSparkline('spark-dxy', sparklineData, { color: '#f59e0b', showEndpoint: true });
        }
    }

    // 5Y5Y Forward sparkline
    const forwardData = getSeriesData('T5YIFR');
    if (forwardData) {
        const sparklineData = getSparklineData(forwardData, 90);
        if (sparklineData.length > 0) {
            createSparkline('spark-5y5y', sparklineData, { color: '#8b5cf6', showEndpoint: true });
        }
    }
}

function renderPanel2() {
    renderMetricCard('hy-oas', 'BAMLH0A0HYM2', { suffix: ' bps', decimals: 0, multiply: 100 });
    renderMetricCard('yield-curve', 'T10Y2Y', { suffix: ' bps', decimals: 0, multiply: 100 });

    // Apply HY OAS threshold coloring (multiply by 100 since data is in %, thresholds are in bps)
    const hyOasValue = getLatestValue(getSeriesData('BAMLH0A0HYM2'));
    if (hyOasValue !== null) {
        const hyOasCard = document.getElementById('metric-hy-oas');
        const thresholdClass = getThresholdClass(hyOasValue * 100, THRESHOLDS.hyOas);
        hyOasCard.className = `metric-card ${thresholdClass}`;
    }

    // Apply yield curve inversion highlighting (negative = inverted)
    const yieldCurveValue = getLatestValue(getSeriesData('T10Y2Y'));
    if (yieldCurveValue !== null) {
        const yieldCurveCard = document.getElementById('metric-yield-curve');
        if (yieldCurveValue < 0) {
            yieldCurveCard.classList.add('threshold-red');
            yieldCurveCard.querySelector('.metric-delta').textContent = 'INVERTED';
        } else {
            yieldCurveCard.classList.remove('threshold-red');
        }
    }

    // Deficit/GDP calculation
    renderDeficitGDP();

    // Panel 2 sparklines
    renderPanel2Sparklines();
}

function renderDeficitGDP() {
    const deficitCard = document.getElementById('metric-deficit-gdp');
    if (!deficitCard) return;

    const deficitData = getSeriesData('MTSDS133FMS');
    if (!deficitData || !deficitData.observations || deficitData.observations.length < 12) {
        deficitCard.querySelector('.metric-value').textContent = '--';
        deficitCard.querySelector('.metric-delta').textContent = 'Insufficient data';
        return;
    }

    // Sum trailing 12 months of deficit (values are in millions, negative = deficit)
    const trailing12 = deficitData.observations
        .slice(0, 12)
        .reduce((sum, obs) => sum + (obs.value || 0), 0);

    // US GDP is approximately $28 trillion (28,000,000 million)
    // This is an approximation - ideally would fetch actual GDP series
    const approximateGDP = 28000000;

    // Calculate deficit as % of GDP (make positive for display)
    const deficitPercent = (Math.abs(trailing12) / approximateGDP) * 100;

    // Determine if it's surplus or deficit
    const isSurplus = trailing12 > 0;

    deficitCard.querySelector('.metric-value').textContent = `${deficitPercent.toFixed(1)}%`;
    deficitCard.querySelector('.metric-delta').textContent =
        isSurplus ? 'Surplus (T12M)' : 'Deficit (T12M)';

    // Apply threshold coloring
    const thresholdClass = getThresholdClass(deficitPercent, THRESHOLDS.deficitGdp);
    deficitCard.className = `metric-card ${thresholdClass}`;
}

function renderPanel2Sparklines() {
    // HY OAS sparkline (convert to bps for display consistency)
    const hyOasData = getSeriesData('BAMLH0A0HYM2');
    if (hyOasData) {
        const sparklineData = getSparklineData(hyOasData, 90).map(v => v * 100);
        if (sparklineData.length > 0) {
            createSparkline('spark-hy-oas', sparklineData, {
                color: '#ef4444',
                showEndpoint: true
            });
        }
    }

    // Yield Curve sparkline (convert to bps)
    const yieldCurveData = getSeriesData('T10Y2Y');
    if (yieldCurveData) {
        const sparklineData = getSparklineData(yieldCurveData, 365).map(v => v * 100);
        if (sparklineData.length > 0) {
            // Color based on whether currently inverted
            const currentValue = getLatestValue(yieldCurveData);
            const color = currentValue < 0 ? '#ef4444' : '#22c55e';
            createSparkline('spark-yield-curve', sparklineData, {
                color,
                showEndpoint: true
            });
        }
    }

    // Deficit sparkline (would need historical calculation - skip for now)
}

function renderPanel3() {
    const tbody = document.getElementById('sector-matrix-body');
    if (!tbody) return;

    // Calculate metrics for all sectors
    const sectorMetrics = SECTORS.map(sector =>
        calculateSectorMetrics(sector, getSeriesData)
    );

    tbody.innerHTML = sectorMetrics.map(metrics => {
        const { sector, employment, employmentYoY, wages, wagesYoY, openings, openingsYoY, output, outputYoY, signal } = metrics;

        // Format YoY values
        const empYoYFormatted = formatYoY(employmentYoY);
        const wageYoYFormatted = formatYoY(wagesYoY);
        const openingsYoYFormatted = formatYoY(openingsYoY);
        const outputYoYFormatted = formatYoY(outputYoY);

        return `
            <tr>
                <td>
                    <div class="sector-name">
                        <span class="sector-dot" style="background:${sector.color}"></span>
                        ${sector.shortName}
                    </div>
                </td>
                <td class="cell-value">
                    ${employment ? formatNumber(employment, 0) : '--'}
                    <span class="cell-yoy ${empYoYFormatted.class}">${empYoYFormatted.text}</span>
                </td>
                <td class="cell-value">
                    ${wages ? '$' + formatNumber(wages, 0) : '--'}
                    <span class="cell-yoy ${wageYoYFormatted.class}">${wageYoYFormatted.text}</span>
                </td>
                <td class="cell-value">
                    ${openings ? formatNumber(openings, 0) : '--'}
                    <span class="cell-yoy ${openingsYoYFormatted.class}">${openingsYoYFormatted.text}</span>
                </td>
                <td class="cell-value">
                    ${output ? formatNumber(output, 1) : '--'}
                    <span class="cell-yoy ${outputYoYFormatted.class}">${outputYoYFormatted.text}</span>
                </td>
                <td>${createSignalBadge(signal)}</td>
            </tr>
        `;
    }).join('');
}

function renderPanel4() {
    // CPI components with YoY% calculation
    renderCPICard('cpi-shelter', 'CUSR0000SAH1', 'Shelter');
    renderCPICard('cpi-medical', 'CPIMEDSL', 'Medical');
    renderCPICard('cpi-energy', 'CPIENGSL', 'Energy');
}

/**
 * Render a CPI metric card with index level, YoY%, and sparkline
 */
function renderCPICard(id, seriesId, label) {
    const card = document.getElementById(`metric-${id}`);
    if (!card) return;

    const data = getSeriesData(seriesId);
    if (!data || !data.observations || data.observations.length < 13) {
        card.querySelector('.metric-value').textContent = '--';
        card.querySelector('.metric-delta').textContent = 'Insufficient data';
        return;
    }

    const current = data.observations[0].value;
    const yearAgo = data.observations[12].value;

    // Calculate YoY%
    const yoy = yearAgo ? ((current - yearAgo) / yearAgo) * 100 : null;

    // Display index with YoY%
    const valueEl = card.querySelector('.metric-value');
    const deltaEl = card.querySelector('.metric-delta');

    valueEl.textContent = current ? current.toFixed(1) : '--';

    if (yoy !== null) {
        const sign = yoy >= 0 ? '+' : '';
        deltaEl.textContent = `${sign}${yoy.toFixed(1)}% YoY`;
        deltaEl.className = `metric-delta ${yoy > 3 ? 'delta-up' : yoy < 2 ? 'delta-down' : ''}`;
    } else {
        deltaEl.textContent = '--';
        deltaEl.className = 'metric-delta';
    }

    // Create sparkline of YoY% over 24 months
    const sparklineYoY = [];
    for (let i = 0; i < Math.min(24, data.observations.length - 12); i++) {
        const curr = data.observations[i].value;
        const prev = data.observations[i + 12]?.value;
        if (curr && prev) {
            sparklineYoY.push(((curr - prev) / prev) * 100);
        }
    }

    if (sparklineYoY.length > 0) {
        // Reverse to get chronological order (oldest first)
        const sparkData = sparklineYoY.reverse();

        // Color based on current trend
        const color = yoy > 3 ? '#ef4444' : yoy < 2 ? '#22c55e' : '#f59e0b';

        createSparkline(`spark-${id}`, sparkData, {
            color,
            showEndpoint: true
        });
    }
}

function renderPanel5() {
    // Yields table
    const yieldsBody = document.getElementById('yields-matrix-body');
    if (yieldsBody) {
        yieldsBody.innerHTML = COUNTRIES.map(country => {
            const yieldData = country.yieldSeries ? getSeriesData(country.yieldSeries) : null;
            const yieldValue = yieldData ? getLatestValue(yieldData) : null;

            // MoM change (monthly data, so index 1 is previous month)
            const prevYield = yieldData?.observations?.[1]?.value ?? null;
            const momChange = (yieldValue !== null && prevYield !== null)
                ? ((yieldValue - prevYield) * 100).toFixed(0)
                : null;

            // Spread vs US
            const usYieldData = getSeriesData('IRLTLT01USM156N');
            const usYield = usYieldData ? getLatestValue(usYieldData) : null;
            const spread = (yieldValue !== null && usYield !== null && country.id !== 'us')
                ? ((usYield - yieldValue) * 100).toFixed(0)
                : null;

            // Format MoM with color
            const momClass = momChange > 0 ? 'delta-up' : momChange < 0 ? 'delta-down' : '';
            const momDisplay = momChange !== null
                ? `<span class="${momClass}">${momChange > 0 ? '+' : ''}${momChange} bps</span>`
                : '--';

            return `
                <tr>
                    <td>
                        <div class="country-name">
                            <span class="country-code">${country.id.toUpperCase()}</span>
                            ${country.name}
                        </div>
                    </td>
                    <td class="cell-value">${yieldValue !== null ? yieldValue.toFixed(2) + '%' : '--'}</td>
                    <td class="cell-value">${momDisplay}</td>
                    <td class="cell-value">${country.id === 'us' ? '--' : (spread !== null ? spread + ' bps' : '--')}</td>
                    <td class="cell-value">--</td>
                    <td>
                        <a href="${country.investingUrl}" target="_blank" rel="noopener" class="link-icon">🔗</a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Currencies table with changes and sparklines
    renderCurrenciesTable();

    // Spread cards
    renderSpreadCard('us-bund', 'IRLTLT01USM156N', 'IRLTLT01DEM156N');
    renderSpreadCard('bund-oat', 'IRLTLT01FRM156N', 'IRLTLT01DEM156N');
    renderSpreadCard('us-jgb', 'IRLTLT01USM156N', 'IRLTLT01JPM156N');

    // Convergence chart
    renderConvergenceChart();
}

function renderCurrenciesTable() {
    const currenciesBody = document.getElementById('currencies-matrix-body');
    if (!currenciesBody) return;

    currenciesBody.innerHTML = CURRENCIES.map((currency, index) => {
        const data = getSeriesData(currency.series);
        const value = data ? getLatestValue(data) : null;

        // 1-day change
        const prevDay = data?.observations?.[1]?.value ?? null;
        const dayChange = (value !== null && prevDay !== null)
            ? ((value - prevDay) / prevDay * 100).toFixed(2)
            : null;

        // 1-month change (approx 22 trading days)
        const prevMonth = data?.observations?.[22]?.value ?? null;
        const monthChange = (value !== null && prevMonth !== null)
            ? ((value - prevMonth) / prevMonth * 100).toFixed(2)
            : null;

        // Format changes with color
        const dayClass = dayChange > 0 ? 'delta-up' : dayChange < 0 ? 'delta-down' : '';
        const monthClass = monthChange > 0 ? 'delta-up' : monthChange < 0 ? 'delta-down' : '';

        const dayDisplay = dayChange !== null
            ? `<span class="${dayClass}">${dayChange > 0 ? '+' : ''}${dayChange}%</span>`
            : '--';
        const monthDisplay = monthChange !== null
            ? `<span class="${monthClass}">${monthChange > 0 ? '+' : ''}${monthChange}%</span>`
            : '--';

        return `
            <tr>
                <td class="cell-value">${currency.pair}</td>
                <td class="cell-value">${value !== null ? value.toFixed(4) : '--'}</td>
                <td class="cell-value">${dayDisplay}</td>
                <td class="cell-value">${monthDisplay}</td>
                <td class="sparkline-cell"><canvas id="spark-fx-${index}" height="30"></canvas></td>
            </tr>
        `;
    }).join('');

    // Render FX sparklines after table is built
    CURRENCIES.forEach((currency, index) => {
        const data = getSeriesData(currency.series);
        if (data) {
            const sparklineData = getSparklineData(data, 90);
            if (sparklineData.length > 0) {
                createSparkline(`spark-fx-${index}`, sparklineData, {
                    color: '#3b82f6',
                    showEndpoint: true
                });
            }
        }
    });
}

function renderConvergenceChart() {
    const convergenceData = COUNTRIES
        .filter(c => c.yieldSeries) // Only countries with FRED data
        .map(country => {
            const data = getSeriesData(country.yieldSeries);
            if (!data?.observations) {
                console.log(`No data for ${country.name} (${country.yieldSeries})`);
                return null;
            }

            // Get up to 12 months of data
            const obs = data.observations.slice(0, 12).reverse();

            return {
                name: country.name,
                color: country.color,
                data: obs.map(o => o.value),
                dates: obs.map(o => o.date)
            };
        })
        .filter(Boolean);

    console.log('Convergence chart data:', convergenceData.length, 'countries');

    if (convergenceData.length > 0) {
        createConvergenceChart('chart-convergence', convergenceData);
    } else {
        console.warn('No convergence data available');
    }
}

// ============================================
// Render Helpers
// ============================================

function renderMetricCard(id, seriesId, options = {}) {
    const card = document.getElementById(`metric-${id}`);
    if (!card) return;

    const {
        value: overrideValue,
        suffix = '',
        prefix = '',
        decimals = 2,
        multiply = 1
    } = options;

    let value, change;

    if (overrideValue !== undefined) {
        value = overrideValue;
        change = null;
    } else if (seriesId) {
        const data = getSeriesData(seriesId);
        if (data) {
            value = getLatestValue(data) * multiply;
            change = getChange(data) * multiply;
        }
    }

    const valueEl = card.querySelector('.metric-value');
    const deltaEl = card.querySelector('.metric-delta');

    if (value !== null && value !== undefined) {
        valueEl.textContent = prefix + formatNumber(value, decimals) + suffix;
    } else {
        valueEl.textContent = '--';
    }

    if (change !== null && change !== undefined) {
        const arrow = change >= 0 ? '▲' : '▼';
        const sign = change >= 0 ? '+' : '';
        deltaEl.textContent = `${arrow} ${sign}${formatNumber(change, decimals)}`;
        deltaEl.className = `metric-delta ${change >= 0 ? 'delta-up' : 'delta-down'}`;
    } else if (deltaEl) {
        deltaEl.textContent = '--';
        deltaEl.className = 'metric-delta delta-flat';
    }
}

function renderSpreadCard(id, series1, series2) {
    const card = document.getElementById(`metric-${id}`);
    if (!card) return;

    const data1 = getSeriesData(series1);
    const data2 = getSeriesData(series2);

    const valueEl = card.querySelector('.metric-value');
    const deltaEl = card.querySelector('.metric-delta');

    if (!data1 || !data2) {
        valueEl.textContent = '--';
        if (deltaEl) deltaEl.textContent = '';
        return;
    }

    const value1 = getLatestValue(data1);
    const value2 = getLatestValue(data2);

    if (value1 === null || value2 === null) {
        valueEl.textContent = '--';
        if (deltaEl) deltaEl.textContent = '';
        return;
    }

    const spread = (value1 - value2) * 100; // Convert to bps
    valueEl.textContent = spread.toFixed(0) + ' bps';

    // Calculate MoM change in spread
    const prev1 = data1.observations?.[1]?.value;
    const prev2 = data2.observations?.[1]?.value;

    if (prev1 !== undefined && prev2 !== undefined && deltaEl) {
        const prevSpread = (prev1 - prev2) * 100;
        const change = spread - prevSpread;
        const changeClass = change > 0 ? 'delta-up' : change < 0 ? 'delta-down' : '';
        deltaEl.innerHTML = `<span class="${changeClass}">${change > 0 ? '+' : ''}${change.toFixed(0)} bps MoM</span>`;
    } else if (deltaEl) {
        deltaEl.textContent = '';
    }
}

// ============================================
// Bottom Bar
// ============================================

function updateBottomBar() {
    // Regime mini badge
    const regimeMini = document.getElementById('bb-regime');
    const regime = AppState.regime.current;
    regimeMini.className = `regime-mini regime-${regime}`;
    regimeMini.querySelector('.regime-number').textContent =
        regime === 'indeterminate' ? '?' : regime;

    // 10Y
    updateBottomMetric('bb-10y', 'DGS10', '%');

    // DXY
    updateBottomMetric('bb-dxy', 'DTWEXBGS', '');

    // HY OAS (data is in %, display in bps)
    const hyOasEl = document.getElementById('bb-hy-oas');
    const hyOasData = getSeriesData('BAMLH0A0HYM2');
    if (hyOasData && hyOasEl) {
        const value = getLatestValue(hyOasData);
        const change = getChange(hyOasData);
        const valueBps = value !== null ? value * 100 : null;

        hyOasEl.querySelector('.value').textContent = valueBps ? valueBps.toFixed(0) : '--';

        const arrowEl = hyOasEl.querySelector('.arrow');
        if (change !== null) {
            arrowEl.textContent = change >= 0 ? '▲' : '▼';
            arrowEl.className = `arrow ${change >= 0 ? 'up' : 'down'}`;
        }

        // Apply threshold color (valueBps is already in bps)
        if (valueBps !== null) {
            const thresholdClass = getThresholdClass(valueBps, THRESHOLDS.hyOas);
            hyOasEl.className = `bottom-metric ${thresholdClass}`;
        }
    }
}

function updateBottomMetric(id, seriesId, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;

    const data = getSeriesData(seriesId);
    if (!data) {
        el.querySelector('.value').textContent = '--';
        return;
    }

    const value = getLatestValue(data);
    const change = getChange(data);

    el.querySelector('.value').textContent = value ? value.toFixed(2) + suffix : '--';

    const arrowEl = el.querySelector('.arrow');
    if (change !== null) {
        arrowEl.textContent = change >= 0 ? '▲' : '▼';
        arrowEl.className = `arrow ${change >= 0 ? 'up' : 'down'}`;
    }
}

// ============================================
// API Key Modal
// ============================================

function showApiKeyModal() {
    console.log('Showing API key modal...');
    const modal = document.getElementById('api-key-modal');
    if (!modal) {
        console.error('API key modal element not found!');
        return;
    }
    modal.classList.add('visible');
    console.log('Modal classes:', modal.className);

    const form = document.getElementById('api-key-form');
    // Remove existing listener to prevent duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const input = document.getElementById('api-key-input');
        const key = input.value.trim();

        if (!key) return;

        // Validate the key
        const submitBtn = newForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Validating...';
        submitBtn.disabled = true;

        const isValid = await validateApiKey(key);

        if (isValid) {
            saveApiKey(key);
            modal.classList.remove('visible');
            await loadDashboardData(key);
            // UI listeners already set up in init()
        } else {
            alert('Invalid API key. Please check and try again.');
            submitBtn.textContent = 'Save & Load Dashboard';
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// Settings Modal
// ============================================

function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('visible');
    renderSettingsForm();
}

function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('visible');
}

function renderSettingsForm() {
    const content = document.getElementById('settings-content');
    if (!content) return;

    renderSettingsFormFromModule(content, (entries) => {
        // Update AppState with new entries
        AppState.manualEntries = entries;

        // Re-render panels that use manual entries
        renderPanel1();
    });
}

// ============================================
// Manual Entries (localStorage)
// ============================================

function loadManualEntries() {
    AppState.manualEntries = loadManualEntriesFromStorage();
}

function saveManualEntries() {
    saveManualEntriesToStorage(AppState.manualEntries);
}

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const apiKey = getApiKey();
            if (apiKey) {
                clearCache();
                await loadDashboardData(apiKey, true);
            }
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal);
    }

    // Settings close button
    const settingsClose = document.getElementById('settings-close');
    if (settingsClose) {
        settingsClose.addEventListener('click', hideSettingsModal);
    }

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
    });

    // Info icon explainers
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const explainerId = icon.dataset.explainer;
            handleExplainerClick(explainerId, icon);
        });
    });

    // Close explainers on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideExplainer();
        }
    });
}

function initPanelGroups() {
    document.querySelectorAll('.group-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.closest('.panel-group');
            group.classList.toggle('collapsed');

            const groupId = group.dataset.group;
            if (group.classList.contains('collapsed')) {
                AppState.ui.collapsedGroups.add(groupId);
                updateGroupSummary(groupId);
            } else {
                AppState.ui.collapsedGroups.delete(groupId);
            }
        });

        // Keyboard accessibility
        header.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });

    // On mobile, collapse groups B and C by default
    if (AppState.ui.isMobile) {
        document.getElementById('group-b')?.classList.add('collapsed');
        document.getElementById('group-c')?.classList.add('collapsed');
        updateGroupSummary('b');
        updateGroupSummary('c');
    }
}

function initTabs() {
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update tab buttons
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`)?.classList.add('active');
        });
    });
}

// ============================================
// Group Summaries
// ============================================

function updateGroupSummary(groupId) {
    const summaryEl = document.getElementById(`group-${groupId}-summary`);
    if (!summaryEl) return;

    if (groupId === 'a') {
        const regime = AppState.regime.current;
        const dgs10 = getLatestValue(getSeriesData('DGS10'));
        const hyOas = getLatestValue(getSeriesData('BAMLH0A0HYM2'));

        summaryEl.textContent = `Regime ${regime === 'indeterminate' ? '?' : regime} · ` +
            `10Y ${dgs10?.toFixed(2) || '--'}% · ` +
            `HY OAS ${hyOas?.toFixed(0) || '--'} bps`;
    } else if (groupId === 'b') {
        summaryEl.textContent = 'Sectoral data · CPI components';
    } else if (groupId === 'c') {
        summaryEl.textContent = 'Sovereign yields · FX rates';
    }
}

// ============================================
// Explainer System
// ============================================

function handleExplainerClick(explainerId, triggerElement) {
    showExplainer(explainerId, triggerElement, AppState.ui.isMobile);
}

function renderExplainerTabs() {
    // Bond Explainer tab
    const bondContainer = document.getElementById('bond-explainer-content');
    if (bondContainer) {
        renderBondExplainerTab(bondContainer);
    }

    // Energy Explainer tab
    const energyContainer = document.getElementById('energy-explainer-content');
    if (energyContainer) {
        renderEnergyExplainerTab(energyContainer);
    }
}

// ============================================
// Loading States
// ============================================

function showLoadingState() {
    // Add skeleton classes to metric values
    document.querySelectorAll('.metric-value').forEach(el => {
        if (el.textContent === '--') {
            el.classList.add('skeleton', 'skeleton-value');
        }
    });
}

function hideLoadingState() {
    document.querySelectorAll('.skeleton').forEach(el => {
        el.classList.remove('skeleton', 'skeleton-value', 'skeleton-text');
    });
}

// ============================================
// Error Banner
// ============================================

function showErrorBanner(message) {
    const banner = document.getElementById('error-banner');
    banner.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.classList.remove('visible')">Dismiss</button>
    `;
    banner.classList.add('visible');
}

function hideErrorBanner() {
    const banner = document.getElementById('error-banner');
    banner.classList.remove('visible');
}

// ============================================
// Utility Functions
// ============================================

function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function updateLastRefreshDisplay(fromCache) {
    const el = document.getElementById('last-updated');
    if (!el) return;

    const timestamp = AppState.cache.timestamp;
    if (timestamp) {
        const label = fromCache ? 'Cached' : 'Updated';
        el.textContent = `${label}: ${formatTimestamp(timestamp)}`;
    }
}

function getThresholdClass(value, thresholds) {
    for (const threshold of thresholds) {
        if (value <= threshold.max) {
            return threshold.class;
        }
    }
    return '';
}

function checkMobileViewport() {
    const wasMobile = AppState.ui.isMobile;
    AppState.ui.isMobile = window.innerWidth < 768;

    // If switching to mobile, collapse groups B and C
    if (!wasMobile && AppState.ui.isMobile) {
        document.getElementById('group-b')?.classList.add('collapsed');
        document.getElementById('group-c')?.classList.add('collapsed');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Global function for clearing API key (called from settings)
window.clearApiKey = function() {
    localStorage.removeItem('fred_api_key');
    clearCache();
    location.reload();
};

// ============================================
// Initialize on DOM ready
// ============================================

document.addEventListener('DOMContentLoaded', init);
