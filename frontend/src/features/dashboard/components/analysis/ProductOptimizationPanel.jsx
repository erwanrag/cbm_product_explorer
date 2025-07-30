import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { formatPrix, formatPercentage } from '@/lib/formatUtils';

export default function ProductOptimizationPanel({ product }) {
    if (!product) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Recommandations & Optimisation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2">
                <strong>Score performance :</strong> {product.performance_score || 0} / 100
            </Typography>
            <Typography variant="body2">
                <strong>Action recommandée :</strong>{' '}
                {product.marge_percent_total < 10
                    ? 'Revoir positionnement prix'
                    : product.stock_total < 5
                        ? 'Surveiller stock'
                        : 'RAS'}
            </Typography>
        </Box>
    );
}
