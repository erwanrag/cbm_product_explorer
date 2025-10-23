import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useTranslation } from '@/store/contexts/LanguageContext';

export const PlotlyChart = ({
    type = 'bar',
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
                <Typography color="error">
                    {t('common.error', 'Erreur')}
                </Typography>
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                    {t('common.no_data', 'Aucune donnée')}
                </Typography>
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

export default PlotlyChart;