// frontend/src/lib/cache.js - Système de cache local avec TTL

import { useState, useEffect, useCallback } from 'react';

/**
 * Système de cache local avec TTL (Time To Live)
 * Évite les requêtes API répétées pour les données peu changeantes
 */
class LocalCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Définir une valeur avec TTL optionnel (en millisecondes)
   * @param {string} key - Clé du cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Durée de vie en ms (défaut: 5 minutes)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    this.cache.set(key, value);
    this.timestamps.set(key, {
      createdAt: Date.now(),
      ttl,
    });
  }

  /**
   * Récupérer une valeur (null si expirée ou inexistante)
   * @param {string} key - Clé du cache
   * @returns {any|null} Valeur ou null
   */
  get(key) {
    if (!this.cache.has(key)) return null;

    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    // Vérifier si expiré
    if (now - timestamp.createdAt > timestamp.ttl) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Vérifier si une clé existe et est valide
   * @param {string} key - Clé du cache
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Supprimer une clé
   * @param {string} key - Clé du cache
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Vider tout le cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Nettoyer les entrées expirées
   */
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp.createdAt > timestamp.ttl) {
        this.delete(key);
      }
    }
  }

  /**
   * Invalider des caches par pattern
   * @param {string|string[]} patterns - Pattern(s) à rechercher
   */
  invalidateByPattern(patterns) {
    if (!Array.isArray(patterns)) patterns = [patterns];

    let invalidated = 0;
    patterns.forEach((pattern) => {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.delete(key);
          invalidated++;
        }
      }
    });

    console.log(`🗑️ Cache invalidated: ${invalidated} entries for patterns:`, patterns);
    return invalidated;
  }

  /**
   * Obtenir les statistiques du cache
   * @returns {Object} Statistiques
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: this._estimateMemoryUsage(),
    };
  }

  /**
   * Estimer l'usage mémoire (approximatif)
   * @private
   */
  _estimateMemoryUsage() {
    let bytes = 0;
    for (const [key, value] of this.cache.entries()) {
      bytes += key.length * 2; // chars = 2 bytes
      bytes += JSON.stringify(value).length * 2;
    }
    return {
      bytes,
      kb: (bytes / 1024).toFixed(2),
      mb: (bytes / 1024 / 1024).toFixed(2),
    };
  }
}

// Instance singleton
export const localCache = new LocalCache();

// Nettoyage automatique toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const before = localCache.getStats().size;
    localCache.cleanup();
    const after = localCache.getStats().size;
    if (before !== after) {
      console.log(`🧹 Cache cleanup: ${before - after} expired entries removed`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Hook pour utiliser le cache local avec auto-fetch
 * 
 * @param {string} key - Clé unique du cache
 * @param {Function} fetcher - Fonction async pour récupérer les données
 * @param {number} ttl - Durée de vie en ms (défaut: 5 minutes)
 * @returns {Object} { data, loading, error, refetch, invalidate }
 * 
 * @example
 * const { data, loading, refetch } = useCachedData(
 *   'products-list',
 *   () => productService.getAll(),
 *   10 * 60 * 1000 // 10 minutes
 * );
 */
export function useCachedData(key, fetcher, ttl = 5 * 60 * 1000) {
  const [data, setData] = useState(() => localCache.get(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (force = false) => {
    // Si en cache et pas de force, retourner immédiatement
    if (!force && localCache.has(key)) {
      const cached = localCache.get(key);
      setData(cached);
      setLoading(false);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      localCache.set(key, result, ttl);
      setData(result);
      return result;
    } catch (err) {
      console.error(`❌ Cache fetch error for key: ${key}`, err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  // Charger au mount si pas en cache
  useEffect(() => {
    if (!localCache.has(key)) {
      fetchData();
    }
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    localCache.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
}

/**
 * Hook simple pour lire/écrire dans le cache
 * 
 * @param {string} key - Clé du cache
 * @param {any} initialValue - Valeur initiale si pas en cache
 * @param {number} ttl - Durée de vie en ms
 * @returns {[any, Function]} [value, setValue]
 * 
 * @example
 * const [userPrefs, setUserPrefs] = useCacheState('user-prefs', {}, 60 * 60 * 1000);
 */
export function useCacheState(key, initialValue = null, ttl = 5 * 60 * 1000) {
  const [value, setValue] = useState(() => {
    const cached = localCache.get(key);
    return cached !== null ? cached : initialValue;
  });

  const setCachedValue = useCallback((newValue) => {
    const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(valueToStore);
    localCache.set(key, valueToStore, ttl);
  }, [key, value, ttl]);

  return [value, setCachedValue];
}

export default localCache;