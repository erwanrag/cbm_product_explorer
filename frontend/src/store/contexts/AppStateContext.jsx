// ===================================
// 📁 frontend/src/store/contexts/AppStateContext.jsx - COMPLET AVEC TOUS LES PARAMÈTRES
// ===================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Context
const AppStateContext = createContext();

// Actions
const ACTIONS = {
    SET_USER: 'SET_USER',
    SET_CONFIG: 'SET_CONFIG',
    UPDATE_CACHE: 'UPDATE_CACHE',
    CLEAR_CACHE: 'CLEAR_CACHE',
    SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
    UPDATE_PERFORMANCE: 'UPDATE_PERFORMANCE',
    ADD_ERROR: 'ADD_ERROR',
    CLEAR_ERRORS: 'CLEAR_ERRORS',
    // 🔥 ACTIONS PARAMÈTRES
    SET_ALL_SETTINGS: 'SET_ALL_SETTINGS',
    UPDATE_SETTING: 'UPDATE_SETTING',
};

// 🔥 TOUS LES PARAMÈTRES DANS LE STORE
const getInitialSettings = () => ({
    // Interface utilisateur
    theme: localStorage.getItem('cbm-theme') || 'light',
    language: localStorage.getItem('cbm-language') || 'fr',
    animations: JSON.parse(localStorage.getItem('cbm-animations') || 'true'),
    compactMode: JSON.parse(localStorage.getItem('cbm-compact') || 'false'),
    showTooltips: JSON.parse(localStorage.getItem('cbm-tooltips') || 'true'),
    autoSave: JSON.parse(localStorage.getItem('cbm-autosave') || 'true'),

    // Performance
    pageSize: parseInt(localStorage.getItem('cbm-pagesize') || '50'),
    cacheTimeout: parseInt(localStorage.getItem('cbm-cache-timeout') || '300'),
    requestTimeout: parseInt(localStorage.getItem('cbm-request-timeout') || '30'),
    retryAttempts: parseInt(localStorage.getItem('cbm-retry-attempts') || '3'),
    enableDebugMode: JSON.parse(localStorage.getItem('cbm-debug') || 'false'),

    // Affichage
    showKPICards: JSON.parse(localStorage.getItem('cbm-show-kpi') || 'true'),
    showCharts: JSON.parse(localStorage.getItem('cbm-show-charts') || 'true'),
    defaultView: localStorage.getItem('cbm-default-view') || 'table',
    exportFormat: localStorage.getItem('cbm-export-format') || 'excel',
    dateFormat: localStorage.getItem('cbm-date-format') || 'dd/MM/yyyy',

    // API & Sécurité
    apiTimeout: parseInt(localStorage.getItem('cbm-api-timeout') || '30000'),
    enableCache: JSON.parse(localStorage.getItem('cbm-enable-cache') || 'true'),
    logLevel: localStorage.getItem('cbm-log-level') || 'info',
    sessionTimeout: parseInt(localStorage.getItem('cbm-session-timeout') || '60'),
});

// État initial
const initialState = {
    user: null,
    config: {
        apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5180/api/v1',
        version: '1.0.0',
        features: {},
    },
    cache: {
        size: 0,
        entries: {},
        lastCleared: null,
    },
    isOnline: navigator.onLine,
    performance: {
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
    },
    errors: [],
    // 🔥 TOUS LES PARAMÈTRES
    settings: getInitialSettings(),
};

// Reducer
const appStateReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_USER:
            return { ...state, user: action.payload };

        case ACTIONS.SET_CONFIG:
            return { ...state, config: { ...state.config, ...action.payload } };

        case ACTIONS.UPDATE_CACHE:
            return {
                ...state,
                cache: {
                    ...state.cache,
                    ...action.payload,
                    size: Object.keys({ ...state.cache.entries, ...action.payload.entries }).length,
                },
            };

        case ACTIONS.CLEAR_CACHE:
            return {
                ...state,
                cache: { size: 0, entries: {}, lastCleared: new Date().toISOString() },
            };

        case ACTIONS.SET_ONLINE_STATUS:
            return { ...state, isOnline: action.payload };

        case ACTIONS.UPDATE_PERFORMANCE:
            return { ...state, performance: { ...state.performance, ...action.payload } };

        case ACTIONS.ADD_ERROR:
            return {
                ...state,
                errors: [...state.errors, { ...action.payload, id: Date.now() }],
            };

        case ACTIONS.CLEAR_ERRORS:
            return { ...state, errors: [] };

        // 🔥 ACTIONS PARAMÈTRES
        case ACTIONS.SET_ALL_SETTINGS:
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case ACTIONS.UPDATE_SETTING:
            return {
                ...state,
                settings: {
                    ...state.settings,
                    [action.payload.key]: action.payload.value,
                },
            };

        default:
            return state;
    }
};

