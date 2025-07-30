// frontend/src/features/dashboard/hooks/useDashboardActions.jsx
import { useState, useCallback } from 'react';
import { useAppState } from '@/store/contexts/AppStateContext';
import { toast } from 'react-toastify';

/**
 * Hook pour les actions dashboard
 */
export function useDashboardActions() {
    const { actions } = useAppState();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('overview');

    const handleProductSelect = useCallback((product) => {
        setSelectedProduct(product);
        actions.setCurrentProduct(product);
    }, [actions]);

    const handleExport = useCallback(async (data) => {
        try {
            const csv = generateCSV(data);
            downloadFile(csv, `dashboard-export-${Date.now()}.csv`);
            toast.success('Export réussi');
        } catch (error) {
            toast.error("Erreur lors de l'export");
        }
    }, []);

    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode);
        actions.setActiveView(mode);
    }, [actions]);

    return {
        selectedProduct,
        viewMode,
        handleProductSelect,
        handleExport,
        handleViewModeChange,
    };
}

// utils internes
function generateCSV(data) {
    if (!data?.rows || !data?.columns) return '';

    const headers = data.columns.map(col => col.headerName).join(';');
    const rows = data.rows.map(row =>
        data.columns.map(col => row[col.field] || '').join(';')
    ).join('\n');

    return `${headers}\n${rows}`;
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
