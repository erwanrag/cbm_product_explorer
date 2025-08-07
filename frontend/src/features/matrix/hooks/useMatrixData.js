// ===================================
// 📁 frontend/src/features/matrix/hooks/useMatrixData.js - REFACTORISÉ
// ===================================

import { matrixService } from '@/api/services/matrixService';
import { useApiData } from '@/store/hooks/useApiData';

export function useMatrixData(filters, options = {}) {
    const result = useApiData(
        'matrix',
        matrixService.getMatrixView.bind(matrixService),
        filters,
        options
    );

    // Transformation spécifique à Matrix
    const matrixData = result.data ? {
        products: result.data.products || [],
        columnRefs: result.data.column_refs || [],
        correspondences: result.data.correspondences || [],
        stats: {
            totalProducts: result.data.products?.length || 0,
            totalColumns: result.data.column_refs?.length || 0,
            totalCorrespondences: result.data.correspondences?.length || 0,
            matchRate: (result.data.products?.length && result.data.column_refs?.length) ?
                ((result.data.correspondences?.length || 0) /
                    (result.data.products.length * result.data.column_refs.length)) * 100 : 0
        }
    } : null;

    return {
        ...result,
        matrixData,
        // Compatibilité avec l'ancienne API
        hasData: !!matrixData && matrixData.products.length > 0,
        productsCount: matrixData?.products?.length || 0,
        columnsCount: matrixData?.columnRefs?.length || 0,
        correspondencesCount: matrixData?.correspondences?.length || 0
    };
}