// frontend/src/features/matrix/hooks/useMatrixData.js

import { useState, useEffect, useCallback } from 'react';
import { matrixService } from '@/api/services/matrixService';

/**
 * Hook pour gérer les données de la vue matricielle
 */
export const useMatrixData = (identifier = null) => {
    const [data, setData] = useState({
        products: [],
        columnRefs: [],
        correspondences: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Charge les données de la matrice
     */
    const loadMatrixData = useCallback(async (payload = identifier) => {
        if (!payload || Object.keys(payload).length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await matrixService.getMatrixView(payload);
            setData({
                products: response.products || [],
                columnRefs: response.column_refs || [],
                correspondences: response.correspondences || []
            });
        } catch (err) {
            console.error('❌ Erreur chargement matrice:', err);
            setError(err.message || 'Erreur lors du chargement de la matrice');
            setData({ products: [], columnRefs: [], correspondences: [] });
        } finally {
            setLoading(false);
        }
    }, [identifier]);

    /**
     * Charge les données avec filtres
     */
    const loadMatrixDataWithFilters = useCallback(async (payload, filters) => {
        if (!payload || Object.keys(payload).length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await matrixService.getMatrixViewFiltered(payload, filters);
            setData({
                products: response.products || [],
                columnRefs: response.column_refs || [],
                correspondences: response.correspondences || []
            });
        } catch (err) {
            console.error('❌ Erreur chargement matrice filtrée:', err);
            setError(err.message || 'Erreur lors du chargement de la matrice');
            setData({ products: [], columnRefs: [], correspondences: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Recharge les données
     */
    const refresh = useCallback(() => {
        if (identifier) {
            loadMatrixData(identifier);
        }
    }, [identifier, loadMatrixData]);

    /**
     * Reset des données
     */
    const reset = useCallback(() => {
        setData({ products: [], columnRefs: [], correspondences: [] });
        setError(null);
    }, []);

    // Chargement initial
    useEffect(() => {
        if (identifier && Object.keys(identifier).length > 0) {
            loadMatrixData(identifier);
        }
    }, [identifier, loadMatrixData]);

    return {
        data,
        loading,
        error,
        loadMatrixData,
        loadMatrixDataWithFilters,
        refresh,
        reset,
        // Données calculées utiles
        hasData: data.products.length > 0,
        productsCount: data.products.length,
        columnsCount: data.columnRefs.length,
        correspondencesCount: data.correspondences.length
    };
};