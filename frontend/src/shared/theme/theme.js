// ===================================
// 📁 frontend/src/shared/theme/theme.js 
// ===================================

import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { frFR } from "@mui/material/locale";

// Import des constantes
import { LAYOUT } from "@/constants/ui";

// Couleurs CBM officielles étendues
const cbmColors = {
    primary: "#1b365d",      // Bleu foncé CBM principal
    secondary: "#005b96",    // Bleu accent
    background: "#f9fafb",   // Gris très clair
    surface: "#ffffff",      // Blanc pur
    accent: "#fff8dc",       // Jaune clair
    border: "#e0e0e0",       // Gris bordure
    success: "#27ae60",      // Vert
    error: "#e53935",        // Rouge
    warning: "#f57c00",      // Orange
    info: "#1976d2",         // Bleu info
};

// Configuration typographique avancée
const typography = {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",

    // Échelle typographique harmonieuse
    h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em"
    },
    h2: {
        fontSize: "2rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em"
    },
    h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.3
    },
    h4: {
        fontSize: "1.5rem",
        fontWeight: 500,
        lineHeight: 1.4
    },
    h5: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.4
    },
    h6: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.5
    },

    // Corps de texte optimisé
    body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
        fontWeight: 400
    },
    body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
        fontWeight: 400
    },

    // Textes spécialisés
    caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
        fontWeight: 400,
        color: cbmColors.border
    },
    overline: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em"
    }
};

// Thème de base
let theme = createTheme(
    {
        palette: {
            mode: "light",
            primary: {
                main: cbmColors.primary,
                light: "#4a5f7a",
                dark: "#0f1e2b",
                contrastText: "#ffffff"
            },
            secondary: {
                main: cbmColors.secondary,
                light: "#4a85b8",
                dark: "#003d66",
                contrastText: "#ffffff"
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
                light: "#ef5350",
                dark: "#c62828"
            },
            warning: {
                main: cbmColors.warning,
                light: "#ff9800",
                dark: "#ef6c00"
            },
            info: {
                main: cbmColors.info,
                light: "#42a5f5",
                dark: "#1565c0"
            },
            success: {
                main: cbmColors.success,
                light: "#4caf50",
                dark: "#2e7d32"
            },

            // Couleurs personnalisées CBM
            accent: {
                main: cbmColors.accent,
                contrastText: cbmColors.primary
            },

            // Textes optimisés
            text: {
                primary: "rgba(0, 0, 0, 0.87)",
                secondary: "rgba(0, 0, 0, 0.6)",
                disabled: "rgba(0, 0, 0, 0.38)",
            },

            // Dividers
            divider: cbmColors.border,
        },

        typography,

        // Espacements harmonieux
        spacing: 8, // Base 8px pour cohérence

        // Breakpoints étendus
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 900,
                lg: 1200,
                xl: 1536,
                xxl: 1920 // Breakpoint supplémentaire
            }
        },

        // Ombres subtiles
        shadows: [
            'none',
            '0px 1px 3px rgba(0, 0, 0, 0.08)', // Légère
            '0px 2px 6px rgba(0, 0, 0, 0.1)',  // Normale
            '0px 4px 12px rgba(0, 0, 0, 0.12)', // Élevée
            '0px 8px 24px rgba(0, 0, 0, 0.15)', // Très élevée
            // ... continuer selon besoins
        ],

        // Configuration des composants
        components: {
            // Boutons CBM
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        padding: "10px 20px",
                        transition: "all 0.2s ease-in-out",

                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
                        }
                    },
                    containedPrimary: {
                        background: `linear-gradient(135deg, ${cbmColors.primary} 0%, ${cbmColors.secondary} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${cbmColors.secondary} 0%, ${cbmColors.primary} 100%)`,
                        }
                    }
                },
            },

            // Cards CBM
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: "12px",
                        border: `1px solid ${cbmColors.border}`,
                        transition: "all 0.2s ease-in-out",
                    },
                    elevation1: {
                        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
                        '&:hover': {
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                            transform: 'translateY(-2px)'
                        }
                    }
                },
            },

            // DataGrid CBM
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        borderRadius: "8px",
                        border: `1px solid ${cbmColors.border}`,
                        fontFamily: typography.fontFamily,
                        fontSize: "0.875rem",

                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: cbmColors.background,
                            borderBottom: `2px solid ${cbmColors.primary}`,
                            fontWeight: 600,
                        },

                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: `${cbmColors.accent}40`, // 40 = 25% opacity
                        }
                    },
                },
            },

            // AppBar CBM
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: `1px solid ${cbmColors.border}`,
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                    }
                }
            },

            // Inputs CBM
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            transition: 'all 0.2s ease-in-out',

                            '&:hover .MuiOutlinedInput