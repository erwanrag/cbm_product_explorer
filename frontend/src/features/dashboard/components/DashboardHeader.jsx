// frontend/src/features/dashboard/components/DashboardHeader.jsx
import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, Alert } from '@mui/material';
import { Refresh, Download, FilterList, Close, OpenInNew } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function DashboardHeader({
    data,
    filters,
    onRefresh,
    loading,
    selectedProduct,
    onClearSelection
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
                background: selectedProduct ?
                    'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' :
                    'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                border: selectedProduct ? '2px solid #1976d2' : '1px solid #e0e0e0',
            }}>
                <Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: selectedProduct ? '#1976d2' : 'primary.main'
                    }}>
                        📊 Dashboard Produits CBM
                        {selectedProduct && (
                            <Chip
                                label="FOCUS MODE"
                                color="primary"
                                size="small"
                                sx={{ ml: 2, fontWeight: 700 }}
                            />
                        )}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            {data?.details?.length || 0} produit(s) •
                            CA total: {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                            }).format(data?.kpis?.totalRevenue || 0)} •
                            Dernière MAJ: {new Date().toLocaleTimeString('fr-FR')}
                        </Typography>
                    </Box>

                    {/* Produit sélectionné */}
                    {selectedProduct && (
                        <Alert
                            severity="info"
                            sx={{ mb: 2 }}
                            action={
                                <IconButton size="small" onClick={onClearSelection}>
                                    <Close fontSize="small" />
                                </IconButton>
                            }
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Focus sur: <strong>{selectedProduct.refint}</strong> - {selectedProduct.designation}
                                <br />
                                CA: <strong>{new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                }).format(selectedProduct.ca_total || 0)}</strong> •
                                Qualité: <strong>{selectedProduct.qualite}</strong>
                            </Typography>
                        </Alert>
                    )}

                    {/* Filtres actifs */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(filters).map(([key, value]) => (
                            <Chip
                                key={key}
                                icon={<FilterList />}
                                label={`${key}: ${value}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Actualiser les données">
                        <IconButton
                            onClick={onRefresh}
                            disabled={loading}
                            color="primary"
                            sx={{
                                '&:hover': { transform: 'rotate(360deg)', transition: 'transform 0.6s' }
                            }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Exporter vers Excel">
                        <IconButton color="primary">
                            <Download />
                        </IconButton>
                    </Tooltip>
                    {selectedProduct && (
                        <Tooltip title="Ouvrir dans Matrix">
                            <IconButton color="secondary">
                                <OpenInNew />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
}
