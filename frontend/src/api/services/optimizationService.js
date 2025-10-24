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

    /**
     * Récupère les groupes d'optimisation (optionnel: par grouping_crn)
     */
    async getOptimizationGroups(grouping_crn = null) {
        const params = grouping_crn ? { grouping_crn } : {};
        return await this.get('groups', params, { 
            useCache: true, 
            cacheTTL: 10 * 60 * 1000 // 10min
        });
    }

    /**
     * Lance le batch complet d'optimisation
     */
    async runBatch() {
        return await this.post('batch/run', {}, { 
            invalidateCache: ['/optimisation'] 
        });
    }

    /**
     * Récupère le statut du dernier batch
     */
    async getBatchStatus() {
        return await this.get('batch/status', {}, { 
            useCache: false 
        });
    }
}



export const optimizationService = new OptimizationService();

