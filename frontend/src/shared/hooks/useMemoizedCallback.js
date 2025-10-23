import { useCallback, useRef } from 'react';

/**
 * Hook pour mémoriser les callbacks et éviter les re-renders
 * Plus stable que useCallback standard pour les dépendances complexes
 */
export function useMemoizedCallback(callback) {
  const callbackRef = useRef(callback);
  
  // Toujours garder la dernière version du callback
  callbackRef.current = callback;
  
  // Retourner une fonction stable qui appelle toujours la dernière version
  return useCallback((...args) => callbackRef.current(...args), []);
}