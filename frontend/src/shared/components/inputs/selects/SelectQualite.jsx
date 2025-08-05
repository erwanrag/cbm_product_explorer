// src/shared/components/inputs/selects/SelectQualite.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from '@/store/contexts/LanguageContext';

export default function SelectQualite({
    value,
    onChange,
    label, // ← Paramètre normal, pas défaut bizarre
    sx = {},
    fullWidth = true,
    size = "small"
}) {
    const { t } = useTranslation();

    // Label par défaut ou passé en props
    const displayLabel = label || t('filters.qualite.label', 'Qualité');

    const options = [
        { value: 'OE', label: t('filters.qualite.oe', 'OE - Origine') },
        { value: 'OEM', label: t('filters.qualite.oem', 'OEM - Équipementier') },
        { value: 'PMQ', label: t('filters.qualite.pmq', 'PMQ - Qualité Pro') },
        { value: 'PMV', label: t('filters.qualite.pmv', 'PMV - Dév. Interne') },
    ];

    return (
        <FormControl fullWidth={fullWidth} sx={sx} size={size}>
            <InputLabel>{displayLabel}</InputLabel>
            <Select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                label={displayLabel}
            >
                <MenuItem value="">
                    {t('filters.qualite.all', '(Toutes)')}
                </MenuItem>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
