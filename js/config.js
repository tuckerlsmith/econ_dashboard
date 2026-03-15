/**
 * FRED Series Configuration
 * Defines all series IDs, their fetch limits, and frequencies
 */

export const SERIES_CONFIG = {
    // ============================================
    // Panel 1: Dollar Regime Diagnostic
    // ============================================

    // US 10-Year Treasury Yield (Daily)
    DGS10: { limit: 365, frequency: 'daily' },

    // Trade-Weighted US Dollar Index - Broad (Daily)
    DTWEXBGS: { limit: 365, frequency: 'daily' },

    // 5-Year, 5-Year Forward Inflation Expectation Rate (Daily)
    T5YIFR: { limit: 365, frequency: 'daily' },

    // ============================================
    // Panel 2: Domestic Credit & Credibility
    // ============================================

    // ICE BofA US High Yield Option-Adjusted Spread (Daily)
    BAMLH0A0HYM2: { limit: 365, frequency: 'daily' },

    // 10-Year Treasury Constant Maturity Minus 2-Year (Daily)
    T10Y2Y: { limit: 365, frequency: 'daily' },

    // Federal Surplus or Deficit (Monthly)
    MTSDS133FMS: { limit: 24, frequency: 'monthly' },

    // ============================================
    // Panel 3: Sectoral Comparison Matrix
    // ============================================

    // Employment - All Employees
    CES6562000001: { limit: 24, frequency: 'monthly' }, // Healthcare & Social Assistance
    USPBS: { limit: 24, frequency: 'monthly' },         // Professional & Business Services
    USINFO: { limit: 24, frequency: 'monthly' },        // Information
    MANEMP: { limit: 24, frequency: 'monthly' },        // Manufacturing
    USCONS: { limit: 24, frequency: 'monthly' },        // Construction

    // Average Weekly Earnings
    CES6562000011: { limit: 24, frequency: 'monthly' }, // Healthcare
    CES6054000011: { limit: 24, frequency: 'monthly' }, // Prof & Business Services
    CES5000000011: { limit: 24, frequency: 'monthly' }, // Information
    CES3000000011: { limit: 24, frequency: 'monthly' }, // Manufacturing
    CES2000000011: { limit: 24, frequency: 'monthly' }, // Construction

    // Job Openings (JOLTS)
    JTS6200JOL: { limit: 24, frequency: 'monthly' },           // Healthcare & Social Assistance
    JTS540099000000000JOL: { limit: 24, frequency: 'monthly' }, // Professional & Business Services
    JTS3000JOL: { limit: 24, frequency: 'monthly' },           // Manufacturing
    JTS2300JOL: { limit: 24, frequency: 'monthly' },           // Construction
    // Note: JOLTS for Information sector needs verification

    // Output Index
    IPMAN: { limit: 24, frequency: 'monthly' }, // Industrial Production: Manufacturing

    // ============================================
    // Panel 4: Domestic Expenses (CPI Components)
    // ============================================

    // CPI: Shelter (Monthly)
    CUSR0000SAH1: { limit: 36, frequency: 'monthly' },

    // CPI: Medical Care (Monthly)
    CUSR0000SAM: { limit: 36, frequency: 'monthly' },

    // CPI: Energy (Monthly)
    CUSR0000SA0E: { limit: 36, frequency: 'monthly' },

    // ============================================
    // Panel 5: Comparative Sovereign Yields
    // ============================================

    // 10-Year Government Bond Yields (Monthly, OECD)
    IRLTLT01USM156N: { limit: 24, frequency: 'monthly' }, // United States
    IRLTLT01DEM156N: { limit: 24, frequency: 'monthly' }, // Germany
    IRLTLT01FRM156N: { limit: 24, frequency: 'monthly' }, // France
    IRLTLT01GBM156N: { limit: 24, frequency: 'monthly' }, // United Kingdom
    IRLTLT01JPM156N: { limit: 24, frequency: 'monthly' }, // Japan
    IRLTLT01KRM156N: { limit: 24, frequency: 'monthly' }, // South Korea
    // Note: China 10Y not available on FRED - use Investing.com

    // ============================================
    // Panel 5: Exchange Rates (Daily)
    // ============================================

    DEXUSEU: { limit: 365, frequency: 'daily' }, // EUR/USD (Dollars per Euro)
    DEXUSUK: { limit: 365, frequency: 'daily' }, // GBP/USD (Dollars per Pound)
    DEXJPUS: { limit: 365, frequency: 'daily' }, // USD/JPY (Yen per Dollar)
    DEXCHUS: { limit: 365, frequency: 'daily' }, // USD/CNY (Yuan per Dollar)
    DEXKOUS: { limit: 365, frequency: 'daily' }, // USD/KRW (Won per Dollar)
};

