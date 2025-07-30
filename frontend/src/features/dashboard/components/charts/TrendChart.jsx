// frontend/src/features/dashboard/components/charts/TrendChart.jsx
import React from 'react';
import { useTheme } from '@mui/material/styles';
import EnterpriseChart from '@/components/ui/Charts/EnterpriseChart';

/**
 * Graphique de tendance CA/Marge - Composant spécialisé
 */
export default function TrendChart({ data, loading }) {
  const theme = useTheme();

  if (!data || loading) {
    return (
      <EnterpriseChart
        data={[]}
        loading={loading}
        title="Évolution CA et Marge"
        subtitle="Tendances sur 12 mois"
        height={400}
      />
    );
  }

  const chartData = [
    {
      x: data.periods,
      y: data.revenue,
      type: 'scatter',
      mode: 'lines+markers',
      name: "Chiffre d'Affaires (€)",
      line: {
        color: theme.palette.primary.main,
        width: 3,
      },
      marker: {
        size: 8,
        color: theme.palette.primary.main,
      },
      yaxis: 'y',
    },
    {
      x: data.periods,
      y: data.margin,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Marge (€)',
      line: {
        color: theme.palette.success.main,
        width: 3,
        dash: 'dot',
      },
      marker: {
        size: 8,
        color: theme.palette.success.main,
      },
      yaxis: 'y2',
    },
  ];

  const layout = {
    yaxis: {
      title: "Chiffre d'Affaires (€)",
      side: 'left',
    },
    yaxis2: {
      title: 'Marge (€)',
      overlaying: 'y',
      side: 'right',
    },
    legend: {
      orientation: 'h',
      x: 0.5,
      y: -0.15,
      xanchor: 'center',
    },
  };

  return (
    <EnterpriseChart
      data={chartData}
      layout={layout}
      title="Évolution CA et Marge"
      subtitle="Tendances sur 12 mois glissants"
      xAxisTitle="Période"
      height={400}
    />
  );
}
