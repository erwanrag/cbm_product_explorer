// ===================================
// 📁 frontend/src/features/settings/components/DisplaySection.jsx
// ===================================

import React from 'react';
import {
    Typography, Card, CardContent, Grid, FormControl,
    InputLabel, Select, MenuItem, FormControlLabel, Switch,
    Box, Stack
} from '@mui/material';
import { TableView, ViewModule, BarChart } from '@mui/icons-material';

const DisplaySection = ({ settings, onSettingChange }) => {
    return (
        <Stack spacing={3}>
            <Typography variant="h6">👁️ Affichage & Vues</Typography>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showKPICards}
                                        onChange={(e) => onSettingChange('showKPICards', e.target.checked)}
                                    />
                                }
                                label="Afficher les cartes KPI sur le dashboard"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showCharts}
                                        onChange={(e) => onSettingChange('showCharts', e.target.checked)}
                                    />
                                }
                                label="Afficher les graphiques"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Vue par défaut</InputLabel>
                                <Select
                                    value={settings.defaultView}
                                    onChange={(e) => onSettingChange('defaultView', e.target.value)}
                                >
                                    <MenuItem value="table">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TableView fontSize="small" />
                                            Tableau
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="cards">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ViewModule fontSize="small" />
                                            Cartes
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="charts">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BarChart fontSize="small" />
                                            Graphiques
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Format d'export par défaut</InputLabel>
                                <Select
                                    value={settings.exportFormat}
                                    onChange={(e) => onSettingChange('exportFormat', e.target.value)}
                                >
                                    <MenuItem value="excel">📊 Excel (XLSX)</MenuItem>
                                    <MenuItem value="csv">📋 CSV</MenuItem>
                                    <MenuItem value="pdf">📄 PDF</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Format de date</InputLabel>
                                <Select
                                    value={settings.dateFormat}
                                    onChange={(e) => onSettingChange('dateFormat', e.target.value)}
                                >
                                    <MenuItem value="dd/MM/yyyy">🇫🇷 DD/MM/YYYY (31/12/2024)</MenuItem>
                                    <MenuItem value="MM/dd/yyyy">🇺🇸 MM/DD/YYYY (12/31/2024)</MenuItem>
                                    <MenuItem value="yyyy-MM-dd">🌍 YYYY-MM-DD (2024-12-31)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Aperçu des formats */}
            <Card sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                        👀 Aperçu des réglages actuels
                    </Typography>
                    <Typography variant="body2">
                        <strong>Vue:</strong> {settings.defaultView} •
                        <strong> Export:</strong> {settings.exportFormat.toUpperCase()} •
                        <strong> Date:</strong> {new Date().toLocaleDateString('fr-FR',
                            settings.dateFormat === 'dd/MM/yyyy' ? { day: '2-digit', month: '2-digit', year: 'numeric' } :
                                settings.dateFormat === 'MM/dd/yyyy' ? { month: '2-digit', day: '2-digit', year: 'numeric' } :
                                    { year: 'numeric', month: '2-digit', day: '2-digit' }
                        )}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            KPI Cards: {settings.showKPICards ? '✅ Visibles' : '❌ Masquées'} •
                            Graphiques: {settings.showCharts ? '✅ Visibles' : '❌ Masqués'}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default DisplaySection;