// ============================================
// Sector Configuration
// ============================================

export const SECTORS = [
    {
        id: 'healthcare',
        name: 'Healthcare',
        shortName: 'Healthcare',
        color: '#f472b6',
        employment: 'CES6562000001',
        wages: 'CES6562000011',
        openings: 'JTS6200JOL',
        output: null // Quarterly BEA data - not on FRED
    },
    {
        id: 'profserv',
        name: 'Professional & Business Services',
        shortName: 'Prof & Business Svcs',
        color: '#818cf8',
        employment: 'USPBS',
        wages: 'CES6054000011',
        openings: 'JTS540099000000000JOL',
        output: null
    },
    {
        id: 'infotech',
        name: 'Information',
        shortName: 'Information',
        color: '#06b6d4',
        employment: 'USINFO',
        wages: 'CES5000000011',
        openings: null, // JOLTS series ID needs verification
        output: null
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing',
        shortName: 'Manufacturing',
        color: '#f59e0b',
        employment: 'MANEMP',
        wages: 'CES3000000011',
        openings: 'JTS3000JOL',
        output: 'IPMAN'
    },
    {
        id: 'construction',
        name: 'Construction',
        shortName: 'Construction',
        color: '#22c55e',
        employment: 'USCONS',
        wages: 'CES2000000011',
        openings: 'JTS2300JOL',
        output: null
    }
];

// ============================================
// Country Configuration (for Panel 5)
// ============================================

export const COUNTRIES = [
    {
        id: 'us',
        name: 'United States',
        flag: '🇺🇸',
        color: '#3b82f6',
        yieldSeries: 'IRLTLT01USM156N',
        dailyYieldSeries: 'DGS10', // Use daily series for current display
        investingUrl: 'https://www.investing.com/rates-bonds/u.s.-10-year-bond-yield'
    },
    {
        id: 'de',
        name: 'Germany',
        flag: '🇩🇪',
        color: '#22c55e',
        yieldSeries: 'IRLTLT01DEM156N',
        investingUrl: 'https://www.investing.com/rates-bonds/germany-10-year-bond-yield'
    },
    {
        id: 'fr',
        name: 'France',
        flag: '🇫🇷',
        color: '#f59e0b',
        yieldSeries: 'IRLTLT01FRM156N',
        investingUrl: 'https://www.investing.com/rates-bonds/france-10-year-bond-yield'
    },
    {
        id: 'gb',
        name: 'United Kingdom',
        flag: '🇬🇧',
        color: '#8b5cf6',
        yieldSeries: 'IRLTLT01GBM156N',
        investingUrl: 'https://www.investing.com/rates-bonds/uk-10-year-bond-yield'
    },
    {
        id: 'jp',
        name: 'Japan',
        flag: '🇯🇵',
        color: '#ef4444',
        yieldSeries: 'IRLTLT01JPM156N',
        investingUrl: 'https://www.investing.com/rates-bonds/japan-10-year-bond-yield'
    },
    {
        id: 'kr',
        name: 'South Korea',
        flag: '🇰🇷',
        color: '#06b6d4',
        yieldSeries: 'IRLTLT01KRM156N',
        investingUrl: 'https://www.investing.com/rates-bonds/south-korea-10-year-bond-yield'
    },
    {
        id: 'cn',
        name: 'China',
        flag: '🇨🇳',
        color: '#dc2626',
        yieldSeries: null, // Not on FRED
        investingUrl: 'https://www.investing.com/rates-bonds/china-10-year-bond-yield'
    }
];

// ============================================
// Currency Configuration
// ============================================

export const CURRENCIES = [
    {
        id: 'eurusd',
        pair: 'EUR/USD',
        series: 'DEXUSEU',
        description: 'Dollars per Euro',
        invertDisplay: false // Higher = stronger euro
    },
    {
        id: 'gbpusd',
        pair: 'GBP/USD',
        series: 'DEXUSUK',
        description: 'Dollars per Pound',
        invertDisplay: false
    },
    {
        id: 'usdjpy',
        pair: 'USD/JPY',
        series: 'DEXJPUS',
        description: 'Yen per Dollar',
        invertDisplay: true // Higher = stronger dollar
    },
    {
        id: 'usdcny',
        pair: 'USD/CNY',
        series: 'DEXCHUS',
        description: 'Yuan per Dollar',
        invertDisplay: true
    },
    {
        id: 'usdkrw',
        pair: 'USD/KRW',
        series: 'DEXKOUS',
        description: 'Won per Dollar',
        invertDisplay: true
    }
];

