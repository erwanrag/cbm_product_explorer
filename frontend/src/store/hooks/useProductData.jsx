// frontend/src/store/hooks/useProductData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService, productService, salesService, stockService } from '@/api/services';
import { toast } from 'react-toastify';

/**
 * Hook centralisé pour la gestion des données produit
 * Gère le cache intelligent, la synchronisation et les mutations
 */
export function useProductData() {
  const queryClient = useQueryClient();

  /**
   * Query pour les données dashboard complètes
   */
  const useDashboardData = (filters, options = {}) => {
    return useQuery({
      queryKey: ['dashboard', 'fiche', filters],
      queryFn: () => dashboardService.getFiche(filters),
      enabled: Boolean(
        filters &&
          (filters.cod_pro ||
            filters.ref_crn ||
            filters.ref_ext ||
            filters.cod_pro_list?.length > 0)
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Erreur chargement dashboard:', error);
        toast.error('Impossible de charger les données produit');
      },
      ...options,
    });
  };

  /**
   * Query pour les détails produits avec retry intelligent
   */
  const useProductDetails = (filters, options = {}) => {
    return useQuery({
      queryKey: ['products', 'details', filters],
      queryFn: () => productService.getDetails(filters),
      enabled: Boolean(filters),
      retry: (failureCount, error) => {
        // Retry logic intelligent
        if (error?.response?.status === 404) return false;
        if (error?.response?.status >= 500) return failureCount < 3;
        return failureCount < 1;
      },
      staleTime: 2 * 60 * 1000,
      ...options,
    });
  };

  /**
   * Query pour l'historique des ventes avec pagination
   */
  const useSalesHistory = (filters, lastNMonths = 12, options = {}) => {
    return useQuery({
      queryKey: ['sales', 'history', filters, lastNMonths],
      queryFn: () => salesService.getHistory(filters, lastNMonths),
      enabled: Boolean(filters),
      staleTime: 1 * 60 * 1000,
      ...options,
    });
  };

  /**
   * Query pour les données de stock
   */
  const useStockData = (filters, options = {}) => {
    return useQuery({
      queryKey: ['stock', 'current', filters],
      queryFn: () => stockService.getCurrent(filters),
      enabled: Boolean(filters),
      staleTime: 30 * 1000, // Stock plus volatil
      ...options,
    });
  };

  /**
   * Mutation pour l'invalidation sélective du cache
   */
  const useInvalidateCache = () => {
    return useMutation({
      mutationFn: async ({ scope, filters }) => {
        // Invalidation ciblée selon le scope
        const queries = [];

        switch (scope) {
          case 'dashboard':
            queries.push(['dashboard']);
            break;
          case 'products':
            queries.push(['products']);
            break;
          case 'sales':
            queries.push(['sales']);
            break;
          case 'stock':
            queries.push(['stock']);
            break;
          case 'all':
            queries.push(['dashboard'], ['products'], ['sales'], ['stock']);
            break;
          default:
            queries.push([scope]);
        }

        await Promise.all(queries.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

        return { invalidated: queries.length };
      },
      onSuccess: ({ invalidated }) => {
        toast.success(`Cache actualisé (${invalidated} requêtes)`);
      },
    });
  };

  /**
   * Utilitaire pour précharger des données
   */
  const prefetchProductData = async (filters) => {
    const queries = [
      queryClient.prefetchQuery({
        queryKey: ['products', 'details', filters],
        queryFn: () => productService.getDetails(filters),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['sales', 'history', filters, 12],
        queryFn: () => salesService.getHistory(filters, 12),
        staleTime: 1 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['stock', 'current', filters],
        queryFn: () => stockService.getCurrent(filters),
        staleTime: 30 * 1000,
      }),
    ];

    await Promise.allSettled(queries);
  };

  return {
    // Queries
    useDashboardData,
    useProductDetails,
    useSalesHistory,
    useStockData,

    // Mutations
    useInvalidateCache,

    // Utilities
    prefetchProductData,

    // Direct access to query client
    queryClient,
  };
}

// frontend/src/store/contexts/AppStateContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AppStateContext = createContext();

/**
 * État global de l'application avec reducer pattern
 */
const initialState = {
  // UI State
  ui: {
    sidebarOpen: true,
    sidebarPinned: true,
    loading: false,
    currentPage: 'dashboard',
  },

  // Filters State
  filters: {
    active: {},
    history: [],
    mode: 'simple', // 'simple' | 'advanced'
  },

  // Selected Data
  selection: {
    currentProduct: null,
    selectedProducts: [],
    activeView: 'dashboard', // 'dashboard' | 'matrix' | 'optimization'
  },

  // Cache State
  cache: {
    lastUpdate: null,
    version: '1.0.0',
  },
};

/**
 * Actions pour la gestion d'état
 */
const actionTypes = {
  // UI Actions
  SET_SIDEBAR_STATE: 'SET_SIDEBAR_STATE',
  SET_LOADING: 'SET_LOADING',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',

  // Filter Actions
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  ADD_TO_FILTER_HISTORY: 'ADD_TO_FILTER_HISTORY',
  SET_FILTER_MODE: 'SET_FILTER_MODE',

  // Selection Actions
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  SET_SELECTED_PRODUCTS: 'SET_SELECTED_PRODUCTS',
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',

  // Cache Actions
  UPDATE_CACHE_TIMESTAMP: 'UPDATE_CACHE_TIMESTAMP',
};

/**
 * Reducer pour la gestion d'état immutable
 */
function appStateReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_SIDEBAR_STATE:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: action.payload.open ?? state.ui.sidebarOpen,
          sidebarPinned: action.payload.pinned ?? state.ui.sidebarPinned,
        },
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };

    case actionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        ui: { ...state.ui, currentPage: action.payload },
      };

    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          active: { ...action.payload, _timestamp: Date.now() },
        },
      };

    case actionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          active: {},
        },
      };

    case actionTypes.ADD_TO_FILTER_HISTORY:
      return {
        ...state,
        filters: {
          ...state.filters,
          history: [
            action.payload,
            ...state.filters.history.slice(0, 9), // Garde les 10 derniers
          ],
        },
      };

    case actionTypes.SET_FILTER_MODE:
      return {
        ...state,
        filters: { ...state.filters, mode: action.payload },
      };

    case actionTypes.SET_CURRENT_PRODUCT:
      return {
        ...state,
        selection: { ...state.selection, currentProduct: action.payload },
      };

    case actionTypes.SET_SELECTED_PRODUCTS:
      return {
        ...state,
        selection: { ...state.selection, selectedProducts: action.payload },
      };

    case actionTypes.SET_ACTIVE_VIEW:
      return {
        ...state,
        selection: { ...state.selection, activeView: action.payload },
      };

    case actionTypes.UPDATE_CACHE_TIMESTAMP:
      return {
        ...state,
        cache: { ...state.cache, lastUpdate: Date.now() },
      };

    default:
      return state;
  }
}

