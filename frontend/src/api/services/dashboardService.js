// frontend/src/api/services/dashboardService.js - NOUVEAU SERVICE
import apiClient from '../core/apiClient';

/**
 * Service pour le dashboard consolidé
 * Compatible avec DashboardFicheResponse du backend
 */
export class DashboardService {
    /**
     * Récupère toutes les données pour une fiche produit
     * @param {Object} payload - Filtres selon DashboardFilterRequest
     * @returns {Promise<Object>} DashboardFicheResponse complète
     */
    async getFiche(payload) {
        const response = await apiClient.post('/dashboard/fiche', payload);
        return response.data;
    }
}

export const dashboardService = new DashboardService();
