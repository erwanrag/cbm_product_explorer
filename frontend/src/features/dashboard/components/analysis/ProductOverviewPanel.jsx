import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export default function ProductOverviewPanel({ product }) {
    if (!product) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Aperçu général
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2">
                <strong>Code produit :</strong> {product.cod_pro}
            </Typography>
            <Typography variant="body2">
                <strong>Référence interne :</strong> {product.refint}
            </Typography>
            <Typography variant="body2">
                <strong>Référence externe :</strong> {product.ref_ext}
            </Typography>
            <Typography variant="body2">
                <strong>Fournisseur :</strong> {product.nom_fou || 'N/A'}
            </Typography>
            <Typography variant="body2">
                <strong>Qualité :</strong> {product.qualite || 'N/A'}
            </Typography>
        </Box>
    );
}
