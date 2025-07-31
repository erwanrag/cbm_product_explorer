// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardTableSection.jsx - AMÉLIORÉ
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    TableSortLabel,
    Tooltip,
    IconButton,
    Menu,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Divider
} from '@mui/material';
import { ViewColumn, Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getMargeColor, getStatutColor, getStatutLabel } from '@/constants/colors';

export default function DashboardTableSection({ data, onProductSelect }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [orderBy, setOrderBy] = useState('qualite_ca'); // ✅ Tri par défaut : qualité + CA
    const [order, setOrder] = useState('desc');

    // ✅ GESTION DES COLONNES MASQUABLES
    const [anchorEl, setAnchorEl] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        cod_pro: true,
        refint: true,
        ref_ext: true,
        nom_pro: true,
        qualite: true,
        statut: true,
        nom_fou: true,
        ca_total: true,
        marge_percent_total: true,
        stock_total: true,
    });

    if (!data?.details || data.details.length === 0) return null;

    // ✅ TRI PERSONNALISÉ qualité + CA
    const sortedData = useMemo(() => {
        return [...data.details].sort((a, b) => {
            if (orderBy === 'qualite_ca') {
                // Tri par qualité d'abord, puis par CA descendant
                const qualiteOrder = ['OE', 'OEM', 'PMQ', 'PMV'];
                const aQualiteIndex = qualiteOrder.indexOf(a.qualite) !== -1 ? qualiteOrder.indexOf(a.qualite) : 999;
                const bQualiteIndex = qualiteOrder.indexOf(b.qualite) !== -1 ? qualiteOrder.indexOf(b.qualite) : 999;

                if (aQualiteIndex !== bQualiteIndex) {
                    return aQualiteIndex - bQualiteIndex;
                }
                // Si même qualité, trier par CA descendant
                return (b.ca_total || 0) - (a.ca_total || 0);
            }

            // Tri normal pour les autres colonnes
            let aVal = a[orderBy] || 0;
            let bVal = b[orderBy] || 0;

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }, [data.details, orderBy, order]);

    // Données paginées
    const paginatedData = sortedData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ✅ GESTION DES COLONNES
    const handleColumnMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColumnMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleColumn = (columnId) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    // ✅ DÉFINITION DES COLONNES avec visibilité
    const allColumns = [
        { id: 'cod_pro', label: 'Code', sortable: true, width: 80, align: 'left' },
        { id: 'refint', label: 'Ref Int', sortable: true, width: 120, align: 'left' },
        { id: 'ref_ext', label: 'Ref Ext', sortable: true, width: 110, align: 'left' },
        { id: 'nom_pro', label: 'Nom Produit', sortable: true, width: 180, align: 'left' },
        { id: 'qualite', label: 'Qualité', sortable: true, width: 80, align: 'center' },
        { id: 'statut', label: 'Statut', sortable: true, width: 80, align: 'center' },
        { id: 'nom_fou', label: 'Fournisseur', sortable: true, width: 150, align: 'left' },
        { id: 'ca_total', label: 'CA Total', sortable: true, width: 100, align: 'right' },
        { id: 'marge_percent_total', label: 'Marge %', sortable: true, width: 80, align: 'right' },
        { id: 'stock_total', label: 'Stock', sortable: true, width: 80, align: 'right' },
    ];

    // Colonnes visibles seulement
    const visibleColumnsArray = allColumns.filter(col => visibleColumns[col.id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Paper elevation={2} sx={{ mt: 2 }}>
                {/* ✅ HEADER AVEC BOUTON COLONNES */}
                <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        Produits ({data.details.length})
                        {orderBy === 'qualite_ca' && (
                            <Chip
                                label="Tri: Qualité + CA"
                                size="small"
                                sx={{ ml: 1, bgcolor: '#e3f2fd', fontSize: '0.7rem' }}
                            />
                        )}
                    </Typography>

                    <IconButton
                        onClick={handleColumnMenuOpen}
                        size="small"
                        sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                    >
                        <ViewColumn fontSize="small" />
                    </IconButton>

                    {/* Menu des colonnes */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleColumnMenuClose}
                        PaperProps={{ sx: { minWidth: 200 } }}
                    >
                        <MenuItem disabled>
                            <Settings fontSize="small" sx={{ mr: 1 }} />
                            Colonnes visibles
                        </MenuItem>
                        <Divider />
                        {allColumns.map((column) => (
                            <MenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={visibleColumns[column.id]}
                                            size="small"
                                        />
                                    }
                                    label={column.label}
                                    sx={{ m: 0, fontSize: '0.875rem' }}
                                />
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                {visibleColumnsArray.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            width: column.width,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            backgroundColor: '#f5f5f5'
                                        }}
                                        sortDirection={orderBy === column.id ? order : false}
                                    >
                                        {column.sortable ? (
                                            <TableSortLabel
                                                active={orderBy === column.id || (column.id === 'qualite' && orderBy === 'qualite_ca')}
                                                direction={orderBy === column.id ? order : 'asc'}
                                                onClick={() => handleRequestSort(column.id === 'qualite' ? 'qualite_ca' : column.id)}
                                                sx={{ fontSize: '0.875rem' }}
                                            >
                                                {column.label}
                                                {column.id === 'qualite' && orderBy === 'qualite_ca' && (
                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                                        +CA
                                                    </Typography>
                                                )}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.map((product, index) => (
                                <TableRow
                                    key={product.cod_pro}
                                    hover
                                    onClick={() => onProductSelect?.(product)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: '#f8f9fa' },
                                        height: 48
                                    }}
                                >
                                    {/* Code Produit */}
                                    {visibleColumns.cod_pro && (
                                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                            {product.cod_pro}
                                        </TableCell>
                                    )}

                                    {/* Référence Interne */}
                                    {visibleColumns.refint && (
                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                            <Tooltip title={product.refint || '-'}>
                                                <span>
                                                    {(product.refint || '-').substring(0, 15)}
                                                    {(product.refint || '').length > 15 ? '...' : ''}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    )}

                                    {/* Référence Externe */}
                                    {visibleColumns.ref_ext && (
                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                            {product.ref_ext ? (
                                                <Tooltip title={product.ref_ext}>
                                                    <Chip
                                                        label={(product.ref_ext).substring(0, 10)}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            bgcolor: '#e3f2fd',
                                                            color: '#1565c0',
                                                        }}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}

                                    {/* Nom Produit */}
                                    {visibleColumns.nom_pro && (
                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                            <Tooltip title={product.nom_pro || 'Nom non défini'}>
                                                <span>
                                                    {product.nom_pro ?
                                                        (product.nom_pro.substring(0, 25) + (product.nom_pro.length > 25 ? '...' : ''))
                                                        :
                                                        <Typography variant="caption" color="text.secondary">
                                                            Non défini
                                                        </Typography>
                                                    }
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    )}

                                    {/* Qualité */}
                                    {visibleColumns.qualite && (
                                        <TableCell align="center">
                                            <Chip
                                                label={product.qualite || 'N/A'}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    bgcolor: getQualiteColor(product.qualite),
                                                    color: 'white',
                                                    minWidth: 45,
                                                }}
                                            />
                                        </TableCell>
                                    )}

                                    {/* Statut */}
                                    {visibleColumns.statut && (
                                        <TableCell align="center">
                                            <Tooltip title={getStatutLabel(product.statut)}>
                                                <Chip
                                                    label={product.statut !== null ? product.statut : 'N/A'}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        bgcolor: getStatutColor(product.statut),
                                                        color: 'white',
                                                        minWidth: 35,
                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>
                                    )}

                                    {/* Fournisseur */}
                                    {visibleColumns.nom_fou && (
                                        <TableCell sx={{ fontSize: '0.8rem' }}>
                                            <Tooltip title={product.nom_fou || '-'}>
                                                <span>
                                                    {(product.nom_fou || '-').substring(0, 20)}
                                                    {(product.nom_fou || '').length > 20 ? '...' : ''}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    )}

                                    {/* CA Total */}
                                    {visibleColumns.ca_total && (
                                        <TableCell align="right">
                                            <Box sx={{
                                                fontWeight: (product.ca_total || 0) > 50000 ? 700 : 500,
                                                fontSize: '0.8rem',
                                                color: (product.ca_total || 0) > 50000 ? '#2e7d32' : 'inherit'
                                            }}>
                                                {formatCurrency(product.ca_total || 0, 'EUR', true)}
                                            </Box>
                                        </TableCell>
                                    )}

                                    {/* Marge % */}
                                    {visibleColumns.marge_percent_total && (
                                        <TableCell align="right">
                                            <Chip
                                                label={`${(product.marge_percent_total || 0).toFixed(1)}%`}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    bgcolor: getMargeColor(product.marge_percent_total || 0),
                                                    color: 'white',
                                                    minWidth: 50,
                                                }}
                                            />
                                        </TableCell>
                                    )}

                                    {/* Stock */}
                                    {visibleColumns.stock_total && (
                                        <TableCell align="right" sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: (product.stock_total || 0) <= 10 ? '#d32f2f' : 'inherit'
                                        }}>
                                            {(product.stock_total || 0).toLocaleString('fr-FR')}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={sortedData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} sur ${count}`
                    }
                    sx={{
                        borderTop: '1px solid #e0e0e0',
                        '& .MuiTablePagination-toolbar': {
                            minHeight: 48,
                            fontSize: '0.875rem'
                        }
                    }}
                />
            </Paper>
        </motion.div>
    );
}