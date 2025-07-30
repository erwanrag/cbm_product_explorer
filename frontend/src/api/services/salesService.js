// frontend/src/api/services/salesService.js - NOUVEAU SERVICE
import apiClient from '@/api/core/client';

/**
 * Service pour les données de ventes
 * Compatible avec ProductSalesHistoryResponse et ProductSalesAggregateResponse
 */
export class SalesService {
  /**
   * Récupère l'historique des ventes par mois
   * @param {Object} payload - Filtres produit
   * @param {number} lastNMonths - Nombre de mois (défaut: 12)
   * @returns {Promise<{items: Array}>}
   */
  async getHistory(payload, lastNMonths = 12) {
    const response = await apiClient.post('/sales/history', payload, {
      params: { last_n_months: lastNMonths },
    });
    return response.data;
  }

  /**
   * Récupère les agrégats de ventes
   * @param {Object} payload - Filtres produit
   * @returns {Promise<{items: Array}>}
   */
  async getAggregate(payload) {
    const response = await apiClient.post('/sales/aggregate', payload);
    return response.data;
  }
}

export const salesService = new SalesService();
