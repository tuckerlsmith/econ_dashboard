/**
 * Calculations Module
 * Regime classifier, correlation, and derived metrics
 */

import { THRESHOLDS } from './config.js';

/**
 * Aligns two series by date and computes first differences
 * @param {Object} series1 - First series data (e.g., yields)
 * @param {Object} series2 - Second series data (e.g., dollar)
 * @returns {Object} Aligned differences { dates, diff1, diff2 }
 */
export function alignAndDifference(series1, series2) {
    if (!series1?.observations || !series2?.observations) {
        return { dates: [], diff1: [], diff2: [] };
    }

    // Create maps for quick lookup
    const map1 = new Map(series1.observations.map(o => [o.date, o.value]));
    const map2 = new Map(series2.observations.map(o => [o.date, o.value]));

    // Find common dates (observations are sorted desc, so reverse for chronological)
    const dates1 = series1.observations.map(o => o.date).reverse();
    const dates2 = new Set(series2.observations.map(o => o.date));
    const commonDates = dates1.filter(d => dates2.has(d));

    // Compute first differences for common dates
    const dates = [];
    const diff1 = [];
    const diff2 = [];

    for (let i = 1; i < commonDates.length; i++) {
        const prevDate = commonDates[i - 1];
        const currDate = commonDates[i];

        const prev1 = map1.get(prevDate);
        const curr1 = map1.get(currDate);
        const prev2 = map2.get(prevDate);
        const curr2 = map2.get(currDate);

        if (prev1 != null && curr1 != null && prev2 != null && curr2 != null) {
            dates.push(currDate);
            diff1.push(curr1 - prev1);
            diff2.push(curr2 - prev2);
        }
    }

    return { dates, diff1, diff2 };
}

/**
 * Calculates Pearson correlation coefficient
 * @param {number[]} x - First array of values
 * @param {number[]} y - Second array of values
 * @returns {number|null} Correlation coefficient (-1 to 1) or null if invalid
 */
