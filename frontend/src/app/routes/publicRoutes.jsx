// Pages avec lazy loading moderne et error boundaries
const DashboardPage = createLazyPage(() => import('@/features/dashboard/DashboardPage'));
const MatrixPage = createLazyPage(() => import('@/features/matrix/MatrixPage'));
const OptimizationPage = createLazyPage(() => import('@/features/optimization/OptimizationPage'));
const AnalyticsPage = createLazyPage(() => import('@/features/analytics/AnalyticsPage'));

/**
 * Routes publiques de l'application CBM GRC Matcher
 * Utilisent le lazy loading moderne avec error boundaries
 */
export const publicRoutes = [
    {
        path: "",
        element: DashboardPage,
        title: "Dashboard",
        description: "Vue d'ensemble des produits et KPIs"
    },
    {
        path: "dashboard",
        element: DashboardPage,
        title: "Dashboard",
        description: "Vue d'ensemble des produits et KPIs"
    },
    {
        path: "matrix",
        element: MatrixPage,
        title: "Matrice",
        description: "Matrice de correspondance produits"
    },
    {
        path: "optimization",
        element: OptimizationPage,
        title: "Optimisation",
        description: "Analyses et optimisations business"
    },
    {
        path: "analytics",
        element: AnalyticsPage,
        title: "Analytics",
        description: "Tableaux de bord et métriques"
    }
];

export default publicRoutes;