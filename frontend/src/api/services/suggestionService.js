// src/api/services/suggestionService.js - VERSION CORRIGÉE
import apiClient from '@/api/core/client';

/**
 * Service pour les suggestions et autocomplétion
 */
export class SuggestionService {
    async autocompleteRefintOrCodpro(query) {
        const response = await apiClient.get('/suggestions/refint-codpro', {
            params: { query },
        });
        return response.data;
    }

    async autocompleteRefCrn(query) {
        const response = await apiClient.get('/suggestions/refcrn', {
            params: { query },
        });
        return response.data;
    }

    async autocompleteRefExt(query) {
        const response = await apiClient.get('/suggestions/ref_ext', {
            params: { query },
        });
        return response.data;
    }

    async getRefCrnByCodPro(codPro) {
        const response = await apiClient.get('/suggestions/refcrn_by_codpro', {
            params: { cod_pro: codPro },
        });
        return response.data;
    }
}

export const suggestionService = new SuggestionService();

// ✅ EXPORTS INDIVIDUELS MANQUANTS
export const autocompleteRefintOrCodpro = (query) => suggestionService.autocompleteRefintOrCodpro(query);
export const autocompleteRefCrn = (query) => suggestionService.autocompleteRefCrn(query);
export const autocompleteRefExt = (query) => suggestionService.autocompleteRefExt(query);
export const getRefCrnByCodPro = (codPro) => suggestionService.getRefCrnByCodPro(codPro);