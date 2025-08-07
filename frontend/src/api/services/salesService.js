import BaseApiService from '@/api/core/BaseApiService';

export class SalesService extends BaseApiService {
    constructor() {
        super('/sales');
    }

    /**
     * Historique des ventes par mois
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

    /**
     * Agrégats de ventes
     * @param {Object} filters - Filtres produit
     * @returns {Promise<{items: Array}>}
     */
    async getAggregate(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('aggregate', payload);
    }
}

export const salesService = new SalesService();
