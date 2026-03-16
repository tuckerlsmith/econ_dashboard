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
    USEHS: { limit: 24, frequency: 'monthly' },         // Education & Health Services supersector (NAICS 61+62)
    USPBS: { limit: 24, frequency: 'monthly' },         // Professional & Business Services
    USINFO: { limit: 24, frequency: 'monthly' },        // Information
    MANEMP: { limit: 24, frequency: 'monthly' },        // Manufacturing
    USCONS: { limit: 24, frequency: 'monthly' },        // Construction

    // Average Weekly Earnings (All Employees) - supersector level
    CES6500000011: { limit: 24, frequency: 'monthly' }, // Education & Health Services
    CES6000000011: { limit: 24, frequency: 'monthly' }, // Prof & Business Services
    CES5000000011: { limit: 24, frequency: 'monthly' }, // Information
    CES3000000011: { limit: 24, frequency: 'monthly' }, // Manufacturing
    CES2000000011: { limit: 24, frequency: 'monthly' }, // Construction

    // Job Openings (JOLTS)
    JTS6200JOL: { limit: 24, frequency: 'monthly' },    // Healthcare & Social Assistance
    JTS540099JOL: { limit: 24, frequency: 'monthly' },  // Professional & Business Services
    JTU5100JOL: { limit: 24, frequency: 'monthly' },    // Information (NSA — no SA version published by BLS)
    JTU6100JOL: { limit: 24, frequency: 'monthly' },    // Educational Services NAICS 61 (NSA) — summed with JTS6200JOL for Ed+Health total
    JTS3000JOL: { limit: 24, frequency: 'monthly' },    // Manufacturing
    JTS2300JOL: { limit: 24, frequency: 'monthly' },    // Construction

    // Real Value Added by Industry (BEA GDP by Industry release, Quarterly)
    // Units: Billions of Chained 2017 Dollars, SAAR
    RVAMA: { limit: 12, frequency: 'quarterly' },   // Manufacturing (NAICS 31-33)
    RVAC: { limit: 12, frequency: 'quarterly' },    // Construction (NAICS 23)
    RVAI: { limit: 12, frequency: 'quarterly' },    // Information (NAICS 51)
    RVAPBS: { limit: 12, frequency: 'quarterly' },  // Professional and Business Services (NAICS 54-56)
    RVAESHS: { limit: 12, frequency: 'quarterly' }, // Ed Services, Health Care & Social Assistance (NAICS 61-62) — ID unconfirmed; shows -- if unavailable

    // ============================================
    // Bond Explainer: Import Share Auto-Calculation
    // ============================================

    // US Goods Imports (NSA, Monthly) — Census/BEA via FRED
    IMP0015: { limit: 24, frequency: 'monthly' }, // Total US Goods Imports (World) — NSA denominator
    IMPCH: { limit: 24, frequency: 'monthly' },   // China Imports
    IMPCA: { limit: 24, frequency: 'monthly' },   // Canada Imports
    IMPMX: { limit: 24, frequency: 'monthly' },   // Mexico Imports (correct ID; IMPX does not exist)

    // ============================================
    // Panel 4: Domestic Expenses (CPI Components)
    // ============================================

    // CPI: Shelter (Monthly)
    CUSR0000SAH1: { limit: 36, frequency: 'monthly' },

    // CPI: Medical Care (Monthly) - using seasonally adjusted index
    CPIMEDSL: { limit: 36, frequency: 'monthly' },

    // CPI: Energy (Monthly) - using seasonally adjusted index
    CPIENGSL: { limit: 36, frequency: 'monthly' },

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
        name: 'Education & Health Services',
        shortName: 'Education & Health',
        color: '#f472b6',
        employment: 'USEHS',           // All Employees, Ed & Health Services supersector (NAICS 61+62)
        wages: 'CES6500000011',        // Avg Weekly Earnings, Ed & Health Services supersector (NAICS 61+62)
        openings: 'JTS6200JOL',        // JOLTS: Healthcare & Social Assistance (NAICS 62, SA)
        openings2: 'JTU6100JOL',       // JOLTS: Educational Services (NAICS 61, NSA) — summed with openings for full supersector total
        output: 'RVAESHS',             // Real Value Added, Ed Services + Health Care & Social Assistance (series ID unconfirmed — shows -- if unavailable)
    },
    {
        id: 'profserv',
        name: 'Professional & Business Services',
        shortName: 'Prof & Business Svcs',
        color: '#818cf8',
        employment: 'USPBS',
        wages: 'CES6000000011',
        openings: 'JTS540099JOL',
        output: 'RVAPBS'               // Real Value Added, Professional and Business Services
    },
    {
        id: 'infotech',
        name: 'Information',
        shortName: 'Information',
        color: '#06b6d4',
        employment: 'USINFO',
        wages: 'CES5000000011',
        openings: 'JTU5100JOL', // NSA — BLS does not publish SA JOLTS for Information sector
        output: 'RVAI'                 // Real Value Added, Information
    },
    {
        id: 'manufacturing',
        name: 'Manufacturing',
        shortName: 'Manufacturing',
        color: '#f59e0b',
        employment: 'MANEMP',
        wages: 'CES3000000011',
        openings: 'JTS3000JOL',
        output: 'RVAMA'                // Real Value Added, Manufacturing (replaces IPMAN index)
    },
    {
        id: 'construction',
        name: 'Construction',
        shortName: 'Construction',
        color: '#22c55e',
        employment: 'USCONS',
        wages: 'CES2000000011',
        openings: 'JTS2300JOL',
        output: 'RVAC'                 // Real Value Added, Construction
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

// All pairs expressed as units of foreign currency per 1 USD.
// Higher value = stronger dollar in every row.
// invert: true  → FRED quotes this as foreign-per-USD already; no math needed
// invert: false → FRED quotes USD-per-foreign; displayValue = 1 / fredValue
export const CURRENCIES = [
    {
        id: 'usdeur',
        pair: 'USD/EUR',
        series: 'DEXUSEU',
        description: 'Euro per Dollar',
        invert: false // FRED: USD per EUR → display 1/value (EUR per USD)
    },
    {
        id: 'usdgbp',
        pair: 'USD/GBP',
        series: 'DEXUSUK',
        description: 'Pounds per Dollar',
        invert: false // FRED: USD per GBP → display 1/value (GBP per USD)
    },
    {
        id: 'usdjpy',
        pair: 'USD/JPY',
        series: 'DEXJPUS',
        description: 'Yen per Dollar',
        invert: true // FRED: JPY per USD → already correct
    },
    {
        id: 'usdcny',
        pair: 'USD/CNY',
        series: 'DEXCHUS',
        description: 'Yuan per Dollar',
        invert: true // FRED: CNY per USD → already correct
    },
    {
        id: 'usdkrw',
        pair: 'USD/KRW',
        series: 'DEXKOUS',
        description: 'Won per Dollar',
        invert: true // FRED: KRW per USD → already correct
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
