// ===================================
// 📁 frontend/src/shared/components/layout/ContentContainer.jsx - CORRIGÉ
// ===================================

import React from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * Container pour le contenu principal - VERSION CORRIGÉE
 * Supprime les marges pour éviter le décalage à droite
 */
const ContentContainer = ({ children }) => {
    const theme = useTheme();

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                width: '100%', // ✅ Largeur complète
                // ❌ SUPPRIMÉ: ml: margin-left qui causait le décalage
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                overflow: 'hidden', // ✅ Évite les débordements horizontaux
            }}
        >
            {/* Espace pour le header fixe */}
            <Box sx={{ height: theme.mixins.toolbar.minHeight }} />

            {/* Contenu avec padding responsive */}
            <Box
                sx={{
                    py: 2, // ✅ Plus compact
                    px: { xs: 1, sm: 2, md: 3 }, // ✅ Padding responsive
                    maxWidth: '100%', // ✅ Pas de dépassement
                    overflow: 'hidden'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default ContentContainer;