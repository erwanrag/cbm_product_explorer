import BaseApiService from '@/api/core/BaseApiService';

export class OptimizationService extends BaseApiService {
    constructor() {
        super('/optimization');
    }

    async getAnalysis(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('analysis', payload);
    }

    async getSimulation(filters = {}, scenario = {}) {
        const payload = {
            ...this.buildPayload(filters),
            ...scenario
        };
        return await this.post('simulation', payload);
    }
}

// ✅ EXPORT SINGLETON
export const optimizationService = new OptimizationService();