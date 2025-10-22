import { useMemo } from 'react';
import { matrixService } from '@/api/services/matrixService';
import { useFeatureData } from '@/store/hooks/useFeatureData';

export function useMatrixData(filters, options = {}) {
    const transformMatrix = useMemo(() => (data) => {
        if (!data) return null;

        const products = data.products || [];
        const columnRefs = data.column_refs || [];
        const correspondences = data.correspondences || [];

        const matchRate = (products.length && columnRefs.length)
            ? ((correspondences.length || 0) / (products.length * columnRefs.length)) * 100
            : 0;

        return {
            products,
            columnRefs,
            correspondences,
            stats: {
                totalProducts: products.length,
                totalColumns: columnRefs.length,
                totalCorrespondences: correspondences.length,
                matchRate,
            },
        };
    }, []);

    const result = useFeatureData(
        'matrix',
        (filters) => matrixService.getMatrixView(filters),
        filters,
        transformMatrix,
        options
    );

    return {
        ...result,
        matrixData: result.data,
        hasData: !!result.data && result.data.products.length > 0,
        productsCount: result.data?.products?.length || 0,
        columnsCount: result.data?.columnRefs?.length || 0,
        correspondencesCount: result.data?.correspondences?.length || 0,
    };
}