// frontend/src/hooks/useDebounce.js - VERSION COMPLÈTE OPTIMISÉE

import { useState, useEffect, useCallback, useRef } from 'react';
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
 * Hook de debounce pour callbacks - VERSION AMÉLIORÉE
 * @param {Function} callback - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function} Callback debouncé
 */
export function useDebouncedCallback(callback, delay = config.performance.debounceDelay) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Garder la ref à jour
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * ✨ NOUVEAU: Hook de recherche avec debounce optimisé
 * Évite les requêtes API inutiles lors de la saisie
 * 
 * @param {string} initialValue - Valeur initiale
 * @param {number} delay - Délai en ms
 * @returns {Object} { searchTerm, setSearchTerm, debouncedValue, isSearching, clearSearch }
 */
export function useSearchDebounce(initialValue = '', delay = config.performance.debounceDelay) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Indiquer qu'on est en train de chercher
    if (searchTerm !== debouncedValue) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
      setIsSearching(false);
    };
  }, [searchTerm, delay, debouncedValue]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedValue('');
    setIsSearching(false);
  }, []);

  return {
    searchTerm,        // Valeur actuelle du champ
    setSearchTerm,     // Setter pour le champ
    debouncedValue,    // Valeur debouncée (pour API)
    isSearching,       // true pendant le debounce
    clearSearch,       // Fonction pour reset
  };
}

/**
 * ✨ NOUVEAU: Hook de debounce avec état de chargement
 * Utile pour afficher un loader pendant le debounce
 * 
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Object} { debouncedValue, isPending }
 */
export function useDebounceWithStatus(value, delay = config.performance.debounceDelay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(handler);
      setIsPending(false);
    };
  }, [value, delay]);

  return {
    debouncedValue,
    isPending,
  };
}

export default useDebounce;