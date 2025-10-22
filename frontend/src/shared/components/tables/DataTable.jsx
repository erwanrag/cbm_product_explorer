// ===================================
// 📁 shared/components/tables/DataTable.jsx
// Table réutilisable avec toutes les fonctionnalités
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TableSortLabel,
    Checkbox, IconButton, Toolbar, Typography, Tooltip,
    Box, TextField, InputAdornment
} from '@mui/material';
import { Search, Download, FilterList, ViewColumn } from '@mui/icons-material';
import { exportToExcel } from '@/utils/export';

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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');

    // Filtrage par recherche
    const filteredData = useMemo(() => {
        if (!search) return data;
        
        return data.filter(row =>
            columns.some(col =>
                String(row[col.field])
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );
    }, [data, search, columns]);

    // Tri des données
    const sortedData = useMemo(() => {
        if (!orderBy) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[orderBy];
            const bVal = b[orderBy];

            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
    }, [filteredData, orderBy, order]);

    // Pagination
    const paginatedData = pagination
        ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : sortedData;

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
            newSelected = newSelected.concat(selected, index);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
        onSelectionChange?.(newSelected);
    };

    const handleExport = () => {
        exportToExcel(sortedData, columns, title || 'export');
    };

    return (
        <Paper sx={{ width: '100%' }}>
            <Toolbar sx={{ pl: 2, pr: 1 }}>
                <Typography variant="h6" flex="1">
                    {title}
                    {selected.length > 0 && (
                        <Typography component="span" variant="body2" sx={{ ml: 2 }}>
                            {selected.length} selected
                        </Typography>
                    )}
                </Typography>

                {searchable && (
                    <TextField
                        size="small"
                        placeholder="Search..."
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
                    <Tooltip title="Export to Excel">
                        <IconButton onClick={handleExport}>
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
                                            {column.headerName}
                                        </TableSortLabel>
                                    ) : (
                                        column.headerName
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, rowIndex) => {
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
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && (
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
                />
            )}
        </Paper>
    );
};