export function pearsonCorrelation(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
        return null;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
        (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    if (denominator === 0) return null;

    return numerator / denominator;
}

/**
 * Calculates rolling correlation over a window
 * @param {number[]} x - First array of values
 * @param {number[]} y - Second array of values
 * @param {number} window - Rolling window size
 * @returns {number[]} Array of correlation values
 */
export function rollingCorrelation(x, y, window = 60) {
    if (!x || !y || x.length !== y.length || x.length < window) {
        return [];
    }

    const correlations = [];

    for (let i = window - 1; i < x.length; i++) {
        const windowX = x.slice(i - window + 1, i + 1);
        const windowY = y.slice(i - window + 1, i + 1);
        const corr = pearsonCorrelation(windowX, windowY);
        correlations.push(corr);
    }

    return correlations;
}

/**
 * Calculates simple moving average
 * @param {number[]} values - Array of values
 * @param {number} period - MA period
 * @returns {number[]} Array of MA values
 */
export function movingAverage(values, period = 20) {
    if (!values || values.length < period) {
        return [];
    }

    const ma = [];

    for (let i = period - 1; i < values.length; i++) {
        const window = values.slice(i - period + 1, i + 1);
        const avg = window.reduce((a, b) => a + b, 0) / period;
        ma.push(avg);
    }

    return ma;
}

/**
 * Determines yield direction based on moving average
 * @param {number[]} yieldChanges - Array of yield changes
 * @param {number} period - MA period for smoothing
 * @returns {string} 'rising', 'falling', or 'flat'
 */
export function getYieldDirection(yieldChanges, period = 20) {
    if (!yieldChanges || yieldChanges.length < period) {
        return 'flat';
    }

    const ma = movingAverage(yieldChanges, period);
    if (ma.length === 0) return 'flat';

    // Use the most recent MA value
    const recentMA = ma[ma.length - 1];

    // Threshold for determining direction (small changes are "flat")
    const threshold = 0.001; // 0.1 bps per day on average

    if (recentMA > threshold) return 'rising';
    if (recentMA < -threshold) return 'falling';
    return 'flat';
}

/**
 * Classifies the current regime based on correlation and yield direction
 * @param {number} correlation - Current 60-day correlation
 * @param {string} yieldDirection - 'rising', 'falling', or 'flat'
 * @returns {number|string} Regime number (1-4) or 'indeterminate'
 */
export function classifyRegime(correlation, yieldDirection) {
    if (correlation === null || yieldDirection === 'flat') {
        return 'indeterminate';
    }

    const { positive, negative } = THRESHOLDS.regimeCorrelation;

    if (correlation > positive) {
        // Positive correlation: yields and dollar moving together
        if (yieldDirection === 'rising') {
            return 1; // Healthy Tightening
        } else if (yieldDirection === 'falling') {
            return 4; // Easing/Stimulus
        }
    } else if (correlation < negative) {
        // Negative correlation: yields and dollar moving opposite
        if (yieldDirection === 'rising') {
            return 2; // Fiscal/Institutional Crisis
        } else if (yieldDirection === 'falling') {
            return 3; // Flight to Safety
        }
    }

    return 'indeterminate';
}

/**
 * Full regime calculation from raw series data
 * @param {Object} yieldSeries - 10Y yield series data
 * @param {Object} dollarSeries - Dollar index series data
 * @returns {Object} Regime info { regime, correlation, direction, correlationHistory }
 */
export function calculateRegime(yieldSeries, dollarSeries) {
    // Align and get differences
    const { dates, diff1: yieldDiffs, diff2: dollarDiffs } = alignAndDifference(
        yieldSeries,
        dollarSeries
    );

    if (yieldDiffs.length < 60) {
        return {
            regime: 'indeterminate',
            correlation: null,
            direction: 'flat',
            correlationHistory: []
        };
    }

    // Calculate rolling correlation (60-day window)
    const correlationHistory = rollingCorrelation(yieldDiffs, dollarDiffs, 60);

    // Get current correlation (most recent)
    const currentCorrelation = correlationHistory.length > 0
        ? correlationHistory[correlationHistory.length - 1]
        : null;

    // Determine yield direction from 20-day MA of yield changes
    const yieldDirection = getYieldDirection(yieldDiffs, 20);

    // Classify regime
    const regime = classifyRegime(currentCorrelation, yieldDirection);

    return {
        regime,
        correlation: currentCorrelation,
        direction: yieldDirection,
        correlationHistory,
        dates: dates.slice(59) // Dates corresponding to correlation history
    };
}

/**
 * Calculates year-over-year percentage change
 * @param {Object} seriesData - Series data with observations
 * @returns {number|null} YoY percentage change
 */
export function calculateYoY(seriesData) {
    if (!seriesData?.observations || seriesData.observations.length < 13) {
        return null;
    }

    const current = seriesData.observations[0].value;
    const yearAgo = seriesData.observations[12].value;

    if (current == null || yearAgo == null || yearAgo === 0) {
        return null;
    }

    return ((current - yearAgo) / yearAgo) * 100;
}

/**
 * Calculates NAFTA and China import shares from FRED trade data.
 * Uses trailing 12-month sums to smooth NSA seasonality.
 * NAFTA Share = (Canada + Mexico) / Total × 100
 * China Share = China / Total × 100
 *
 * @param {Function} getSeriesData - Function to retrieve series data by ID
 * @returns {{ nafta: number, china: number, dataThrough: string }|null}
 *   Returns null if any required series is unavailable or has insufficient data.
 */
export function calculateImportShares(getSeriesData) {
    const totalData = getSeriesData('IMP0015');
    const chinaData = getSeriesData('IMPCH');
    const canadaData = getSeriesData('IMPCA');
    const mexicoData = getSeriesData('IMPX');

    // Need at least 12 observations for a trailing 12-month sum
    const series = [totalData, chinaData, canadaData, mexicoData];
    if (series.some(s => !s?.observations || s.observations.length < 12)) {
        return null;
    }

    // Sum the 12 most recent monthly observations (observations are sorted desc)
    const sum12 = (data) => data.observations.slice(0, 12).reduce((acc, o) => acc + o.value, 0);

    const total12 = sum12(totalData);
    const china12 = sum12(chinaData);
    const canada12 = sum12(canadaData);
    const mexico12 = sum12(mexicoData);

    if (total12 === 0) return null;

    // dataThrough = date of the most recent observation across all four series (min of the four latest dates)
    const latestDates = series.map(s => s.observations[0].date);
    const dataThrough = latestDates.sort()[0]; // earliest of the four latest = most-lagged series

    return {
        nafta: (canada12 + mexico12) / total12 * 100,
        china: china12 / total12 * 100,
        dataThrough
    };
}

/**
 * Gets threshold class for a value
 * @param {number} value - The value to check
 * @param {Array} thresholds - Array of threshold objects { max, class }
 * @returns {string} CSS class name
 */
export function getThresholdClass(value, thresholds) {
    if (value === null || !thresholds) return '';

    for (const threshold of thresholds) {
        if (value <= threshold.max) {
            return threshold.class;
        }
    }

    return '';
}

/**
 * Calculates deficit as percentage of GDP (trailing 12 months)
 * @param {Object} deficitSeries - Monthly deficit series
 * @param {Object} gdpSeries - GDP series (if available)
 * @returns {number|null} Deficit/GDP percentage
 */
export function calculateDeficitGDP(deficitSeries, gdpSeries) {
    // This is a simplified calculation
    // Full implementation would need actual GDP data
    if (!deficitSeries?.observations || deficitSeries.observations.length < 12) {
        return null;
    }

    // Sum trailing 12 months of deficit (values are in millions)
    const trailing12 = deficitSeries.observations
        .slice(0, 12)
        .reduce((sum, obs) => sum + (obs.value || 0), 0);

    // Approximate GDP (would need actual GDP series for accuracy)
    // US GDP is approximately $28 trillion
    const approximateGDP = 28000000; // in millions

    return (Math.abs(trailing12) / approximateGDP) * 100;
}
