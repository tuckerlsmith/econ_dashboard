/**
 * Charts Module
 * Chart.js sparkline factory and chart utilities
 */

// Store chart instances for cleanup/reuse
const chartInstances = new Map();

/**
 * Default chart options for consistent styling
 */
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
    },
    scales: {
        x: { display: false },
        y: { display: false }
    },
    elements: {
        point: { radius: 0 },
        line: { borderWidth: 1.5 }
    }
};

/**
 * Creates or updates a sparkline chart
 * @param {string|HTMLCanvasElement} canvasOrId - Canvas element or ID
 * @param {number[]} data - Array of values
 * @param {Object} options - Chart options
 * @param {string[]} [dates] - Optional date labels for hover tooltips
 * @returns {Chart|null} Chart instance
 */
export function createSparkline(canvasOrId, data, options = {}, dates = []) {
    const canvas = typeof canvasOrId === 'string'
        ? document.getElementById(canvasOrId)
        : canvasOrId;

    if (!canvas || !data || data.length === 0) {
        return null;
    }

    const ctx = canvas.getContext('2d');
    const canvasId = canvas.id || canvas.dataset.chartId || `chart-${Date.now()}`;

    // Destroy existing chart if present
    if (chartInstances.has(canvasId)) {
        chartInstances.get(canvasId).destroy();
    }

    const {
        color = '#3b82f6',
        fillColor = null,
        showEndpoint = false,
        tension = 0.3,
        borderWidth = 1.5,
        tooltipSuffix = '',
        tooltipDecimals = 2
    } = options;

    // Use date labels if provided, otherwise use numeric indices
    const labels = dates.length === data.length ? dates : data.map((_, i) => i);
    const hasDateLabels = dates.length === data.length;

    // Determine fill color
    const fill = fillColor ? {
        target: 'origin',
        above: fillColor,
        below: fillColor
    } : false;

    // Build tooltip config — only enable when date labels are provided
    const tooltipConfig = hasDateLabels ? {
        enabled: true,
        backgroundColor: 'rgba(10, 15, 28, 0.95)',
        borderColor: 'rgba(58, 69, 96, 0.8)',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        titleFont: { family: "'JetBrains Mono', monospace", size: 10 },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12, weight: '600' },
        padding: 8,
        displayColors: false,
        callbacks: {
            title: (items) => {
                const date = items[0]?.label;
                if (!date) return '';
                // Format YYYY-MM-DD → "Jan 2025" or "Jan 15, 2025"
                const d = new Date(date + 'T00:00:00');
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            },
            label: (item) => {
                const val = item.raw;
                if (val === null || val === undefined) return '--';
                return `${parseFloat(val).toFixed(tooltipDecimals)}${tooltipSuffix}`;
            }
        }
    } : { enabled: false };

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data,
                borderColor: color,
                backgroundColor: fillColor || 'transparent',
                fill,
                tension,
                borderWidth,
                pointRadius: showEndpoint ? generatePointRadius(data.length) : 0,
                pointBackgroundColor: color
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                legend: { display: false },
                tooltip: tooltipConfig
            },
            interaction: hasDateLabels ? {
                mode: 'index',
                intersect: false
            } : undefined,
            ...options.chartOptions
        }
    };

    const chart = new Chart(ctx, config);
    chartInstances.set(canvasId, chart);

    return chart;
}

/**
 * Generates point radius array (only last point visible)
 * @param {number} length - Data length
 * @returns {number[]} Array of point radii
 */
function generatePointRadius(length) {
    const radii = new Array(length).fill(0);
    if (length > 0) {
        radii[length - 1] = 3;
    }
    return radii;
}

/**
 * Creates the correlation chart with threshold bands
 * @param {string|HTMLCanvasElement} canvasOrId - Canvas element or ID
 * @param {number[]} correlationData - Array of correlation values
 * @param {string[]} dates - Array of date strings
 * @returns {Chart|null} Chart instance
 */
