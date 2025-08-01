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
            // Construction du payload selon le schema ProductIdentifierRequest
            const payload = {
                cod_pro_list: filters.cod_pro ? [filters.cod_pro] : null,
                refint_list: null,
                ref_ext_list: filters.ref_ext ? [filters.ref_ext] : null,
                famille_list: filters.famille_list || null,
                s_famille_list: filters.s_famille_list || null,
                fournisseur_list: filters.fournisseur_list || null,
                qualite_list: filters.qualite ? [filters.qualite] : null,
                grouping_crn: filters.grouping_crn || 0
            };

            const response = await apiClient.post('/optimisation/optimisation', payload);
            return response.data;
        } catch (error) {
            console.error('Erreur API getOptimization:', error);
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
                grouping_crn: optimization.grouping_crn,
                qualite: optimization.qualite,
                refs_to_delete: [
                    ...(optimization.refs_to_delete_low_sales || []),
                    ...(optimization.refs_to_delete_no_sales || [])
                ].map(ref => ref.cod_pro),
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
                    grouping_crn: opt.grouping_crn,
                    qualite: opt.qualite,
                    refs_to_delete: [
                        ...(opt.refs_to_delete_low_sales || []),
                        ...(opt.refs_to_delete_no_sales || [])
                    ].map(ref => ref.cod_pro),
                    refs_to_keep: (opt.refs_to_keep || []).map(ref => ref.cod_pro),
                    expected_gain: opt.gain_potentiel,
                    expected_gain_6m: opt.gain_potentiel_6m
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