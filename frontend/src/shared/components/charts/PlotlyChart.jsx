// ===================================
// 📁 shared/components/charts/PlotlyChart.jsx
// Wrapper Plotly mutualisé avec configs prédéfinies
// ===================================

import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '@mui/material';
import { useTranslation } from '@/store/contexts/LanguageContext';

export const PlotlyChart = ({
    type = 'bar', // 'bar', 'line', 'pie', 'scatter', 'heatmap'
    data,
    title,
    height = 400,
    showLegend = true,
    loading = false,
    error = false,
    customLayout = {},
    customConfig = {},
    responsive = true
}) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const defaultLayout = useMemo(() => ({
        title: {
            text: title,
            font: {
                family: theme.typography.fontFamily,
                size: 16,
                color: theme.palette.text.primary
            }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: showLegend,
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.2,
            xanchor: 'center',
            x: 0.5
        },
        margin: { t: 40, r: 20, b: 60, l: 60 },
        xaxis: {
            gridcolor: theme.palette.divider,
            zerolinecolor: theme.palette.divider
        },
        yaxis: {
            gridcolor: theme.palette.divider,
            zerolinecolor: theme.palette.divider
        },
        colorway: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main
        ],
        ...customLayout
    }), [theme, title, showLegend, customLayout]);

    const defaultConfig = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        toImageButtonOptions: {
            format: 'png',
            filename: title || 'chart',
            height: 600,
            width: 800,
            scale: 2
        },
        ...customConfig
    };

    if (loading) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="error">{t('charts.error')}</Typography>
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">{t('charts.noData')}</Typography>
            </Box>
        );
    }

    return (
        <Plot
            data={data}
            layout={defaultLayout}
            config={defaultConfig}
            style={{ width: '100%', height }}
            useResizeHandler={responsive}
        />
    );
};
