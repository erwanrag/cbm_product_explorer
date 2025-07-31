// src/features/help/pages/HelpPage.jsx
import React from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const HelpPage = () => {
    const { t } = useTranslation();

    const features = t('help.features.list', { returnObjects: true });
    const filters = t('help.filters.list', { returnObjects: true });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HelpOutline sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4">{t('help.title')}</Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('help.purpose.title')}</Typography>
                <Typography color="text.secondary">{t('help.purpose.text')}</Typography>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('help.features.title')}</Typography>
                <List dense>
                    {features.map((f, i) => (
                        <ListItem key={i}><ListItemText primary={f} /></ListItem>
                    ))}
                </List>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('help.filters.title')}</Typography>
                <List dense>
                    {Object.entries(filters).map(([key, label]) => (
                        <ListItem key={key}><ListItemText primary={label} /></ListItem>
                    ))}
                </List>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('help.grouping.title')}</Typography>
                <Typography color="text.secondary" paragraph>{t('help.grouping.text1')}</Typography>
                <Typography color="text.secondary" paragraph>{t('help.grouping.text2')}</Typography>
                <Typography color="text.secondary">{t('help.grouping.text3')}</Typography>
            </Paper>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" align="center">
                {t('help.contact')}
            </Typography>
        </Box>
    );
};

export default HelpPage;
