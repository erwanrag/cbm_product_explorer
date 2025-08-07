// ===================================
// 📁 frontend/src/api/services/optimizationService.js - VERSION SIMPLE QUI MARCHE
// ===================================

import apiClient from '@/api/core/client';

export const OptimizationService = {
    /**
     * Récupère les données d'optimisation - Version qui marche avec ton backend
     * @param {Object} filters - Filtres selon ProductIdentifierRequest schema
     * @returns {Promise<Object>} - GroupOptimizationListResponse
     */
    async getOptimization(filters) {
        try {
            const payload = {};

            // Construction du payload identique à celui qui marche
            if (filters.cod_pro) {
                payload.cod_pro = parseInt(filters.cod_pro, 10);
            }
            if (filters.ref_crn) {
                payload.ref_crn = filters.ref_crn;
            }
            if (filters.ref_ext) {
                payload.ref_ext = filters.ref_ext;
            }
            if (filters.qualite) {
                payload.qualite = filters.qualite;
            }
            if (filters.refint) {
                payload.refint = filters.refint;
            }

            // grouping_crn toujours inclure
            payload.grouping_crn = filters.grouping_crn ? parseInt(filters.grouping_crn, 10) : 0;
            payload.single_cod_pro = filters.single_cod_pro || false;

            //console.log('📤 Payload optimisation:', payload);

            const response = await apiClient.post('/optimisation/optimisation', payload);

            //console.log('📥 Réponse optimisation:', response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Erreur getOptimization:', error);
            throw error;
        }
    }
};

export default OptimizationService;