// ===================================
// 📁 frontend/src/api/services/optimizationService.js  
// ===================================

import apiClient from '@/api/core/client';

export const OptimizationService = {
    /**
     * Récupère les données d'optimisation
     * @param {Object} filters - Filtres selon ProductIdentifierRequest schema
     * @returns {Promise<Object>} - GroupOptimizationListResponse
     */
    async getOptimization(filters) {
        try {
            // ✅ Construction du payload IDENTIQUE à ton curl qui marche
            const payload = {};

            // ✅ Envoyer cod_pro simple (pas cod_pro_list)
            if (filters.cod_pro) {
                payload.cod_pro = parseInt(filters.cod_pro, 10);
            }

            // ✅ Autres champs optionnels
            if (filters.ref_crn) {
                payload.ref_crn = filters.ref_crn;
            }
            if (filters.ref_ext) {
                payload.ref_ext = filters.ref_ext;
            }
            if (filters.qualite) {
                payload.qualite = filters.qualite;
            }

            // ✅ grouping_crn (toujours inclure)
            payload.grouping_crn = filters.grouping_crn ? parseInt(filters.grouping_crn, 10) : 0;

            // ✅ IMPORTANT : Ajouter single_cod_pro comme dans ton curl
            payload.single_cod_pro = false;

            console.log('📤 Payload envoyé à l\'API optimisation:', payload);

            const response = await apiClient.post('/optimisation/optimisation', payload);

            console.log('📥 Réponse API optimisation:', response.data);

            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getOptimization:', error);
            if (error.response) {
                console.error('📄 Détails erreur:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            throw error;
        }
    },

    /**
     * Simule l'impact d'une optimisation
     * @param {Object} optimization - Optimisation à simuler
     * @returns {Promise<Object>}
     */
    async simulateOptimization(optimization) {
        try {
            const payload = {
                grouping_crn: parseInt(optimization.grouping_crn, 10),
                qualite: optimization.qualite,
                refs_to_delete: [
                    ...(optimization.refs_to_delete_low_sales || []),
                    ...(optimization.refs_to_delete_no_sales || [])
                ].map(ref => parseInt(ref.cod_pro, 10)),
                simulation_months: 6
            };

            const response = await apiClient.post('/optimisation/simulate', payload);
            return response.data;
        } catch (error) {
            console.error('Erreur API simulateOptimization:', error);
            throw error;
        }
    },

    /**
     * Applique les optimisations sélectionnées
     * @param {Array} optimizations - Liste des optimisations à appliquer
     * @returns {Promise<Object>}
     */
    async applyOptimizations(optimizations) {
        try {
            const payload = {
                optimizations: optimizations.map(opt => ({
                    grouping_crn: parseInt(opt.grouping_crn, 10),
                    qualite: opt.qualite,
                    refs_to_delete: [
                        ...(opt.refs_to_delete_low_sales || []),
                        ...(opt.refs_to_delete_no_sales || [])
                    ].map(ref => parseInt(ref.cod_pro, 10)),
                    refs_to_keep: (opt.refs_to_keep || []).map(ref => parseInt(ref.cod_pro, 10)),
                    expected_gain: parseFloat(opt.gain_potentiel),
                    expected_gain_6m: parseFloat(opt.gain_potentiel_6m)
                }))
            };

            const response = await apiClient.post('/optimisation/apply', payload);
            return response.data;
        } catch (error) {
            console.error('Erreur API applyOptimizations:', error);
            throw error;
        }
    },

    /**
     * Récupère l'historique des optimisations appliquées
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Array>}
     */
    async getOptimizationHistory(filters = {}) {
        try {
            const response = await apiClient.get('/optimisation/history', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Erreur API getOptimizationHistory:', error);
            throw error;
        }
    },

    /**
     * Récupère les statistiques globales d'optimisation
     * @param {Object} dateRange - Filtres temporels
     * @returns {Promise<Object>}
     */
    async getOptimizationStats(dateRange = {}) {
        try {
            const response = await apiClient.get('/optimisation/stats', { params: dateRange });
            return response.data;
        } catch (error) {
            console.error('Erreur API getOptimizationStats:', error);
            throw error;
        }
    },

    /**
     * Exporte les données d'optimisation
     * @param {Object} exportParams - Paramètres d'export
     * @returns {Promise<void>}
     */
    async exportOptimization(exportParams) {
        try {
            const response = await apiClient.post('/optimisation/export', exportParams, {
                responseType: 'blob'
            });

            // Téléchargement du fichier
            const blob = new Blob([response.data], {
                type: exportParams.format === 'excel'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'text/csv'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `optimisation_${new Date().toISOString().split('T')[0]}.${exportParams.format === 'excel' ? 'xlsx' : 'csv'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erreur API exportOptimization:', error);
            throw error;
        }
    }
};