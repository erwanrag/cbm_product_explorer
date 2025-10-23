// ===================================
// 📁 frontend/src/shared/hooks/useTableState.js
// Hook générique pour gestion état des tables
// ===================================

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook centralisé pour gérer l'état des tables (pagination, tri, recherche, sélection)
 * Remplace la logique dupliquée dans dashboard/matrix/optimization
 * 
 * @param {object} config - Configuration initiale
 * @returns {object} État et handlers de la table
 */
export function useTableState(config = {}) {
    const {
        defaultPage = 0,
        defaultPageSize = 25,
        defaultSortBy = null,
        defaultSortOrder = 'asc',
        defaultSearchTerm = '',
        pageSizeOptions = [10, 25, 50, 100],
    } = config;

    // États
    const [page, setPage] = useState(defaultPage);
    const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
    const [sortBy, setSortBy] = useState(defaultSortBy);
    const [sortOrder, setSortOrder] = useState(defaultSortOrder);
    const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
    const [selectedRows, setSelectedRows] = useState([]);

    // Handlers
    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0); // Reset à la première page
    }, []);

    const handleSort = useCallback((field) => {
        if (sortBy === field) {
            // Toggle ordre si même colonne
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setPage(0); // Reset à la première page
    }, [sortBy]);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        setPage(0); // Reset à la première page
    }, []);

    const handleSelectRow = useCallback((rowId) => {
        setSelectedRows(prev => {
            if (prev.includes(rowId)) {
                return prev.filter(id => id !== rowId);
            }
            return [...prev, rowId];
        });
    }, []);

    const handleSelectAll = useCallback((data, idField = 'id') => {
        if (selectedRows.length === data.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(data.map(row => row[idField]));
        }
    }, [selectedRows.length]);

    const clearSelection = useCallback(() => {
        setSelectedRows([]);
    }, []);

    const resetState = useCallback(() => {
        setPage(defaultPage);
        setRowsPerPage(defaultPageSize);
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setSearchTerm(defaultSearchTerm);
        setSelectedRows([]);
    }, [defaultPage, defaultPageSize, defaultSortBy, defaultSortOrder, defaultSearchTerm]);

    // Computed values
    const hasSelection = selectedRows.length > 0;
    const isAllSelected = useCallback((data, idField = 'id') => {
        return data.length > 0 && selectedRows.length === data.length;
    }, [selectedRows.length]);

    return {
        // État
        page,
        rowsPerPage,
        sortBy,
        sortOrder,
        searchTerm,
        selectedRows,
        
        // Setters directs (pour cas avancés)
        setPage,
        setRowsPerPage,
        setSortBy,
        setSortOrder,
        setSearchTerm,
        setSelectedRows,

        // Handlers
        handleChangePage,
        handleChangeRowsPerPage,
        handleSort,
        handleSearch,
        handleSelectRow,
        handleSelectAll,
        clearSelection,
        resetState,

        // Computed
        hasSelection,
        isAllSelected,
        pageSizeOptions,
    };
}

/**
 * Hook pour filtrer et paginer les données côté client
 * Utilisé quand les données sont chargées entièrement en mémoire
 */
export function useClientSideTable(data = [], tableState, options = {}) {
    const {
        searchFields = [],
        customSort = null,
        customFilter = null,
    } = options;

    const {
        page,
        rowsPerPage,
        sortBy,
        sortOrder,
        searchTerm,
    } = tableState;

    // Filtrage par recherche
    const filteredData = useMemo(() => {
        if (!searchTerm || searchFields.length === 0) {
            return customFilter ? data.filter(customFilter) : data;
        }

        const lowerSearch = searchTerm.toLowerCase();
        const baseFiltered = data.filter(row => {
            return searchFields.some(field => {
                const value = row[field];
                if (value == null) return false;
                return String(value).toLowerCase().includes(lowerSearch);
            });
        });

        return customFilter ? baseFiltered.filter(customFilter) : baseFiltered;
    }, [data, searchTerm, searchFields, customFilter]);

    // Tri
    const sortedData = useMemo(() => {
        if (!sortBy) return filteredData;

        return [...filteredData].sort((a, b) => {
            if (customSort) {
                return customSort(a, b, sortBy, sortOrder);
            }

            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else {
                comparison = String(aVal).localeCompare(String(bVal));
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortBy, sortOrder, customSort]);

    // Pagination
    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return sortedData.slice(start, end);
    }, [sortedData, page, rowsPerPage]);

    return {
        data: paginatedData,
        filteredCount: filteredData.length,
        totalCount: data.length,
        hasData: paginatedData.length > 0,
        isEmpty: data.length === 0,
        isFiltered: searchTerm !== '' || (customFilter && filteredData.length !== data.length),
    };
}

export default useTableState;


