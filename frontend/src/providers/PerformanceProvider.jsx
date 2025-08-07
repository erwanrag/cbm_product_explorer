// ===================================
// 📁 frontend/src/providers/PerformanceProvider.jsx - REMPLACER LE CONTENU
// ===================================

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { config } from '@/config/environment';

const PerformanceContext = createContext(null);

/**
 * Provider pour le monitoring des performances CBM
 * Optimisé pour l'environnement enterprise
 */
export function PerformanceProvider({ children }) {
  // Métriques de performance
  const markStart = useCallback((name) => {
    if (config.features.enablePerformanceMonitoring) {
      performance.mark(`${name}-start`);
    }
  }, []);

  const markEnd = useCallback((name) => {
    if (config.features.enablePerformanceMonitoring) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;

        if (config.features.enableDebugLogs) {
          //console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        }

        // Alerte si performance dégradée
        if (duration > 1000) {
          console.warn(`🐌 Performance warning: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    }
  }, []);

  // Monitoring Web Vitals
  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const metric = {
          name: entry.name,
          value: entry.value,
          url: window.location.pathname,
          timestamp: Date.now(),
        };

        if (config.features.enableDebugLogs) {
          console.log(`📊 Web Vital - ${entry.name}: ${entry.value.toFixed(2)}ms`);
        }

        // Alertes pour métriques critiques
        if (entry.name === 'largest-contentful-paint' && entry.value > 2500) {
          console.warn('🚨 LCP dégradé:', entry.value);
        }

        if (entry.name === 'first-input' && entry.value > 100) {
          console.warn('🚨 FID dégradé:', entry.value);
        }

        // Envoi vers analytics (à implémenter selon vos besoins)
        // analytics?.track('web_vital', metric);
      });
    });

    try {
      observer.observe({
        entryTypes: [
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
          'navigation',
          'resource',
        ],
      });
    } catch (e) {
      console.warn('Performance Observer non supporté:', e);
    }

    return () => observer.disconnect();
  }, []);

  // Monitoring des erreurs globales
  useEffect(() => {
    const handleError = (event) => {
      const errorInfo = {
        message: event.error?.message || 'Erreur inconnue',
        filename: event.error?.filename,
        lineno: event.error?.lineno,
        colno: event.error?.colno,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      console.error('🚨 Erreur JavaScript capturée:', errorInfo);

      if (config.features.enableErrorReporting) {
        // Envoi vers service d'erreur (Sentry, LogRocket, etc.)
        // errorReporting?.captureException(event.error, errorInfo);
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('🚨 Promise rejection non gérée:', event.reason);

      if (config.features.enableErrorReporting) {
        // errorReporting?.captureException(event.reason);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Monitoring des ressources lentes
  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring) return;

    const checkResourcePerformance = () => {
      const resources = performance.getEntriesByType('resource');
      resources.forEach((resource) => {
        if (resource.duration > 3000) {
          // Plus de 3 secondes
          console.warn(`🐌 Ressource lente: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
        }
      });
    };

    const interval = setInterval(checkResourcePerformance, 30000); // Toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const value = {
    markStart,
    markEnd,

    // Fonction utilitaire pour mesurer des fonctions
    measureFunction: useCallback(
      (name, func) => {
        markStart(name);
        const result = func();

        if (result instanceof Promise) {
          return result.finally(() => markEnd(name));
        } else {
          markEnd(name);
          return result;
        }
      },
      [markStart, markEnd]
    ),

    // Fonction pour mesurer des composants React
    measureRender: useCallback(
      (componentName) => {
        if (!config.features.enablePerformanceMonitoring) return {};

        return {
          onRenderStart: () => markStart(`render-${componentName}`),
          onRenderEnd: () => markEnd(`render-${componentName}`),
        };
      },
      [markStart, markEnd]
    ),
  };

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
}

/**
 * Hook pour utiliser les outils de performance
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}
