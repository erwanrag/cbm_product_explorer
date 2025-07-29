import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLayout } from "@/context/layout/LayoutContext";
import PageWrapper from "@/shared/components/page/PageWrapper";
import PageTitle from "@/shared/components/page/PageTitle";
import { fetchProductDetails } from "@/api/productApi";
import { fetchCodProMatchList } from "@/api/matchApi";
import { toast } from "react-toastify";
import MatrixTable from "./components/MatrixTable";
import MatrixDetailPanel from "./components/MatrixDetailPanel";

export default function MatrixPage() {
    const { filters, setFilterType } = useLayout(); 
    useEffect(() => {
        setFilterType("matrix");
        return () => setFilterType("none");
    }, []);
    const codProList = filters?.cod_pro_list || [];
    const enabled = Array.isArray(codProList) && codProList.length > 0;

    const [selectedProduct, setSelectedProduct] = useState(null);

    // === 1. Récupération détails produits (lignes)
    const { data: detailsData = { products: [] } } = useQuery({
        enabled,
        queryKey: ["matrix-details", codProList.join(","), filters?._forceRefresh],
        queryFn: () =>
            fetchProductDetails({
                cod_pro_list: codProList,
                grouping_crn: filters?.use_grouping ? 1 : 0,
            }),
        onError: () => toast.error("Erreur chargement détails produits"),
    });

    // === 2. Récupération correspondances (colonnes)
    const { data: matchesData = [] } = useQuery({
        enabled,
        queryKey: ["matrix-match", codProList.join(","), filters?._forceRefresh],
        queryFn: () =>
            fetchCodProMatchList({
                cod_pro_list: codProList,
                grouping_crn: filters?.use_grouping ? 1 : 0,
            }),
        onError: () =>
            toast.error("Erreur chargement correspondances ref_crn / ref_ext"),
    });

    if (!enabled) {
        return (
            <PageWrapper>
                <PageTitle>🔗 Matrice Produits</PageTitle>
                <p>Veuillez sélectionner des filtres et valider pour afficher la matrice.</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageTitle>🔗 Matrice Produits</PageTitle>

            <MatrixTable
                products={detailsData.products || []}
                matches={matchesData}
                onInspectProduct={setSelectedProduct}
            />

            <MatrixDetailPanel
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </PageWrapper>
    );
}