/**
 * Provider pour l'état global de l'application
 */
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Actions encapsulées
  const actions = {
    setSidebarState: useCallback(
      (open, pinned) =>
        dispatch({
          type: actionTypes.SET_SIDEBAR_STATE,
          payload: { open, pinned },
        }),
      []
    ),

    setLoading: useCallback(
      (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
      []
    ),

    setCurrentPage: useCallback(
      (page) => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
      []
    ),

    setFilters: useCallback((filters) => {
      dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
      dispatch({ type: actionTypes.ADD_TO_FILTER_HISTORY, payload: filters });
    }, []),

    clearFilters: useCallback(() => dispatch({ type: actionTypes.CLEAR_FILTERS }), []),

    setFilterMode: useCallback(
      (mode) => dispatch({ type: actionTypes.SET_FILTER_MODE, payload: mode }),
      []
    ),

    setCurrentProduct: useCallback(
      (product) => dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: product }),
      []
    ),

    setSelectedProducts: useCallback(
      (products) => dispatch({ type: actionTypes.SET_SELECTED_PRODUCTS, payload: products }),
      []
    ),

    setActiveView: useCallback(
      (view) => dispatch({ type: actionTypes.SET_ACTIVE_VIEW, payload: view }),
      []
    ),

    updateCacheTimestamp: useCallback(
      () => dispatch({ type: actionTypes.UPDATE_CACHE_TIMESTAMP }),
      []
    ),
  };

  const value = {
    state,
    actions,
    // Selectors
    selectors: {
      isLoading: state.ui.loading,
      hasActiveFilters: Object.keys(state.filters.active).length > 0,
      currentProduct: state.selection.currentProduct,
      selectedProductsCount: state.selection.selectedProducts.length,
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/**
 * Hook pour accéder à l'état global
 */
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
