import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Hook optimisé pour les queries avec cache intelligent
 * Évite les re-fetches inutiles et améliore les performances
 */
export function useOptimizedQuery(queryKey, queryFn, options = {}) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes par défaut
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
    retry = 1,
    ...restOptions
  } = options;

  // Memoize queryKey pour éviter les re-renders
  const memoizedKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  const query = useQuery({
    queryKey: memoizedKey,
    queryFn,
    staleTime,
    cacheTime,
    refetchOnWindowFocus,
    retry,
    ...restOptions,
  });

  // Fonction de refresh optimisée
  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    ...query,
    refresh,
    hasData: !!query.data,
    isEmpty: query.data && (Array.isArray(query.data) ? query.data.length === 0 : Object.keys(query.data).length === 0),
  };
}