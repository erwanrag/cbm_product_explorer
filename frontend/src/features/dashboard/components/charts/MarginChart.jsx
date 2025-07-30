import React from 'react';
import EnterpriseChart from '@/shared/components/ui/Charts/EnterpriseChart';

/**
 * Graphique de Marge Totale (€ et %)
 */
export default function MarginChart({ data, loading }) {
    if (!data || loading) {
        return (
            <EnterpriseChart
                data={[]}
                loading={loading}
                title="Marge Globale"
                subtitle="Chargement en cours..."
                height={400}
            />
        );
    }

    const chartData = [
        {
            x: data.periods,
            y: data.margin,
            type: 'bar',
            name: 'Marge (€)',
            marker: {
                color: '#2e7d32',
            },
            yaxis: 'y',
        },
        {
            x: data.periods,
            y: data.margin_percent,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Marge (%)',
            line: {
                color: '#9C27B0',
                dash: 'dot',
                width: 3,
            },
            yaxis: 'y2',
        },
    ];

    const layout = {
        yaxis: { title: 'Marge (€)' },
        yaxis2: {
            title: 'Marge (%)',
            overlaying: 'y',
            side: 'right',
            tickformat: ',.0%',
        },
    };

    return (
        <EnterpriseChart
            data={chartData}
            layout={layout}
            title="Marge Globale"
            subtitle="12 mois glissants"
            xAxisTitle="Période"
            height={400}
        />
    );
}
