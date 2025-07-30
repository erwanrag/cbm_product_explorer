// 📁 frontend/src/shared/theme/theme.js

import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';
import { LAYOUT } from '@/constants/ui';

const cbmColors = {
    primary: '#1b365d',
    secondary: '#005b96',
    background: '#f9fafb',
    surface: '#ffffff',
    accent: '#fff8dc',
    border: '#e0e0e0',
    success: '#27ae60',
    error: '#e53935',
    warning: '#f57c00',
    info: '#1976d2',
};

const typography = {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 400 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 400, color: cbmColors.border },
    overline: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
};

let theme = createTheme(
    {
        palette: {
            mode: 'light',
            primary: {
                main: cbmColors.primary,
                light: '#4a5f7a',
                dark: '#0f1e2b',
                contrastText: '#ffffff',
            },
            secondary: {
                main: cbmColors.secondary,
                light: '#4a85b8',
                dark: '#003d66',
                contrastText: '#ffffff',
            },
            background: {
                default: cbmColors.background,
                paper: cbmColors.surface,
            },
            surface: {
                main: cbmColors.surface,
            },
            error: {
                main: cbmColors.error,
                light: '#ef5350',
                dark: '#c62828',
            },
            warning: {
                main: cbmColors.warning,
                light: '#ff9800',
                dark: '#ef6c00',
            },
            info: {
                main: cbmColors.info,
                light: '#42a5f5',
                dark: '#1565c0',
            },
            success: {
                main: cbmColors.success,
                light: '#4caf50',
                dark: '#2e7d32',
            },
            accent: {
                main: cbmColors.accent,
                contrastText: cbmColors.primary,
            },
            text: {
                primary: 'rgba(0, 0, 0, 0.87)',
                secondary: 'rgba(0, 0, 0, 0.6)',
                disabled: 'rgba(0, 0, 0, 0.38)',
            },
            divider: cbmColors.border,
        },
        typography,
        spacing: 8,
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 900,
                lg: 1200,
                xl: 1536,
                xxl: 1920,
            },
        },
        shadows: [
            'none',
            '0px 1px 3px rgba(0, 0, 0, 0.08)',
            '0px 2px 6px rgba(0, 0, 0, 0.1)',
            '0px 4px 12px rgba(0, 0, 0, 0.12)',
            '0px 8px 24px rgba(0, 0, 0, 0.15)',
        ],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '10px 20px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    },
                    containedPrimary: {
                        background: `linear-gradient(135deg, ${cbmColors.primary} 0%, ${cbmColors.secondary} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${cbmColors.secondary} 0%, ${cbmColors.primary} 100%)`,
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                        border: `1px solid ${cbmColors.border}`,
                        transition: 'all 0.2s ease-in-out',
                    },
                    elevation1: {
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
                            transform: 'translateY(-2px)',
                        },
                    },
                },
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        border: `1px solid ${cbmColors.border}`,
                        fontFamily: typography.fontFamily,
                        fontSize: '0.875rem',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: cbmColors.background,
                            borderBottom: `2px solid ${cbmColors.primary}`,
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: `${cbmColors.accent}40`,
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: `1px solid ${cbmColors.border}`,
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: cbmColors.primary,
                        },
                    },
                },
            },
        },
    },
    frFR
);

theme = responsiveFontSizes(theme);

export default theme;
