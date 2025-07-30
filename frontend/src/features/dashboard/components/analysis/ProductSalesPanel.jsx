import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { formatPrix, formatPercentage } from '@/lib/formatUtils';

export default function ProductSalesPanel({ product }) {
    if (!product) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Données de vente
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2">
                <strong>CA total :</strong> {formatPrix(product.ca_total)}
            </Typography>
            <Typography variant="body2">
                <strong>Quantité totale :</strong> {product.quantite_total || 0}
            </Typography>
            <Typography variant="body2">
                <strong>Marge moyenne :</strong> {formatPercentage(product.marge_percent_total)}
            </Typography>
        </Box>
    );
}
