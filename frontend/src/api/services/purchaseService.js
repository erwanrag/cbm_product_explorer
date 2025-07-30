// frontend/src/api/services/purchaseService.js - NOUVEAU SERVICE
import apiClient from '@/api/core/client';

/**
 * Service pour les prix d'achat
 * Compatible avec ProductPurchasePriceResponse
 */
export class PurchaseService {
  /**
   * Récupère les prix d'achat
   * @param {Object} payload - Filtres produit
   * @returns {Promise<{items: Array}>}
   */
  async getPrices(payload) {
    const response = await apiClient.post('/purchase/price', payload);
    return response.data;
  }
}

export const purchaseService = new PurchaseService();
