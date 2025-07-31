// frontend/src/features/matrix/components/MatrixLegend.jsx

import React from 'react';
import {
    Paper,
    Typography,
    Grid,
    Box,
    Chip,
    Divider
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Info
} from '@mui/icons-material';

/**
 * Légende pour la vue matricielle
 */
export default function MatrixLegend({ sx = {} }) {
    const columnLegendItems = [
        {
            color: '#bbdefb',
            label: 'CRN uniquement',
            description: 'Référence présente uniquement dans les données constructeur'
        },
        {
            color: '#c8e6c9',
            label: 'CRN + EXT',
            description: 'Référence présente dans constructeur ET externe'
        },
        {
            color: '#ffcc80',
            label: 'EXT uniquement',
            description: 'Référence présente uniquement dans les données externes/GRC'
        }
    ];

    const cellLegendItems = [
        {
            color: '#a5d6a7',
            icon: <CheckCircle sx={{ fontSize: 16 }} />,
            label: 'Match CRN',
            description: 'Correspondance via référence constructeur'
        },
        {
            color: '#90caf9',
            icon: <CheckCircle sx={{ fontSize: 16 }} />,
            label: 'Match EXT',
            description: 'Correspondance via référence externe'
        },
        {
            color: '#d1c4e9',
            icon: <CheckCircle sx={{ fontSize: 16 }} />,
            label: 'Match Double',
            description: 'Correspondance CRN + EXT'
        },
        {
            color: '#ffcdd2',
            icon: <Cancel sx={{ fontSize: 16 }} />,
            label: 'Pas de match',
            description: 'Aucune correspondance trouvée'
        }
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                bgcolor: '#fafafa',
                border: '1px solid #e0e0e0',
                ...sx
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Info fontSize="small" />
                Légende de la Matrice
            </Typography>

            <Grid container spacing={3}>
                {/* Légende des en-têtes de colonnes */}
                <Grid item xs={12} md={6}>
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                    >
                        🏷️ En-têtes de Colonnes (Références)
                    </Typography>
                    <Grid container spacing={1}>
                        {columnLegendItems.map((item, index) => (
                            <Grid item xs={12} key={index}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        py: 0.5
                                    }}
                                >
                                    <Chip
                                        label="REF"
                                        size="small"
                                        sx={{
                                            bgcolor: item.color,
                                            color: '#000',
                                            fontWeight: 600,
                                            minWidth: 50,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.label}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                    >
                        ✅ Cellules de Correspondance
                    </Typography>
                    <Grid container spacing={1}>
                        {cellLegendItems.map((item, index) => (
                            <Grid item xs={12} key={index}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        py: 0.5
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: item.color,
                                            borderRadius: 1,
                                            p: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: 32,
                                            height: 24
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {item.label}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                💡 <strong>Utilisation :</strong> Cliquez sur une cellule verte/bleue/violette pour voir les détails de correspondance.
                Les colonnes sont triées alphabétiquement et colorées selon leur origine (CRN, EXT, ou les deux).
            </Typography>
        </Paper>
    );
}