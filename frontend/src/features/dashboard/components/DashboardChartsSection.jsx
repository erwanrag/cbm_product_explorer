// frontend/src/features/dashboard/components/DashboardChartsSection.jsx
import React from 'react';
import { Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';
import EnterpriseChart from '@/shared/components/ui/Charts/EnterpriseChart';
import RevenueChart from '@/features/dashboard/components/charts/RevenueChart';
import MarginChart from '@/features/dashboard/components/charts/MarginChart';
import DistributionChart from '@/features/dashboard/components/charts/DistributionChart';
import TrendChart from '@/features/dashboard/components/charts/TrendChart';

/**
 * Section graphiques du dashboard - Composant focalisé
 * Responsabilité: Orchestration des différents graphiques
 */
export default function DashboardChartsSection({ data, loading, viewMode }) {
  if (!data?.chartData && !loading) return null;

  const renderChartsByViewMode = () => {
    switch (viewMode) {
      case 'revenue-focus':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RevenueChart data={data.chartData} loading={loading} />
            </Grid>
          </Grid>
        );

      case 'margin-analysis':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <MarginChart data={data.chartData} loading={loading} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DistributionChart
                data={data.details}
                field="marge_percent_total"
                title="Répartition des Marges"
                loading={loading}
              />
            </Grid>
          </Grid>
        );

      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <TrendChart data={data.chartData} loading={loading} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <DistributionChart
                data={data.details}
                field="qualite"
                title="Répartition par Qualité"
                loading={loading}
              />
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Box sx={{ mb: 3 }}>{renderChartsByViewMode()}</Box>
    </motion.div>
  );
}
