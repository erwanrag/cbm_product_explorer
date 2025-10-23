// ===================================
// 📁 shared/components/tables/DataTable.jsx
// Table réutilisable SIMPLIFIÉE - Compatible avec l'existant
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TableSortLabel,
    Checkbox, IconButton, Toolbar, Typography, Tooltip,
    Box, TextField, InputAdornment
} from '@mui/material';
import { Search, Download } from '@mui/icons-material';
import { useExport } from '@/shared/hooks/useExport';

export const DataTable = ({
    columns,
    data,
    title,
    selectable = false,
    searchable = true,
    exportable = true,
    pagination = true,
    sorting = true,
    dense = false,
    stickyHeader = true,
    maxHeight = 600,
    onRowClick,
    onSelectionChange,
    loading = false,
    error = false
}) => {
    const { exportToExcel, isExporting } = useExport();
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');

    // Filtrage par recherche
    const filteredData = useMemo(() => {
        if (!search || !data) return data || [];
        
        return data.filter(row =>
            columns.some(col => {
                const value = row[col.field];
                return value && String(value).toLowerCase().includes(search.toLowerCase());
            })
        );
    }, [data, search, columns]);

    // Tri des données
    const sortedData = useMemo(() => {
        if (!orderBy || !filteredData) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[orderBy];
            const bVal = b[orderBy];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            const comparison = typeof aVal === 'number' 
                ? aVal - bVal 
                : String(aVal).localeCompare(String(bVal));

            return order === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, orderBy, order]);

    // Pagination
    const paginatedData = pagination && sortedData
        ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : sortedData || [];

    const handleSort = (field) => {
        const isAsc = orderBy === field && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(field);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = paginatedData.map((row, index) => index);
            setSelected(newSelected);
            onSelectionChange?.(newSelected);
        } else {
            setSelected([]);
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (index) => {
        const selectedIndex = selected.indexOf(index);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, index];
        } else if (selectedIndex === 0) {
            newSelected = selected.slice(1);
        } else if (selectedIndex === selected.length - 1) {
            newSelected = selected.slice(0, -1);
        } else if (selectedIndex > 0) {
            newSelected = [
                ...selected.slice(0, selectedIndex),
                ...selected.slice(selectedIndex + 1)
            ];
        }

        setSelected(newSelected);
        onSelectionChange?.(newSelected);
    };

    const handleExport = () => {
        if (!sortedData || sortedData.length === 0) return;
        
        exportToExcel(
            sortedData,
            title || 'export',
            'Données',
            {
                columns: columns.map(col => ({
                    key: col.field,
                    label: col.headerName || col.field,
                    width: col.minWidth ? col.minWidth / 10 : 15,
                }))
            }
        );
    };

    if (loading) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Chargement...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">Erreur de chargement</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ width: '100%' }}>
            <Toolbar sx={{ pl: 2, pr: 1 }}>
                <Typography variant="h6" flex="1">
                    {title}
                    {selected.length > 0 && (
                        <Typography component="span" variant="body2" sx={{ ml: 2 }}>
                            {selected.length} sélectionné(s)
                        </Typography>
                    )}
                </Typography>

                {searchable && (
                    <TextField
                        size="small"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            )
                        }}
                        sx={{ mr: 2 }}
                    />
                )}

                {exportable && (
                    <Tooltip title="Exporter vers Excel">
                        <IconButton 
                            onClick={handleExport}
                            disabled={isExporting || !sortedData || sortedData.length === 0}
                        >
                            <Download />
                        </IconButton>
                    </Tooltip>
                )}
            </Toolbar>

            <TableContainer sx={{ maxHeight }}>
                <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                                        checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={column.field}
                                    align={column.align || 'left'}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {sorting && column.sortable !== false ? (
                                        <TableSortLabel
                                            active={orderBy === column.field}
                                            direction={orderBy === column.field ? order : 'asc'}
                                            onClick={() => handleSort(column.field)}
                                        >
                                            {column.headerName || column.field}
                                        </TableSortLabel>
                                    ) : (
                                        column.headerName || column.field
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        Aucune donnée disponible
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIndex) => {
                                const isSelected = selected.indexOf(rowIndex) !== -1;

                                return (
                                    <TableRow
                                        hover
                                        key={rowIndex}
                                        selected={isSelected}
                                        onClick={() => onRowClick?.(row)}
                                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    >
                                        {selectable && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(rowIndex)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column) => (
                                            <TableCell key={column.field} align={column.align || 'left'}>
                                                {column.renderCell
                                                    ? column.renderCell(row[column.field], row)
                                                    : row[column.field]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && sortedData && sortedData.length > 0 && (
                <TablePagination
                    component="div"
                    count={sortedData.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    labelRowsPerPage="Lignes par page:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
            )}
        </Paper>
    );
};