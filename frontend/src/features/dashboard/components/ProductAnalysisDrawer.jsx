// frontend/src/features/dashboard/components/ProductAnalysisDrawer.jsx
import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Panneaux spécialisés
import ProductOverviewPanel from './analysis/ProductOverviewPanel';
import ProductSalesPanel from './analysis/ProductSalesPanel';
import ProductStockPanel from './analysis/ProductStockPanel';
import ProductOptimizationPanel from './analysis/ProductOptimizationPanel';

/**
 * Drawer d'analyse produit - Composant focalisé
 * Responsabilité: Navigation entre les différents panneaux d'analyse
 */
export default function ProductAnalysisDrawer({ product, onClose, viewMode }) {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { label: 'Vue d\'ensemble', key: 'overview' },
        { label: 'Ventes', key: 'sales' },
        { label: 'Stock', key: 'stock' },
        { label: 'Optimisation', key: 'optimization' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ProductOverviewPanel product={product} />;
            case 1:
                return <ProductSalesPanel product={product} />;
            case 2:
                return <ProductStockPanel product={product} />;
            case 3:
                return <ProductOptimizationPanel product={product} />;
            default:
                return <ProductOverviewPanel product={product} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                <Drawer
                    anchor="right"
                    open={Boolean(product)}
                    onClose={onClose}
                    sx={{ zIndex: 1300 }}
                    PaperProps={{
                        sx: { width: { xs: '100vw', md: 600 }, maxWidth: '100vw' }
                    }}
                >
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{
                            p: 2,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: '#f8f9fa'
                        }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Analyse Produit {product?.cod_pro}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product?.refint} • {product?.qualite}
                                </Typography>
                            </Box>
                            <IconButton onClick={onClose} size="small">
                                <Close />
                            </IconButton>
                        </Box>

                        {/* Tabs Navigation */}
                        <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {tabs.map((tab, index) => (
                                    <Tab
                                        key={tab.key}
                                        label={tab.label}
                                        sx={{ minWidth: 120 }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </Box>
                    </Box>
                </Drawer>
            </motion.div>
        </AnimatePresence>
    );
}