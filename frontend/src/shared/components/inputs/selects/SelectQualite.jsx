// src/shared/components/inputs/selects/SelectQualite.jsx
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function SelectQualite({ value, onChange, label = 'filters.qualite.label', sx = {}, fullWidth = true }) {
    const { t } = useTranslation();

    const options = [
        { value: 'OE', label: t('filters.qualite.oe') },
        { value: 'OEM', label: t('filters.qualite.oem') },
        { value: 'PMQ', label: t('filters.qualite.pmq') },
        { value: 'PMV', label: t('filters.qualite.pmv') },
    ];

    return (
        <FormControl fullWidth={fullWidth} sx={sx} size="small">
            <InputLabel>{t(label)}</InputLabel>
            <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} label={t(label)}>
                <MenuItem value="">{t('filters.qualite.all')}</MenuItem>
                {options.map((q) => (
                    <MenuItem key={q.value} value={q.value}>
                        {q.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
