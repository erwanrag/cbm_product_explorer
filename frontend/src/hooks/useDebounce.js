// frontend/src/hooks/useDebounce.js - GARDER ET AMÉLIORER

import { useState, useEffect } from 'react';
import { config } from '@/config/environment';

/**
 * Hook de debounce optimisé avec configuration globale
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en ms (optionnel, utilise config par défaut)
 * @returns {any} Valeur debouncée
 */
export function useDebounce(value, delay = config.performance.debounceDelay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook de debounce pour callbacks
 * @param {Function} callback - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function} Callback debouncé
 */
export function useDebouncedCallback(callback, delay = config.performance.debounceDelay) {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

export default useDebounce;
