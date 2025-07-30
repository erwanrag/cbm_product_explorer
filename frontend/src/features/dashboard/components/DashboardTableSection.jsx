// frontend/src/features/dashboard/components/DashboardTableSection.jsx
import React, { useMemo } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    TableSortLabel
} from '@mui/material';
import { Visibility, Edit, TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getMargeColor } from '@/lib/colors';

export default function DashboardTableSection({
    data,
    loading,
    onRefresh,
    onProductSelect,
    selectedProduct
}) {
    if (!data?.details || data.details.length === 0) return null;

    // Tri par qualité puis CA décroissant
    const sortedProducts = useMemo(() => {
        const qualiteOrder = { 'OE': 1, 'OEM': 2, 'PMQ': 3, 'PMV': 4 };

        return [...data.details].sort((a, b) => {
            const qualiteA = qualiteOrder[a.qualite] || 999;
            const qualiteB = qualiteOrder[b.qualite] || 999;

            if (qualiteA !== qualiteB) {
                return qualiteA - qualiteB;
            }

            return (b.ca_total || 0) - (a.ca_total || 0);
        });
    }, [data.details]);

    const getMarginChipColor = (margin) => {
        if (margin > 20) return 'success';
        if (margin > 10) return 'warning';
        return 'error';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Paper sx={{ mt: 4, width: '100%' }}>
                <Box sx={{
                    p: 3,
                    borderBottom: 1,
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        📋 Détail des Produits ({sortedProducts.length})
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        Triés par qualité (OE → OEM → PMQ/PMV) puis CA décroissant • Cliquez sur une ligne pour ouvrir le détail
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: '70vh', width: '100%' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Réf. Interne</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa', minWidth: 300 }}>Désignation</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Qualité</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="right">
                                    <TableSortLabel active direction="desc">CA (12m)</TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="right">Marge %</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="right">Stock</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="right">PMP €</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="right">Prix Achat €</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }}>Famille</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: '#f8f9fa' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedProducts.map((product, index) => {
                                const caTotal = product.ca_total || 0;
                                const margin = product.marge_percent_total || 0;
                                const isSelected = selectedProduct?.cod_pro === product.cod_pro;
                                const qualiteColor = getQualiteColor(product.qualite);

                                return (
                                    <TableRow
                                        key={product.cod_pro || index}
                                        hover
                                        onClick={() => {
                                            console.log('🎯 Clic produit:', product);
                                            onProductSelect(product);
                                        }}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                                            '&:hover': {
                                                bgcolor: isSelected ? 'rgba(25, 118, 210, 0.16)' : 'rgba(25, 118, 210, 0.04)',
                                                transform: 'scale(1.01)',
                                                transition: 'all 0.2s ease',
                                            },
                                            borderLeft: `4px solid ${isSelected ? '#1976d2' : qualiteColor}`,
                                            borderLeftWidth: isSelected ? '6px' : '4px',
                                        }}
                                    >
                                        <TableCell sx={{
                                            fontFamily: 'monospace',
                                            fontWeight: isSelected ? 800 : 700,
                                            fontSize: '0.9rem'
                                        }}>
                                            {product.refint}
                                        </TableCell>

                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography variant="body2" sx={{
                                                fontWeight: isSelected ? 700 : 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {product.designation}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Réf CRN: {product.ref_crn || 'N/A'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.qualite || 'N/A'}
                                                size="small"
                                                sx={{
                                                    bgcolor: isSelected ? '#1976d2' : `${qualiteColor}33`,
                                                    color: isSelected ? 'white' : qualiteColor,
                                                    fontWeight: 700,
                                                    border: `1px solid ${qualiteColor}`,
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={product.statut_clean || 'RAS'}
                                                size="small"
                                                color={product.statut === 0 ? 'success' : 'error'}
                                            />
                                        </TableCell>

                                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                {caTotal > 10000 && <TrendingUp color="success" fontSize="small" />}
                                                {caTotal < 1000 && <TrendingDown color="error" fontSize="small" />}
                                                <Typography variant="body2" sx={{
                                                    fontWeight: isSelected ? 800 : 700
                                                }}>
                                                    {formatCurrency(caTotal)}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Box sx={{
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1,
                                                bgcolor: getMargeColor(margin),
                                                color: 'white',
                                                fontWeight: 700,
                                                minWidth: 60,
                                                textAlign: 'center'
                                            }}>
                                                {margin.toFixed(1)}%
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            {(product.stock_total || 0).toLocaleString('fr-FR')}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatCurrency(product.pmp || 0)}
                                        </TableCell>

                                        <TableCell align="right">
                                            {formatCurrency(product.px_achat_eur)}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {product.famille || 'N/A'} / {product.s_famille || 'N/A'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('🔍 Clic loupe:', product);
                                                        onProductSelect(product);
                                                    }}
                                                    sx={{
                                                        '&:hover': {
                                                            transform: 'scale(1.2)',
                                                            bgcolor: 'rgba(25, 118, 210, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    sx={{
                                                        '&:hover': {
                                                            transform: 'scale(1.2)',
                                                            bgcolor: 'rgba(156, 39, 176, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </motion.div>
    );
}