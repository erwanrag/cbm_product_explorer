
// ===================================
// 📁 frontend/src/api/services/dashboardService.js 
// ===================================

import BaseApiService from '@/api/core/BaseApiService';

export class DashboardService extends BaseApiService {
    constructor() {
        super('/dashboard');
    }

    /**
     * Récupère la fiche dashboard
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>}
     */
    async getFiche(filters = {}) {
        const payload = this.buildPayload(filters);
        //console.log('🚀 Dashboard API call with filters:', payload);

        const data = await this.post('fiche', payload);
        //console.log('✅ Dashboard response:', data);

        return data;
    }
}

export const dashboardService = new DashboardService();