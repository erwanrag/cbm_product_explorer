// frontend/src/api/core/client.js 

import axios from 'axios';
import { config } from '@/config/environment';

/**
 * Instance Axios configurée pour l'API CBM GRC Matcher
 * ✅ Compatible avec votre backend sur port 5180
 */
const apiClient = axios.create({
    baseURL: config.apiBaseUrl, // http://127.0.0.1:5180/api/v1 
    timeout: config.performance.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Intercepteur de requête - Logs et config
 */
apiClient.interceptors.request.use(
    (config) => {
        // Log en développement
        if (import.meta.env.DEV) {
            console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Anti-cache pour les GET
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        return config;
    },
    (error) => {
        console.error('🔴 Request Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Intercepteur de réponse - Gestion erreurs
 */
apiClient.interceptors.response.use(
    (response) => {
        // Log succès en développement
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }

        return response;
    },
    (error) => {
        // Log détaillé des erreurs
        const status = error.response?.status;
        const url = error.config?.url;
        const method = error.config?.method?.toUpperCase();

        console.error(`❌ API Error: ${method} ${url} - ${status}`, {
            status,
            data: error.response?.data,
            message: error.message
        });

        // Transformation des erreurs pour l'UI
        const transformedError = {
            status,
            message: error.response?.data?.message || error.message,
            details: error.response?.data?.details || null,
            originalError: error
        };

        return Promise.reject(transformedError);
    }
);

export default apiClient;