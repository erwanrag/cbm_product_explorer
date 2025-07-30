import React from 'react';
import EnterpriseChart from '@/shared/components/ui/Charts/EnterpriseChart';

/**
 * Graphique de Chiffre d'Affaires
 */
export default function RevenueChart({ data, loading }) {
    if (!data || loading) {
        return (
            <EnterpriseChart
                data={[]}
                loading={loading}
                title="Chiffre d'Affaires"
                subtitle="Chargement en cours..."
                height={400}
            />
        );
    }

    const chartData = [
        {
            x: data.periods,
            y: data.revenue,
            type: 'bar',
            name: "Chiffre d'Affaires (€)",
            marker: {
                color: '#1976d2',
            },
        },
    ];

    return (
        <EnterpriseChart
            data={chartData}
            title="Chiffre d'Affaires"
            subtitle="12 derniers mois"
            xAxisTitle="Période"
            yAxisTitle="Montant (€)"
            height={400}
        />
    );
}
