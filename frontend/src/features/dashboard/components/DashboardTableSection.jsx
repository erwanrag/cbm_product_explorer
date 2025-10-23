// 📁 DashboardTableSection.jsx - AVEC TRADUCTIONS
import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography, Chip,
    TableSortLabel, Tooltip, IconButton, Menu, MenuItem,
    FormControlLabel, Checkbox, Divider, Button
} from '@mui/material';
import { FileDownload, ViewColumn, Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getMargeColor, getMatchPercentColor, getStatutColor, getStatutLabel } from '@/constants/colors';
import { ExportExcelButton } from '@/shared/components/export';
import { useTranslation } from '@/store/contexts/LanguageContext';

export default function DashboardTableSection({ data, onProductSelect }) {
    const { t } = useTranslation();
    
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

    const codProToMatchPercent = useMemo(() => {
        if (!data?.matches || data.matches.length === 0) return {};
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
    }, [data?.matches]);

    const sortedData = useMemo(() => {
        if (!data?.details) return [];
        return [...data.details].sort((a, b) => {
            if (orderBy === 'qualite_ca') {
                const qualiteOrder = ['OE', 'OEM', 'PMQ', 'PMV'];
                const aQualiteIndex = qualiteOrder.indexOf(a.qualite) !== -1 ? qualiteOrder.indexOf(a.qualite) : 999;
                const bQualiteIndex = qualiteOrder.indexOf(b.qualite) !== -1 ? qualiteOrder.indexOf(b.qualite) : 999;
                if (aQualiteIndex !== bQualiteIndex) return aQualiteIndex - bQualiteIndex;
                return (b.ca_total || 0) - (a.ca_total || 0);
            }
            const aVal = a[orderBy];
            const bVal = b[orderBy];
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            const comparison = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
            return order === 'asc' ? comparison : -comparison;
        });
    }, [data?.details, orderBy, order]);

    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleColumnToggle = (columnId) => {
        setVisibleColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    if (!data?.details || data.details.length === 0) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary">
                    {t('dashboard.table.no_products', 'Aucun produit trouvé')}
                </Typography>
            </Paper>
        );
    }

    const columnDefinitions = [
        { id: 'cod_pro', label: t('dashboard.table.cod_pro', 'Code'), width: 90, sortable: true },
        { id: 'refint', label: t('dashboard.table.ref_crn', 'Ref CRN'), width: 120, sortable: true },
        { id: 'ref_ext', label: t('dashboard.table.ref_ext', 'Ref Ext'), width: 120, sortable: true },
        { id: 'nom_pro', label: t('dashboard.table.designation', 'Désignation'), width: 200, sortable: true },
        { id: 'qualite', label: t('dashboard.table.qualite', 'Qualité'), width: 70, sortable: true, align: 'center' },
        { id: 'statut', label: t('dashboard.table.statut', 'Statut'), width: 70, sortable: true, align: 'center' },
        { id: 'nom_fou', label: t('dashboard.table.supplier', 'Fournisseur'), width: 150, sortable: true },
        { id: 'px_vente_calcule', label: t('dashboard.table.sale_price', 'PV'), width: 90, sortable: true, align: 'right' },
        { id: 'px_achat_eur', label: t('dashboard.table.purchase_price', 'PA'), width: 90, sortable: true, align: 'right' },
        { id: 'quantite_total', label: t('dashboard.table.quantity', 'Qté'), width: 80, sortable: true, align: 'right' },
        { id: 'ca_total', label: t('dashboard.table.revenue', 'CA'), width: 100, sortable: true, align: 'right' },
        { id: 'marge_percent_total', label: t('dashboard.table.margin', 'Marge %'), width: 90, sortable: true, align: 'right' },
        { id: 'stock_total', label: t('dashboard.table.stock', 'Stock'), width: 80, sortable: true, align: 'right' },
        { id: 'pmp', label: t('dashboard.table.pmp', 'PMP'), width: 90, sortable: true, align: 'right' },
        { id: 'match_percent', label: t('dashboard.table.match', 'Match %'), width: 80, sortable: true, align: 'center' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Paper elevation={2} sx={{ width: '100%', mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {t('dashboard.table.title', 'Liste des produits')} ({sortedData.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <ExportExcelButton data={sortedData} filename="dashboard_products" />
                        <Tooltip title={t('dashboard.table.configure_columns', 'Configurer les colonnes')}>
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <ViewColumn />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: '#f8f9fa', fontWeight: 700, fontSize: '0.8rem', py: 1.5 } }}>
                                {columnDefinitions.filter(col => visibleColumns[col.id]).map(col => (
                                    <TableCell key={col.id} align={col.align || 'left'} sx={{ width: col.width }}>
                                        {col.sortable ? (
                                            <TableSortLabel
                                                active={orderBy === col.id}
                                                direction={orderBy === col.id ? order : 'asc'}
                                                onClick={() => handleSort(col.id)}
                                            >
                                                {col.label}
                                            </TableSortLabel>
                                        ) : col.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((product, index) => (
                                <TableRow
                                    key={product.cod_pro}
                                    hover
                                    onClick={() => onProductSelect && onProductSelect(product)}
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
                                            {product.quantite_total > 0 ? formatCurrency((product.ca_total || 0) / (product.quantite_total || 1)) : formatCurrency(product.px_vente_calcule || 0)}
                                        </TableCell>
                                    )}
                                    {visibleColumns.px_achat_eur && <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatCurrency(product.px_achat_eur || 0)}</TableCell>}
                                    {visibleColumns.quantite_total && <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{(product.quantite_total || 0).toLocaleString('fr-FR')}</TableCell>}
                                    {visibleColumns.ca_total && <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(product.ca_total || 0)}</TableCell>}
                                    {visibleColumns.marge_percent_total && (
                                        <TableCell align="right">
                                            <Chip label={`${(product.marge_percent_total || 0).toFixed(1)}%`} size="small"
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: getMargeColor(product.marge_percent_total || 0, product.qualite), color: 'white', minWidth: 60 }} />
                                        </TableCell>
                                    )}
                                    {visibleColumns.stock_total && <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{(product.stock_total || 0).toLocaleString('fr-FR')}</TableCell>}
                                    {visibleColumns.pmp && <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatCurrency(product.pmp || 0)}</TableCell>}
                                    {visibleColumns.match_percent && (
                                        <TableCell align="center">
                                            <Chip label={`${codProToMatchPercent[product.cod_pro] || 0}%`} size="small"
                                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: getMatchPercentColor(codProToMatchPercent[product.cod_pro]), color: 'white', minWidth: 50 }} />
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
                    labelRowsPerPage={t('common.rows_per_page', 'Lignes:')}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('common.of', 'sur')} ${count}`}
                    sx={{ borderTop: '1px solid #e0e0e0', '& .MuiTablePagination-toolbar': { minHeight: 48, fontSize: '0.875rem' } }}
                />

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    {columnDefinitions.map(col => (
                        <MenuItem key={col.id}>
                            <FormControlLabel
                                control={<Checkbox checked={visibleColumns[col.id]} onChange={() => handleColumnToggle(col.id)} />}
                                label={col.label}
                            />
                        </MenuItem>
                    ))}
                </Menu>
            </Paper>
        </motion.div>
    );
}