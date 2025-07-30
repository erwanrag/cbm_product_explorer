// frontend/src/features/dashboard/components/charts/DistributionChart.jsx
import React, { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import EnterpriseChart from '@/shared/components/ui/Charts/EnterpriseChart';

/**
 * Graphique de distribution (camembert) - Composant spécialisé
 */
export default function DistributionChart({ data, field, title, loading }) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!data || !data.length) return [];

    // Regroupement par valeur du champ
    const distribution = data.reduce((acc, item) => {
      const key = item[field] || 'Non défini';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(distribution);
    const values = Object.values(distribution);

    // Couleurs dynamiques
    const colors = labels.map((_, index) => {
      const colorPalette = [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main,
        theme.palette.secondary.main,
      ];
      return colorPalette[index % colorPalette.length];
    });

    return [
      {
        type: 'pie',
        labels,
        values,
        textinfo: 'label+percent',
        textposition: 'outside',
        hole: 0.4,
        marker: { colors },
        hovertemplate:
          '<b>%{label}</b><br>' +
          'Nombre: %{value}<br>' +
          'Pourcentage: %{percent}<br>' +
          '<extra></extra>',
      },
    ];
  }, [data, field, theme]);

  return (
    <EnterpriseChart
      data={chartData}
      title={title}
      subtitle={`Répartition de ${data?.length || 0} éléments`}
      height={350}
      loading={loading}
      layout={{
        showlegend: true,
        legend: {
          orientation: 'v',
          x: 1.02,
          y: 0.5,
        },
      }}
    />
  );
}
