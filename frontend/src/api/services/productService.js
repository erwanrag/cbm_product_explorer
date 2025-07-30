// frontend/src/api/services/productService.js - NOUVEAU SERVICE
import apiClient from '@/api/core/client';

/**
 * Service pour les produits
 * Compatible avec les nouveaux endpoints backend
 */
export class ProductService {
  /**
   * Récupère les détails de produits selon ProductDetailResponse
   * @param {Object} payload - Filtres produit
   * @returns {Promise<{products: Array}>}
   */
  async getDetails(payload) {
    const response = await apiClient.post('/products/details', payload);
    return response.data;
  }

  /**
   * Récupère un produit unique par cod_pro
   * @param {number} codPro - Code produit
   * @returns {Promise<Object>}
   */
  async getSingleDetail(codPro) {
    const response = await apiClient.get(`/products/detail/${codPro}`);
    return response.data;
  }

  /**
   * Récupère les correspondances ref_crn/ref_ext selon ProductMatchListResponse
   * @param {Object} payload - Filtres produit
   * @returns {Promise<{matches: Array}>}
   */
  async getMatches(payload) {
    const response = await apiClient.post('/products/match', payload);
    return response.data;
  }

  /**
   * Récupère la matrice produits selon ProductMatrixResponse
   * @param {Object} payload - Filtres produit
   * @returns {Promise<Object>}
   */
  async getMatrix(payload) {
    const response = await apiClient.post('/products/matrix', payload);
    return response.data;
  }
}

export const productService = new ProductService();
