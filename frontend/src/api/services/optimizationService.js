import BaseApiService from '@/api/core/BaseApiService';

export class OptimizationService extends BaseApiService {
    constructor() {
        super('/optimisation');
    }

    /**
     * Récupère les données d'optimisation
     * @param {Object} filters - Critères d'identification
     * @returns {Promise<Object>} Données d'optimisation
     */
    async getOptimizationData(filters = {}) {
        const payload = this.buildPayload(filters); // ✅ this est bien défini
        return await this.post('optimisation', payload);
    }

    /**
     * Simule une optimisation
     * @param {Object} data - Données de simulation
     * @returns {Promise<Object>}
     */
    async simulateOptimization(data = {}) {
        return await this.post('simulate', data);
    }
}

export const optimizationService = new OptimizationService();

