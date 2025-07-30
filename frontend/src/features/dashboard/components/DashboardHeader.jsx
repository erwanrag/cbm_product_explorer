import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import QuickActionsMenu from './QuickActionsMenu';

/**
 * Header du dashboard - Composant focalisé
 */
export default function DashboardHeader({
    productCount,
    onRefresh,
    onExport,
    onViewModeChange,
    viewMode,
    loading,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        📊 Dashboard Produits
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Analyse en temps réel • {productCount} produit(s) • Dernière mise à jour:{' '}
                        {new Date().toLocaleTimeString('fr-FR')}
                    </Typography>
                </Box>

                <QuickActionsMenu
                    onRefresh={onRefresh}
                    onExport={onExport}
                    onViewModeChange={onViewModeChange}
                    currentViewMode={viewMode}
                    loading={loading}
                />
            </Box>
        </motion.div>
    );
}
