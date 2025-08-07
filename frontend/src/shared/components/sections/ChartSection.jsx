// ===================================
// 📁 frontend/src/shared/components/sections/ChartSection.jsx
// ===================================

import React from 'react';
import { Box, Typography, Paper, Grid, Alert } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Section pour afficher des graphiques de manière standardisée
 * Wrapper générique pour tous vos graphiques existants
 */
export default function ChartSection({
    title = "📈 Graphiques",
    subtitle,
    charts = [],
    isLoading = false,
    error = null,
    layout = 'grid', // 'grid' | 'stack' | 'carousel'
    columns = 2,
    containerSx = {}
}) {
    if (error) {
        return (
            <Paper sx={{ p: 3, mb: 4 }}>
                <Alert severity="error">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Erreur lors du chargement des graphiques
                    </Typography>
                    <Typography variant="body2">
                        {error.message || 'Une erreur est survenue'}
                    </Typography>
                </Alert>
            </Paper>
        );
    }

    if (!charts || charts.length === 0) return null;

    const renderCharts = () => {
        switch (layout) {
            case 'stack':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {charts.map((chart, index) => (
                            <motion.div
                                key={chart.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Paper sx={{ p: 3 }}>
                                    {chart.title && (
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            {chart.title}
                                        </Typography>
                                    )}
                                    {chart.component}
                                </Paper>
                            </motion.div>
                        ))}
                    </Box>
                );

            default: // 'grid'
                return (
                    <Grid container spacing={3}>
                        {charts.map((chart, index) => (
                            <Grid
                                item
                                xs={12}
                                md={12 / columns}
                                key={chart.id || index}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Paper sx={{ p: 3, height: '100%' }}>
                                        {chart.title && (
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                {chart.title}
                                            </Typography>
                                        )}
                                        {chart.component}
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                );
        }
    };

    return (
        <Box sx={{ mb: 4, ...containerSx }}>
            {title && (
                <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600 }}
                >
                    {title}
                </Typography>
            )}

            {subtitle && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    {subtitle}
                </Typography>
            )}

            {renderCharts()}
        </Box>
    );
}