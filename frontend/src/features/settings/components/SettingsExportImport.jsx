// ===================================
// 📁 frontend/src/features/settings/components/SettingsExportImport.jsx
// ===================================

import React, { useState } from 'react';
import {
    Stack, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Typography
} from '@mui/material';
import { Download, Upload, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';

const SettingsExportImport = ({ settings, onImport, onReset }) => {
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const handleExportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cbm-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowExportDialog(false);
        toast.success('📥 Paramètres exportés');
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    onImport(prev => ({ ...prev, ...importedSettings }));
                    toast.success('📤 Paramètres importés - N\'oubliez pas de sauvegarder !');
                    setShowImportDialog(false);
                } catch (error) {
                    toast.error('❌ Fichier de paramètres invalide');
                }
            };
            reader.readAsText(file);
        }
        // Reset input value pour permettre la sélection du même fichier
        event.target.value = '';
    };

    return (
        <>
            <Stack spacing={1}>
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => setShowExportDialog(true)}
                    fullWidth
                    size="small"
                >
                    Exporter
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => setShowImportDialog(true)}
                    fullWidth
                    size="small"
                >
                    Importer
                </Button>
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Refresh />}
                    onClick={onReset}
                    fullWidth
                    size="small"
                >
                    Réinitialiser
                </Button>
            </Stack>

            {/* Dialog Export */}
            <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
                <DialogTitle>📥 Exporter les paramètres</DialogTitle>
                <DialogContent>
                    <Typography>
                        Vous allez télécharger un fichier JSON contenant tous vos paramètres.
                        Ce fichier peut être utilisé pour restaurer votre configuration sur un autre appareil.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowExportDialog(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleExportSettings} variant="contained">
                        Télécharger
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Import */}
            <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)}>
                <DialogTitle>📤 Importer les paramètres</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Sélectionnez un fichier JSON de paramètres précédemment exporté.
                        Vos paramètres actuels seront remplacés.
                    </Typography>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowImportDialog(false)}>
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SettingsExportImport;