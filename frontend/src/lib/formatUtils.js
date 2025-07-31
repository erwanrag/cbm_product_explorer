// ===================================
// 📁 frontend/src/lib/formatUtils.js - VERSION PROPRE ET COMPLÈTE
// ===================================

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

// Configuration dayjs (une seule fois)
dayjs.extend(relativeTime);
dayjs.locale('fr');

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(value, decimals = 0) {
    if (value == null || isNaN(value)) return 'N/A';

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Formate une valeur monétaire CBM - FONCTION SÉCURISÉE
 */
export function formatCurrency(value, currency = 'EUR', compact = false) {
    // ✅ Vérifications strictes
    if (value == null || isNaN(value)) return 'N/A';

    // ✅ Sécurisation du paramètre currency
    if (typeof currency !== 'string' || currency.length !== 3) {
        currency = 'EUR';
    }

    // ✅ Format compact pour les graphiques
    if (compact && Math.abs(value) >= 1000) {
        if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M€`;
        } else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(0)}k€`;
        }
    }

    // ✅ Try-catch pour éviter les erreurs de format
    try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    } catch (error) {
        console.warn('Format currency error:', error);
        return `${formatNumber(value, 2)} €`;
    }
}

/**
 * Formate un prix CBM (fonction spécifique)
 */
export function formatPrix(value) {
    if (value == null || isNaN(value)) return '-';
    if (value === 0) return '0,00 €';
    return formatCurrency(value);
}

/**
 * Formate une date
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return 'N/A';
    return dayjs(date).format(format);
}

/**
 * Formate une date relative
 */
export function formatRelativeDate(date) {
    if (!date) return 'N/A';
    return dayjs(date).fromNow();
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value, decimals = 1, isDecimal = false) {
    if (value == null || isNaN(value)) return 'N/A';
    const percentage = isDecimal ? value * 100 : value;
    return `${formatNumber(percentage, decimals)}%`;
}

/**
 * Tronque un texte avec ellipses
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Formate une quantité avec unité
 */
export function formatQuantity(value, unit = '') {
    if (value == null || isNaN(value)) return 'N/A';
    return `${formatNumber(value)} ${unit}`.trim();
}

// ✅ FONCTIONS SPÉCIALES POUR LES GRAPHIQUES RECHARTS

/**
 * Formateur pour les axes Y des graphiques (version compacte)
 */
export function formatAxisCurrency(value) {
    if (value == null || isNaN(value)) return '0€';
    return formatCurrency(value, 'EUR', true);
}

/**
 * Formateur pour les tooltips des graphiques
 */
export function formatTooltipCurrency(value, name) {
    return [formatCurrency(value), name];
}

/**
 * Formateur pour les pourcentages dans les graphiques
 */
export function formatAxisPercentage(value) {
    if (value == null || isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
}