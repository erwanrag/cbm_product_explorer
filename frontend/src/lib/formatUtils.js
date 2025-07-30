// ===================================
// 📁 frontend/src/lib/formatUtils.js - REMPLACER VOTRE EXISTANT
// ===================================

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import { DISPLAY_FORMATS } from '@/constants/business';

// Configuration dayjs
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
 * Formate une valeur monétaire CBM
 */
export function formatCurrency(value, currency = DISPLAY_FORMATS.CURRENCY, compact = false) {
  if (value == null || isNaN(value)) return 'N/A';

  if (compact && Math.abs(value) >= 1000) {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K €`;
    }
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(value);
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
export function formatDate(date, format = DISPLAY_FORMATS.DATE) {
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
export function formatPercentage(
  value,
  decimals = DISPLAY_FORMATS.PERCENTAGE_PLACES,
  isDecimal = false
) {
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
