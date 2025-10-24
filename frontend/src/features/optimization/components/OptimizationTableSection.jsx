// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationTableSection.jsx
// ✅ VERSION FINALE - Couleurs harmonisées & détails complets
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TableSortLabel,
    Chip, IconButton, Collapse, Typography, Button,
    Checkbox, Tooltip, Stack
} from '@mui/material';
import {
    KeyboardArrowDown, KeyboardArrowRight, PlayArrow, Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectionQualityIndicator from './indicators/ProjectionQualityIndicator';
import { getQualiteColor, getQualiteLabel } from '@/constants/colors';

const OptimizationTableSection = ({ data, onOptimizationSelect, onSimulationOpen }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [orderBy, setOrderBy] = useState('synthese_totale.gain_total_achat_18m');
    const [order, setOrder] = useState('desc');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());

    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getNestedValue = (obj, path) =>
        path.split('.').reduce((current, key) => current?.[key], obj);

    const sortedData = useMemo(() => {
        if (!data?.items) return [];
        return [...data.items].sort((a, b) => {
            let aVal = getNestedValue(a, orderBy);
            let bVal = getNestedValue(b, orderBy);
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            return order === 'asc'
                ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0
                : aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        });
    }, [data, orderBy, order]);

    const paginatedData = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return sortedData.slice(startIndex, startIndex + rowsPerPage);
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

    const handleRowExpand = (key) =>
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            newSet.has(key) ? newSet.delete(key) : newSet.add(key);
            return newSet;
        });

    const handleRowSelect = (key, isSelected) =>
        setSelectedRows((prev) => {
            const newSet = new Set(prev);
            isSelected ? newSet.add(key) : newSet.delete(key);
            return newSet;
        });

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            const allKeys = new Set(paginatedData.map(item => `${item.grouping_crn}_${item.qualite}`));
            setSelectedRows(allKeys);
        } else {
            setSelectedRows(new Set());
        }
    };

    const SortableTableCell = ({ children, sortKey, align = 'left' }) => (
        <TableCell align={align}>
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
            {/* En-tête */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Opportunités d'Optimisation ({sortedData.length} groupes)
                    </Typography>
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
                            <TableCell />
                            <SortableTableCell sortKey="grouping_crn">Groupe CRN</SortableTableCell>
                            <SortableTableCell sortKey="qualite">Qualité</SortableTableCell>
                            <SortableTableCell sortKey="refs_total" align="center">Refs Total</SortableTableCell>
                            <SortableTableCell sortKey="synthese_totale.gain_manque_achat_12m" align="right">Manque à gagner 12M</SortableTableCell>
                            <SortableTableCell sortKey="synthese_totale.gain_potentiel_achat_6m" align="right">Gain potentiel 6M</SortableTableCell>
                            <SortableTableCell sortKey="synthese_totale.gain_total_achat_18m" align="right">Gain Total 18M</SortableTableCell>
                            <TableCell align="center">Qualité Projection</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        <AnimatePresence>
                            {paginatedData.map((opt) => {
                                const rowKey = `${opt.grouping_crn}_${opt.qualite}`;
                                const isExpanded = expandedRows.has(rowKey);
                                const isSelected = selectedRows.has(rowKey);

                                const qualiteColor = getQualiteColor(opt.qualite);
                                const qualiteLabel = getQualiteLabel(opt.qualite);

                                return (
                                    <React.Fragment key={rowKey}>
                                        <TableRow
                                            component={motion.tr}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            hover
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleRowSelect(rowKey, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleRowExpand(rowKey)}>
                                                    {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{opt.grouping_crn}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={qualiteLabel}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: qualiteColor + '20',
                                                        color: qualiteColor,
                                                        fontWeight: 600,
                                                        border: `1px solid ${qualiteColor}`,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">{opt.refs_total}</TableCell>
                                            <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 600 }}>
                                                {formatCurrency(opt.synthese_totale?.gain_manque_achat_12m)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                {formatCurrency(opt.synthese_totale?.gain_potentiel_achat_6m)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                                {formatCurrency(opt.synthese_totale?.gain_total_achat_18m)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {opt.projection_6m?.metadata ? (
                                                    <ProjectionQualityIndicator projection={opt.projection_6m} compact />
                                                ) : (
                                                    <Chip size="small" label="N/A" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Voir détails">
                                                    <IconButton size="small" onClick={() => onOptimizationSelect(opt)}>
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>

                                        {/* ✅ Détails du groupe restaurés */}
                                        <TableRow>
                                            <TableCell colSpan={10} sx={{ p: 0 }}>
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{ py: 3, px: 2, bgcolor: 'grey.50' }}>
                                                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                                            📊 Détails du Groupe
                                                        </Typography>

                                                        <Stack spacing={2}>
                                                            {/* Synthèse 18M */}
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    💰 Synthèse 18 mois :
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Marge actuelle 18M :</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {formatCurrency(opt.synthese_totale?.marge_achat_actuelle_18m)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2">Marge optimisée 18M :</Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                        {formatCurrency(opt.synthese_totale?.marge_achat_optimisee_18m)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            {/* Qualité de projection */}
                                                            {opt.projection_6m?.metadata && (
                                                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                        🎯 Qualité de la projection :
                                                                    </Typography>
                                                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                                        <Chip
                                                                            size="small"
                                                                            label={`${(opt.projection_6m.metadata.quality_score * 100).toFixed(0)}%`}
                                                                            color={
                                                                                opt.projection_6m.metadata.quality_score >= 0.7
                                                                                    ? 'success'
                                                                                    : opt.projection_6m.metadata.quality_score >= 0.4
                                                                                    ? 'warning'
                                                                                    : 'error'
                                                                            }
                                                                        />
                                                                        <Chip
                                                                            size="small"
                                                                            label={opt.projection_6m.metadata.method}
                                                                            variant="outlined"
                                                                        />
                                                                    </Stack>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {opt.projection_6m.metadata.summary}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            {/* Répartition des références */}
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                    📦 Répartition des références :
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
                                                                            ✅ À conserver : {opt.refs_to_keep?.length || 0}
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
                                                                            ⚠️ Faibles ventes : {opt.refs_to_delete_low_sales?.length || 0}
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
                                                                            ❌ Sans ventes : {opt.refs_to_delete_no_sales?.length || 0}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </Box>
                                                        </Stack>
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
