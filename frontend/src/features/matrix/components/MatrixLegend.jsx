import React from 'react';
import { Paper, Typography, Box, Chip, Stack } from '@mui/material';
import { 
    COLUMN_COLORS, 
    COLUMN_TYPES,
    getColumnTypeLabel 
} from '@/features/matrix/constants/matrixConstants'; // ✅ IMPORT

export default function MatrixLegend({ compact = false, sx = {} }) {
    const columnLegendItems = [
        {
            color: COLUMN_COLORS.CRN_ONLY, // ✅ CONSTANTE
            label: 'CRN seul',
            type: COLUMN_TYPES.CRN_ONLY,
        },
        {
            color: COLUMN_COLORS.BOTH, // ✅ CONSTANTE
            label: 'CRN + EXT',
            type: COLUMN_TYPES.BOTH,
        },
        {
            color: COLUMN_COLORS.EXT_ONLY, // ✅ CONSTANTE
            label: 'EXT seul',
            type: COLUMN_TYPES.EXT_ONLY,
        }
    ];

    if (compact) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    bgcolor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    ...sx
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Légende:
                    </Typography>
                    {columnLegendItems.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    bgcolor: item.color,
                                    borderRadius: 0.5,
                                    border: '1px solid #ddd'
                                }}
                            />
                            <Typography variant="caption">
                                {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper elevation={1} sx={{ p: 2, ...sx }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📍 Légende de la Matrice
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
                {columnLegendItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                bgcolor: item.color,
                                borderRadius: 1,
                                border: '1px solid #ddd'
                            }}
                        />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {getColumnTypeLabel(item.type)} {/* ✅ CONSTANTE */}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}