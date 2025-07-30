// ===================================
// 📁 frontend/src/shared/layout/Layout.jsx - CORRIGER LES IMPORTS
// ===================================

import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useLayout } from "@/store/hooks/useLayout";
import { LayoutProvider } from "@/store/contexts/LayoutContext";
import { LAYOUT } from "@/constants/ui";

// Composants layout
import Sidebar from "./Sidebar";
import Header from "./Header";
import ContentContainer from "./ContentContainer";

/**
 * Layout principal CBM - Version corrigée avec nouvelle architecture
 */
const Layout = () => {
    return (
        <LayoutProvider>
            <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
                {/* Sidebar Navigation */}
                <Box component="nav" aria-label="Navigation principale">
                    <Sidebar />
                </Box>

                {/* Main Content Area */}
                <Box
                    component="main"
                    role="main"
                    id="main-content"
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Header />
                    <ContentContainer>
                        <Outlet />
                    </ContentContainer>
                </Box>
            </Box>

            {/* Toast Notifications */}
            <ToastContainer
                position="bottom-right"
                role="status"
                aria-live="polite"
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
                limit={5}
            />
        </LayoutProvider>
    );
};

export default Layout;
