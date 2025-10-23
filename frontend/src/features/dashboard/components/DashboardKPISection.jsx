import React from 'react';
import { Box, Grid } from '@mui/material';
import { AttachMoney, Inventory, TrendingUp, Assessment } from '@mui/icons-material';
import { KPICard } from '@/shared/components';
import { useTranslation } from '@/store/contexts/LanguageContext';
import { formatCurrency, formatNumber } from '@/lib/formatUtils';

export default function DashboardKPISection({ kpis, loading }) {
  const { t } = useTranslation();

  const kpiConfig = [
    {
      title: t('dashboard.kpis.total_products', 'Produits'),
      value: formatNumber(kpis?.totalProducts || 0),
      icon: <Assessment />,
      color: '#1976d2',
      delay: 0
    },
    {
      title: t('dashboard.kpis.total_revenue', 'CA Total'),
      value: formatCurrency(kpis?.totalRevenue || 0, 'EUR', true),
      icon: <AttachMoney />,
      color: '#2e7d32',
      delay: 0.1
    },
    {
      title: t('dashboard.kpis.avg_margin', 'Marge Moy.'),
      value: `${(kpis?.averageMargin || 0).toFixed(1)}%`,
      icon: <TrendingUp />,
      color: '#ed6c02',
      delay: 0.2
    },
    {
      title: t('dashboard.kpis.total_quantity', 'Quantité'),
      value: formatNumber(kpis?.totalQuantity || 0),
      icon: <Inventory />,
      color: '#0288d1',
      delay: 0.3
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {kpiConfig.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}