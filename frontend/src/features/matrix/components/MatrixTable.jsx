// ===================================
// 📁 frontend/src/features/matrix/components/MatrixTable.jsx
// Version corrigée compatible avec le nouveau DataTable
// ===================================

import React, { useMemo, useState } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Chip, Box,
    IconButton, Tooltip, Menu, MenuItem, FormControlLabel,
    Checkbox, Typography, TextField, InputAdornment
} from '@mui/material';
import { ViewColumn, Search } from '@mui/icons-material';
import { getQualiteColor, getStatutColor, getStatutLabel } from '@/lib/colors';

export default function MatrixTable({
    products = [],
    matches = [],
    columnRefs = [],
    columnVisibility = {},
    onColumnVisibilityChange
}) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [search, setSearch] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    // ✅ Colonnes de base
    const baseColumns = [
        { id: 'cod_pro', label: 'Code', width: 90, visible: columnVisibility.details !== false },
        { id: 'refint', label: 'Ref Interne', width: 120, visible: columnVisibility.details !== false },
        { id: 'nom_pro', label: 'Désignation', width: 200, visible: columnVisibility.designation !== false },
        { id: 'qualite', label: 'Qualité', width: 80, align: 'center', visible: columnVisibility.qualite !== false },
        { id: 'statut', label: 'Statut', width: 80, align: 'center', visible: columnVisibility.statut !== false },
        { id: 'famille', label: 'Famille', width: 120, visible: columnVisibility.famille !== false },
        { id: 'nom_fou', label: 'Fournisseur', width: 150, visible: columnVisibility.fournisseur !== false },
    ];

    // ✅ Filtrage par recherche
    const filteredProducts = useMemo(() => {
        if (!search) return products;

        return products.filter(product =>
            Object.values(product).some(value =>
                String(value).toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [products, search]);

    // ✅ Pagination
    const paginatedProducts = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredProducts.slice(start, start + rowsPerPage);
    }, [filteredProducts, page, rowsPerPage]);

    // ✅ Rendu cellule correspondance
    const renderMatchCell = (product, columnRef) => {
        const productMatches = matches.filter(m => m.cod_pro === product.cod_pro);
        const inCrn = productMatches.some(m => m.ref_crn === columnRef.ref);
        const inExt = productMatches.some(m => m.ref_ext === columnRef.ref);

        if (inCrn && inExt) {
            return (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Chip 
                        label="C" 
                        size="small" 
                        sx={{ 
                            bgcolor: '#1976d2', 
                            color: 'white', 
                            minWidth: 25, 
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600
                        }} 
                    />
                    <Chip 
                        label="E" 
                        size="small" 
                        sx={{ 
                            bgcolor: '#ed6c02', 
                            color: 'white', 
                            minWidth: 25, 
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600
                        }} 
                    />
                </Box>
            );
        } else if (inCrn) {
            return (
                <Chip 
                    label="CRN" 
                    size="small" 
                    sx={{ 
                        bgcolor: '#1976d2', 
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 20
                    }} 
                />
            );
        } else if (inExt) {
            return (
                <Chip 
                    label="EXT" 
                    size="small" 
                    sx={{ 
                        bgcolor: '#ed6c02', 
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 20
                    }} 
                />
            );
        }

        return <span style={{ color: '#999' }}>-</span>;
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleColumnToggle = (columnId) => {
        if (onColumnVisibilityChange) {
            onColumnVisibilityChange({
                ...columnVisibility,
                [columnId]: !columnVisibility[columnId]
            });
        }
    };

    if (!products || products.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    Aucun produit trouvé
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ width: '100%' }}>
            {/* TOOLBAR */}
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Matrice produits ({filteredProducts.length})
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        sx={{ width: 250 }}
                    />

                    <Tooltip title="Configurer les colonnes">
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <ViewColumn />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* TABLE */}
            <TableContainer sx={{ maxHeight: 700 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { bgcolor: '#f8f9fa', fontWeight: 700, fontSize: '0.8rem' } }}>
                            {baseColumns.filter(col => col.visible).map(col => (
                                <TableCell 
                                    key={col.id} 
                                    align={col.align || 'left'} 
                                    sx={{ width: col.width }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}

                            {columnRefs.map(ref => (
                                <TableCell 
                                    key={ref.ref} 
                                    align="center" 
                                    sx={{ 
                                        minWidth: 80,
                                        bgcolor: ref.type === 'CRN' ? '#e3f2fd' : '#fff3e0'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                        <span style={{ fontSize: '0.9rem' }}>
                                            {ref.type === 'CRN' ? '🔵' : '🟠'}
                                        </span>
                                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                            {ref.ref}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedProducts.map((product, index) => (
                            <TableRow 
                                key={product.cod_pro}
                                hover
                                sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                            >
                                {baseColumns.filter(col => col.visible).map(col => {
                                    const value = product[col.id];

                                    if (col.id === 'qualite') {
                                        return (
                                            <TableCell key={col.id} align="center">
                                                <Chip 
                                                    label={value || 'N/A'} 
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: getQualiteColor(value), 
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        height: 22,
                                                        minWidth: 45
                                                    }} 
                                                />
                                            </TableCell>
                                        );
                                    }

                                    if (col.id === 'statut') {
                                        return (
                                            <TableCell key={col.id} align="center">
                                                <Tooltip title={getStatutLabel(value)}>
                                                    <Chip 
                                                        label={value ?? 'N/A'} 
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: getStatutColor(value), 
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            height: 22,
                                                            minWidth: 35
                                                        }} 
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                        );
                                    }

                                    return (
                                        <TableCell key={col.id} align={col.align || 'left'} sx={{ fontSize: '0.8rem' }}>
                                            {value || '-'}
                                        </TableCell>
                                    );
                                })}

                                {columnRefs.map(ref => (
                                    <TableCell key={ref.ref} align="center">
                                        {renderMatchCell(product, ref)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                sx={{ 
                    borderTop: '1px solid #e0e0e0',
                    '& .MuiTablePagination-toolbar': { minHeight: 48, fontSize: '0.875rem' }
                }}
            />

            {/* MENU COLONNES */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {baseColumns.map(col => (
                    <MenuItem key={col.id}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={col.visible} 
                                    onChange={() => handleColumnToggle(col.id === 'cod_pro' || col.id === 'refint' ? 'details' : col.id.replace('nom_', ''))} 
                                />
                            }
                            label={col.label}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Paper>
    );
}