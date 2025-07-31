// frontend/src/features/matrix/constants/matrixConstants.js

/**
 * Constantes spécifiques à la vue matricielle
 */

// Qualités produits (aligné avec backend)
export const QUALITES = {
    OEM: 'OEM',
    PMQ: 'PMQ',
    PMV: 'PMV',
    OE: 'OE'
};

export const QUALITE_OPTIONS = [
    { value: '', label: 'Toutes les qualités' },
    { value: 'OEM', label: 'OEM - Original Equipment Manufacturer' },
    { value: 'PMQ', label: 'PMQ - Pièce Marché Qualité' },
    { value: 'PMV', label: 'PMV - Pièce Marché Véhicule' },
    { value: 'OE', label: 'OE - Origine Équipementier' }
];

// Statuts produits (aligné avec backend constants.py)
export const STATUTS = {
    RAS: 0,                    // RAS (normal)
    INTERDIT_ACHAT: 1,        // Interdit Achat
    INTERDIT_VENTE: 2,        // Interdit Vente
    INTERDIT_ACHAT_VENTE: 8   // Interdit Achat/Vente
};

export const STATUT_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 0, label: '0 - RAS (Actif)' },
    { value: 1, label: '1 - Interdit Achat' },
    { value: 2, label: '2 - Interdit Vente' },
    { value: 8, label: '8 - Interdit Achat/Vente' }
];

// Couleurs colonnes matrice
export const COLUMN_COLORS = {
    CRN_ONLY: '#bbdefb',      // Bleu clair - CRN uniquement
    EXT_ONLY: '#ffcc80',      // Orange clair - EXT uniquement  
    BOTH: '#c8e6c9'           // Vert clair - CRN + EXT
};

// Couleurs cellules matrice
export const CELL_COLORS = {
    NO_MATCH: '#ffcdd2',      // Rouge clair - Pas de correspondance
    CRN_MATCH: '#a5d6a7',     // Vert - Match CRN
    EXT_MATCH: '#90caf9',     // Bleu - Match EXT
    BOTH_MATCH: '#d1c4e9'     // Violet - Match CRN + EXT
};

// Types de colonnes
export const COLUMN_TYPES = {
    CRN_ONLY: 'crn_only',
    EXT_ONLY: 'ext_only',
    BOTH: 'both'
};

// Types de correspondances
export const MATCH_TYPES = {
    NONE: 'none',
    CRN: 'crn',
    EXT: 'ext',
    BOTH: 'both'
};

// Configuration DataGrid
export const MATRIX_CONFIG = {
    DEFAULT_PAGE_SIZE: 25,
    PAGE_SIZE_OPTIONS: [25, 50, 100],
    MAX_COLUMNS_BEFORE_VIRTUALIZATION: 50,
    FIXED_COLUMN_WIDTH: {
        COD_PRO: 130,
        REF_INT: 180,
        DESIGNATION: 250,
        QUALITE: 100,
        STOCK: 100
    },
    DYNAMIC_COLUMN_WIDTH: 140
};

// Messages d'aide
export const HELP_MESSAGES = {
    COLUMN_HEADER: {
        CRN_ONLY: 'Référence présente uniquement dans les données constructeur',
        EXT_ONLY: 'Référence présente uniquement dans les données externes/GRC',
        BOTH: 'Référence présente dans constructeur ET externe'
    },
    CELL_TOOLTIP: {
        NO_MATCH: 'Aucune correspondance trouvée',
        CRN_MATCH: 'Correspondance via référence constructeur',
        EXT_MATCH: 'Correspondance via référence externe',
        BOTH_MATCH: 'Correspondance constructeur + externe'
    }
};

// Filtres par défaut
export const DEFAULT_FILTERS = {
    qualite: null,
    famille: null,
    statut: null,
    search_term: null
};

// Export des fonctions utilitaires
export const getColumnColor = (type) => {
    switch (type) {
        case COLUMN_TYPES.CRN_ONLY:
            return COLUMN_COLORS.CRN_ONLY;
        case COLUMN_TYPES.EXT_ONLY:
            return COLUMN_COLORS.EXT_ONLY;
        case COLUMN_TYPES.BOTH:
            return COLUMN_COLORS.BOTH;
        default:
            return '#f5f5f5';
    }
};

export const getCellColor = (matchType) => {
    switch (matchType) {
        case MATCH_TYPES.CRN:
            return CELL_COLORS.CRN_MATCH;
        case MATCH_TYPES.EXT:
            return CELL_COLORS.EXT_MATCH;
        case MATCH_TYPES.BOTH:
            return CELL_COLORS.BOTH_MATCH;
        case MATCH_TYPES.NONE:
        default:
            return CELL_COLORS.NO_MATCH;
    }
};

export const getColumnTypeLabel = (type) => {
    return HELP_MESSAGES.COLUMN_HEADER[type.toUpperCase()] || 'Type inconnu';
};

export const getCellTooltip = (matchType) => {
    return HELP_MESSAGES.CELL_TOOLTIP[matchType.toUpperCase()] || 'Correspondance inconnue';
};