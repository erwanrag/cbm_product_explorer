import React, { lazy, Suspense } from 'react';

/**
 * Crée un composant lazy simple (sans Suspense)
 */
export function createLazyComponent(importFn) {
    return lazy(importFn);
}

/**
 * Crée une page lazy avec wrapper Suspense intégré
 */
export function createLazyPage(importFn) {
    const LazyComponent = lazy(importFn);

    return function LazyPageWrapper(props) {
        return (
            <Suspense
                fallback={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '400px',
                            fontSize: '16px',
                        }}
                    >
                        Chargement...
                    </div>
                }
            >
                <LazyComponent {...props} />
            </Suspense>
        );
    };
}

/**
 * Error Boundary pour capturer les erreurs de chargement lazy
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
                    <h3>Erreur de chargement</h3>
                    <p>Impossible de charger cette page. Veuillez réessayer.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Recharger
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Précharge un composant lazy manuellement (facultatif)
 */
export function preloadComponent(importFn) {
    return importFn();
}
