// frontend/src/features/matrix/utils/exportUtils.js

/**
 * Utilitaires pour l'export de données matricielles
 */

/**
 * Convertit les données matricielles en CSV
 */
export const exportToCSV = (exportData, filename = 'matrice_correspondances') => {
    const { rows, metadata } = exportData;

    if (!rows.length) {
        console.warn('Aucune donnée à exporter');
        return;
    }

    // Création du CSV
    const headers = Object.keys(rows[0]);
    const csvContent = [
        // En-tête
        headers.join(','),
        // Données
        ...rows.map(row =>
            headers.map(header => {
                const value = row[header];
                // Échapper les guillemets et virgules
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    // Ajout des métadonnées en commentaire
    const metadataComment = [
        `# Export généré le ${new Date().toLocaleString('fr-FR')}`,
        `# Produits: ${metadata.totalProducts}`,
        `# Colonnes: ${metadata.totalColumns}`,
        `# Correspondances: ${metadata.totalCorrespondences}`,
        ''
    ].join('\n');

    const finalContent = metadataComment + csvContent;

    // Téléchargement
    downloadFile(finalContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Convertit les données matricielles en Excel (simulation)
 * Note: Pour un vrai export Excel, il faudrait utiliser une lib comme xlsx
 */
export const exportToExcel = (exportData, filename = 'matrice_correspondances') => {
    // Pour l'instant, on exporte en CSV avec extension .xlsx
    // Dans une vraie implémentation, utiliser la lib xlsx
    const { rows, metadata } = exportData;

    if (!rows.length) {
        console.warn('Aucune donnée à exporter');
        return;
    }

    // Simulation d'export Excel via CSV
    // TODO: Remplacer par une vraie lib Excel comme 'xlsx'
    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join('\t'), // Tabulations pour Excel
        ...rows.map(row =>
            headers.map(header => row[header] ?? '').join('\t')
        )
    ].join('\n');

    downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.ms-excel;charset=utf-8;');
};

/**
 * Export JSON pour debug ou intégration
 */
export const exportToJSON = (exportData, filename = 'matrice_correspondances') => {
    const content = JSON.stringify(exportData, null, 2);
    downloadFile(content, `${filename}.json`, 'application/json;charset=utf-8;');
};

/**
 * Génère un rapport de synthèse
 */
export const exportSummaryReport = (data, filters, filename = 'rapport_matrice') => {
    const { products, columnRefs, correspondences } = data;

    // Calcul des statistiques
    const stats = {
        totalProducts: products.length,
        totalColumns: columnRefs.length,
        totalCorrespondences: correspondences.length,
        matchRate: products.length && columnRefs.length
            ? ((correspondences.length / (products.length * columnRefs.length)) * 100).toFixed(2)
            : 0,
        qualityBreakdown: {},
        columnTypeBreakdown: {}
    };

    // Répartition par qualité
    products.forEach(product => {
        const qualite = product.qualite || 'Inconnue';
        stats.qualityBreakdown[qualite] = (stats.qualityBreakdown[qualite] || 0) + 1;
    });

    // Répartition par type de colonne
    columnRefs.forEach(col => {
        stats.columnTypeBreakdown[col.type] = (stats.columnTypeBreakdown[col.type] || 0) + 1;
    });

    // Construction du rapport
    const reportLines = [
        '# RAPPORT DE SYNTHÈSE - MATRICE DE CORRESPONDANCES',
        `# Généré le ${new Date().toLocaleString('fr-FR')}`,
        '',
        '## STATISTIQUES GLOBALES',
        `Nombre de produits: ${stats.totalProducts}`,
        `Nombre de références: ${stats.totalColumns}`,
        `Nombre de correspondances: ${stats.totalCorrespondences}`,
        `Taux de correspondance: ${stats.matchRate}%`,
        '',
        '## RÉPARTITION PAR QUALITÉ',
        ...Object.entries(stats.qualityBreakdown).map(([qualite, count]) =>
            `${qualite}: ${count} produits (${((count / stats.totalProducts) * 100).toFixed(1)}%)`
        ),
        '',
        '## RÉPARTITION DES RÉFÉRENCES',
        ...Object.entries(stats.columnTypeBreakdown).map(([type, count]) => {
            const label = type === 'crn_only' ? 'CRN uniquement' :
                type === 'ext_only' ? 'EXT uniquement' :
                    type === 'both' ? 'CRN + EXT' : type;
            return `${label}: ${count} références`;
        }),
        ''
    ];

    // Ajout des filtres appliqués
    if (filters && Object.values(filters).some(v => v !== null && v !== '')) {
        reportLines.push('## FILTRES APPLIQUÉS');
        if (filters.qualite) reportLines.push(`Qualité: ${filters.qualite}`);
        if (filters.famille) reportLines.push(`Famille: ${filters.famille}`);
        if (filters.statut !== null) reportLines.push(`Statut: ${filters.statut}`);
        if (filters.search_term) reportLines.push(`Recherche: "${filters.search_term}"`);
        reportLines.push('');
    }

    // Top 10 des produits les mieux référencés
    const topProducts = products.map(product => {
        const matches = correspondences.filter(c => c.cod_pro === product.cod_pro);
        return { ...product, matchCount: matches.length };
    }).sort((a, b) => b.matchCount - a.matchCount).slice(0, 10);

    if (topProducts.length) {
        reportLines.push('## TOP 10 - PRODUITS LES MIEUX RÉFÉRENCÉS');
        topProducts.forEach((product, index) => {
            reportLines.push(`${index + 1}. ${product.cod_pro} (${product.ref_int}) - ${product.matchCount} correspondances`);
        });
        reportLines.push('');
    }

    const reportContent = reportLines.join('\n');
    downloadFile(reportContent, `${filename}.txt`, 'text/plain;charset=utf-8;');
};

/**
 * Fonction utilitaire pour télécharger un fichier
 */
const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Nettoyage de l'URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Gestionnaire principal d'export
 */
export const handleMatrixExport = (data, filters) => {
    return {
        csv: (filename) => exportToCSV({ rows: data.rows, metadata: data.metadata }, filename),
        excel: (filename) => exportToExcel({ rows: data.rows, metadata: data.metadata }, filename),
        json: (filename) => exportToJSON({ ...data, filters }, filename),
        summary: (filename) => exportSummaryReport(data, filters, filename)
    };
};

/**
 * Validation des données avant export
 */
export const validateExportData = (data) => {
    const errors = [];

    if (!data) {
        errors.push('Aucune donnée fournie');
        return errors;
    }

    if (!data.products || !Array.isArray(data.products)) {
        errors.push('Liste des produits manquante ou invalide');
    }

    if (!data.columnRefs || !Array.isArray(data.columnRefs)) {
        errors.push('Liste des références colonnes manquante ou invalide');
    }

    if (!data.correspondences || !Array.isArray(data.correspondences)) {
        errors.push('Liste des correspondances manquante ou invalide');
    }

    if (data.products && data.products.length === 0) {
        errors.push('Aucun produit à exporter');
    }

    return errors;
};

/**
 * Formateur de nom de fichier avec timestamp
 */
export const generateExportFilename = (baseName, extension = '') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    return `${baseName}_${timestamp}${ext}`;
};