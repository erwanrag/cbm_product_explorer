// frontend/src/api/services/optimizationService.js - NOUVEAU SERVICE
import apiClient from '../core/apiClient';

/**
 * Service pour l'optimisation et analyses avancées
 * Compatible avec GroupOptimizationListResponse
 */
export class OptimizationService {
    /**
     * Évalue les gains potentiels par groupe
     * @param {Object} payload - Filtres produit
     * @returns {Promise<{items: Array}>}
     */
    async evaluateGroupOptimization(payload) {
        const response = await apiClient.post('/optimisation/optimisation', payload);
        return response.data;
    }
}

export const optimizationService = new OptimizationService();