// 📁 DashboardTableSection.jsx
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
import { FileDownload, ViewColumn, Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getMargeColor, getMatchPercentColor, getStatutColor, getStatutLabel } from '@/constants/colors';

export default function DashboardTableSection({ data, onProductSelect }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [orderBy, setOrderBy] = useState('qualite_ca');
    const [order, setOrder] = useState('desc');

    const [anchorEl, setAnchorEl] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        cod_pro: true,
        refint: true,
        ref_ext: true,
        nom_pro: true,
        qualite: true,
        statut: true,
        nom_fou: true,
        px_vente_calcule: true,
        px_achat_eur: true,
        quantite_total: true,
        ca_total: true,
        marge_percent_total: true,
        stock_total: true,
        pmp: true,
        match_percent: true,
    });

    if (!data?.details || data.details.length === 0) return null;

    // ✅ Calcul du % de matching pour chaque produit
    const codProToMatchPercent = useMemo(() => {
        if (!data.matches || data.matches.length === 0) return {};
        const allRefCrnSet = new Set(data.matches.map(m => m.ref_crn));
        const totalRefCrn = allRefCrnSet.size;
        const codProMap = {};
        data.matches.forEach(({ cod_pro, ref_crn }) => {
            if (!codProMap[cod_pro]) codProMap[cod_pro] = new Set();
            codProMap[cod_pro].add(ref_crn);
        });
        const result = {};
        Object.entries(codProMap).forEach(([cod_pro, refs]) => {
            result[cod_pro] = +(100 * refs.size / totalRefCrn).toFixed(1);
        });
        return result;
    }, [data.matches]);

    const sortedData = useMemo(() => {
        return [...data.details].sort((a, b) => {
            if (orderBy === 'qualite_ca') {
                const qualiteOrder = ['OE', 'OEM', 'PMQ', 'PMV'];
                const aQualiteIndex = qualiteOrder.indexOf(a.qualite) !== -1 ? qualiteOrder.indexOf(a.qualite) : 999;
                const bQualiteIndex = qualiteOrder.indexOf(b.qualite) !== -1 ? qualiteOrder.indexOf(b.qualite) : 999;
                if (aQualiteIndex !== bQualiteIndex) return aQualiteIndex - bQualiteIndex;
                return (b.ca_total || 0) - (a.ca_total || 0);
            }
            let aVal = a[orderBy] || 0;
            let bVal = b[orderBy] || 0;
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            return order === 'asc' ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
                : (aVal > bVal ? -1 : aVal < bVal ? 1 : 0);
        });
    }, [data.details, orderBy, order]);

    const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleColumnMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleColumnMenuClose = () => setAnchorEl(null);
    const toggleColumn = (columnId) => {
        setVisibleColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    const allColumns = [
        { id: 'cod_pro', label: 'Code', sortable: true, width: 80, align: 'left' },
        { id: 'refint', label: 'Ref Int', sortable: true, width: 120, align: 'left' },
        { id: 'ref_ext', label: 'Ref Ext', sortable: true, width: 110, align: 'left' },
        { id: 'nom_pro', label: 'Nom Produit', sortable: true, width: 180, align: 'left' },
        { id: 'qualite', label: 'Qualité', sortable: true, width: 80, align: 'center' },
        { id: 'statut', label: 'Statut', sortable: true, width: 80, align: 'center' },
        { id: 'nom_fou', label: 'Fournisseur', sortable: true, width: 150, align: 'left' },
        { id: 'px_vente_calcule', label: 'PV Cal.', sortable: false, width: 90, align: 'right' },
        { id: 'px_achat_eur', label: 'PA EUR', sortable: true, width: 90, align: 'right' },
        { id: 'quantite_total', label: 'Qté Vendue', sortable: true, width: 100, align: 'right' },
        { id: 'ca_total', label: 'CA Total', sortable: true, width: 100, align: 'right' },
        { id: 'marge_percent_total', label: 'Marge %', sortable: true, width: 80, align: 'right' },
        { id: 'stock_total', label: 'Stock', sortable: true, width: 80, align: 'right' },
        { id: 'pmp', label: 'PMP Dépôt 1', sortable: true, width: 100, align: 'right' },
        { id: 'match_percent', label: '% Matching', sortable: false, width: 100, align: 'right' }
    ];

    const visibleColumnsArray = allColumns.filter(col => visibleColumns[col.id]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Paper elevation={2} sx={{ mt: 2 }}>
                <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        Produits ({data.details.length})
                        {orderBy === 'qualite_ca' && (
                            <Chip label="Tri: Qualité + CA" size="small" sx={{ ml: 1, bgcolor: '#e3f2fd', fontSize: '0.7rem' }} />
                        )}
                    </Typography>

      
                    <Tooltip title="Afficher/masquer les colonnes">
                        <IconButton onClick={handleColumnMenuOpen} color="primary" size="small">
                            <ViewColumn fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleColumnMenuClose} PaperProps={{ sx: { minWidth: 200 } }}>
                        <MenuItem disabled>
                            <Settings fontSize="small" sx={{ mr: 1 }} />
                            Colonnes visibles
                        </MenuItem>
                        <Divider />
                        {allColumns.map((column) => (
                            <MenuItem key={column.id} onClick={() => toggleColumn(column.id)}>
                                <FormControlLabel
                                    control={<Checkbox checked={visibleColumns[column.id]} size="small" />}
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
                                        style={{ width: column.width, fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#f5f5f5' }}
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
                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>+CA</Typography>
                                                )}
                                            </TableSortLabel>
                                        ) : column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.map((product) => (
                                <TableRow
                                    key={product.cod_pro}
                                    hover
                                    onClick={() => onProductSelect?.(product)}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f8f9fa' }, height: 48 }}
                                >
                                    {visibleColumns.cod_pro && <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{product.cod_pro}</TableCell>}
                                    {visibleColumns.refint && <TableCell sx={{ fontSize: '0.8rem' }}>{product.refint || '-'}</TableCell>}
                                    {visibleColumns.ref_ext && <TableCell sx={{ fontSize: '0.8rem' }}>{product.ref_ext || '-'}</TableCell>}
                                    {visibleColumns.nom_pro && <TableCell sx={{ fontSize: '0.8rem' }}>{product.nom_pro || '-'}</TableCell>}
                                    {visibleColumns.qualite && (
                                        <TableCell align="center">
                                            <Chip label={product.qualite || 'N/A'} size="small"
                                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: getQualiteColor(product.qualite), color: 'white', minWidth: 45 }} />
                                        </TableCell>
                                    )}
                                    {visibleColumns.statut && (
                                        <TableCell align="center">
                                            <Tooltip title={getStatutLabel(product.statut)}>
                                                <Chip label={product.statut ?? 'N/A'} size="small"
                                                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: getStatutColor(product.statut), color: 'white', minWidth: 35 }} />
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                    {visibleColumns.nom_fou && <TableCell sx={{ fontSize: '0.8rem' }}>{product.nom_fou || '-'}</TableCell>}
                                    {visibleColumns.px_vente_calcule && (
                                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                                            {product.quantite_total > 0 ? formatCurrency(product.ca_total / product.quantite_total, 'EUR', true) : '-'}
                                        </TableCell>
                                    )}
                                    {visibleColumns.px_achat_eur && (
                                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                                            {formatCurrency(product.px_achat_eur || 0, 'EUR', true)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.quantite_total && (
                                        <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                            {(product.quantite_total || 0).toLocaleString('fr-FR')}
                                        </TableCell>
                                    )}
                                    {visibleColumns.ca_total && (
                                        <TableCell align="right">
                                            <Box sx={{ fontWeight: (product.ca_total || 0) > 50000 ? 700 : 500, fontSize: '0.8rem' }}>
                                                {formatCurrency(product.ca_total || 0, 'EUR', true)}
                                            </Box>
                                        </TableCell>
                                    )}
                                    {visibleColumns.marge_percent_total && (
                                        <TableCell align="right">
                                            <Chip label={`${(product.marge_percent_total || 0).toFixed(1)}%`} size="small"
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: getMargeColor(product.marge_percent_total || 0, product.qualite), color: 'white', minWidth: 50 }} />
                                        </TableCell>
                                    )}
                                    {visibleColumns.stock_total && (
                                        <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                            {(product.stock_total || 0).toLocaleString('fr-FR')}
                                        </TableCell>
                                    )}
                                    {visibleColumns.pmp && (
                                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                                            {formatCurrency(product.pmp || 0, 'EUR', true)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.match_percent && (
                                        <TableCell align="right">
                                            <Chip
                                                label={`${codProToMatchPercent[product.cod_pro]?.toFixed(1) ?? '-'}%`}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    bgcolor: getMatchPercentColor(codProToMatchPercent[product.cod_pro]),
                                                    color: 'white',
                                                    minWidth: 50,
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={sortedData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                    sx={{ borderTop: '1px solid #e0e0e0', '& .MuiTablePagination-toolbar': { minHeight: 48, fontSize: '0.875rem' } }}
                />
            </Paper>
        </motion.div>
    );
}
