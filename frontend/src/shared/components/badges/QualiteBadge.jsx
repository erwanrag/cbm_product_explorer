// ===================================
// 📁 frontend/src/shared/components/ui/badges/QualiteBadge.jsx - NOUVEAU
// ===================================

import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { getQualiteColor, getQualiteLabel } from '@/lib/colors';

/**
 * Badge pour afficher les qualités produit CBM
 */
export default function QualiteBadge({
    qualite,
    size = 'small',
    variant = 'filled',
    showTooltip = true,
    ...props
}) {
    if (!qualite) return null;

    const color = getQualiteColor(qualite);
    const label = getQualiteLabel(qualite);

    const badge = (
        <Chip
            label={label}
            size={size}
            variant={variant}
            sx={{
                bgcolor: variant === 'filled' ? color : 'transparent',
                color: variant === 'filled' ? 'white' : color,
                border: variant === 'outlined' ? `1px solid ${color}` : 'none',
                fontWeight: 600,
                minWidth: 45,
                fontSize: '0.75rem',
                ...props.sx
            }}
            {...props}
        />
    );

    if (showTooltip) {
        const tooltipText = {
            'OE': 'Origine Équipementier',
            'OEM': 'Original Equipment Manufacturer',
            'PMQ': 'Pièce Marché Qualité',
            'PMV': 'Pièce Marché Véhicule'
        }[qualite] || qualite;

        return (
            <Tooltip title={tooltipText} arrow>
                {badge}
            </Tooltip>
        );
    }

    return badge;
}