// ===================================
// 📁 2. src/features/help/pages/HelpPage.jsx - VERSION FINALE SIMPLE
// ===================================

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    HelpOutline,
    CheckCircleOutline,
    Email,
    ContentCopy,
    CheckCircle
} from '@mui/icons-material';
import { useTranslation } from '@/store/contexts/LanguageContext';

const HelpPage = () => {
    const { t, language } = useTranslation();
    const [emailCopied, setEmailCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText('e.ragueneau@cbmcompany.com');
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch (error) {
            console.warn('Impossible de copier l\'email');
        }
    };

    // 🔥 TRADUCTIONS COMPLÈTES selon la langue
    const getFeatures = () => {
        if (language === 'en') {
            return [
                '🔎 Search by cod_pro, ref_crn, refint, ref_ext',
                '🧩 Smart grouping via grouping_crn',
                '📊 Full dashboard: KPIs, stock, history, turnover',
                '📥 Excel export, combined filters',
                '⚡ Fast resolution using Grouping_crn_table (no more slow stored procedures)'
            ];
        }
        // Français par défaut
        return [
            '🔎 Recherche par cod_pro, ref_crn, refint, ref_ext',
            '🧩 Regroupement intelligent via grouping_crn',
            '📊 Dashboard complet : KPI, stock, historique, CA',
            '📥 Export Excel, filtres combinés',
            '⚡ Résolution rapide via Grouping_crn_table (plus de procédure lente)'
        ];
    };

    const getFilters = () => {
        if (language === 'en') {
            return {
                'cod_pro': 'cod_pro: Unique CBM product code',
                'ref_crn': 'ref_crn: Manufacturer reference',
                'ref_ext': 'ref_ext: External (or GRC) reference',
                'refint': 'refint: Internal CBM reference',
                'qualite': 'qualite: Product quality (OE, OEM, PMQ, PMV)',
                'grouping_crn': 'grouping_crn: Enables logical grouping by product family'
            };
        }
        // Français par défaut
        return {
            'cod_pro': 'cod_pro : Code produit CBM unique',
            'ref_crn': 'ref_crn : Référence constructeur d\'origine',
            'ref_ext': 'ref_ext : Référence externe client ou GRC',
            'refint': 'refint : Référence interne CBM',
            'qualite': 'qualite : Qualité produit (OE, OEM, PMQ, PMV)',
            'grouping_crn': 'grouping_crn : Active le regroupement logique par famille de produits'
        };
    };

    const getGroupingTexts = () => {
        if (language === 'en') {
            return {
                text1: 'The grouping_crn field is a logical key that links multiple CBM products (cod_pro) together, even if they don\'t directly share the same ref_crn, as long as they are connected via transitive links.',
                text2: 'Example: product A is linked to ref_crn X, product B to X and Y, and product C to Y → A, B and C are grouped under the same grouping_crn.',
                text3: 'This grouping is automatically computed from Bridge_cod_pro_ref_crn and propagated into Grouping_crn_table (with quality, refint, and ref_ext included).',
                example: 'Example:',
                calculation: 'Automatic calculation:'
            };
        }
        // Français par défaut
        return {
            text1: 'Le champ grouping_crn est une clé de regroupement logique qui permet d\'associer plusieurs produits CBM (cod_pro) entre eux, même s\'ils ne partagent pas directement une même référence constructeur (ref_crn), mais sont liés par transitivité via des références communes.',
            text2: 'si le produit A est lié à la ref_crn X, le produit B est lié à X et Y, et le produit C est lié à Y, alors A, B et C sont regroupés dans le même grouping_crn.',
            text3: 'Ce regroupement est calculé automatiquement à partir de la table Bridge_cod_pro_ref_crn et propagé dans Grouping_crn_table (qualité, refint, ref_ext inclus).',
            example: 'Exemple :',
            calculation: 'Calcul automatique :'
        };
    };

    const features = getFeatures();
    const filters = getFilters();
    const groupingTexts = getGroupingTexts();

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <HelpOutline sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {t('help.title', 'Aide & Documentation')}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {t('help.subtitle', 'Guide complet d\'utilisation de CBM GRC Matcher')}
                    </Typography>
                </Box>
            </Box>

            {/* Section Objectif */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('help.purpose.title', '🧭 À quoi sert CBM GRC Matcher ?')}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {language === 'en'
                        ? 'CBM GRC Matcher is a product analysis and matching tool based on various keys (manufacturer, internal and external references). It allows grouping, filtering and comparing products by quality, CRN group, and sales or stock history.'
                        : 'CBM GRC Matcher est un outil d\'analyse et de correspondance des produits CBM à partir de différentes clés (références constructeur, internes, externes). Il permet de regrouper, filtrer, comparer les produits selon leur qualité, leur groupe CRN, et leur historique de ventes et de stock.'
                    }
                </Typography>
            </Paper>

            {/* Section Fonctionnalités */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('help.features.title', '📌 Fonctionnalités principales')}
                </Typography>
                <List dense>
                    {features.map((feature, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleOutline fontSize="small" sx={{ color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Section Filtres */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('help.filters.title', '🧪 Filtres disponibles')}
                </Typography>
                <List dense>
                    {Object.entries(filters).map(([key, definition]) => (
                        <ListItem key={key} sx={{ pl: 0, alignItems: 'flex-start' }}>
                            <ListItemText
                                primary={
                                    <Typography component="span" sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        bgcolor: 'grey.100',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: '0.875rem'
                                    }}>
                                        {key}
                                    </Typography>
                                }
                                secondary={definition}
                                secondaryTypographyProps={{
                                    sx: { mt: 1, lineHeight: 1.5 }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Section Grouping CRN */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.50' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('help.grouping.title', '🧩 Comprendre le regroupement grouping_crn')}
                </Typography>
                <Typography color="text.secondary" paragraph sx={{ lineHeight: 1.7 }}>
                    {groupingTexts.text1}
                </Typography>
                <Typography color="text.secondary" paragraph sx={{ lineHeight: 1.7 }}>
                    <strong>{groupingTexts.example}</strong> {groupingTexts.text2}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <strong>{groupingTexts.calculation}</strong> {groupingTexts.text3}
                </Typography>
            </Paper>

            {/* Contact */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
            }}>
                <Email sx={{ color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                    {t('help.contact', 'Pour tout problème technique, contactez : e.ragueneau@cbmcompany.com')}
                </Typography>
                <Tooltip title={emailCopied ? (language === 'en' ? 'Email copied!' : 'Email copié !') : (language === 'en' ? 'Copy email' : 'Copier l\'email')}>
                    <IconButton size="small" onClick={handleCopyEmail}>
                        {emailCopied ? (
                            <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                        ) : (
                            <ContentCopy fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>
        </Container>
    );
};

export default HelpPage;
