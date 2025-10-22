import apiClient from '@/api/core/client';

export class BaseApiService {
    constructor(baseEndpoint) {
        this.baseEndpoint = baseEndpoint;
    }

    async get(endpoint = '', params = {}, options = {}) {
        const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
        
        try {
            const response = await apiClient.get(url, { params, ...options });
            return response.data;
        } catch (error) {
            this._handleError('GET', url, error);
            throw error;
        }
    }

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

    buildUrl(endpoint = '') {
        return endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
    }

    // ✅ MÉTHODE MANQUANTE - AJOUTER ICI
    buildPayload(filters = {}) {
        return {
            cod_pro: filters.cod_pro || null,
            ref_crn: filters.ref_crn || null,
            ref_ext: filters.ref_ext || null,
            refint: filters.refint || null,
            qualite: filters.qualite || null,
            grouping_crn: filters.grouping_crn || 0,
            single_cod_pro: filters.single_cod_pro || false,
        };
    }

    _handleError(method, url, error) {
        const status = error.response?.status;
        console.error(`❌ API Error: ${method} ${url}`, {
            status,
            message: error.message,
            data: error.response?.data,
        });
    }
}

export default BaseApiService;