// Provider avec ThemeProvider intégré
export const AppStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialState);

    // 🔥 FONCTION UNIVERSELLE POUR CHANGER N'IMPORTE QUEL PARAMÈTRE
    const updateSetting = (key, value) => {
        dispatch({
            type: ACTIONS.UPDATE_SETTING,
            payload: { key, value },
        });

        // Sauvegarder dans localStorage
        const storageKey = `cbm-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        localStorage.setItem(storageKey, typeof value === 'object' ? JSON.stringify(value) : value.toString());

        // 🔥 EFFETS IMMÉDIATS selon le paramètre
        switch (key) {
            case 'enableDebugMode':
                if (value) {
                    console.log('🔧 Mode debug activé - Settings:', state.settings);
                    window.cbmDebug = true;
                    window.cbmSettings = state.settings;
                } else {
                    window.cbmDebug = false;
                    delete window.cbmSettings;
                }
                break;

            case 'language':
                // Changer la langue du document
                document.documentElement.lang = value;
                // Ici on pourrait intégrer i18n plus tard
                break;

            case 'logLevel':
                // Configurer le niveau de logs
                window.cbmLogLevel = value;
                console.log(`📊 Niveau de log changé: ${value}`);
                break;

            case 'enableCache':
                if (!value) {
                    // Vider le cache si désactivé
                    dispatch({ type: ACTIONS.CLEAR_CACHE });
                    console.log('🗑️ Cache désactivé et vidé');
                }
                break;
        }
    };

    const updateAllSettings = (settings) => {
        dispatch({
            type: ACTIONS.SET_ALL_SETTINGS,
            payload: settings,
        });

        // Sauvegarder dans localStorage
        Object.entries(settings).forEach(([key, value]) => {
            const storageKey = `cbm-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            localStorage.setItem(storageKey, typeof value === 'object' ? JSON.stringify(value) : value.toString());
        });
    };

    // Actions existantes
    const setUser = (user) => dispatch({ type: ACTIONS.SET_USER, payload: user });
    const updateConfig = (config) => dispatch({ type: ACTIONS.SET_CONFIG, payload: config });
    const updateCache = (cacheData) => dispatch({ type: ACTIONS.UPDATE_CACHE, payload: cacheData });
    const clearCache = () => dispatch({ type: ACTIONS.CLEAR_CACHE });
    const setOnlineStatus = (status) => dispatch({ type: ACTIONS.SET_ONLINE_STATUS, payload: status });
    const updatePerformance = (perf) => dispatch({ type: ACTIONS.UPDATE_PERFORMANCE, payload: perf });
    const addError = (error) => dispatch({ type: ACTIONS.ADD_ERROR, payload: error });
    const clearErrors = () => dispatch({ type: ACTIONS.CLEAR_ERRORS });

    // 🔥 CRÉATION DU THÈME MATERIAL-UI
    const isDarkMode = state.settings.theme === 'dark' ||
        (state.settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const muiTheme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            primary: {
                main: '#2196f3',
                light: '#64b5f6',
                dark: '#1976d2',
            },
            secondary: {
                main: '#f50057',
                light: '#ff5983',
                dark: '#c51162',
            },
            success: {
                main: '#4caf50',
            },
            warning: {
                main: '#ff9800',
            },
            error: {
                main: '#f44336',
            },
            background: {
                default: isDarkMode ? '#121212' : '#fafafa',
                paper: isDarkMode ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: isDarkMode ? '#ffffff' : '#000000',
                secondary: isDarkMode ? '#b3b3b3' : '#666666',
            },
        },
        typography: {
            h4: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
        },
        components: {
            // Mode compact
            MuiContainer: {
                styleOverrides: {
                    root: {
                        paddingTop: state.settings.compactMode ? '12px' : '24px',
                        paddingBottom: state.settings.compactMode ? '12px' : '24px',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        marginBottom: state.settings.compactMode ? '12px' : '16px',
                    },
                },
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        padding: state.settings.compactMode ? '12px !important' : '16px !important',
                        '&:last-child': {
                            paddingBottom: state.settings.compactMode ? '12px !important' : '16px !important',
                        },
                    },
                },
            },
            // Contrôle des animations
            MuiButtonBase: {
                styleOverrides: {
                    root: {
                        transition: state.settings.animations ?
                            'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' :
                            'none',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        transition: state.settings.animations ?
                            'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' :
                            'none',
                    },
                },
            },
            MuiCollapse: {
                styleOverrides: {
                    root: {
                        transitionDuration: state.settings.animations ? '300ms' : '0ms',
                    },
                },
            },
        },
    });

    // Écouter les changements système pour le mode auto
    useEffect(() => {
        if (state.settings.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                dispatch({
                    type: ACTIONS.SET_ALL_SETTINGS,
                    payload: state.settings,
                });
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [state.settings.theme]);

    // 🔥 EFFETS AU DÉMARRAGE
    useEffect(() => {
        // Appliquer la langue
        document.documentElement.lang = state.settings.language;

        // Appliquer le debug mode
        if (state.settings.enableDebugMode) {
            window.cbmDebug = true;
            window.cbmSettings = state.settings;
        }

        // Appliquer le niveau de log
        window.cbmLogLevel = state.settings.logLevel;

        // Charger la config depuis localStorage
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
    }, []);

    const value = {
        // State
        ...state,
        isDarkMode,

        // Actions existantes
        setUser,
        updateConfig,
        updateCache,
        clearCache,
        setOnlineStatus,
        updatePerformance,
        addError,
        clearErrors,

        // 🔥 NOUVELLES ACTIONS PARAMÈTRES
        updateSetting,
        updateAllSettings,
    };

    return (
        <AppStateContext.Provider value={value}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppStateContext.Provider>
    );
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