// ============================================
// Threshold Configuration
// ============================================

export const THRESHOLDS = {
    // HY OAS thresholds (basis points)
    hyOas: [
        { max: 400, class: 'threshold-green', label: 'Normal' },
        { max: 500, class: 'threshold-amber', label: 'Elevated' },
        { max: 800, class: 'threshold-red', label: 'Stress' },
        { max: Infinity, class: 'threshold-critical', label: 'Crisis' }
    ],

    // Term Premium thresholds (basis points)
    termPremium: [
        { max: 75, class: 'threshold-green', label: 'Normal' },
        { max: 100, class: 'threshold-amber', label: 'Elevated' },
        { max: Infinity, class: 'threshold-red', label: 'High' }
    ],

    // Deficit/GDP thresholds (percent)
    deficitGdp: [
        { max: 5, class: 'threshold-green', label: 'Sustainable' },
        { max: 8, class: 'threshold-amber', label: 'Elevated' },
        { max: Infinity, class: 'threshold-red', label: 'Critical' }
    ],

    // 5Y5Y Forward thresholds (percent)
    forward5y5y: [
        { max: 2.5, class: 'threshold-green', label: 'Anchored' },
        { max: 3.0, class: 'threshold-amber', label: 'Elevated' },
        { max: Infinity, class: 'threshold-red', label: 'De-anchoring' }
    ],

    // Regime correlation thresholds
    regimeCorrelation: {
        positive: 0.3,  // Above this = Regime 1 or 4
        negative: -0.3  // Below this = Regime 2 or 3
    }
};

// ============================================
// Regime Configuration
// ============================================

export const REGIMES = {
    1: {
        name: 'Healthy Tightening',
        description: 'Yields up, dollar up — capital attracted by higher rates',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.08)'
    },
    2: {
        name: 'Fiscal/Institutional Crisis',
        description: 'Yields up, dollar down — loss of sovereign confidence',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.08)'
    },
    3: {
        name: 'Flight to Safety',
        description: 'Yields down, dollar up — risk-off safe haven demand',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    4: {
        name: 'Easing/Stimulus',
        description: 'Yields down, dollar down — capital seeking return elsewhere',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.08)'
    },
    indeterminate: {
        name: 'Indeterminate',
        description: 'No clear regime signal',
        color: '#5a6478',
        bgColor: 'transparent'
    }
};

// ============================================
// Manual Entry Configuration
// ============================================

export const MANUAL_ENTRIES = [
    {
        key: 'termPremium',
        label: 'NY Fed ACM 10Y Term Premium',
        unit: 'bps',
        source: 'https://www.newyorkfed.org/research/data_indicators/term-premia-tabs#/overview',
        updateFrequency: 'Daily'
    },
    {
        key: 'dollarReserveShare',
        label: 'Dollar Reserve Share (IMF COFER)',
        unit: '%',
        source: 'https://data.imf.org/COFER',
        updateFrequency: 'Quarterly'
    },
    {
        key: 'dollarInvoicingShare',
        label: 'Dollar Invoicing Share (BIS/SWIFT)',
        unit: '%',
        source: 'https://www.swift.com/our-solutions/compliance-and-shared-services/business-intelligence/renminbi/rmb-tracker',
        updateFrequency: 'Annual'
    },
    {
        key: 'naftaShareImports',
        label: 'NAFTA Share of US Imports',
        unit: '%',
        source: 'https://www.census.gov/foreign-trade/statistics/',
        updateFrequency: 'Monthly'
    },
    {
        key: 'chinaShareImports',
        label: 'China Share of US Imports',
        unit: '%',
        source: 'https://www.census.gov/foreign-trade/statistics/',
        updateFrequency: 'Monthly'
    },
    {
        key: 'rmbSwiftShare',
        label: 'RMB Share of SWIFT Payments',
        unit: '%',
        source: 'https://www.swift.com/our-solutions/compliance-and-shared-services/business-intelligence/renminbi/rmb-tracker',
        updateFrequency: 'Monthly'
    }
];
