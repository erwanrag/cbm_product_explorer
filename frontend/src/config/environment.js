// frontend/src/config/environment.js - VERSION CORRIGÉE
class EnvironmentConfig {
    constructor() {
        this.env = import.meta.env.VITE_ENV || import.meta.env.MODE;
        this.isDevelopment = this.env === 'dev' || this.env === 'development';
        this.isProduction = this.env === 'prod' || this.env === 'production';
        this.isStaging = this.env === 'staging';

        this.validateConfig();
    }

    get apiBaseUrl() {
        const url = import.meta.env.VITE_API_URL;

        if (!url) {
            if (this.isDevelopment) {
                console.warn('⚠️  VITE_API_URL non définie, utilisation du fallback développement');
                return 'http://127.0.0.1:5180/api/v1'; // ✅ PORT CORRIGÉ
            }
            throw new Error('❌ VITE_API_URL est obligatoire en production');
        }

        // Assurer que l'URL se termine par /api/v1 si pas déjà présent
        if (url.endsWith('/api/v1')) {
            return url;
        } else if (url.endsWith('/')) {
            return url + 'api/v1';
        } else {
            return url + '/api/v1';
        }
    }

    get features() {
        return {
            enableDevTools: this.isDevelopment,
            enableAnalytics: this.isProduction,
            enableMockData: import.meta.env.VITE_ENABLE_MOCK === 'true',
            enablePerformanceMonitoring: this.isProduction,
            enableErrorReporting: this.isProduction || this.isStaging,
            enableDebugLogs: this.isDevelopment
        };
    }

    get performance() {
        return {
            requestTimeout: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000,
            cacheTimeout: parseInt(import.meta.env.VITE_CACHE_TIMEOUT) || 300000,
            retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
            debounceDelay: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY) || 300
        };
    }

    get ui() {
        return {
            theme: import.meta.env.VITE_THEME || 'light',
            language: import.meta.env.VITE_LANGUAGE || 'fr',
            defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 50,
            maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 200,
            animationsEnabled: import.meta.env.VITE_ANIMATIONS !== 'false'
        };
    }

    validateConfig() {
        try {
            new URL(this.apiBaseUrl);
            console.log(`✅ Configuration ${this.env} validée`, {
                apiUrl: this.apiBaseUrl,
                isDev: this.isDevelopment,
                features: Object.entries(this.features).filter(([, enabled]) => enabled).map(([name]) => name)
            });
        } catch (error) {
            console.error(`❌ VITE_API_URL invalide: ${this.apiBaseUrl}`);
            throw new Error(`❌ VITE_API_URL invalide: ${this.apiBaseUrl}`);
        }
    }
}

export const config = new EnvironmentConfig();
export default config;
