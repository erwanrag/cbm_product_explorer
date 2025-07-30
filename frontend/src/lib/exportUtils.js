// ===================================
// 📁 frontend/src/lib/exportUtils.js - REMPLACER VOTRE EXISTANT
// ===================================

import dayjs from 'dayjs';
import { DISPLAY_FORMATS } from '@/constants/business';

/**
 * Exporte des données en CSV formaté CBM
 */
export function exportToCSV(data, filename = 'export_cbm', columns = null, options = {}) {
    if (!data || data.length === 0) {
        console.warn('Aucune donnée à exporter');
        return;
    }

    const {
        separator = ';', // Séparateur français pour Excel
        includeHeader = true,
        dateFormat = DISPLAY_FORMATS.DATE
    } = options;

    const cols = columns || Object.keys(data[0]);

    // En-tête
    const csvHeader = includeHeader ? cols.join(separator) : '';

    // Lignes avec formatage CBM
    const csvRows = data.map(row =>
        cols.map(col => {
            let value = row[col];

            // Formatage dates
            if (value instanceof Date || (typeof value === 'string' && dayjs(value).isValid())) {
                value = dayjs(value).format(dateFormat);
            }

            // Formatage nombres CBM
            if (typeof value === 'number') {
                if (col.includes('prix') || col.includes('ca_') || col.includes('stock_valorise')) {
                    value = value.toFixed(2);
                } else if (col.includes('percent') || col.includes('marge')) {
                    value = `${value.toFixed(1)}%`;
                }
            }

            // Échapper pour CSV
            if (typeof value === 'string' && (value.includes(separator) || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }

            return value ?? '';
        }).join(separator)
    );

    // Assembler avec BOM pour Excel français
    const csvContent = includeHeader
        ? [csvHeader, ...csvRows].join('\n')
        : csvRows.join('\n');

    const BOM = '\uFEFF';
    downloadFile(BOM + csvContent, `${filename}_${getTimestamp()}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Exporte en JSON
 */
export function exportToJSON(data, filename = 'export_cbm', options = {}) {
    const { indent = 2 } = options;
    const jsonContent = JSON.stringify(data, null, indent);
    downloadFile(jsonContent, `${filename}_${getTimestamp()}.json`, 'application/json');
}

/**
 * Exporte un rapport HTML CBM
 */
export function exportToHTML(reportData, filename = 'rapport_cbm') {
    const { title = 'Rapport CBM GRC Matcher', data, summary } = reportData;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { border-bottom: 3px solid #1976d2; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { color: #1976d2; margin: 0; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #1976d2; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .export-date { color: #666; font-size: 0.9em; margin-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p class="export-date">Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}</p>
    </div>
    
    ${summary ? `<div class="summary"><h2>Résumé Exécutif</h2><p>${summary}</p></div>` : ''}
    
    ${data && Array.isArray(data) && data.length > 0 ? `
        <h2>Données (${data.length} lignes)</h2>
        <table>
            <thead>
                <tr>${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.map(row => `<tr>${Object.values(row).map(val => `<td>${val ?? 'N/A'}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>
    ` : '<p>Aucune donnée à afficher</p>'}
    
    <div class="footer">
        <p>Rapport généré par CBM GRC Matcher</p>
    </div>
</body>
</html>`;

    downloadFile(htmlContent, `${filename}_${getTimestamp()}.html`, 'text/html');
}

/**
 * Télécharge un fichier
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Génère un timestamp pour fichiers
 */
function getTimestamp() {
    return dayjs().format('YYYYMMDD_HHmmss');
}
