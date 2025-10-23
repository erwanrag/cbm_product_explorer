import React from 'react';
import { Box, Grid } from '@mui/material';
import { TrendingUp, ShowChart, AccountBalance, Speed } from '@mui/icons-material';
import { KPICard } from '@/shared/components';
import { useTranslation } from '@/store/contexts/LanguageContext';

export default function OptimizationKPISection({ data, loading }) {
  const { t } = useTranslation();

  const kpiConfig = [
    {
      title: t('optimization.kpis.total_groups', 'Groupes Totaux'),
      value: data?.summary?.totalGroups || 0,
      icon: <ShowChart />, // ✅ Rendu JSX
      color: '#1976d2',
      format: 'number',
      delay: 0
    },
    {
      title: t('optimization.kpis.total_gain', 'Gain Potentiel'),
      value: data?.summary?.totalGainImmediat || 0,
      icon: <TrendingUp />, // ✅ Rendu JSX
      color: '#2e7d32',
      format: 'currency',
      delay: 0.1
    },
    {
      title: t('optimization.kpis.gain_6m', 'Gain 6M'),
      value: data?.summary?.totalGain6m || 0,
      icon: <AccountBalance />, // ✅ Rendu JSX
      color: '#0288d1',
      format: 'currency',
      delay: 0.2
    },
    {
      title: t('optimization.kpis.avg_growth', 'Croissance Moy.'),
      value: data?.summary?.avgTauxCroissance || 0,
      icon: <Speed />, // ✅ Rendu JSX
      color: '#ed6c02',
      format: 'percentage',
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