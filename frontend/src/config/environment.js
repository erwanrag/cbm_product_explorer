// frontend/src/config/environment.js - CONFIGURATION FINALE UNIFIÉE

/**
 * Configuration d'environnement centralisée pour CBM GRC Matcher
 * Remplace et unifie tous les fichiers de config éparpillés
 */
class EnvironmentConfig {
  constructor() {
    // Détection de l'environnement
    this.env = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
    this.isDevelopment = this.env === 'dev' || this.env === 'development';
    this.isProduction = this.env === 'prod' || this.env === 'production';
    this.isStaging = this.env === 'staging';

    // Validation au démarrage
    this.validateConfig();
    this.logEnvironmentInfo();
  }

  // ===== API CONFIGURATION =====
  get apiBaseUrl() {
    const url = import.meta.env.VITE_API_URL;

    // Fallback développement avec URL correcte
    if (!url) {
      if (this.isDevelopment) {
        const fallback = 'http://127.0.0.1:5180/api/v1';
        console.warn('⚠️  VITE_API_URL non définie, utilisation du fallback:', fallback);
        return fallback;
      }
      throw new Error('❌ VITE_API_URL est obligatoire en production');
    }

    // Normalisation de l'URL (assure /api/v1 à la fin)
    return this.normalizeApiUrl(url);
  }

  normalizeApiUrl(url) {
    // Supprimer le trailing slash
    const cleanUrl = url.replace(/\/+$/, '');

    // Ajouter /api/v1 si pas présent
    if (cleanUrl.endsWith('/api/v1')) {
      return cleanUrl;
    } else if (cleanUrl.includes('/api/v1')) {
      return cleanUrl; // URL déjà correcte avec /api/v1 quelque part
    } else {
      return cleanUrl + '/api/v1';
    }
  }

  // ===== FEATURES FLAGS =====
  get features() {
    return {
      // Outils de développement
      enableDevTools: this.isDevelopment,
      enableReactQueryDevTools: this.isDevelopment,
      enableReduxDevTools: this.isDevelopment,

      // Analytics & Monitoring
      enableAnalytics: this.isProduction,
      enablePerformanceMonitoring: this.isProduction || this.isStaging,
      enableErrorReporting: this.isProduction || this.isStaging,

      // Debug & Logs
      enableDebugLogs: this.isDevelopment,
      enableVerboseLogs: import.meta.env.VITE_VERBOSE_LOGS === 'true',

      // Mock Data
      enableMockData: import.meta.env.VITE_ENABLE_MOCK === 'true',

      // Experimental
      enableExperimentalFeatures: import.meta.env.VITE_EXPERIMENTAL === 'true',
    };
  }

  // ===== PERFORMANCE SETTINGS =====
  get performance() {
    return {
      // Timeouts (en millisecondes)
      requestTimeout: this.getNumericEnv('VITE_REQUEST_TIMEOUT', 30000),
      cacheTimeout: this.getNumericEnv('VITE_CACHE_TIMEOUT', 300000), // 5 min
      longCacheTimeout: this.getNumericEnv('VITE_LONG_CACHE_TIMEOUT', 3600000), // 1h

      // Retry logic
      retryAttempts: this.getNumericEnv('VITE_RETRY_ATTEMPTS', 3),
      retryDelay: this.getNumericEnv('VITE_RETRY_DELAY', 1000),

      // UI Responsiveness
      debounceDelay: this.getNumericEnv('VITE_DEBOUNCE_DELAY', 300),
      throttleDelay: this.getNumericEnv('VITE_THROTTLE_DELAY', 100),

      // Pagination
      defaultPageSize: this.getNumericEnv('VITE_DEFAULT_PAGE_SIZE', 50),
      maxPageSize: this.getNumericEnv('VITE_MAX_PAGE_SIZE', 200),

      // Bundle & Loading
      chunkSize: this.getNumericEnv('VITE_CHUNK_SIZE', 500),
      preloadChunks: import.meta.env.VITE_PRELOAD_CHUNKS !== 'false',
    };
  }

