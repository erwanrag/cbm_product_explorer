// frontend/src/api/services/stockService.js - NOUVEAU SERVICE
import apiClient from '../core/apiClient';

/**
 * Service pour les données de stock
 * Compatible avec ProductStockResponse et ProductStockHistoryResponse
 */
export class StockService {
    /**
     * Récupère le stock actuel
     * @param {Object} payload - Filtres produit
     * @returns {Promise<{items: Array}>}
     */
    async getCurrent(payload) {
        const response = await apiClient.post('/stock/current', payload);
        return response.data;
    }

    /**
     * Récupère l'historique du stock
     * @param {Object} payload - Filtres produit
     * @param {number} lastNMonths - Nombre de mois
     * @returns {Promise<{items: Array}>}
     */
    async getHistory(payload, lastNMonths = 12) {
        const response = await apiClient.post('/stock/history', payload, {
            params: { last_n_months: lastNMonths }
        });
        return response.data;
    }
}

export const stockService = new StockService();