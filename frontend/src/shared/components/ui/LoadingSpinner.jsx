// ===================================
// 📁 frontend/src/shared/components/ui/LoadingSpinner.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Composant de chargement CBM avec variations
 */
export default function LoadingSpinner({
    message = 'Chargement...',
    size = 40,
    variant = 'default', // 'default', 'skeleton', 'minimal'
    fullScreen = false,
    rows = 5, // Pour variant skeleton
    ...props
}) {
    // Variant skeleton pour tables
    if (variant === 'skeleton') {
        return (
            <Box sx={{ width: '100%', p: 2 }}>
                {Array.from({ length: rows }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rectangular"
                        height={60}
                        sx={{ mb: 1, borderRadius: 1 }}
                    />
                ))}
            </Box>
        );
    }

    // Variant minimal
    if (variant === 'minimal') {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} thickness={4} />
            </Box>
        );
    }

    // Variant par défaut avec animation
    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 3
                }}
                {...props}
            >
                <CircularProgress
                    size={size}
                    thickness={4}
                    sx={{ color: 'primary.main' }}
                />
                {message && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontWeight: 500,
                            textAlign: 'center',
                            maxWidth: 200
                        }}
                    >
                        {message}
                    </Typography>
                )}
            </Box>
        </motion.div>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
}