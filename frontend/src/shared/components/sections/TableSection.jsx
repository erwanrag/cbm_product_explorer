// ===================================
// 📁 frontend/src/shared/components/sections/TableSection.jsx  
// ===================================

import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Section pour afficher une table de manière standardisée
 * Wrapper générique pour vos *TableSection existants
 */
export default function TableSection({
    title = "📋 Tableau",
    subtitle,
    table, // Votre composant table existant (DashboardTableSection, etc.)
    isLoading = false,
    error = null,
    actions,
    containerSx = {}
}) {
    if (error) {
        return (
            <Paper sx={{ p: 3, mb: 4 }}>
                <Alert severity="error">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Erreur lors du chargement du tableau
                    </Typography>
                    <Typography variant="body2">
                        {error.message || 'Une erreur est survenue'}
                    </Typography>
                </Alert>
            </Paper>
        );
    }

    if (!table) return null;

    return (
        <Box sx={{ mb: 4, ...containerSx }}>
            {(title || subtitle || actions) && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    mb: 3
                }}>
                    <Box>
                        {title && (
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, mb: subtitle ? 1 : 0 }}
                            >
                                {title}
                            </Typography>
                        )}

                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {actions && <Box>{actions}</Box>}
                </Box>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {table}
            </motion.div>
        </Box>
    );
}
