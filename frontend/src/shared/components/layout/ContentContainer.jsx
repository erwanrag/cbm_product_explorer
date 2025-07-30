/ ===================================
// 📁 frontend/src/shared/layout/ContentContainer.jsx - AMÉLIORÉ
// ===================================

import React from "react";
import { Box, Container } from "@mui/material";
import { LAYOUT } from "@/constants/ui";

/**
 * Container pour le contenu principal - Version améliorée
 */
const ContentContainer = ({ children, maxWidth = "xl", disableGutters = false }) => (
    <Container
        maxWidth={maxWidth}
        disableGutters={disableGutters}
        sx={{
            flexGrow: 1,
            py: 3,
            px: { xs: 2, md: 3 },
            mt: `${LAYOUT.HEADER_HEIGHT}px`,
            minHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT}px)`,
        }}
    >
        {children}
    </Container>
);

export default ContentContainer;
