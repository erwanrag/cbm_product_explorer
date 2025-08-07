// ===================================
// 📁 frontend/src/shared/components/sections/KPISection.jsx - VERSION COMPLÈTE
// ===================================

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatUtils';

/**
 * Carte KPI individuelle générique
 */
const KPICard = ({
    title,
    value,
    subtitle,
    icon,
    color = 'primary',
    bgColor,
    trend,
    format = 'auto',
    isLoading = false,
    width = 2.4 // Largeur Grid par défaut
}) => {
    // Formatage automatique de la valeur
    const formatValue = (val, format) => {
        if (val === null || val === undefined) return '-';

        switch (format) {
            case 'currency':
                return formatCurrency(val);
            case 'percentage':
                return formatPercentage(val);
            case 'number':
                return formatNumber(val);
            default:
                // Auto-détection du format
                if (typeof val === 'number') {
                    if (val > 1000) return formatCurrency(val);
                    if (val < 1 && val > 0) return formatPercentage(val * 100);
                    return formatNumber(val);
                }
                return val;
        }
    };

    const formattedValue = formatValue(value, format);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                sx={{
                    height: '100%',
                    background: bgColor ? `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)` : 'white',
                    border: `1px solid ${color === 'primary' ? '#e3f2fd' : '#e8f5e8'}`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: `${color}.main`,
                                color: 'white',
                                mr: 2,
                                width: 48,
                                height: 48
                            }}
                        >
                            {icon}
                        </Avatar>

                        {trend !== undefined && (
                            <Chip
                                icon={trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                                label={formatPercentage(Math.abs(trend))}
                                color={trend >= 0 ? 'success' : 'error'}
                                variant="outlined"
                                size="small"
                            />
                        )}
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: `${color}.main`,
                            mb: 1,
                            minHeight: 48 // Éviter les sautillements
                        }}
                    >
                        {isLoading ? <Skeleton width="80%" /> : formattedValue}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {isLoading ? <Skeleton width="60%" /> : title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}
                        >
                            {isLoading ? <Skeleton width="40%" /> : subtitle}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

/**
 * Section KPI générique - Remplace tous les *KPISection existants
 * 
 * @param {string} title - Titre de la section
 * @param {Array} kpis - Liste des KPIs à afficher
 * @param {boolean} isLoading - État de chargement
 * @param {string} layout - Disposition ('grid'|'horizontal'|'vertical')
 * @param {Object} containerSx - Styles du conteneur
 */
export default function KPISection({
    title = "📊 Indicateurs Clés",
    kpis = [],
    isLoading = false,
    layout = 'grid',
    containerSx = {}
}) {
    if (!kpis || kpis.length === 0) return null;

    const renderKPIs = () => {
        switch (layout) {
            case 'horizontal':
                return (
                    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
                        {kpis.map((kpi, index) => (
                            <Box key={kpi.id || index} sx={{ minWidth: 280, flex: '0 0 auto' }}>
                                <KPICard {...kpi} isLoading={isLoading} />
                            </Box>
                        ))}
                    </Box>
                );

            case 'vertical':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {kpis.map((kpi, index) => (
                            <KPICard key={kpi.id || index} {...kpi} isLoading={isLoading} />
                        ))}
                    </Box>
                );

            default: // 'grid'
                return (
                    <Grid container spacing={3}>
                        {kpis.map((kpi, index) => (
                            <Grid item xs={12} sm={6} md={kpi.width || 2.4} key={kpi.id || index}>
                                <KPICard {...kpi} isLoading={isLoading} />
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
                    sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}
                >
                    {title}
                </Typography>
            )}

            {renderKPIs()}
        </Box>
    );
}