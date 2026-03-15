/**
 * Settings Module
 * Handles manual data entry form and localStorage persistence
 */

import { MANUAL_ENTRIES } from './config.js';

const STORAGE_KEY = 'dashboard_manual_entries';

/**
 * Load manual entries from localStorage
 * @returns {Object} Manual entries object with values and timestamps
 */
export function loadManualEntries() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load manual entries:', e);
    }
    return {};
}

/**
 * Save manual entries to localStorage
 * @param {Object} entries - Manual entries object
 */
export function saveManualEntries(entries) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.warn('Failed to save manual entries:', e);
    }
}

/**
 * Get a specific manual entry
 * @param {string} key - Entry key
 * @returns {Object|null} Entry object with value and lastUpdated, or null
 */
export function getManualEntry(key) {
    const entries = loadManualEntries();
    return entries[key] || null;
}

/**
 * Set a specific manual entry
 * @param {string} key - Entry key
 * @param {number|string} value - Entry value
 */
export function setManualEntry(key, value) {
    const entries = loadManualEntries();
    entries[key] = {
        value: value,
        lastUpdated: new Date().toISOString()
    };
    saveManualEntries(entries);
}

/**
 * Delete a specific manual entry
 * @param {string} key - Entry key
 */
export function deleteManualEntry(key) {
    const entries = loadManualEntries();
    delete entries[key];
    saveManualEntries(entries);
}

/**
 * Format a date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Render the settings form
 * @param {HTMLElement} container - Container element
 * @param {Function} onSave - Callback when entries are saved
 */
export function renderSettingsForm(container, onSave) {
    const entries = loadManualEntries();

    const html = `
        <div class="settings-form">
            <p class="settings-description">
                Enter values from external sources that are not available via FRED API.
                These values are stored locally in your browser.
            </p>

            <div class="settings-grid">
                ${MANUAL_ENTRIES.map(entry => {
                    const current = entries[entry.key];
                    return `
                        <div class="setting-item">
                            <label for="setting-${entry.key}" class="setting-label">
                                ${entry.label}
                                <span class="setting-unit">(${entry.unit})</span>
                            </label>
                            <div class="setting-input-row">
                                <input
                                    type="number"
                                    id="setting-${entry.key}"
                                    name="${entry.key}"
                                    class="setting-input"
                                    value="${current?.value || ''}"
                                    placeholder="Enter value"
                                    step="any"
                                >
                                ${current ? `<button type="button" class="btn-clear" data-key="${entry.key}" title="Clear">&times;</button>` : ''}
                            </div>
                            <div class="setting-meta">
                                <span class="setting-frequency">Updates: ${entry.updateFrequency}</span>
                                ${current ? `<span class="setting-last-updated">Last set: ${formatDate(current.lastUpdated)}</span>` : ''}
                            </div>
                            <a href="${entry.source}" target="_blank" rel="noopener" class="setting-source">
                                View source &rarr;
                            </a>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="settings-actions">
                <button type="button" id="settings-save" class="btn-primary">Save All</button>
                <button type="button" id="settings-clear-all" class="btn-secondary">Clear All</button>
            </div>

            <hr class="settings-divider">

            <div class="settings-api">
                <h3>API Configuration</h3>
                <p>Current API Key: <code>${getApiKeyPreview()}</code></p>
                <button type="button" id="settings-clear-api" class="btn-danger">Clear API Key & Reload</button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach event listeners
    container.querySelector('#settings-save')?.addEventListener('click', () => {
        const newEntries = { ...entries };

        MANUAL_ENTRIES.forEach(entry => {
            const input = container.querySelector(`#setting-${entry.key}`);
            if (input && input.value !== '') {
                newEntries[entry.key] = {
                    value: parseFloat(input.value),
                    lastUpdated: new Date().toISOString()
                };
            }
        });

        saveManualEntries(newEntries);

        if (onSave) onSave(newEntries);

        // Re-render to show updated timestamps
        renderSettingsForm(container, onSave);
    });

    container.querySelector('#settings-clear-all')?.addEventListener('click', () => {
        if (confirm('Clear all manual entries?')) {
            saveManualEntries({});
            if (onSave) onSave({});
            renderSettingsForm(container, onSave);
        }
    });

    container.querySelector('#settings-clear-api')?.addEventListener('click', () => {
        if (confirm('Clear API key and reload? You will need to re-enter your FRED API key.')) {
            localStorage.removeItem('fred_api_key');
            sessionStorage.clear();
            location.reload();
        }
    });

    // Clear individual entry buttons
    container.querySelectorAll('.btn-clear').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            deleteManualEntry(key);
            if (onSave) onSave(loadManualEntries());
            renderSettingsForm(container, onSave);
        });
    });
}

/**
 * Get API key preview (masked)
 * @returns {string} Masked API key or "Not set"
 */
function getApiKeyPreview() {
    const key = localStorage.getItem('fred_api_key');
    if (!key) return 'Not set';
    return '••••••••' + key.slice(-4);
}
