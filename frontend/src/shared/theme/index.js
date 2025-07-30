// frontend/src/shared/theme/index.js - CONFIGURATION THÈME MATERIAL-UI
import { createTheme } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';

/**
 * Palette de couleurs CBM
 */
const palette = {
    primary: {
        main: '#1976d2',      // Bleu principal CBM
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
    },
    secondary: {
        main: '#dc004e',      // Rouge accent CBM
        light: '#ff5983',
        dark: '#9a0036',
        contrastText: '#fff',
    },
    success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
    },
    warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
    },
    error: {
        main: '#d32f2f',
        light: '#f44336',
        dark: '#c62828',
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
    },
    background: {
        default: '#fafafa',
        paper: '#ffffff',
    },
    text: {
        primary: '#212121',
        secondary: '#757575',
        disabled: '#bdbdbd',
    },
};

/**
 * Configuration de la typographie
 */
const typography = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.5,
    },
    h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.6,
    },
    subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.75,
    },
    subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
    },
    body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
    },
    body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.43,
    },
    button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.75,
        textTransform: 'uppercase',
    },
    caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.66,
    },
    overline: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 2.66,
        textTransform: 'uppercase',
    },
};

/**
 * Configuration des composants
 */
const components = {
    // AppBar
    MuiAppBar: {
        styleOverrides: {
            root: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                borderBottom: '1px solid #e0e0e0',
            },
        },
    },

    // Button
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                },
            },
            containedPrimary: {
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
            },
        },
    },

    // Card
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                },
            },
        },
    },

    // DataGrid
    MuiDataGrid: {
        styleOverrides: {
            root: {
                border: 'none',
                borderRadius: 8,
                '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e9ecef',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    color: '#495057',
                },
                '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8f9fa',
                },
            },
        },
    },

    // TextField
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                    },
                },
            },
        },
    },

    // Chip
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 16,
                fontWeight: 500,
            },
        },
    },

    // Paper
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
            elevation1: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            },
            elevation2: {
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            },
            elevation3: {
                boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
            },
        },
    },

    // Drawer
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRight: '1px solid #e0e0e0',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            },
        },
    },

    // Tooltip
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: '#424242',
                fontSize: '0.75rem',
                borderRadius: 6,
            },
            arrow: {
                color: '#424242',
            },
        },
    },
};

/**
 * Configuration pour le mode sombre
 */
const darkPalette = {
    ...palette,
    mode: 'dark',
    background: {
        default: '#121212',
        paper: '#1e1e1e',
    },
    text: {
        primary: '#ffffff',
        secondary: '#aaaaaa',
        disabled: '#666666',
    },
};

/**
 * Créer le thème selon le mode
 */
export const createAppTheme = (mode = 'light') => {
    const isDark = mode === 'dark';

    return createTheme(
        {
            palette: isDark ? darkPalette : palette,
            typography,
            components,
            shape: {
                borderRadius: 8,
            },
            spacing: 8,
            transitions: {
                duration: {
                    shortest: 150,
                    shorter: 200,
                    short: 250,
                    standard: 300,
                    complex: 375,
                    enteringScreen: 225,
                    leavingScreen: 195,
                },
                easing: {
                    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
                    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
                },
            },
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 900,
                    lg: 1200,
                    xl: 1536,
                },
            },
            zIndex: {
                mobileStepper: 1000,
                fab: 1050,
                speedDial: 1050,
                appBar: 1100,
                drawer: 1200,
                modal: 1300,
                snackbar: 1400,
                tooltip: 1500,
            },
        },
        frFR // Localisation française
    );
};

// Export du thème par défaut
export default createAppTheme();