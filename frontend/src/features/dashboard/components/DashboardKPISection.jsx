// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardKPISection.jsx - AVEC STOCK
// ===================================

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { Inventory, Euro, TrendingUp, Warehouse } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatUtils';

export default function DashboardKPISection({ data, loading }) {
    if (!data?.details) return null;

    // Calcul des KPIs complets avec STOCK
    const totalProducts = data.details.length;
    const totalRevenue = data.details.reduce((sum, p) => sum + (p.ca_total || 0), 0);
    const averageMargin = data.details.length > 0 ?
        data.details.reduce((sum, p) => sum + (p.marge_percent_total || 0), 0) / data.details.length : 0;

    // ✅ AJOUT DU STOCK VALORISÉ
    const totalStockValue = data.details.reduce((sum, p) =>
        sum + ((p.stock_total || 0) * (p.pmp || 0)), 0);

    const kpis = [
        {
            title: 'Produits',
            value: totalProducts,
            format: 'number',
            icon: <Inventory />,
            color: '#1976d2',
            bgColor: '#e3f2fd',
        },
        {
            title: 'CA Total',
            value: totalRevenue,
            format: 'currency',
            icon: <Euro />,
            color: '#2e7d32',
            bgColor: '#e8f5e8',
        },
        {
            title: 'Marge Moy.',
            value: averageMargin,
            format: 'percentage',
            icon: <TrendingUp />,
            color: averageMargin > 15 ? '#2e7d32' : '#f57c00',
            bgColor: averageMargin > 15 ? '#e8f5e8' : '#fff3e0',
        },
        {
            title: 'Stock Valorisé',
            value: totalStockValue,
            format: 'currency',
            icon: <Warehouse />,
            color: '#9c27b0',
            bgColor: '#f3e5f5',
        },
    ];

    const formatValue = (value, format) => {
        if (format === 'currency') {
            return formatCurrency(value, 'EUR', true); // Format compact
        }
        if (format === 'percentage') {
            return `${(value || 0).toFixed(1)}%`;
        }
        return (value || 0).toLocaleString('fr-FR');
    };

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}> {/* Plus compact */}
            {kpis.map((kpi, index) => (
                <Grid item xs={6} sm={3} key={kpi.title}> {/* 4 colonnes sur desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card sx={{
                            height: '110px', // Plus compact
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(135deg, ${kpi.bgColor} 0%, ${kpi.bgColor}aa 100%)`,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                            },
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{
                                        bgcolor: kpi.color,
                                        width: 32,
                                        height: 32,
                                        mr: 1.5
                                    }}>
                                        {kpi.icon}
                                    </Avatar>
                                    <Typography variant="body2" color="text.secondary">
                                        {kpi.title}
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: kpi.color,
                                    fontSize: '1.1rem' // Plus compact
                                }}>
                                    {formatValue(kpi.value, kpi.format)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
}