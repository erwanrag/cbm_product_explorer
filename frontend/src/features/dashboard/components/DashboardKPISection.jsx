// frontend/src/features/dashboard/components/DashboardKPISection.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '@/lib/formatUtils.js';
import KPICard from '@/features/dashboard/ui/KPICard';

/**
 * Section KPI du dashboard - Composant focalisé
 * Responsabilité: Affichage des métriques clés
 */
export default function DashboardKPISection({ data, loading, onKpiClick }) {
  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" height={60} />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data?.kpis) return null;

  const kpis = [
    {
      id: 'products',
      title: 'Produits Actifs',
      value: data.kpis.totalProducts,
      format: 'number',
      icon: 'inventory',
      color: 'primary',
    },
    {
      id: 'revenue',
      title: 'CA Total (12 mois)',
      value: data.kpis.totalRevenue,
      format: 'currency',
      icon: 'euro',
      color: 'success',
    },
    {
      id: 'margin',
      title: 'Marge Moyenne',
      value: data.kpis.averageMargin,
      format: 'percentage',
      icon: 'trending_up',
      color: data.kpis.averageMargin > 15 ? 'success' : 'warning',
    },
    {
      id: 'quantity',
      title: 'Quantité Vendue',
      value: data.kpis.totalQuantity,
      format: 'number',
      icon: 'inventory_2',
      color: 'info',
    },
    {
      id: 'stockValue',
      title: 'Stock Valorisé',
      value: data.kpis.totalStockValue,
      format: 'currency',
      icon: 'account_balance_wallet',
      color: 'secondary',
    },
    {
      id: 'lowStock',
      title: 'Alertes Stock',
      value: data.kpis.lowStockItems,
      format: 'number',
      icon: 'warning',
      color: data.kpis.lowStockItems > 0 ? 'error' : 'success',
      clickable: true,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <KPICard {...kpi} onClick={kpi.clickable ? () => onKpiClick?.(kpi.id) : undefined} />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
