// ===================================
// 📁 frontend/src/store/hooks/useApiData.js - CRÉER
// ===================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * Hook factory générique pour tous les appels API avec React Query
 * Standardise le comportement, les logs, les toasts et la gestion d'erreur
 */
export function useApiData(
    queryKey,
    apiFunction,
    filters = {},
    options = {}
) {
    // Vérification des filtres actifs
    const hasActiveFilters = useMemo(() => {
        if (!filters || typeof filters !== 'object') return false;

        const { cod_pro, ref_crn, ref_ext, refint, qualite } = filters;
        return !!(cod_pro || ref_crn || ref_ext || refint || qualite);
    }, [filters]);

    // Stabilisation des filtres pour React Query
    const stableFilters = useMemo(() => {
        if (!hasActiveFilters) return null;

        return {
            cod_pro: filters.cod_pro || null,
            ref_crn: filters.ref_crn || null,
            ref_ext: filters.ref_ext || null,
            refint: filters.refint || null,
            qualite: filters.qualite || null,
            grouping_crn: filters.grouping_crn || 0,
            single_cod_pro: filters.single_cod_pro || false
        };
    }, [
        filters?.cod_pro,
        filters?.ref_crn,
        filters?.ref_ext,
        filters?.refint,
        filters?.qualite,
        filters?.grouping_crn,
        filters?.single_cod_pro,
        hasActiveFilters
    ]);

    // Configuration par défaut
    const defaultOptions = {
        enabled: hasActiveFilters && !!stableFilters,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        onSuccess: (data) => {
            const featureName = Array.isArray(queryKey) ? queryKey[0] : queryKey;
            const count = data?.details?.length ||
                data?.items?.length ||
                data?.products?.length ||
                0;

            console.log(`✅ ${featureName} data loaded:`, data);

            if (count === 0) {
                toast.info(`Aucune donnée trouvée pour ${featureName}`);
            } else {
                toast.success(`${featureName}: ${count} élément(s) chargé(s)`);
            }
        },
        onError: (error) => {
            const featureName = Array.isArray(queryKey) ? queryKey[0] : queryKey;

            console.error(`❌ Erreur ${featureName}:`, error);
            toast.error(`Impossible de charger ${featureName}`);
        }
    };

    // Fusionner les options
    const finalOptions = {
        ...defaultOptions,
        ...options,
        queryKey: Array.isArray(queryKey) ?
            [...queryKey, stableFilters] :
            [queryKey, stableFilters],
        queryFn: () => apiFunction(stableFilters)
    };

    // Exécuter React Query
    const query = useQuery(finalOptions);

    // Retour standardisé
    return {
        // Données
        data: query.data,

        // État
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching,

        // Erreur
        error: query.error,

        // Méthodes
        refetch: query.refetch,

        // Métadonnées
        hasActiveFilters,
        hasData: !!query.data,

        // Helpers pour compatibilité avec votre code existant
        refreshData: query.refetch,
        dashboardData: query.data // Pour compatibilité Dashboard
    };
}

export default useApiData;