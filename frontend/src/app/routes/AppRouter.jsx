import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import Layout from "@/shared/layout/Layout";
import NotFound from "@/pages/NotFound";
import { Suspense, createElement } from "react";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="p-4">Chargement…</div>}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {publicRoutes.map(({ path, element }) => (
                            <Route key={path} path={path} element={createElement(element)} />
                        ))}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
