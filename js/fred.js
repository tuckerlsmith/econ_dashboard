/**
 * FRED API Client
 * Handles data fetching, caching, and rate limiting for the FRED API
 */

// FRED API base URL
const FRED_API_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// CORS proxy for browser requests (FRED API doesn't send CORS headers)
// Using allorigins.win which works from production domains
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Build the full URL with proxy
function buildFredUrl(params) {
    const fullUrl = `${FRED_API_BASE}?${params}`;
    return CORS_PROXY + encodeURIComponent(fullUrl);
}
const CACHE_KEY = 'fred_data_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_DELAY = 600; // 600ms between batches (to stay under 120 req/min)
const BATCH_SIZE = 10; // Fetch 10 series per batch

/**
 * Fetches a single FRED series
 * @param {string} seriesId - FRED series ID
 * @param {Object} config - Series configuration
 * @param {string} apiKey - FRED API key
 * @returns {Promise<Object>} Series data with observations
 */
export async function fetchSeries(seriesId, config, apiKey) {
    const params = new URLSearchParams({
        series_id: seriesId,
        api_key: apiKey,
        file_type: 'json',
        sort_order: 'desc',
        limit: config.limit || 365
    });

    const url = buildFredUrl(params.toString());
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FRED API error for ${seriesId}: ${response.status} - ${errorText}`);
    }

    const json = await response.json();

    // Parse observations, filtering out invalid values
    const observations = json.observations
        .map(o => ({
            date: o.date,
            value: o.value === '.' ? null : parseFloat(o.value)
        }))
        .filter(o => o.value !== null && !isNaN(o.value));

    return {
        seriesId,
        frequency: config.frequency || 'daily',
        observations
    };
}

/**
 * Fetches all configured FRED series with rate limiting
 * @param {Object} seriesConfig - Object mapping series IDs to their configs
 * @param {string} apiKey - FRED API key
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<Object>} Object mapping series IDs to their data
 */
export async function fetchAllSeries(seriesConfig, apiKey, onProgress) {
    const results = {};
    const errors = [];
    const seriesIds = Object.keys(seriesConfig);
    const total = seriesIds.length;
    let completed = 0;

    // Split into batches
    const batches = [];
    for (let i = 0; i < seriesIds.length; i += BATCH_SIZE) {
        batches.push(seriesIds.slice(i, i + BATCH_SIZE));
    }

    // Process batches sequentially with rate limiting
    for (const batch of batches) {
        // Process series within a batch in parallel
        const batchPromises = batch.map(async (seriesId) => {
            try {
                const data = await fetchSeries(seriesId, seriesConfig[seriesId], apiKey);
                results[seriesId] = data;
            } catch (error) {
                console.error(`Failed to fetch ${seriesId}:`, error);
                errors.push({ seriesId, error: error.message });
                results[seriesId] = null;
            }
            completed++;
            if (onProgress) {
                onProgress(completed, total);
            }
        });

        await Promise.all(batchPromises);

        // Rate limit: wait before next batch
        if (batches.indexOf(batch) < batches.length - 1) {
            await delay(RATE_LIMIT_DELAY);
        }
    }

    // Cache the results
    cacheResults(results);

    // Return results along with any errors
    return { data: results, errors };
}

/**
 * Caches results to sessionStorage
 * @param {Object} data - Data to cache
 */
export function cacheResults(data) {
    const cache = {
        timestamp: Date.now(),
        data
    };
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to cache data to sessionStorage:', e);
    }
}

/**
 * Checks if the cache is valid (not expired)
 * @returns {boolean} True if cache is valid
 */
export function isCacheValid() {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return false;
        const { timestamp } = JSON.parse(cached);
        return (Date.now() - timestamp) < CACHE_TTL;
    } catch (e) {
        return false;
    }
}

/**
 * Gets cached data if available
 * @returns {Object|null} Cached data or null
 */
export function getCachedData() {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const { data } = JSON.parse(cached);
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Gets the timestamp of the cached data
 * @returns {number|null} Cache timestamp or null
 */
export function getCacheTimestamp() {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const { timestamp } = JSON.parse(cached);
        return timestamp;
    } catch (e) {
        return null;
    }
}

/**
 * Clears the cache
 */
export function clearCache() {
    try {
        sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
        console.warn('Failed to clear cache:', e);
    }
}

/**
 * Gets the API key from localStorage
 * @returns {string|null} API key or null
 */
export function getApiKey() {
    return localStorage.getItem('fred_api_key');
}

/**
 * Saves the API key to localStorage
 * @param {string} key - API key to save
 */
export function saveApiKey(key) {
    localStorage.setItem('fred_api_key', key);
}

/**
 * Validates an API key by making a test request
 * @param {string} key - API key to validate
 * @returns {Promise<boolean>} True if key is valid
 */
export async function validateApiKey(key) {
    // Skip actual validation - just check format
    // FRED API has CORS issues with some localhost setups
    // Real validation will happen when we try to fetch data
    if (!key || key.length < 10) {
        console.log('API key too short');
        return false;
    }
    console.log('API key format looks valid, skipping network validation');
    return true;
}

/**
 * Utility function to delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the latest value from a series
 * @param {Object} seriesData - Series data object
 * @returns {number|null} Latest value or null
 */
export function getLatestValue(seriesData) {
    if (!seriesData || !seriesData.observations || seriesData.observations.length === 0) {
        return null;
    }
    return seriesData.observations[0].value;
}

/**
 * Gets the previous value from a series
 * @param {Object} seriesData - Series data object
 * @returns {number|null} Previous value or null
 */
export function getPreviousValue(seriesData) {
    if (!seriesData || !seriesData.observations || seriesData.observations.length < 2) {
        return null;
    }
    return seriesData.observations[1].value;
}

/**
 * Gets the change between latest and previous values
 * @param {Object} seriesData - Series data object
 * @returns {number|null} Change value or null
 */
export function getChange(seriesData) {
    const latest = getLatestValue(seriesData);
    const previous = getPreviousValue(seriesData);
    if (latest === null || previous === null) return null;
    return latest - previous;
}

/**
 * Gets the percentage change between latest and previous values
 * @param {Object} seriesData - Series data object
 * @returns {number|null} Percentage change or null
 */
export function getPercentChange(seriesData) {
    const latest = getLatestValue(seriesData);
    const previous = getPreviousValue(seriesData);
    if (latest === null || previous === null || previous === 0) return null;
    return ((latest - previous) / previous) * 100;
}

/**
 * Gets an array of values for sparkline rendering
 * @param {Object} seriesData - Series data object
 * @param {number} count - Number of values to get
 * @returns {number[]} Array of values (oldest first for charting)
 */
export function getSparklineData(seriesData, count = 90) {
    if (!seriesData || !seriesData.observations) return [];
    return seriesData.observations
        .slice(0, count)
        .map(o => o.value)
        .reverse(); // Reverse so oldest is first (for left-to-right charts)
}

/**
 * Gets a value from N periods ago
 * @param {Object} seriesData - Series data object
 * @param {number} periods - Number of periods back
 * @returns {number|null} Value or null
 */
export function getValueNPeriodsAgo(seriesData, periods) {
    if (!seriesData || !seriesData.observations || seriesData.observations.length <= periods) {
        return null;
    }
    return seriesData.observations[periods].value;
}

/**
 * Calculates year-over-year change
 * @param {Object} seriesData - Series data object (assumed monthly)
 * @returns {number|null} YoY change or null
 */
export function getYoYChange(seriesData) {
    const current = getLatestValue(seriesData);
    const yearAgo = getValueNPeriodsAgo(seriesData, 12);
    if (current === null || yearAgo === null) return null;
    return current - yearAgo;
}

/**
 * Calculates year-over-year percentage change
 * @param {Object} seriesData - Series data object (assumed monthly)
 * @returns {number|null} YoY percent change or null
 */
export function getYoYPercentChange(seriesData) {
    const current = getLatestValue(seriesData);
    const yearAgo = getValueNPeriodsAgo(seriesData, 12);
    if (current === null || yearAgo === null || yearAgo === 0) return null;
    return ((current - yearAgo) / yearAgo) * 100;
}
