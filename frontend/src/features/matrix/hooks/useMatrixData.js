// ===================================
// 📁 frontend/src/features/matrix/hooks/useMatrixData.js - VERSION REACT QUERY
// ===================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matrixService } from '@/api/services/matrixService';
import { toast } from 'react-toastify';

/**
 * Hook pour gérer les données de la vue matricielle - VERSION REACT QUERY STABLE
 * Similaire à useDashboardData
 */
export function useMatrixData(filters) {
    // ✅ Vérifier si on a des filtres valides
    const hasActiveFilters = useMemo(() => {
        if (!filters || typeof filters !== 'object') return false;

        const { cod_pro, ref_crn, ref_ext } = filters;
        return !!(cod_pro || ref_crn || ref_ext);
    }, [filters]);

    // ✅ Stabiliser les filtres pour React Query
    const stableFilters = useMemo(() => {
        if (!hasActiveFilters) return null;

        return {
            cod_pro: filters.cod_pro || null,
            ref_crn: filters.ref_crn || null,
            ref_ext: filters.ref_ext || null,
            grouping_crn: filters.grouping_crn || 0,
            qualite: filters.qualite || null
        };
    }, [
        filters?.cod_pro,
        filters?.ref_crn,
        filters?.ref_ext,
        filters?.grouping_crn,
        filters?.qualite,
        hasActiveFilters
    ]);

    // ✅ React Query - Stable comme Dashboard
    const query = useQuery({
        queryKey: ['matrix', 'view', stableFilters],
        queryFn: () => matrixService.getMatrixView(stableFilters),
        enabled: hasActiveFilters && !!stableFilters,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            const count = data?.products?.length || 0;
            if (count === 0) {
                toast.info('Aucun produit trouvé pour cette matrice');
            } else {
                toast.success(`Matrice chargée: ${count} produits`);
            }
        },
        onError: (error) => {
            console.error('Erreur matrice:', error);
            toast.error('Impossible de charger la matrice');
        },
    });

    // ✅ Transformation des données
    const transformedData = useMemo(() => {
        if (!query.data) return null;

        const { products, column_refs, correspondences } = query.data;

        // Statistiques calculées
        const stats = {
            totalProducts: products?.length || 0,
            totalColumns: column_refs?.length || 0,
            totalCorrespondences: correspondences?.length || 0,
            matchRate: (products?.length && column_refs?.length)
                ? ((correspondences?.length || 0) / (products.length * column_refs.length)) * 100
                : 0
        };

        return {
            products: products || [],
            columnRefs: column_refs || [],
            correspondences: correspondences || [],
            stats
        };
    }, [query.data]);

    // ✅ Retour stable
    return {
        matrixData: transformedData,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refreshData: query.refetch,
        isFetching: query.isFetching,
        // Valeurs calculées pour compatibilité
        hasData: !!transformedData && transformedData.products.length > 0,
        productsCount: transformedData?.products?.length || 0,
        columnsCount: transformedData?.columnRefs?.length || 0,
        correspondencesCount: transformedData?.correspondences?.length || 0
    };
}