// frontend/src/api/services/suggestionService.js - NOUVEAU SERVICE
import apiClient from '@/api/core/client';

/**
 * Service pour les suggestions et autocomplétion
 * Compatible avec les nouveaux endpoints suggestions
 */
export class SuggestionService {
  /**
   * Autocomplétion des références internes ou codes produit
   * @param {string} query - Texte de recherche
   * @returns {Promise<Array>}
   */
  async autocompleteRefintOrCodpro(query) {
    const response = await apiClient.get('/suggestions/refint-codpro', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Autocomplétion des références constructeur
   * @param {string} query - Texte de recherche
   * @returns {Promise<{results: Array}>}
   */
  async autocompleteRefCrn(query) {
    const response = await apiClient.get('/suggestions/refcrn', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Autocomplétion des références externes
   * @param {string} query - Texte de recherche
   * @returns {Promise<{results: Array}>}
   */
  async autocompleteRefExt(query) {
    const response = await apiClient.get('/suggestions/ref_ext', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Récupère les ref_crn associées à un cod_pro
   * @param {number} codPro - Code produit
   * @returns {Promise<{results: Array}>}
   */
  async getRefCrnByCodPro(codPro) {
    const response = await apiClient.get('/suggestions/refcrn_by_codpro', {
      params: { cod_pro: codPro },
    });
    return response.data;
  }
}

export const suggestionService = new SuggestionService();
