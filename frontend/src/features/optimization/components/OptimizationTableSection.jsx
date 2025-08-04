// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationTableSection.jsx - COMPLET
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
import ProjectionQualityIndicator from './indicators/ProjectionQualityIndicator';

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

    if (!data?.items?.length) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Aucune donnée d'optimisation disponible
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2}>
            {/* En-tête avec actions */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Opportunités d'Optimisation ({sortedData.length} groupes)
                    </Typography>

                    <Stack direction="row" spacing={1}>
                        {selectedRows.size > 0 && (
                            <Button
                                variant="outlined"
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
                    </Stack>
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
                            {/* ✅ NOUVELLE COLONNE: Marge optimisée */}
                            <SortableTableCell sortKey="marge_optimisee_6m" align="right">Marge Opt. 6M</SortableTableCell>
                            <SortableTableCell sortKey="taux_croissance" align="center">Tendance</SortableTableCell>
                            {/* ✅ NOUVELLE COLONNE: Qualité projection */}
                            <TableCell align="center">Qualité Projection</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence>
                            {paginatedData.map((optimization) => {
                                const key = `${optimization.grouping_crn}_${optimization.qualite}`;
                                const isSelected = selectedRows.has(key);
                                const isExpanded = expandedRows.has(key);

                                return (
                                    <React.Fragment key={key}>
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            component={TableRow}
                                            hover
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleRowSelect(key, e.target.checked)}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRowExpand(key)}
                                                >
                                                    {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                                </IconButton>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {optimization.grouping_crn}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={optimization.qualite}
                                                    size="small"
                                                    color={
                                                        optimization.qualite === 'OEM' ? 'primary' :
                                                            optimization.qualite === 'PMQ' ? 'success' : 'warning'
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {optimization.refs_total}
                                                </Typography>
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
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: optimization.gain_potentiel > 0 ? 'success.main' : 'text.secondary'
                                                    }}
                                                >
                                                    {formatCurrency(optimization.gain_potentiel)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: optimization.gain_potentiel_6m > 0 ? 'primary.main' : 'text.secondary'
                                                    }}
                                                >
                                                    {formatCurrency(optimization.gain_potentiel_6m)}
                                                </Typography>
                                            </TableCell>

                                            {/* ✅ NOUVELLE CELLULE: Marge optimisée 6M */}
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'secondary.main'
                                                    }}
                                                >
                                                    {formatCurrency(optimization.marge_optimisee_6m)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    vs {formatCurrency(optimization.marge_actuelle_6m)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                    {optimization.taux_croissance >= 0 ? (
                                                        <TrendingUp color="success" fontSize="small" />
                                                    ) : (
                                                        <TrendingDown color="error" fontSize="small" />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: optimization.taux_croissance >= 0 ? 'success.main' : 'error.main'
                                                        }}
                                                    >
                                                        {formatPercentage(optimization.taux_croissance)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* ✅ CELLULE QUALITÉ PROJECTION CORRIGÉE */}
                                            <TableCell align="center">
                                                {optimization.projection_6m?.metadata?.quality_score ? (
                                                    <ProjectionQualityIndicator
                                                        projection={optimization.projection_6m}
                                                        compact={true}
                                                    />
                                                ) : (
                                                    <Chip size="small" label="N/A" color="default" variant="outlined" />
                                                )}
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

                                        {/* Ligne détaillée expansible */}
                                        <TableRow>
                                            <TableCell colSpan={13} sx={{ p: 0, border: 'none' }}>
                                                <Collapse in={isExpanded}>
                                                    <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                            Détails {optimization.grouping_crn} - {optimization.qualite}
                                                        </Typography>

                                                        {/* ✅ Métriques détaillées avec nouveaux champs */}
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                💰 Métriques économiques:
                                                            </Typography>
                                                            <Stack spacing={1}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Prix achat minimum:</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {formatCurrency(optimization.px_achat_min)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Prix vente pondéré:</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {formatCurrency(optimization.px_vente_pondere)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Marge actuelle 6M:</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {formatCurrency(optimization.marge_actuelle_6m)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Marge optimisée 6M:</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                        {formatCurrency(optimization.marge_optimisee_6m)}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Box>

                                                        {/* ✅ Qualité de projection détaillée */}
                                                        {optimization.projection_6m?.metadata && (
                                                            <Box sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    🎯 Qualité de la projection:
                                                                </Typography>
                                                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                                    <Chip
                                                                        size="small"
                                                                        label={`${(optimization.projection_6m.metadata.quality_score * 100).toFixed(0)}%`}
                                                                        color={
                                                                            optimization.projection_6m.metadata.quality_score >= 0.7 ? 'success' :
                                                                                optimization.projection_6m.metadata.quality_score >= 0.4 ? 'warning' : 'error'
                                                                        }
                                                                    />
                                                                    <Chip
                                                                        size="small"
                                                                        label={optimization.projection_6m.metadata.method}
                                                                        variant="outlined"
                                                                    />
                                                                    <Chip
                                                                        size="small"
                                                                        label={optimization.projection_6m.metadata.confidence_level}
                                                                        variant="outlined"
                                                                        color="info"
                                                                    />
                                                                </Stack>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {optimization.projection_6m.metadata.summary}
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Répartition des références */}
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                📦 Répartition des références:
                                                            </Typography>
                                                            <Stack direction="row" spacing={2}>
                                                                <Box sx={{
                                                                    p: 1,
                                                                    bgcolor: 'success.50',
                                                                    borderRadius: 1,
                                                                    border: '1px solid',
                                                                    borderColor: 'success.200'
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                        ✅ À conserver: {optimization.refs_to_keep?.length || 0}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{
                                                                    p: 1,
                                                                    bgcolor: 'warning.50',
                                                                    borderRadius: 1,
                                                                    border: '1px solid',
                                                                    borderColor: 'warning.200'
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                                                        ⚠️ Faibles ventes: {optimization.refs_to_delete_low_sales?.length || 0}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{
                                                                    p: 1,
                                                                    bgcolor: 'error.50',
                                                                    borderRadius: 1,
                                                                    border: '1px solid',
                                                                    borderColor: 'error.200'
                                                                }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                                        ❌ Sans ventes: {optimization.refs_to_delete_no_sales?.length || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Box>

                                                        {/* Barre de progression du gain */}
                                                        {optimization.gain_potentiel > 0 && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Potentiel de gain (relatif)
                                                                </Typography>
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