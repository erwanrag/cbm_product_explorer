// frontend/src/api/core/BaseApiService.js - VERSION OPTIMISÉE AVEC CACHE

import apiClient from '@/api/core/client';
import { localCache } from '@/lib/cache';

export class BaseApiService {
    constructor(baseEndpoint, options = {}) {
        this.baseEndpoint = baseEndpoint;
        this.defaultCacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 minutes par défaut
        this.enableCache = options.enableCache !== false; // Cache activé par défaut
    }

    /**
     * GET avec cache optionnel
     */
    async get(endpoint = '', params = {}, options = {}) {
        const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
        
        // Gestion du cache
        const {
            useCache = this.enableCache,
            cacheTTL = this.defaultCacheTTL,
            forceRefresh = false,
            ...axiosOptions
        } = options;

        // Générer clé de cache
        const cacheKey = this._generateCacheKey('GET', url, params);

        // Vérifier le cache
        if (useCache && !forceRefresh) {
            const cached = localCache.get(cacheKey);
            if (cached) {
                console.log(`✅ Cache hit: ${url}`);
                return cached;
            }
        }

        try {
            console.log(`🌐 API call: GET ${url}`);
            const response = await apiClient.get(url, { params, ...axiosOptions });
            
            // Mettre en cache
            if (useCache) {
                localCache.set(cacheKey, response.data, cacheTTL);
            }
            
            return response.data;
        } catch (error) {
            this._handleError('GET', url, error);
            throw error;
        }
    }

    /**
     * POST sans cache (mutation)
     */
    async post(endpoint = '', payload = {}, options = {}) {
        const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
        
        const { invalidateCache, ...axiosOptions } = options;

        try {
            console.log(`🌐 API call: POST ${url}`);
            const response = await apiClient.post(url, payload, axiosOptions);
            
            // Invalider le cache après mutation
            if (invalidateCache) {
                this.invalidateCache(invalidateCache);
            }
            
            return response.data;
        } catch (error) {
            this._handleError('POST', url, error);
            throw error;
        }
    }

    /**
     * PUT sans cache (mutation)
     */
    async put(endpoint = '', payload = {}, options = {}) {
        const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
        
        const { invalidateCache, ...axiosOptions } = options;

        try {
            console.log(`🌐 API call: PUT ${url}`);
            const response = await apiClient.put(url, payload, axiosOptions);
            
            if (invalidateCache) {
                this.invalidateCache(invalidateCache);
            }
            
            return response.data;
        } catch (error) {
            this._handleError('PUT', url, error);
            throw error;
        }
    }

    /**
     * DELETE sans cache (mutation)
     */
    async delete(endpoint, options = {}) {
        const url = `${this.baseEndpoint}/${endpoint}`;
        
        const { invalidateCache, ...axiosOptions } = options;

        try {
            console.log(`🌐 API call: DELETE ${url}`);
            const response = await apiClient.delete(url, axiosOptions);
            
            if (invalidateCache) {
                this.invalidateCache(invalidateCache);
            }
            
            return response.data;
        } catch (error) {
            this._handleError('DELETE', url, error);
            throw error;
        }
    }

    /**
     * Construire l'URL complète
     */
    buildUrl(endpoint = '') {
        return endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
    }

    /**
     * Construire le payload standard CBM
     */
    buildPayload(filters = {}) {
        return {
            cod_pro: filters.cod_pro || null,
            ref_crn: filters.ref_crn || null,
            ref_ext: filters.ref_ext || null,
            refint: filters.refint || null,
            qualite: filters.qualite || null,
            grouping_crn: filters.grouping_crn || 0,
            single_cod_pro: filters.single_cod_pro || false,
        };
    }

    /**
     * Invalider le cache pour ce service
     */
    invalidateCache(patterns = null) {
        if (!patterns) {
            // Invalider tout le cache de ce service
            patterns = [this.baseEndpoint];
        }
        localCache.invalidateByPattern(patterns);
    }

    /**
     * Vider tout le cache de ce service
     */
    clearCache() {
        this.invalidateCache([this.baseEndpoint]);
    }

    /**
     * Générer une clé de cache unique
     * @private
     */
    _generateCacheKey(method, url, params = {}) {
        const paramsStr = Object.keys(params).length > 0 
            ? JSON.stringify(params, Object.keys(params).sort())
            : '';
        return `api:${method}:${url}:${paramsStr}`;
    }

    /**
     * Gestion des erreurs
     * @private
     */
    _handleError(method, url, error) {
        const status = error.response?.status;
        console.error(`❌ API Error: ${method} ${url}`, {
            status,
            message: error.message,
            data: error.response?.data,
        });
    }
}

export default BaseApiService;