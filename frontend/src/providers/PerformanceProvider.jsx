/ frontend/src / providers / PerformanceProvider.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance';
import config from '@/config/environment';

const PerformanceContext = createContext();

/**
 * Provider pour le monitoring des performances
 */
export function PerformanceProvider({ children }) {
    useEffect(() => {
        if (!config.features.enablePerformanceMonitoring) return;

        // Observer des Web Vitals
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (config.features.enableDebugLogs) {
                    console.log(`📊 ${entry.name}: ${entry.value}ms`);
                }

                // Envoi des métriques (à implémenter selon vos besoins)
                // analytics.track('performance', {
                //     metric: entry.name,
                //     value: entry.value,
                //     url: window.location.pathname
                // });
            });
        });

        // Observer les métriques importantes
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

        return () => observer.disconnect();
    }, []);

    // Monitoring des erreurs
    useEffect(() => {
        const handleError = (event) => {
            console.error('🚨 Erreur JavaScript:', event.error);

            if (config.features.enableErrorReporting) {
                // Envoi vers service d'erreur
                // errorReporting.captureException(event.error);
            }
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    const value = {
        markStart: performanceMonitor.mark.bind(performanceMonitor),
        measureEnd: performanceMonitor.measure.bind(performanceMonitor)
    };

    return (
        <PerformanceContext.Provider value={value}>
            {children}
        </PerformanceContext.Provider>
    );
}

export const usePerformance = () => {
    const context = useContext(PerformanceContext);
    if (!context) {
        throw new Error('usePerformance must be used within PerformanceProvider');
    }
    return context;
};
