import { Routes, Route, Navigate } from 'react-router-dom';
import { createLazyPage } from '@/utils/lazy-loading';

// Pages principales
const DashboardPage = createLazyPage(() => import('@/features/dashboard/pages/DashboardPage'));
const MatrixPage = createLazyPage(() => import('@/features/matrix/pages/MatrixPage'));
const OptimizationPage = createLazyPage(() => import('@/features/optimization/pages/OptimizationPage'));
const SettingsPage = createLazyPage(() => import('@/features/settings/pages/SettingsPage'));
const HelpPage = createLazyPage(() => import('@/features/help/pages/HelpPage'));

// Pages système
const NotFoundPage = createLazyPage(() => import('@/shared/pages/NotFoundPage'));
const ErrorPage = createLazyPage(() => import('@/shared/pages/ErrorPage'));

/**
 * Définition centralisée des routes principales
 */
const routes = [
    {
        path: '/dashboard',
        element: DashboardPage,
        title: 'Dashboard',
        description: "Vue d'ensemble des produits et KPIs",
    },
    {
        path: '/matrix',
        element: MatrixPage,
        title: 'Matrice',
        description: 'Matrice de correspondance produits',
    },
    {
        path: '/optimization',
        element: OptimizationPage,
        title: 'Optimisation',
        description: 'Analyses et optimisations business',
    },
    {
        path: '/settings',
        element: SettingsPage,
        title: 'Paramètres',
        description: "Configuration de l'application",
    },
    {
        path: '/help',
        element: HelpPage,
        title: 'Aide',
        description: 'Documentation et support',
    },
];

/**
 * Composant routeur principal utilisé dans App.jsx
 */
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {routes.map(({ path, element: Component, title, description }) => (
                <Route
                    key={path}
                    path={path}
                    element={<Component title={title} description={description} />}
                />
            ))}

            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

/**
 * Export pour navigation dynamique (sidebar, breadcrumb…)
 */
export { routes };
