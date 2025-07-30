// ===================================
// 📁 frontend/src/shared/layout/Sidebar.jsx - CORRIGER LES IMPORTS
// ===================================

import React from "react";
import { Drawer, Box, Divider, Typography, Paper } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

// ✅ IMPORTS CORRIGÉS
import { useLayout } from "@/store/hooks/useLayout";
import { LAYOUT } from "@/constants/ui";
import logo from "@/assets/cbm-logo.png";

// Composants layout
import Navigation from "./Navigation";
import FiltersPanel from "./FiltersPanel";

/**
 * Sidebar CBM - Version corrigée avec nouvelle architecture
 */
const Sidebar = () => {
    const {
        isSidebarOpen,
        isSidebarPinned,
        closeSidebar,
        filterType
    } = useLayout();

    return (
        <AnimatePresence>
            {(isSidebarOpen || isSidebarPinned) && (
                <motion.div
                    initial={{ x: -LAYOUT.SIDEBAR_WIDTH, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -LAYOUT.SIDEBAR_WIDTH, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 0.8
                    }}
                >
                    <Drawer
                        variant={isSidebarPinned ? "permanent" : "temporary"}
                        anchor="left"
                        open={true}
                        onClose={closeSidebar}
                        sx={{
                            width: LAYOUT.SIDEBAR_WIDTH,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                                width: LAYOUT.SIDEBAR_WIDTH,
                                boxSizing: "border-box",
                                backgroundColor: "background.paper",
                                borderRight: "1px solid",
                                borderColor: "divider",
                                display: "flex",
                                flexDirection: "column",
                                pt: `${LAYOUT.HEADER_HEIGHT + 16}px`, // Header + padding
                                boxShadow: isSidebarPinned ? 'none' : '4px 0 8px rgba(0,0,0,0.1)'
                            },
                        }}
                    >
                        {/* Logo CBM */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                                mb: 3,
                                px: 2
                            }}
                        >
                            <img
                                src={logo}
                                alt="CBM Logo"
                                style={{
                                    width: "64px",
                                    height: "auto",
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                }}
                            />
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                    textAlign: 'center',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                CBM GRC Matcher
                            </Typography>
                        </Box>

                        {/* Navigation principale */}
                        <Box sx={{ flexGrow: 1, px: 1 }}>
                            <Navigation />
                        </Box>

                        {/* Divider avec style */}
                        <Divider
                            sx={{
                                mx: 2,
                                my: 2,
                                '&::before, &::after': {
                                    borderColor: 'primary.main',
                                    borderWidth: '1px'
                                }
                            }}
                        />

                        {/* Panel de filtres */}
                        <Box sx={{ px: 2, pb: 2 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2
                                }}
                            >
                                <FiltersPanel />
                            </Paper>
                        </Box>
                    </Drawer>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
