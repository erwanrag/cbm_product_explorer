import { BaseApiService } from '@/api/core';

class DashboardService extends BaseApiService {
  constructor() {
    super('/dashboard', {
      cacheTTL: 2 * 60 * 1000,  // ✨ AJOUTER : Cache de 2 minutes
      enableCache: true,         // ✨ AJOUTER : Activer le cache
    });
  }

  async getFiche(filters) {
    const payload = this.buildPayload(filters);
    
    // Le cache est maintenant actif automatiquement !
    return this.post('fiche', payload, {
      useCache: true,              // ✨ OPTIONNEL : utiliser le cache
      cacheTTL: 2 * 60 * 1000,    // ✨ OPTIONNEL : TTL spécifique
    });
  }

  // Reste du code inchangé...
}

export const dashboardService = new DashboardService();
export default DashboardService;