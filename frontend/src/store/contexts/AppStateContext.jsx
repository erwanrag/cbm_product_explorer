// ===================================
// 📁 frontend/src/store/contexts/AppStateContext.jsx - NOUVEAU
// ===================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * État initial de l'application
 */
const initialState = {
  // État utilisateur (si applicable)
  user: null,
  isAuthenticated: false,

  // Configuration application
  config: {
    theme: 'light',
    language: 'fr',
    animations: true,
  },

  // Cache applicatif
  cache: {
    products: new Map(),
    sales: new Map(),
    lastUpdate: null,
  },

  // État global
  isOnline: navigator.onLine,
  lastSync: null,

  // Performance
  performance: {
    requestCount: 0,
    averageResponseTime: 0,
    errors: [],
  },
};

/**
 * Actions disponibles
 */
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_CONFIG: 'SET_CONFIG',
  UPDATE_CACHE: 'UPDATE_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
  UPDATE_PERFORMANCE: 'UPDATE_PERFORMANCE',
  ADD_ERROR: 'ADD_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

/**
 * Reducer pour gérer l'état global
 */
const appStateReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTIONS.SET_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
      };

    case ACTIONS.UPDATE_CACHE:
      const { key, data } = action.payload;
      return {
        ...state,
        cache: {
          ...state.cache,
          [key]: data,
          lastUpdate: new Date().toISOString(),
        },
      };

    case ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        cache: {
          products: new Map(),
          sales: new Map(),
          lastUpdate: null,
        },
      };

    case ACTIONS.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload,
      };

    case ACTIONS.SET_LAST_SYNC:
      return {
        ...state,
        lastSync: action.payload,
      };

    case ACTIONS.UPDATE_PERFORMANCE:
      const { requestCount, responseTime } = action.payload;
      const newAverage =
        state.performance.requestCount === 0
          ? responseTime
          : (state.performance.averageResponseTime * state.performance.requestCount +
              responseTime) /
            (state.performance.requestCount + 1);

      return {
        ...state,
        performance: {
          ...state.performance,
          requestCount: state.performance.requestCount + (requestCount || 1),
          averageResponseTime: newAverage,
        },
      };

    case ACTIONS.ADD_ERROR:
      return {
        ...state,
        performance: {
          ...state.performance,
          errors: [...state.performance.errors, action.payload],
        },
      };

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        performance: {
          ...state.performance,
          errors: [],
        },
      };

    default:
      return state;
  }
};

/**
 * Contexte AppState
 */
export const AppStateContext = createContext(undefined);

/**
 * Provider du contexte AppState
 */
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Actions
  const setUser = useCallback((user) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user });
  }, []);

  const updateConfig = useCallback((config) => {
    dispatch({ type: ACTIONS.SET_CONFIG, payload: config });

    // Persister en localStorage si possible
    try {
      const existingConfig = JSON.parse(localStorage.getItem('cbm-config') || '{}');
      localStorage.setItem(
        'cbm-config',
        JSON.stringify({
          ...existingConfig,
          ...config,
        })
      );
    } catch (error) {
      console.warn('Impossible de sauvegarder la config:', error);
    }
  }, []);

  const updateCache = useCallback((key, data) => {
    dispatch({ type: ACTIONS.UPDATE_CACHE, payload: { key, data } });
  }, []);

  const clearCache = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CACHE });
  }, []);

  const setOnlineStatus = useCallback((isOnline) => {
    dispatch({ type: ACTIONS.SET_ONLINE_STATUS, payload: isOnline });
  }, []);

  const updatePerformance = useCallback((metrics) => {
    dispatch({ type: ACTIONS.UPDATE_PERFORMANCE, payload: metrics });
  }, []);

  const addError = useCallback((error) => {
    const errorInfo = {
      message: error.message || 'Erreur inconnue',
      timestamp: new Date().toISOString(),
      stack: error.stack,
      url: window.location.href,
    };
    dispatch({ type: ACTIONS.ADD_ERROR, payload: errorInfo });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERRORS });
  }, []);

  // Chargement de la config depuis localStorage au démarrage
  React.useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('cbm-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        dispatch({ type: ACTIONS.SET_CONFIG, payload: config });
      }
    } catch (error) {
      console.warn('Impossible de charger la config:', error);
    }

    // Listeners pour l'état en ligne/hors ligne
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  const value = {
    // State
    ...state,

    // Actions
    setUser,
    updateConfig,
    updateCache,
    clearCache,
    setOnlineStatus,
    updatePerformance,
    addError,
    clearErrors,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

/**
 * Hook pour utiliser le contexte AppState
 */
export const useAppState = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState doit être utilisé dans un AppStateProvider');
  }

  return context;
};
