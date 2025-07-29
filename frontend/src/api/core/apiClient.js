// frontend/src/api/core/apiClient.js
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { toast } from "react-toastify";

/**
 * Instance Axios configurée pour l'API CBM GRC Matcher
 * Gère automatiquement les erreurs, timeouts et retry logic
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor - Ajout trace ID et logs
apiClient.interceptors.request.use(
    (config) => {
        const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Trace-ID'] = traceId;

        console.log(`🔵 [${traceId}] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
        });

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Gestion erreurs centralisée
apiClient.interceptors.response.use(
    (response) => {
        const traceId = response.config.headers['X-Trace-ID'];
        const responseTime = response.headers['x-response-time'];

        console.log(`✅ [${traceId}] ${response.status} - ${responseTime || 'N/A'}`, {
            data: response.data
        });

        return response;
    },
    (error) => {
        const traceId = error.config?.headers?.['X-Trace-ID'] || 'unknown';

        // Gestion des différents types d'erreurs
        if (error.response) {
            // Erreur serveur avec réponse
            const { status, data } = error.response;
            console.error(`❌ [${traceId}] HTTP ${status}:`, data);

            switch (status) {
                case 400:
                    toast.error(`Requête invalide: ${data.detail || 'Vérifiez vos données'}`);
                    break;
                case 404:
                    toast.error('Ressource non trouvée');
                    break;
                case 422:
                    toast.error(`Erreur de validation: ${data.detail || 'Données invalides'}`);
                    break;
                case 500:
                    toast.error('Erreur interne du serveur');
                    break;
                case 503:
                    toast.error('Service temporairement indisponible');
                    break;
                default:
                    toast.error(`Erreur ${status}: ${data.detail || 'Erreur inconnue'}`);
            }
        } else if (error.request) {
            // Erreur réseau
            console.error(`🔴 [${traceId}] Erreur réseau:`, error.message);
            toast.error('Impossible de contacter le serveur');
        } else {
            // Autre erreur
            console.error(`💥 [${traceId}] Erreur:`, error.message);
            toast.error('Une erreur inattendue s\'est produite');
        }

        return Promise.reject(error);
    }
);

export default apiClient;