export function createCorrelationChart(canvasOrId, correlationData, dates = []) {
    const canvas = typeof canvasOrId === 'string'
        ? document.getElementById(canvasOrId)
        : canvasOrId;

    if (!canvas || !correlationData || correlationData.length === 0) {
        return null;
    }

    const ctx = canvas.getContext('2d');
    const canvasId = canvas.id || 'correlation-chart';

    // Destroy existing chart if present
    if (chartInstances.has(canvasId)) {
        chartInstances.get(canvasId).destroy();
    }

    // Generate labels
    const labels = dates.length > 0 ? dates : correlationData.map((_, i) => i);

    // Threshold lines (+0.3 and -0.3)
    const positiveThreshold = new Array(correlationData.length).fill(0.3);
    const negativeThreshold = new Array(correlationData.length).fill(-0.3);
    const zeroLine = new Array(correlationData.length).fill(0);

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Correlation',
                    data: correlationData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: '+0.3 Threshold',
                    data: positiveThreshold,
                    borderColor: 'rgba(34, 197, 94, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: '-0.3 Threshold',
                    data: negativeThreshold,
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Zero',
                    data: zeroLine,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => {
                            if (context.datasetIndex === 0) {
                                return `Correlation: ${context.parsed.y.toFixed(3)}`;
                            }
                            return null;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 6,
                        callback: function(value, index) {
                            // Show every ~30th label
                            if (index % 30 === 0 && dates[index]) {
                                return formatDateShort(dates[index]);
                            }
                            return '';
                        }
                    }
                },
                y: {
                    display: true,
                    min: -1,
                    max: 1,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        stepSize: 0.5
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };

    const chart = new Chart(ctx, config);
    chartInstances.set(canvasId, chart);

    return chart;
}

/**
 * Creates yield vs dollar overlay chart
 * @param {string|HTMLCanvasElement} canvasOrId - Canvas element or ID
 * @param {Object} yieldData - Yield series { dates, values }
 * @param {Object} dollarData - Dollar series { dates, values }
 * @returns {Chart|null} Chart instance
 */
export function createYieldDollarChart(canvasOrId, yieldData, dollarData) {
    const canvas = typeof canvasOrId === 'string'
        ? document.getElementById(canvasOrId)
        : canvasOrId;

    if (!canvas || !yieldData?.values || !dollarData?.values) {
        return null;
    }

    const ctx = canvas.getContext('2d');
    const canvasId = canvas.id || 'yield-dollar-chart';

    // Destroy existing chart if present
    if (chartInstances.has(canvasId)) {
        chartInstances.get(canvasId).destroy();
    }

    // Use dates from yield data (assuming aligned)
    const labels = yieldData.dates || yieldData.values.map((_, i) => i);

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: '10Y Yield',
                    data: yieldData.values,
                    borderColor: '#22c55e',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y'
                },
                {
                    label: 'DXY',
                    data: dollarData.values,
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 6,
                        callback: function(value, index) {
                            if (index % 15 === 0 && labels[index]) {
                                return formatDateShort(labels[index]);
                            }
                            return '';
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Yield (%)',
                        color: '#22c55e'
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#22c55e' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'DXY',
                        color: '#f59e0b'
                    },
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#f59e0b' }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };

    const chart = new Chart(ctx, config);
    chartInstances.set(canvasId, chart);

    return chart;
}

/**
 * Creates a convergence chart for sovereign yields
 * @param {string|HTMLCanvasElement} canvasOrId - Canvas element or ID
 * @param {Object[]} seriesArray - Array of { name, color, data, dates }
 * @returns {Chart|null} Chart instance
 */
export function createConvergenceChart(canvasOrId, seriesArray) {
    const canvas = typeof canvasOrId === 'string'
        ? document.getElementById(canvasOrId)
        : canvasOrId;

    if (!canvas || !seriesArray || seriesArray.length === 0) {
        return null;
    }

    const ctx = canvas.getContext('2d');
    const canvasId = canvas.id || 'convergence-chart';

    // Destroy existing chart if present
    if (chartInstances.has(canvasId)) {
        chartInstances.get(canvasId).destroy();
    }

    // Use dates from first series
    const labels = seriesArray[0].dates || seriesArray[0].data.map((_, i) => i);

    const datasets = seriesArray.map(series => ({
        label: series.name,
        data: series.data,
        borderColor: series.color,
        backgroundColor: 'transparent',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
    }));

    const config = {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        boxWidth: 12,
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 6
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Yield (%)',
                        color: '#94a3b8'
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#64748b' }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };

    const chart = new Chart(ctx, config);
    chartInstances.set(canvasId, chart);

    return chart;
}

/**
 * Formats a date string for chart display
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date (MMM DD)
 */
function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Destroys all chart instances
 */
export function destroyAllCharts() {
    chartInstances.forEach(chart => chart.destroy());
    chartInstances.clear();
}

/**
 * Gets color based on value change
 * @param {number} value - Current value
 * @param {number} previous - Previous value
 * @returns {string} Color hex code
 */
export function getChangeColor(value, previous) {
    if (value === null || previous === null) return '#64748b';
    if (value > previous) return '#22c55e';
    if (value < previous) return '#ef4444';
    return '#64748b';
}
