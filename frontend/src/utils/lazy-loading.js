//frontend/src/utils/lazy-loading.js

/**
 * Crée un composant lazy simple (pour composants, pas pages)
 * @param {Function} importFn - Fonction d'import dynamique
 * @returns {React.Component} Composant lazy
 */
export function createLazyComponent(importFn) {
  return React.lazy(importFn);
}

/**
 * Error Boundary simple pour le lazy loading
 */
class ErrorBoundary extends React.Component {
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
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#d32f2f',
          }}
        >
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
 * Précharge un composant lazy (utile pour optimiser l'UX)
 * @param {Function} importFn - Fonction d'import dynamique
 */
export function preloadComponent(importFn) {
  const componentImport = importFn();
  return componentImport;
}

/**
 * Hook pour précharger des routes au survol
 * @param {Array} routes - Routes à précharger
 */
export function useRoutePreloading(routes = []) {
  const preloadRoute = React.useCallback(
    (routePath) => {
      const route = routes.find((r) => r.path === routePath);
      if (route && route.component) {
        preloadComponent(route.component);
      }
    },
    [routes]
  );

  return { preloadRoute };
}
