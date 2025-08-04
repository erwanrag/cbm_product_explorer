// 📁 frontend/src/features/optimization/components/indicators/ProjectionQualityIndicator.jsx
import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';

const getQualityLabel = (score) => {
    if (score >= 0.7) return { label: 'Haute', color: 'success' };
    if (score >= 0.4) return { label: 'Moyenne', color: 'warning' };
    return { label: 'Faible', color: 'error' };
};

const ProjectionQualityIndicator = ({ score, method, lowerBounds = [], upperBounds = [], variant = 'chip' }) => {
    if (score === undefined || score === null) return null;

    const { label, color } = getQualityLabel(score);

    const minBound = Math.min(...lowerBounds);
    const maxBound = Math.max(...upperBounds);
    const confidenceRange = Math.round(maxBound - minBound);

    const tooltipText = `Méthode: ${method || 'N/A'}\nFiabilité: ${label} (${(score * 100).toFixed(0)}%)\nÉcart borne: ${confidenceRange}`;

    if (variant === 'chip') {
        return (
            <Tooltip title={<Typography variant="body2" whiteSpace="pre-line">{tooltipText}</Typography>} arrow>
                <Chip
                    size="small"
                    label={label}
                    color={color}
                    variant="outlined"
                />
            </Tooltip>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: `${color}.50`, borderRadius: 2, border: `1px solid`, borderColor: `${color}.300` }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Méthode : {method}</Typography>
            <Typography variant="body2">Score : {(score * 100).toFixed(0)}% ({label})</Typography>
            <Typography variant="body2">Écart bornes : {confidenceRange}</Typography>
        </Box>
    );
};

export default ProjectionQualityIndicator;
