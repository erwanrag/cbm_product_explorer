// ===================================
// 📁 frontend/src/features/matrix/components/MatrixLegend.jsx - VERSION COMPACTE
// ===================================

import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Stack
} from '@mui/material';

/**
 * Légende compacte pour la vue matricielle
 */
export default function MatrixLegend({ compact = false, sx = {} }) {
    const columnLegendItems = [
        {
            color: '#bbdefb',
            label: 'CRN seul',
            description: 'Référence constructeur uniquement'
        },
        {
            color: '#c8e6c9',
            label: 'CRN + EXT',
            description: 'Constructeur + Externe'
        },
        {
            color: '#ffcc80',
            label: 'EXT seul',
            description: 'Référence externe uniquement'
        }
    ];

    const cellLegendItems = [
        { color: '#a5d6a7', label: 'Match CRN' },
        { color: '#90caf9', label: 'Match EXT' },
        { color: '#d1c4e9', label: 'Match Double' },
        { color: '#ffcdd2', label: 'Pas de match' }
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Colonnes:
                    </Typography>
                    {columnLegendItems.map((item, index) => (
                        <Chip
                            key={index}
                            label={item.label}
                            size="small"
                            sx={{
                                bgcolor: item.color,
                                color: '#000',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                height: 24
                            }}
                        />
                    ))}

                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, ml: 2 }}>
                        Cellules:
                    </Typography>
                    {cellLegendItems.map((item, index) => (
                        <Chip
                            key={index}
                            label={item.label}
                            size="small"
                            sx={{
                                bgcolor: item.color,
                                color: '#000',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                height: 24
                            }}
                        />
                    ))}
                </Stack>
            </Paper>
        );
    }

    // Version complète (pour les cas où compact=false)
    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                bgcolor: '#fafafa',
                border: '1px solid #e0e0e0',
                ...sx
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                🎨 Légende de la Matrice
            </Typography>

            <Stack spacing={3}>
                {/* Légende des colonnes */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                        Couleurs des colonnes (références)
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {columnLegendItems.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: item.color,
                                        borderRadius: 0.5,
                                        border: '1px solid #ccc'
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    - {item.description}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>

                {/* Légende des cellules */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                        Couleurs des cellules (correspondances)
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {cellLegendItems.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: item.color,
                                        borderRadius: 0.5,
                                        border: '1px solid #ccc'
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}