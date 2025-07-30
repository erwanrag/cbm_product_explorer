// frontend/src/features/dashboard/components/DashboardKPISection.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { Inventory, Euro, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor } from '@/lib/colors';

export default function DashboardKPISection({ data, loading, selectedProduct }) {
    if (!data?.kpis) return null;

    // ✅ SEULEMENT 3 KPIs utiles
    const kpis = [
        {
            title: 'Produits Actifs',
            value: data.kpis.totalProducts,
            format: 'number',
            icon: <Inventory />,
            color: '#1976d2',
            bgColor: '#e3f2fd',
        },
        {
            title: 'CA Total (12m)',
            value: data.kpis.totalRevenue,
            format: 'currency',
            icon: <Euro />,
            color: '#2e7d32',
            bgColor: '#e8f5e8',
        },
        {
            title: 'Marge Moyenne',
            value: data.kpis.averageMargin,
            format: 'percentage',
            icon: <TrendingUp />,
            color: data.kpis.averageMargin > 15 ? '#2e7d32' : '#f57c00',
            bgColor: data.kpis.averageMargin > 15 ? '#e8f5e8' : '#fff3e0',
        },
    ];

    const formatValue = (value, format) => {
        if (format === 'currency') {
            return formatCurrency(value);
        }
        if (format === 'percentage') {
            return `${(value || 0).toFixed(1)}%`;
        }
        return (value || 0).toLocaleString('fr-FR');
    };

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={4} key={kpi.title}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card sx={{
                            height: '140px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: `linear-gradient(135deg, ${kpi.bgColor} 0%, ${kpi.bgColor}aa 100%)`,
                            border: selectedProduct ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: 6,
                            }
                        }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Avatar sx={{
                                        bgcolor: kpi.color,
                                        color: 'white',
                                        width: 56,
                                        height: 56,
                                    }}>
                                        {kpi.icon}
                                    </Avatar>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h4" sx={{
                                            fontWeight: 800,
                                            color: kpi.color,
                                            lineHeight: 1,
                                        }}>
                                            {formatValue(kpi.value, kpi.format)}
                                        </Typography>
                                        <Typography variant="body1" sx={{
                                            color: kpi.color,
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}>
                                            {kpi.title}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
}
