/**
 * Sectors Module
 * Signal derivation logic for sectoral comparison matrix
 */

/**
 * Signal types with their display properties
 */
export const SIGNALS = {
    costPathology: {
        id: 'cost-pathology',
        name: 'Cost Pathology',
        shortName: 'Cost Path.',
        color: '#ef4444', // red
        description: 'Employment rising faster than output - declining productivity'
    },
    earningsConcentration: {
        id: 'earnings-concentration',
        name: 'Earnings Concentration',
        shortName: 'Earn. Conc.',
        color: '#f59e0b', // amber
        description: 'Output rising while employment falls - automation/efficiency gains'
    },
    skillsGap: {
        id: 'skills-gap',
        name: 'Skills Gap',
        shortName: 'Skills Gap',
        color: '#8b5cf6', // purple
        description: 'Openings rising while employment flat/down - labor mismatch'
    },
    aiDisplacement: {
        id: 'ai-displacement',
        name: 'AI Displacement',
        shortName: 'AI Displ.',
        color: '#ec4899', // pink
        description: 'Both employment and openings falling - structural decline'
    },
    supplyCapacity: {
        id: 'supply-capacity',
        name: 'Supply Capacity',
        shortName: 'Supply Cap.',
        color: '#22c55e', // green
        description: 'Employment, openings, and wages all rising - healthy expansion'
    },
    neutral: {
        id: 'neutral',
        name: 'Neutral',
        shortName: 'Neutral',
        color: '#64748b', // gray
        description: 'No clear signal pattern'
    }
};

/**
 * Calculates YoY percentage change for a series
 * @param {Object} seriesData - Series data with observations
 * @param {number} periodsPerYear - Observations per year: 12 for monthly (default), 4 for quarterly
 * @returns {number|null} YoY percentage change
 */
export function calculateYoY(seriesData, periodsPerYear = 12) {
    if (!seriesData?.observations || seriesData.observations.length <= periodsPerYear) {
        return null;
    }

    const current = seriesData.observations[0].value;
    const yearAgo = seriesData.observations[periodsPerYear].value;

    if (current == null || yearAgo == null || yearAgo === 0) {
        return null;
    }

    return ((current - yearAgo) / yearAgo) * 100;
}

/**
 * Determines the trend direction based on YoY change
 * @param {number} yoyChange - YoY percentage change
 * @param {number} threshold - Threshold for significance (default 1%)
 * @returns {string} 'up', 'down', or 'flat'
 */
export function getTrend(yoyChange, threshold = 1) {
    if (yoyChange === null) return 'unknown';
    if (yoyChange > threshold) return 'up';
    if (yoyChange < -threshold) return 'down';
    return 'flat';
}

/**
 * Derives signal for a sector based on employment, openings, output, and wage trends
 * @param {Object} trends - Object with employment, openings, output, wages YoY values
 * @returns {Object} Signal object from SIGNALS
 */
export function deriveSignal(trends) {
    const { employment, openings, output, wages } = trends;

    const empTrend = getTrend(employment);
    const openTrend = getTrend(openings);
    const outputTrend = getTrend(output);
    const wageTrend = getTrend(wages);

    // Supply Capacity: employment up, openings up, wages up
    if (empTrend === 'up' && openTrend === 'up' && wageTrend === 'up') {
        return SIGNALS.supplyCapacity;
    }

    // AI Displacement: employment down, openings down
    if (empTrend === 'down' && openTrend === 'down') {
        return SIGNALS.aiDisplacement;
    }

    // Skills Gap: openings up, employment flat/down
    if (openTrend === 'up' && (empTrend === 'flat' || empTrend === 'down')) {
        return SIGNALS.skillsGap;
    }

    // Cost Pathology: employment up, output flat/down (if output data available)
    if (empTrend === 'up' && (outputTrend === 'flat' || outputTrend === 'down')) {
        return SIGNALS.costPathology;
    }

    // Earnings Concentration: output up, employment down
    if (outputTrend === 'up' && empTrend === 'down') {
        return SIGNALS.earningsConcentration;
    }

    // No clear signal
    return SIGNALS.neutral;
}

/**
 * Calculates all sector metrics and signals
 * @param {Object} sector - Sector configuration from config.js
 * @param {Function} getSeriesData - Function to get series data by ID
 * @returns {Object} Sector metrics and signal
 */
export function calculateSectorMetrics(sector, getSeriesData) {
    const empData = getSeriesData(sector.employment);
    const wageData = getSeriesData(sector.wages);
    const openingsData = sector.openings ? getSeriesData(sector.openings) : null;
    const outputData = sector.output ? getSeriesData(sector.output) : null;

    // Current values
    const employment = empData?.observations?.[0]?.value ?? null;
    const rawWages = wageData?.observations?.[0]?.value ?? null;
    const wages = rawWages !== null ? rawWages * 52.14 : null;
    const openings = openingsData?.observations?.[0]?.value ?? null;
    const output = outputData?.observations?.[0]?.value ?? null;

    // YoY changes (output is quarterly — use 4 periods per year)
    const employmentYoY = calculateYoY(empData);
    const wagesYoY = calculateYoY(wageData);
    const openingsYoY = calculateYoY(openingsData);
    const outputYoY = calculateYoY(outputData, 4);

    // Derive signal
    const signal = deriveSignal({
        employment: employmentYoY,
        openings: openingsYoY,
        output: outputYoY,
        wages: wagesYoY
    });

    const outputDate = outputData?.observations?.[0]?.date ?? null;

    return {
        sector,
        employment,
        employmentYoY,
        wages,
        wagesYoY,
        openings,
        openingsYoY,
        output,
        outputYoY,
        outputDate,
        signal
    };
}

/**
 * Formats a YoY change for display
 * @param {number|null} yoy - YoY percentage change
 * @returns {string} Formatted string with sign and color class
 */
export function formatYoY(yoy) {
    if (yoy === null) return { text: '--', class: '' };

    const sign = yoy > 0 ? '+' : '';
    const colorClass = yoy > 1 ? 'delta-up' : yoy < -1 ? 'delta-down' : '';

    return {
        text: `${sign}${yoy.toFixed(1)}%`,
        class: colorClass
    };
}

/**
 * Creates a signal badge HTML
 * @param {Object} signal - Signal object from SIGNALS
 * @returns {string} HTML string for the badge
 */
export function createSignalBadge(signal) {
    return `<span class="signal-badge" style="background:${signal.color}20;color:${signal.color};border:1px solid ${signal.color}40" title="${signal.description}">${signal.shortName}</span>`;
}