  // ===== UI SETTINGS =====
  get ui() {
    return {
      // Thème
      theme: import.meta.env.VITE_THEME || 'light',
      darkMode: import.meta.env.VITE_DARK_MODE === 'true',

      // Localisation
      language: import.meta.env.VITE_LANGUAGE || 'fr',
      locale: import.meta.env.VITE_LOCALE || 'fr-FR',
      timezone: import.meta.env.VITE_TIMEZONE || 'Europe/Paris',

      // Animations
      animationsEnabled: import.meta.env.VITE_ANIMATIONS !== 'false',
      animationDuration: this.getNumericEnv('VITE_ANIMATION_DURATION', 300),
      reducedMotion: import.meta.env.VITE_REDUCED_MOTION === 'true',

      // Layout
      sidebarCollapsed: import.meta.env.VITE_SIDEBAR_COLLAPSED === 'true',
      compactMode: import.meta.env.VITE_COMPACT_MODE === 'true',

      // Notifications
      notificationDuration: this.getNumericEnv('VITE_NOTIFICATION_DURATION', 5000),
      notificationPosition: import.meta.env.VITE_NOTIFICATION_POSITION || 'top-right',
    };
  }

  // ===== BUSINESS SETTINGS =====
  get business() {
    return {
      // CBM spécifique
      companyName: 'CBM',
      appName: 'GRC Matcher',
      version: import.meta.env.VITE_VERSION || '2.0.0',

      // Formats
      dateFormat: import.meta.env.VITE_DATE_FORMAT || 'DD/MM/YYYY',
      timeFormat: import.meta.env.VITE_TIME_FORMAT || 'HH:mm',
      currencyFormat: import.meta.env.VITE_CURRENCY_FORMAT || 'EUR',

      // Limites métier
      maxProductsInBatch: this.getNumericEnv('VITE_MAX_PRODUCTS_BATCH', 100),
      maxSearchResults: this.getNumericEnv('VITE_MAX_SEARCH_RESULTS', 500),
    };
  }

  // ===== UTILITAIRES =====
  getNumericEnv(key, defaultValue) {
    const value = import.meta.env[key];
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  getBooleanEnv(key, defaultValue = false) {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
  }

  // ===== VALIDATION =====
  validateConfig() {
    const errors = [];

    // Validation API URL
    try {
      new URL(this.apiBaseUrl);
    } catch (error) {
      errors.push(`VITE_API_URL invalide: ${this.apiBaseUrl}`);
    }

    // Validation timeouts
    if (this.performance.requestTimeout < 1000) {
      errors.push('VITE_REQUEST_TIMEOUT doit être >= 1000ms');
    }

    // Validation pagination
    if (this.performance.defaultPageSize > this.performance.maxPageSize) {
      errors.push('VITE_DEFAULT_PAGE_SIZE ne peut pas être > VITE_MAX_PAGE_SIZE');
    }

    if (errors.length > 0) {
      console.error('❌ Erreurs de configuration:', errors);
      throw new Error(`Configuration invalide: ${errors.join(', ')}`);
    }
  }

  // ===== LOGGING =====
  logEnvironmentInfo() {
    if (this.features.enableDebugLogs) {
      console.group('🔧 Configuration CBM GRC Matcher');
      console.log('🌍 Environnement:', this.env);
      console.log('🔗 API URL:', this.apiBaseUrl);
      console.log(
        '⚡ Features actives:',
        Object.entries(this.features)
          .filter(([, enabled]) => enabled)
          .map(([name]) => name)
      );
      console.log('📊 Performance:', {
        timeout: `${this.performance.requestTimeout}ms`,
        cache: `${this.performance.cacheTimeout}ms`,
        pageSize: this.performance.defaultPageSize,
      });
      console.groupEnd();
    }
  }

  // ===== API PUBLIQUE =====

  /**
   * Vérifie si une feature est activée
   */
  isFeatureEnabled(featureName) {
    return this.features[featureName] === true;
  }

  /**
   * Retourne la configuration complète
   */
  getFullConfig() {
    return {
      env: this.env,
      api: { baseUrl: this.apiBaseUrl },
      features: this.features,
      performance: this.performance,
      ui: this.ui,
      business: this.business,
    };
  }
}

// Export singleton
export const config = new EnvironmentConfig();

// Exports individuels pour compatibilité
export const API_BASE_URL = config.apiBaseUrl;
export const IS_DEVELOPMENT = config.isDevelopment;
export const IS_PRODUCTION = config.isProduction;

// Export par défaut
export default config;
