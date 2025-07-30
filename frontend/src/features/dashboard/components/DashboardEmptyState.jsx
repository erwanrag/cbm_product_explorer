// frontend/src/features/dashboard/components/DashboardEmptyState.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Analytics, TrendingUp, Inventory } from '@mui/icons-material';
import { motion } from 'framer-motion';

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
                textAlign: 'center',
                p: 4,
            }}>
                <Analytics sx={{ fontSize: 120, color: 'primary.main', mb: 3 }} />
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Dashboard CBM
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                    Sélectionnez des filtres dans le panneau latéral pour commencer l'analyse
                    de vos produits, ventes et performances.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h6">Analyses</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tendances et KPIs
                            </Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Inventory color="primary" sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h6">Stocks</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gestion et alertes
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </motion.div>
    );
}
