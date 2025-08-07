// ===================================
// 📁 frontend/src/api/services/productService.js - REFACTORISÉ
// ===================================

import BaseApiService from '@/api/core/BaseApiService';

export class ProductService extends BaseApiService {
    constructor() {
        super('/products');
    }

    /**
     * Détails de produits selon ProductDetailResponse
     * @param {Object} filters - Filtres produit
     * @returns {Promise<{products: Array}>}
     */
    async getDetails(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('details', payload);
    }

    /**
     * Produit unique par cod_pro
     * @param {number} codPro - Code produit
     * @returns {Promise<Object>}
     */
    async getSingleDetail(codPro) {
        return await this.get(`detail/${codPro}`);
    }

    /**
     * Correspondances ref_crn/ref_ext
     * @param {Object} filters - Filtres produit
     * @returns {Promise<{matches: Array}>}
     */
    async getMatches(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('match', payload);
    }

    /**
     * Matrice produits
     * @param {Object} filters - Filtres produit
     * @returns {Promise<Object>}
     */
    async getMatrix(filters = {}) {
        const payload = this.buildPayload(filters);
        return await this.post('matrix', payload);
    }
}

export const productService = new ProductService();
