// frontend/src/api/services/identifierService.js - NOUVEAU SERVICE
import apiClient from '../core/apiClient';

/**
 * Service pour la résolution d'identifiants produits
 * Compatible avec le nouveau backend enterprise
 */
export class IdentifierService {
    /**
     * Résout une liste de cod_pro à partir d'identifiants variés
     * @param {Object} payload - Identifiants produit selon ProductIdentifierRequest
     * @returns {Promise<{cod_pro_list: number[]}>}
     */
    async resolveCodPro(payload) {
        const response = await apiClient.post('/identifiers/resolve-codpro', payload);
        return response.data;
    }
}

export const identifierService = new IdentifierService();