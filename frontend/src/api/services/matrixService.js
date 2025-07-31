// frontend/src/services/api/matrixService.js

import apiClient from '@/api/core/client';
/**
 * Service API pour la vue matricielle
 */
export const matrixService = {
    /**
     * Récupère les données de la vue matricielle
     * @param {Object} payload - Critères d'identification (cod_pro, ref_crn, refint, etc.)
     * @returns {Promise<Object>} Données de la matrice
     */
    async getMatrixView(payload) {
        try {
            const response = await apiClient.post('/matrix/view', payload);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getMatrixView:', error);
            throw new Error(
                error.response?.data?.detail ||
                error.message ||
                'Erreur lors de la récupération de la vue matricielle'
            );
        }
    },

    /**
     * Récupère la vue matricielle avec filtres
     * @param {Object} payload - Critères de base
     * @param {Object} filters - Filtres additionnels (qualite, famille, statut, search_term)
     * @returns {Promise<Object>} Données de la matrice filtrée
     */
    async getMatrixViewFiltered(payload, filters = {}) {
        try {
            const requestBody = {
                ...payload,
                ...filters
            };

            const response = await apiClient.post('/matrix/view/filtered', requestBody);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getMatrixViewFiltered:', error);
            throw new Error(
                error.response?.data?.detail ||
                error.message ||
                'Erreur lors de la récupération de la vue matricielle filtrée'
            );
        }
    },

    /**
     * Récupère les détails d'une cellule spécifique
     * @param {number} codPro - Code produit
     * @param {string} ref - Référence colonne
     * @returns {Promise<Object>} Détails de la cellule
     */
    async getCellDetails(codPro, ref) {
        try {
            const response = await apiClient.get(`/matrix/cell/${codPro}/${encodeURIComponent(ref)}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur API getCellDetails:', error);
            throw new Error(
                error.response?.data?.detail ||
                error.message ||
                'Erreur lors de la récupération des détails de la cellule'
            );
        }
    }
};