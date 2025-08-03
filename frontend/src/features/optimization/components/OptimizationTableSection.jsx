// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationTableSection.jsx
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TableSortLabel,
    Chip, IconButton, Collapse, Typography, Button,
    Checkbox, Tooltip, Stack, LinearProgress
} from '@mui/material';
import {
    KeyboardArrowDown, KeyboardArrowRight, PlayArrow,
    CheckCircle, TrendingUp, TrendingDown, Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const OptimizationTableSection = ({ data, onOptimizationSelect, onSimulationOpen }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [orderBy, setOrderBy] = useState('gain_potentiel');
    const [order, setOrder] = useState('desc');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());

    // Formatage des devises
    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Formatage des pourcentages
    const formatPercentage = (value) => {
        if (value === null || value === undefined) return '0%';
        return `${(value * 100).toFixed(2)}%`;
    };

    // Tri des données
    const sortedData = useMemo(() => {
        if (!data?.items) return [];

        return [...data.items].sort((a, b) => {
            let aVal = a[orderBy];
            let bVal = b[orderBy];

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
    }, [data, orderBy, order]);

    // Données paginées
    const paginatedData = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return sortedData.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);

    // Handlers
    const handleSort = (property) => {
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

    const handleRowExpand = (key) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleRowSelect = (key, isSelected) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(key);
            } else {
                newSet.delete(key);
            }
            return newSet;
        });
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            const allKeys = new Set(paginatedData.map(item => `${item.grouping_crn}_${item.qualite}`));
            setSelectedRows(allKeys);
        } else {
            setSelectedRows(new Set());
        }
    };

    // Composant en-tête avec tri
    const SortableTableCell = ({ children, sortKey, align = 'left', ...props }) => (
        <TableCell align={align} {...props}>
            <TableSortLabel
                active={orderBy === sortKey}
                direction={orderBy === sortKey ? order : 'asc'}
                onClick={() => handleSort(sortKey)}
                sx={{ fontWeight: 600 }}
            >
                {children}
            </TableSortLabel>
        </TableCell>
    );

    if (!data?.items || data.items.length === 0) {
        return (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    Aucune donnée d'optimisation disponible
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Optimisations Détaillées
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {selectedRows.size > 0 && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<PlayArrow />}
                                onClick={() => {
                                    const selectedOptimizations = paginatedData.filter(item =>
                                        selectedRows.has(`${item.grouping_crn}_${item.qualite}`)
                                    );
                                    onSimulationOpen(selectedOptimizations);
                                }}
                            >
                                Simuler ({selectedRows.size})
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                    indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedData.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell width={50} />
                            <SortableTableCell sortKey="grouping_crn">Groupe CRN</SortableTableCell>
                            <SortableTableCell sortKey="qualite">Qualité</SortableTableCell>
                            <SortableTableCell sortKey="refs_total" align="right">Nb Refs</SortableTableCell>
                            <SortableTableCell sortKey="px_achat_min" align="right">Prix Min</SortableTableCell>
                            <SortableTableCell sortKey="px_vente_pondere" align="right">Prix Moy</SortableTableCell>
                            <SortableTableCell sortKey="gain_potentiel" align="right">Gain Immédiat</SortableTableCell>
                            <SortableTableCell sortKey="gain_potentiel_6m" align="right">Gain 6M</SortableTableCell>
                            <SortableTableCell sortKey="taux_croissance" align="right">Croissance</SortableTableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence>
                            {paginatedData.map((optimization) => {
                                const rowKey = `${optimization.grouping_crn}_${optimization.qualite}`;
                                const isExpanded = expandedRows.has(rowKey);
                                const isSelected = selectedRows.has(rowKey);

                                return (
                                    <React.Fragment key={rowKey}>
                                        {/* Ligne principale */}
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{ backgroundColor: isSelected ? '#f3f4f6' : 'transparent' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleRowSelect(rowKey, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRowExpand(rowKey)}
                                                >
                                                    {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {optimization.grouping_crn}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={optimization.qualite}
                                                    color={
                                                        optimization.qualite === 'OEM' ? 'success' :
                                                            optimization.qualite === 'PMQ' ? 'primary' : 'warning'
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack alignItems="flex-end" spacing={0.5}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {optimization.refs_total}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {optimization.refs_to_keep?.length || 0} à garder
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {formatCurrency(optimization.px_achat_min)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">
                                                    {formatCurrency(optimization.px_vente_pondere)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={optimization.gain_potentiel > 0 ? 'success.main' : 'error.main'}
                                                >
                                                    {formatCurrency(optimization.gain_potentiel)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={optimization.gain_potentiel_6m > 0 ? 'success.main' : 'error.main'}
                                                >
                                                    {formatCurrency(optimization.gain_potentiel_6m)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    {optimization.taux_croissance > 0 ? (
                                                        <TrendingUp fontSize="small" color="success" />
                                                    ) : (
                                                        <TrendingDown fontSize="small" color="error" />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ ml: 0.5 }}
                                                        color={optimization.taux_croissance > 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        {formatPercentage(optimization.taux_croissance)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Voir détails">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onOptimizationSelect(optimization)}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Simuler">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => onSimulationOpen([optimization])}
                                                        >
                                                            <PlayArrow fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </motion.tr>

                                        {/* Ligne détaillée */}
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{ py: 2, px: 4, bgcolor: 'grey.50' }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Détail de l'optimisation
                                                        </Typography>

                                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                                                            {/* Historique */}
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500} gutterBottom>
                                                                    Historique 3 derniers mois
                                                                </Typography>
                                                                {optimization.historique_6m?.slice(-3).map((hist, idx) => (
                                                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                                        <Typography variant="caption">{hist.periode}</Typography>
                                                                        <Typography variant="caption" fontWeight={500}>
                                                                            {formatCurrency(hist.marge)}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>

                                                            {/* Projection */}
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500} gutterBottom>
                                                                    Projection 3 prochains mois
                                                                </Typography>
                                                                {optimization.projection_6m?.mois?.slice(0, 3).map((proj, idx) => (
                                                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                                        <Typography variant="caption">{proj.periode}</Typography>
                                                                        <Typography variant="caption" fontWeight={500} color="success.main">
                                                                            {formatCurrency(proj.marge)}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>

                                                            {/* Références à supprimer */}
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500} gutterBottom>
                                                                    Références à optimiser
                                                                </Typography>
                                                                <Stack spacing={0.5}>
                                                                    {optimization.refs_to_delete_low_sales?.length > 0 && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={`${optimization.refs_to_delete_low_sales.length} avec ventes`}
                                                                            color="warning"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                    {optimization.refs_to_delete_no_sales?.length > 0 && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={`${optimization.refs_to_delete_no_sales.length} sans ventes`}
                                                                            color="error"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                    {optimization.refs_to_keep?.length > 0 && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={`${optimization.refs_to_keep.length} à conserver`}
                                                                            color="success"
                                                                            variant="outlined"
                                                                        />
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        </Box>

                                                        {/* Barre de progression du gain */}
                                                        {optimization.gain_potentiel > 0 && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Potentiel de gain
                                                                    </Typography>
                                                                    <Typography variant="caption" fontWeight={500}>
                                                                        {Math.round((optimization.gain_potentiel / Math.max(optimization.gain_potentiel_6m, optimization.gain_potentiel)) * 100)}%
                                                                    </Typography>
                                                                </Box>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={Math.min((optimization.gain_potentiel / 50000) * 100, 100)}
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 3,
                                                                        bgcolor: 'grey.200',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: 'success.main'
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                );
                            })}
                        </AnimatePresence>
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
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
        </Paper>
    );
};

export default OptimizationTableSection;