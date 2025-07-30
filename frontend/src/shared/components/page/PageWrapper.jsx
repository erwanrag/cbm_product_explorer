// ===================================
// 📁 frontend/src/shared/components/page/PageWrapper.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Box, Container, Fade } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Wrapper de page CBM avec animations et layout responsive
 */
export default function PageWrapper({
    children,
    maxWidth = 'xl',
    disableGutters = false,
    animate = true,
    sx = {},
    ...props
}) {
    const content = (
        <Container
            maxWidth={maxWidth}
            disableGutters={disableGutters}
            sx={{
                py: 3,
                minHeight: 'calc(100vh - 200px)', // Compenser header + footer
                ...sx
            }}
            {...props}
        >
            {children}
        </Container>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {content}
            </motion.div>
        );
    }

    return (
        <Fade in timeout={300}>
            {content}
        </Fade>
    );
}
