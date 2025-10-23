// frontend/src/api/core/optimizedClient.js - Client API avec cache automatique

import apiClient from './client';
import { localCache } from '@/lib/cache';

/**
 * Client API avec cache automatique
 * Enveloppe les requêtes avec un système de cache intelligent
 */
class OptimizedApiClient {
  constructor(client) {
    this.client = client;
    this.defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * GET avec cache automatique
   * @param {string} url - URL de la requête
   * @param {Object} config - Configuration Axios + options cache
   * @returns {Promise<any>} Données de la réponse
   */
  async get(url, config = {}) {
    const {
      useCache = true,
      cacheTTL = this.defaultCacheTTL,
      forceRefresh = false,
      cacheKey = null,
      ...axiosConfig
    } = config;

    // Générer une clé de cache unique
    const key = cacheKey || this._generateCacheKey('GET', url, axiosConfig.params);

    // Vérifier le cache si activé
    if (useCache && !forceRefresh) {
      const cached = localCache.get(key);
      if (cached) {
        console.log(`✅ Cache hit: ${url}`);
        return cached;
      }
    }

    // Faire la requête
    console.log(`🌐 API call: GET ${url}`);
    const response = await this.client.get(url, axiosConfig);

    // Mettre en cache si activé
    if (useCache) {
      localCache.set(key, response.data, cacheTTL);
    }

    return response.data;
  }

  /**
   * POST sans cache (mutations)
   * @param {string} url - URL de la requête
   * @param {any} data - Données à envoyer
   * @param {Object} config - Configuration
   * @returns {Promise<any>}
   */
  async post(url, data, config = {}) {
    const { invalidateCache, ...axiosConfig } = config;

    console.log(`🌐 API call: POST ${url}`);
    const response = await this.client.post(url, data, axiosConfig);

    // Invalider les caches liés après une mutation
    if (invalidateCache) {
      this.invalidateCache(invalidateCache);
    }

    return response.data;
  }

  /**
   * PUT sans cache (mutations)
   */
  async put(url, data, config = {}) {
    const { invalidateCache, ...axiosConfig } = config;

    console.log(`🌐 API call: PUT ${url}`);
    const response = await this.client.put(url, data, axiosConfig);

    if (invalidateCache) {
      this.invalidateCache(invalidateCache);
    }

    return response.data;
  }

  /**
   * DELETE sans cache (mutations)
   */
  async delete(url, config = {}) {
    const { invalidateCache, ...axiosConfig } = config;

    console.log(`🌐 API call: DELETE ${url}`);
    const response = await this.client.delete(url, axiosConfig);

    if (invalidateCache) {
      this.invalidateCache(invalidateCache);
    }

    return response.data;
  }

  /**
   * Invalider des caches par pattern
   * @param {string|string[]} patterns - Pattern(s) à invalider
   */
  invalidateCache(patterns) {
    localCache.invalidateByPattern(patterns);
  }

  /**
   * Vider tout le cache
   */
  clearCache() {
    localCache.clear();
    console.log('🗑️ All cache cleared');
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
   * Obtenir les stats du cache
   */
  getCacheStats() {
    return localCache.getStats();
  }
}

// Instance singleton
export const optimizedApiClient = new OptimizedApiClient(apiClient);

export default optimizedApiClient;