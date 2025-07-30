// ===================================
// 📁 frontend/src/shared/components/ui/ErrorBoundary.jsx - CRÉER
// ===================================

import React from 'react';
import { Box, Typography, Button, Alert, Container } from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';

/**
 * Error Boundary pour capturer les erreurs React
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log l'erreur
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Envoyer vers service d'erreur si configuré
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRefresh = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="error">
                            {this.props.fallback}
                        </Typography>
                        <Button onClick={this.handleRefresh} sx={{ mt: 2 }}>
                            Réessayer
                        </Button>
                    </Box>
                );
            }

            return (
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Box textAlign="center">
                        <Typography variant="h4" color="error" gutterBottom>
                            Une erreur s'est produite
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Nous nous excusons pour ce désagrément. L'équipe technique a été notifiée.
                        </Typography>

                        {this.props.showDetails && this.state.error && (
                            <Alert severity="error" sx={{ mb: 4, textAlign: 'left' }}>
                                <Typography variant="body2" component="pre" sx={{ overflow: 'auto' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={this.handleRefresh}
                            >
                                Recharger la page
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<Home />}
                                onClick={this.handleGoHome}
                            >
                                Retour à l'accueil
                            </Button>
                        </Box>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;