import { useState, useCallback } from 'react';

export function useFeatureStates(config = {}) {
    const {
        initialSelectedItem = null,
        initialRefFilter = '',
        initialQualiteFilter = '',
        initialSearchTerm = '',
        enableDetailModal = true,
        enableExportModal = false,
        enableSimulationModal = false,
        enableInsights = true,
        enableFilters = false,
        defaultViewMode = 'table',
        enableColumnVisibility = false,
        defaultColumnVisibility = null,
    } = config;

    const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
    const [refFilter, setRefFilter] = useState(initialRefFilter);
    const [qualiteFilter, setQualiteFilter] = useState(initialQualiteFilter);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [simulationModalOpen, setSimulationModalOpen] = useState(false);
    const [showInsights, setShowInsights] = useState(enableInsights);
    const [showFilters, setShowFilters] = useState(enableFilters);
    const [showHelp, setShowHelp] = useState(false);
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [columnVisibility, setColumnVisibility] = useState(
        defaultColumnVisibility || {
            details: true,
            designation: true,
            qualite: true,
            statut: true,
            famille: true,
            fournisseur: true,
        }
    );
    const [simulationData, setSimulationData] = useState(null);

    const openDetailModal = useCallback((item) => {
        setSelectedItem(item);
        setDetailModalOpen(true);
    }, []);

    const closeDetailModal = useCallback(() => {
        setDetailModalOpen(false);
        setSelectedItem(null);
    }, []);

    const openExportModal = useCallback(() => setExportModalOpen(true), []);
    const closeExportModal = useCallback(() => setExportModalOpen(false), []);

    const openSimulationModal = useCallback((data) => {
        setSimulationData(data);
        setSimulationModalOpen(true);
    }, []);

    const closeSimulationModal = useCallback(() => {
        setSimulationModalOpen(false);
        setSimulationData(null);
    }, []);

    const toggleInsights = useCallback(() => setShowInsights(prev => !prev), []);
    const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);
    const toggleHelp = useCallback(() => setShowHelp(prev => !prev), []);

    const resetFilters = useCallback(() => {
        setRefFilter('');
        setQualiteFilter('');
        setSearchTerm('');
    }, []);

    const toggleAllColumns = useCallback((visible) => {
        setColumnVisibility(prev => {
            const newVisibility = {};
            Object.keys(prev).forEach(key => {
                newVisibility[key] = visible;
            });
            return newVisibility;
        });
    }, []);

    return {
        selectedItem,
        setSelectedItem,
        refFilter,
        setRefFilter,
        qualiteFilter,
        setQualiteFilter,
        searchTerm,
        setSearchTerm,
        resetFilters,
        detailModal: {
            isOpen: detailModalOpen,
            open: openDetailModal,
            close: closeDetailModal,
        },
        exportModal: {
            isOpen: exportModalOpen,
            open: openExportModal,
            close: closeExportModal,
        },
        simulationModal: {
            isOpen: simulationModalOpen,
            open: openSimulationModal,
            close: closeSimulationModal,
            data: simulationData,
        },
        insights: {
            isVisible: showInsights,
            toggle: toggleInsights,
        },
        filters: {
            isVisible: showFilters,
            toggle: toggleFilters,
        },
        help: {
            isVisible: showHelp,
            toggle: toggleHelp,
        },
        viewMode,
        setViewMode,
        columnVisibility,
        setColumnVisibility,
        toggleAllColumns,
    };
}