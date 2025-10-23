// frontend/src/api/services/productService.js

import { BaseApiService } from '@/api/core';

class ProductService extends BaseApiService {
  constructor() {
    super('/products', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes de cache
      enableCache: true,
    });
  }

  // Méthodes avec cache automatique
  async getAll(filters) {
    return this.get('', filters, {
      useCache: true, // Cache activé
      cacheTTL: 10 * 60 * 1000,
    });
  }

  // Méthode qui invalide le cache
  async create(product) {
    return this.post('', product, {
      invalidateCache: ['/products'], // Invalide cache produits
    });
  }

  // Forcer le refresh sans cache
  async getAllFresh(filters) {
    return this.get('', filters, {
      forceRefresh: true, // Bypass le cache
    });
  }
}

export const productService = new ProductService();