// ===================================
// 📁 frontend/src/api/core/BaseApiService.js
// ===================================

import apiClient from '@/api/core/client';

/**
 * Classe de base pour tous les services API
 * Standardise les appels, la gestion d'erreurs et les logs
 */
export class BaseApiService {
  constructor(baseEndpoint) {
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * GET générique avec paramètres
   * @param {string} endpoint - Endpoint spécifique (optionnel)
   * @param {Object} params - Paramètres de requête
   * @param {Object} options - Options axios
   * @returns {Promise<any>}
   */
  async get(endpoint = '', params = {}, options = {}) {
    const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
    
    try {
      const response = await apiClient.get(url, { 
        params,
        ...options 
      });
      
      return response.data;
    } catch (error) {
      this._handleError('GET', url, error);
      throw error;
    }
  }

  /**
   * POST générique avec payload
   * @param {string} endpoint - Endpoint spécifique (optionnel)
   * @param {Object} payload - Corps de la requête
   * @param {Object} options - Options axios
   * @returns {Promise<any>}
   */
  async post(endpoint = '', payload = {}, options = {}) {
    const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
    
    try {
      const response = await apiClient.post(url, payload, options);
      return response.data;
    } catch (error) {
      this._handleError('POST', url, error);
      throw error;
    }
  }

  /**
   * PUT générique
   * @param {string} endpoint - Endpoint spécifique (optionnel)
   * @param {Object} payload - Corps de la requête
   * @param {Object} options - Options axios
   * @returns {Promise<any>}
   */
  async put(endpoint = '', payload = {}, options = {}) {
    const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
    
    try {
      const response = await apiClient.put(url, payload, options);
      return response.data;
    } catch (error) {
      this._handleError('PUT', url, error);
      throw error;
    }
  }

  /**
   * DELETE générique
   * @param {string} endpoint - Endpoint spécifique
   * @param {Object} options - Options axios
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}) {
    const url = `${this.baseEndpoint}/${endpoint}`;
    
    try {
      const response = await apiClient.delete(url, options);
      return response.data;
    } catch (error) {
      this._handleError('DELETE', url, error);
      throw error;
    }
  }

  /**
   * Méthode utilitaire pour construire l'URL complète
   * @param {string} endpoint - Endpoint spécifique
   * @returns {string}
   */
  buildUrl(endpoint = '') {
    return endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
  }

  /**
   * Gestion centralisée des erreurs
   * @private
   * @param {string} method - Méthode HTTP
   * @param {string} url - URL appelée
   * @param {Error} error - Erreur capturée
   */
  _handleError(method, url, error) {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;
    
    console.error(`❌ ${this.constructor.name} API Error:`, {
      method,
      url,
      status,
      message,
      details: error.response?.data
    });

    // Transformation de l'erreur pour l'UI
    error.uiMessage = this._getUIErrorMessage(status, message);
  }

  /**
   * Messages d'erreur user-friendly
   * @private
   * @param {number} status - Code de statut HTTP
   * @param {string} message - Message original
   * @returns {string}
   */
  _getUIErrorMessage(status, message) {
    switch (status) {
      case 400:
        return 'Données de requête invalides';
      case 401:
        return 'Authentification requise';
      case 403:
        return 'Accès non autorisé';
      case 404:
        return 'Ressource non trouvée';
      case 422:
        return 'Données de validation incorrectes';
      case 500:
        return 'Erreur serveur interne';
      case 503:
        return 'Service temporairement indisponible';
      default:
        return message || 'Une erreur inattendue est survenue';
    }
  }

  /**
   * Helper pour construire des payloads standardisés
   * @param {Object} filters - Filtres d'entrée
   * @returns {Object} Payload nettoyé
   */
  buildPayload(filters = {}) {
    const payload = {};
    
    // Standardisation des filtres CBM
    if (filters.cod_pro) {
      payload.cod_pro = parseInt(filters.cod_pro, 10);
    }
    if (filters.ref_crn) {
      payload.ref_crn = filters.ref_crn;
    }
    if (filters.ref_ext) {
      payload.ref_ext = filters.ref_ext;
    }
    if (filters.qualite) {
      payload.qualite = filters.qualite;
    }
    if (filters.refint) {
      payload.refint = filters.refint;
    }
    
    // Grouping CRN avec valeur par défaut
    payload.grouping_crn = filters.grouping_crn ? 
      parseInt(filters.grouping_crn, 10) : 0;
      
    // Single cod_pro flag
    payload.single_cod_pro = filters.single_cod_pro || false;
    
    return payload;
  }
}

export default BaseApiService;