// ===================================
// 📁 frontend/src/store/contexts/LayoutContext.jsx - FUSIONNER VOS EXISTANTS
// ===================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * État initial du layout
 */
const initialState = {
  // Sidebar
  sidebarOpen: false,
  sidebarMobileOpen: false,

  // Filtres
  filters: {
    cod_pro: null,
    ref_crn: null,
    ref_ext: null,
    qualite: null,
    use_grouping: false,
  },

  // UI State
  loading: false,
  notifications: [],

  // Page state
  currentPage: 'dashboard',
  breadcrumbs: [],
};

/**
 * Actions disponibles
 */
const ACTIONS = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_MOBILE_SIDEBAR: 'TOGGLE_MOBILE_SIDEBAR',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_LOADING: 'SET_LOADING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS',
};

/**
 * Reducer pour gérer l'état du layout
 */
const layoutReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case ACTIONS.TOGGLE_MOBILE_SIDEBAR:
      return {
        ...state,
        sidebarMobileOpen: !state.sidebarMobileOpen,
      };

    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case ACTIONS.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload,
      };

    case ACTIONS.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Contexte Layout
 */
export const LayoutContext = createContext(undefined);

/**
 * Provider du contexte Layout
 */
export const LayoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Actions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_MOBILE_SIDEBAR });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    dispatch({
      type: ACTIONS.ADD_NOTIFICATION,
      payload: { ...notification, id },
    });

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const setCurrentPage = useCallback((page) => {
    dispatch({ type: ACTIONS.SET_CURRENT_PAGE, payload: page });
  }, []);

  const setBreadcrumbs = useCallback((breadcrumbs) => {
    dispatch({ type: ACTIONS.SET_BREADCRUMBS, payload: breadcrumbs });
  }, []);

  const value = {
    // State
    ...state,

    // Actions
    toggleSidebar,
    toggleMobileSidebar,
    setFilters,
    clearFilters,
    setLoading,
    addNotification,
    removeNotification,
    setCurrentPage,
    setBreadcrumbs,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

/**
 * Hook pour utiliser le contexte Layout
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout doit être utilisé dans un LayoutProvider');
  }

  return context;
};
