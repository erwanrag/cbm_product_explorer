// frontend/src/shared/hooks/useExport.js
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

/**
 * Hook centralisé pour les exports Excel/CSV
 * Remplace la logique dupliquée dans toutes les features
 * 
 * @returns {object} { exportToExcel, exportToCSV, isExporting }
 */
export function useExport() {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Exporte des données vers Excel (.xlsx)
     * 
     * @param {Array} data - Données à exporter (array d'objets)
     * @param {string} filename - Nom du fichier (sans extension)
     * @param {string} sheetName - Nom de la feuille Excel
     * @param {object} options - Options d'export
     * @param {Array} options.columns - [{key, label, width, format}] pour personnaliser les colonnes
     * @param {function} options.onSuccess - Callback de succès
     * @param {function} options.onError - Callback d'erreur
     */
    const exportToExcel = useCallback(async (
        data,
        filename = 'export',
        sheetName = 'Données',
        options = {}
    ) => {
        if (!data || data.length === 0) {
            toast.warning('⚠️ Aucune donnée à exporter');
            return;
        }

        setIsExporting(true);

        try {
            // Préparer les données selon les colonnes spécifiées
            let exportData = data;

            if (options.columns && options.columns.length > 0) {
                exportData = data.map(row => {
                    const formattedRow = {};
                    options.columns.forEach(col => {
                        const value = row[col.key];
                        
                        // Appliquer le formatage si spécifié
                        if (col.format && typeof col.format === 'function') {
                            formattedRow[col.label || col.key] = col.format(value);
                        } else {
                            formattedRow[col.label || col.key] = value;
                        }
                    });
                    return formattedRow;
                });
            }

            // Créer le workbook
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Appliquer les largeurs de colonnes si spécifiées
            if (options.columns && options.columns.some(col => col.width)) {
                ws['!cols'] = options.columns.map(col => ({
                    wch: col.width || 15
                }));
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Télécharger le fichier
            const timestamp = new Date().toISOString().slice(0, 10);
            const fullFilename = `${filename}_${timestamp}.xlsx`;
            
            XLSX.writeFile(wb, fullFilename);

            toast.success(`✅ Export Excel réussi : ${fullFilename}`);

            if (options.onSuccess) {
                options.onSuccess(fullFilename);
            }

        } catch (error) {
            console.error('Erreur export Excel:', error);
            toast.error('❌ Erreur lors de l\'export Excel');

            if (options.onError) {
                options.onError(error);
            }
        } finally {
            setIsExporting(false);
        }
    }, []);

    /**
     * Exporte des données vers CSV
     * 
     * @param {Array} data - Données à exporter
     * @param {string} filename - Nom du fichier (sans extension)
     * @param {object} options - Options d'export
     */
    const exportToCSV = useCallback(async (
        data,
        filename = 'export',
        options = {}
    ) => {
        if (!data || data.length === 0) {
            toast.warning('⚠️ Aucune donnée à exporter');
            return;
        }

        setIsExporting(true);

        try {
            // Préparer les données
            let exportData = data;

            if (options.columns && options.columns.length > 0) {
                exportData = data.map(row => {
                    const formattedRow = {};
                    options.columns.forEach(col => {
                        const value = row[col.key];
                        if (col.format && typeof col.format === 'function') {
                            formattedRow[col.label || col.key] = col.format(value);
                        } else {
                            formattedRow[col.label || col.key] = value;
                        }
                    });
                    return formattedRow;
                });
            }

            // Créer le CSV
            const ws = XLSX.utils.json_to_sheet(exportData);
            const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' }); // Point-virgule pour Excel FR

            // Créer le blob et télécharger
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const timestamp = new Date().toISOString().slice(0, 10);
            const fullFilename = `${filename}_${timestamp}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', fullFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`✅ Export CSV réussi : ${fullFilename}`);

            if (options.onSuccess) {
                options.onSuccess(fullFilename);
            }

        } catch (error) {
            console.error('Erreur export CSV:', error);
            toast.error('❌ Erreur lors de l\'export CSV');

            if (options.onError) {
                options.onError(error);
            }
        } finally {
            setIsExporting(false);
        }
    }, []);

    /**
     * Exporte plusieurs feuilles dans un seul Excel
     * 
     * @param {Array} sheets - [{name, data, columns}]
     * @param {string} filename - Nom du fichier
     */
    const exportMultiSheet = useCallback(async (sheets, filename = 'export') => {
        if (!sheets || sheets.length === 0) {
            toast.warning('⚠️ Aucune feuille à exporter');
            return;
        }

        setIsExporting(true);

        try {
            const wb = XLSX.utils.book_new();

            sheets.forEach(sheet => {
                if (!sheet.data || sheet.data.length === 0) return;

                let exportData = sheet.data;

                // Appliquer colonnes personnalisées si présentes
                if (sheet.columns && sheet.columns.length > 0) {
                    exportData = sheet.data.map(row => {
                        const formattedRow = {};
                        sheet.columns.forEach(col => {
                            const value = row[col.key];
                            if (col.format && typeof col.format === 'function') {
                                formattedRow[col.label || col.key] = col.format(value);
                            } else {
                                formattedRow[col.label || col.key] = value;
                            }
                        });
                        return formattedRow;
                    });
                }

                const ws = XLSX.utils.json_to_sheet(exportData);

                // Largeurs de colonnes
                if (sheet.columns && sheet.columns.some(col => col.width)) {
                    ws['!cols'] = sheet.columns.map(col => ({
                        wch: col.width || 15
                    }));
                }

                XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet');
            });

            const timestamp = new Date().toISOString().slice(0, 10);
            const fullFilename = `${filename}_${timestamp}.xlsx`;

            XLSX.writeFile(wb, fullFilename);

            toast.success(`✅ Export multi-feuilles réussi : ${fullFilename}`);

        } catch (error) {
            console.error('Erreur export multi-sheet:', error);
            toast.error('❌ Erreur lors de l\'export');
        } finally {
            setIsExporting(false);
        }
    }, []);

    return {
        exportToExcel,
        exportToCSV,
        exportMultiSheet,
        isExporting
    };
}