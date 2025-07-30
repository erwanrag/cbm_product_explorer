// ===================================
// 📁 frontend/src/store/contexts/AppStateContext.jsx - NOUVEAU
// ===================================

import React, { createContext, useContext, useReducer } from 'react';

// État initial global
const initialState = {
    // UI State
    sidebar: {
        isOpen: false,
        isPinned: false,
    },

    // Filtres globaux
    filters: {
        active: {},
        history: [],
        type: 'none' // 'dashboard', 'matrix', 'optimization', 'none'
    },

    // État de l'application
    app: {
        isLoading: false,
        currentPage: 'dashboard',
        lastRefresh: null,
    },

    // Sélection produits
    selection: {
        selectedProducts: [],
        currentProduct: null,
        activeView: 'table' // 'table', 'grid', 'chart'
    }
};

// Actions
const actionTypes = {
    // Sidebar
    SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
    SET_SIDEBAR_PINNED: 'SET_SIDEBAR_PINNED',
    TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',

    // Filtres
    SET_FILTERS: 'SET_FILTERS',
    SET_FILTER_TYPE: 'SET_FILTER_TYPE',
    CLEAR_FILTERS: 'CLEAR_FILTERS',
    ADD_TO_FILTER_HISTORY: 'ADD_TO_FILTER_HISTORY',

    // App
    SET_LOADING: 'SET_LOADING',
    SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
    SET_LAST_REFRESH: 'SET_LAST_REFRESH',

    // Sélection
    SET_SELECTED_PRODUCTS: 'SET_SELECTED_PRODUCTS',
    SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
    SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
};

// Reducer
function appStateReducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_SIDEBAR_OPEN:
            return {
                ...state,
                sidebar: { ...state.sidebar, isOpen: action.payload }
            };

        case actionTypes.SET_SIDEBAR_PINNED:
            return {
                ...state,
                sidebar: { ...state.sidebar, isPinned: action.payload }
            };

        case actionTypes.TOGGLE_SIDEBAR:
            return {
                ...state,
                sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen }
            };

        case actionTypes.SET_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, active: action.payload }
            };

        case actionTypes.SET_FILTER_TYPE:
            return {
                ...state,
                filters: { ...state.filters, type: action.payload }
            };

        case actionTypes.CLEAR_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, active: {} }
            };

        case actionTypes.ADD_TO_FILTER_HISTORY:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    history: [action.payload, ...state.filters.history.slice(0, 9)] // Keep last 10
                }
            };

        case actionTypes.SET_LOADING:
            return {
                ...state,
                app: { ...state.app, isLoading: action.payload }
            };

        case actionTypes.SET_CURRENT_PAGE:
            return {
                ...state,
                app: { ...state.app, currentPage: action.payload }
            };

        case actionTypes.SET_LAST_REFRESH:
            return {
                ...state,
                app: { ...state.app, lastRefresh: Date.now() }
            };

        case actionTypes.SET_CURRENT_PRODUCT:
            return {
                ...state,
                selection: { ...state.selection, currentProduct: action.payload }
            };

        case actionTypes.SET_SELECTED_PRODUCTS:
            return {
                ...state,
                selection: { ...state.selection, selectedProducts: action.payload }
            };

        case actionTypes.SET_ACTIVE_VIEW:
            return {
                ...state,
                selection: { ...state.selection, activeView: action.payload }
            };

        default:
            return state;
    }
}

// Context
const AppStateContext = createContext(null);

// Provider
export function AppStateProvider({ children }) {
    const [state, dispatch] = useReducer(appStateReducer, initialState);

    // Actions encapsulées
    const actions = {
        // Sidebar
        setSidebarOpen: (isOpen) => dispatch({ type: actionTypes.SET_SIDEBAR_OPEN, payload: isOpen }),
        setSidebarPinned: (isPinned) => dispatch({ type: actionTypes.SET_SIDEBAR_PINNED, payload: isPinned }),
        toggleSidebar: () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),

        // Filtres
        setFilters: (filters) => {
            dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
            dispatch({ type: actionTypes.ADD_TO_FILTER_HISTORY, payload: filters });
        },
        setFilterType: (type) => dispatch({ type: actionTypes.SET_FILTER_TYPE, payload: type }),
        clearFilters: () => dispatch({ type: actionTypes.CLEAR_FILTERS }),

        // App
        setLoading: (isLoading) => dispatch({ type: actionTypes.SET_LOADING, payload: isLoading }),
        setCurrentPage: (page) => dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page }),
        refresh: () => dispatch({ type: actionTypes.SET_LAST_REFRESH }),

        // Sélection
        setSelectedProducts: (products) => dispatch({ type: actionTypes.SET_SELECTED_PRODUCTS, payload: products }),
        setCurrentProduct: (product) => dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: product }),
        setActiveView: (view) => dispatch({ type: actionTypes.SET_ACTIVE_VIEW, payload: view }),
    };

    const value = { state, actions, dispatch };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

// Hook
export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within AppStateProvider');
    }
    return context;
}
