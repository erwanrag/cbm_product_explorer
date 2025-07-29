// frontend/src/features/dashboard/components/DashboardEmptyState.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Analytics, TrendingUp, Inventory } from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * État vide du dashboard - Composant dédié
 */
export default function DashboardEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <Analytics sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    Dashboard Produits CBM
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                    Sélectionnez des filtres dans le panneau latéral pour commencer l'analyse
                    de vos produits, ventes et performances.
                </Typography>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp color="primary" />
                        <Typography variant="body2">Analyses de tendances</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory color="primary" />
                        <Typography variant="body2">Gestion de stock</Typography>
                    </Paper>
                </Box>
            </Box>
        </motion.div>
    );
}
