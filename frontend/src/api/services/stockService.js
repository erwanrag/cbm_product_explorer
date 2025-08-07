// frontend/src/api/services/stockService.js - NOUVEAU SERVICE
import apiClient from '@/api/core/client';

import BaseApiService from '@/api/core/BaseApiService';

export class StockService extends BaseApiService {
    constructor() {
        super('/stock');
    }

    /**
     * Stock actuel
     * @param {Object} filters - Filtres produit
     * @returns {Promise<{items: Array}>}
     */
    async getCurrent(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('current', payload);
    }

    /**
     * Historique du stock
     * @param {Object} filters - Filtres produit
     * @param {number} lastNMonths - Nombre de mois
     * @returns {Promise<{items: Array}>}
     */
    async getHistory(filters = {}, lastNMonths = 12) {
        const payload = this.buildPayload(filters);
        return await this.post('history', payload, {
            params: { last_n_months: lastNMonths }
        });
    }
}

export const stockService = new StockService();