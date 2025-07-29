// frontend/src/components/ui/Charts/EnterpriseChart.jsx
import React, { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Box, Paper, Typography, Skeleton, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Composant graphique enterprise avec configurations avancées
 */
const EnterpriseChart = memo(({
    data = [],
    type = 'line',
    title,
    subtitle,
    xAxisTitle,
    yAxisTitle,
    height = 400,
    loading = false,
    error = null,
    config = {},
    layout = {},
    style = {},
    onPlotlyClick,
    onPlotlyHover,
    ...props
}) => {
    const theme = useTheme();

    // Configuration par défaut enterprise
    const defaultConfig = useMemo(() => ({
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false,
        toImageButtonOptions: {
            format: 'png',
            filename: `chart-${Date.now()}`,
            height: 800,
            width: 1200,
            scale: 2
        },
        locale: 'fr',
        responsive: true,
        ...config
    }), [config]);

    // Layout par défaut enterprise
    const defaultLayout = useMemo(() => ({
        font: {
            family: theme.typography.fontFamily,
            size: 12,
            color: theme.palette.text.primary
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 60, r: 40, t: 60, b: 60 },
        height,

        xaxis: {
            title: { text: xAxisTitle, font: { size: 14, color: theme.palette.text.secondary } },
            gridcolor: theme.palette.divider,
            linecolor: theme.palette.divider,
            tickfont: { color: theme.palette.text.secondary }
        },

        yaxis: {
            title: { text: yAxisTitle, font: { size: 14, color: theme.palette.text.secondary } },
            gridcolor: theme.palette.divider,
            linecolor: theme.palette.divider,
            tickfont: { color: theme.palette.text.secondary }
        },

        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.2,
            xanchor: 'center',
            x: 0.5,
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: theme.palette.divider,
            borderwidth: 1
        },

        hovermode: 'closest',
        showlegend: data.length > 1,

        ...layout
    }), [theme, height, xAxisTitle, yAxisTitle, layout, data.length]);

    if (loading) {
        return (
            <Paper sx={{ p: 2, height: height + 100 }}>
                <Skeleton variant="text" width="30%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={height} />
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2, height: height + 100 }}>
                <Alert severity="error" sx={{ height: '100%', alignItems: 'center' }}>
                    {error.message || 'Erreur lors du chargement du graphique'}
                </Alert>
            </Paper>
        );
    }

    if (!data.length) {
        return (
            <Paper sx={{ p: 2, height: height + 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                    Aucune donnée à afficher
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            {(title || subtitle) && (
                <Box sx={{ mb: 2 }}>
                    {title && (
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            )}

            <Plot
                data={data}
                layout={defaultLayout}
                config={defaultConfig}
                style={{ width: '100%', ...style }}
                onClick={onPlotlyClick}
                onHover={onPlotlyHover}
                {...props}
            />
        </Paper>
    );
});

EnterpriseChart.displayName = 'EnterpriseChart';

export default EnterpriseChart;
