// ===================================
// 📁 frontend/src/shared/components/buttons/CBMButton.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Bouton CBM enterprise avec variants et loading
 */
export default function CBMButton({
    children,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    onClick,
    fullWidth = false,
    ...props
}) {
    // Variants CBM spécifiques
    const getVariantProps = () => {
        switch (variant) {
            case 'primary':
                return {
                    variant: 'contained',
                    color: 'primary',
                    sx: {
                        background: 'linear-gradient(135deg, #1b365d 0%, #005b96 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #005b96 0%, #1b365d 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(27, 54, 93, 0.3)'
                        }
                    }
                };
            case 'secondary':
                return {
                    variant: 'outlined',
                    color: 'primary',
                    sx: {
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-1px)'
                        }
                    }
                };
            case 'success':
                return {
                    variant: 'contained',
                    sx: {
                        bgcolor: '#27ae60',
                        '&:hover': {
                            bgcolor: '#2e7d32',
                            transform: 'translateY(-1px)'
                        }
                    }
                };
            case 'danger':
                return {
                    variant: 'contained',
                    color: 'error',
                    sx: {
                        '&:hover': {
                            transform: 'translateY(-1px)'
                        }
                    }
                };
            default:
                return { variant: 'contained' };
        }
    };

    const variantProps = getVariantProps();

    return (
        <motion.div
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        >
            <Button
                {...variantProps}
                size={size}
                disabled={disabled || loading}
                onClick={loading ? undefined : onClick}
                fullWidth={fullWidth}
                startIcon={loading ? null : icon}
                sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    minHeight: size === 'large' ? 48 : size === 'small' ? 32 : 40,
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    ...variantProps.sx
                }}
                {...props}
            >
                {loading && (
                    <CircularProgress
                        size={16}
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            marginLeft: '-8px',
                            marginTop: '-8px',
                            color: 'inherit'
                        }}
                    />
                )}
                <Box
                    sx={{
                        opacity: loading ? 0 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    {children}
                </Box>
            </Button>
        </motion.div>
    );
}
