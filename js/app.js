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
    createSparkline,
    createCorrelationChart,
    createYieldDollarChart
} from './charts.js';

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

    // Deficit/GDP calculation will be added in Phase 2
    const deficitCard = document.getElementById('metric-deficit-gdp');
    if (deficitCard) {
        deficitCard.querySelector('.metric-value').textContent = '--';
        deficitCard.querySelector('.metric-delta').textContent = 'Calculation pending';
    }
}

function renderPanel3() {
    // Sectoral matrix - signal derivation will be added in Phase 5 (sectors.js)
    const tbody = document.getElementById('sector-matrix-body');
    if (!tbody) return;

    tbody.innerHTML = SECTORS.map(sector => {
        const empData = getSeriesData(sector.employment);
        const wageData = getSeriesData(sector.wages);
        const openingsData = sector.openings ? getSeriesData(sector.openings) : null;
        const outputData = sector.output ? getSeriesData(sector.output) : null;

        const empValue = empData ? getLatestValue(empData) : null;
        const wageValue = wageData ? getLatestValue(wageData) : null;
        const openingsValue = openingsData ? getLatestValue(openingsData) : null;
        const outputValue = outputData ? getLatestValue(outputData) : null;

        return `
            <tr>
                <td>
                    <div class="sector-name">
                        <span class="sector-dot" style="background:${sector.color}"></span>
                        ${sector.shortName}
                    </div>
                </td>
                <td class="cell-value">${empValue ? formatNumber(empValue, 0) : '--'}</td>
                <td class="cell-value">${wageValue ? '$' + formatNumber(wageValue, 0) : '--'}</td>
                <td class="cell-value">${openingsValue ? formatNumber(openingsValue, 0) : '--'}</td>
                <td class="cell-value">${outputValue ? formatNumber(outputValue, 1) : '--'}</td>
                <td>--</td>
            </tr>
        `;
    }).join('');
}

function renderPanel4() {
    renderMetricCard('cpi-shelter', 'CUSR0000SAH1', { decimals: 1 });
    renderMetricCard('cpi-medical', 'CPIMEDSL', { decimals: 1 });
    renderMetricCard('cpi-energy', 'CPIENGSL', { decimals: 1 });
}

function renderPanel5() {
    // Yields table
    const yieldsBody = document.getElementById('yields-matrix-body');
    if (yieldsBody) {
        yieldsBody.innerHTML = COUNTRIES.map(country => {
            const yieldData = country.yieldSeries ? getSeriesData(country.yieldSeries) : null;
            const yieldValue = yieldData ? getLatestValue(yieldData) : null;
            const usYieldData = getSeriesData('IRLTLT01USM156N');
            const usYield = usYieldData ? getLatestValue(usYieldData) : null;
            const spread = (yieldValue !== null && usYield !== null && country.id !== 'us')
                ? ((usYield - yieldValue) * 100).toFixed(0)
                : '--';

            return `
                <tr>
                    <td>
                        <div class="country-name">
                            <span class="country-flag">${country.flag}</span>
                            ${country.name}
                        </div>
                    </td>
                    <td class="cell-value">${yieldValue !== null ? yieldValue.toFixed(2) + '%' : '--'}</td>
                    <td class="cell-value">--</td>
                    <td class="cell-value">${country.id === 'us' ? '--' : spread + ' bps'}</td>
                    <td>--</td>
                    <td>
                        <a href="${country.investingUrl}" target="_blank" rel="noopener" class="link-icon">🔗</a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Currencies table
    const currenciesBody = document.getElementById('currencies-matrix-body');
    if (currenciesBody) {
        currenciesBody.innerHTML = CURRENCIES.map(currency => {
            const data = getSeriesData(currency.series);
            const value = data ? getLatestValue(data) : null;

            return `
                <tr>
                    <td class="cell-value">${currency.pair}</td>
                    <td class="cell-value">${value !== null ? value.toFixed(4) : '--'}</td>
                    <td class="cell-value">--</td>
                    <td class="cell-value">--</td>
                    <td>--</td>
                </tr>
            `;
        }).join('');
    }

    // Spread cards
    renderSpreadCard('us-bund', 'IRLTLT01USM156N', 'IRLTLT01DEM156N');
    renderSpreadCard('bund-oat', 'IRLTLT01FRM156N', 'IRLTLT01DEM156N');
    renderSpreadCard('us-jgb', 'IRLTLT01USM156N', 'IRLTLT01JPM156N');
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

    if (!data1 || !data2) {
        card.querySelector('.metric-value').textContent = '--';
        card.querySelector('.metric-delta').textContent = '--';
        return;
    }

    const value1 = getLatestValue(data1);
    const value2 = getLatestValue(data2);

    if (value1 === null || value2 === null) {
        card.querySelector('.metric-value').textContent = '--';
        return;
    }

    const spread = (value1 - value2) * 100; // Convert to bps
    card.querySelector('.metric-value').textContent = spread.toFixed(0) + ' bps';
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
    // Will be expanded in settings.js
    const content = document.getElementById('settings-content');
    content.innerHTML = `
        <p>Manual entry form will be implemented in Phase 6.</p>
        <p>Current API Key: ${getApiKey() ? '••••' + getApiKey().slice(-4) : 'Not set'}</p>
        <button onclick="clearApiKey()" class="btn-secondary">Clear API Key</button>
    `;
}

// ============================================
// Manual Entries (localStorage)
// ============================================

function loadManualEntries() {
    try {
        const stored = localStorage.getItem('dashboard_manual_entries');
        if (stored) {
            AppState.manualEntries = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load manual entries:', e);
    }
}

function saveManualEntries() {
    try {
        localStorage.setItem('dashboard_manual_entries', JSON.stringify(AppState.manualEntries));
    } catch (e) {
        console.warn('Failed to save manual entries:', e);
    }
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
            showExplainer(explainerId, icon);
        });
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
// Explainer System (Placeholder)
// ============================================

function showExplainer(explainerId, triggerElement) {
    // Will be fully implemented in explainers.js
    console.log('Explainer requested:', explainerId);

    // For now, just log - full implementation in Phase 7
    if (AppState.ui.isMobile) {
        // Would show bottom sheet
        alert(`Explainer: ${explainerId}\n\nFull implementation coming in Phase 7.`);
    } else {
        // Would show tooltip
        alert(`Explainer: ${explainerId}\n\nFull implementation coming in Phase 7.`);
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
