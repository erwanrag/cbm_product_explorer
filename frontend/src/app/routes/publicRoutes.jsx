import { lazy } from "react";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const MatrixPage = lazy(() => import("@/features/matrix/MatrixPage"));

export const publicRoutes = [
    { path: "", element: DashboardPage },
    { path: "dashboard", element: DashboardPage },
    { path: "matrix", element: MatrixPage },
];
