// frontend/src/services/api/matrixService.js

import BaseApiService from '@/api/core/BaseApiService';

export class MatrixService extends BaseApiService {
    constructor() {
        super('/matrix');
    }

    /**
     * Récupère les données de la vue matricielle
     * @param {Object} filters - Critères d'identification
     * @returns {Promise<Object>} Données de la matrice
     */
    async getMatrixView(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('view', payload);
    }

    /**
     * Vue matricielle avec filtres additionnels
     * @param {Object} filters - Critères de base
     * @param {Object} additionalFilters - Filtres additionnels
     * @returns {Promise<Object>}
     */
    async getMatrixViewFiltered(filters = {}, additionalFilters = {}) {
        const payload = {
            ...this.buildPayload(filters),
            ...additionalFilters
        };

        return await this.post('view/filtered', payload);
    }

    /**
     * Détails d'une cellule spécifique
     * @param {number} codPro - Code produit
     * @param {string} ref - Référence colonne
     * @returns {Promise<Object>}
     */
    async getCellDetails(codPro, ref) {
        return await this.get(`cell/${codPro}/${encodeURIComponent(ref)}`);
    }
}

export const matrixService = new MatrixService();