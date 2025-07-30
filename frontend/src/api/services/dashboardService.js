// frontend/src/api/services/dashboardService.js
import apiClient from '@/api/core/client';

export class DashboardService {
    async getFiche(payload) {
        try {
            console.log('🚀 Dashboard API call with filters:', payload);

            const response = await apiClient.post('/dashboard/fiche', payload);

            console.log('✅ Dashboard response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Dashboard API error:', error);
            throw new Error(`Erreur dashboard: ${error.message}`);
        }
    }
}

export const dashboardService = new DashboardService();