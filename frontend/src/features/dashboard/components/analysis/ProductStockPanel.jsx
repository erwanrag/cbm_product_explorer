import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { formatPrix } from '@/lib/formatUtils';

export default function ProductStockPanel({ product }) {
    if (!product) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Stock et valorisation
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2">
                <strong>Stock total :</strong> {product.stock_total || 0}
            </Typography>
            <Typography variant="body2">
                <strong>Stock valorisé :</strong> {formatPrix(product.stock_value)}
            </Typography>
            <Typography variant="body2">
                <strong>Prix achat (PMP) :</strong> {formatPrix(product.px_achat_eur)}
            </Typography>
        </Box>
    );
}
