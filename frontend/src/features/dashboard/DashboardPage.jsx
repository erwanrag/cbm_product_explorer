import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLayout } from "@/context/layout/LayoutContext";
import PageWrapper from "@/shared/components/page/PageWrapper";
import PageTitle from "@/shared/components/page/PageTitle";
import DashboardKPIs from "./components/DashboardKPIs";
import GraphSection from "./components/GraphSection";
import ProductsTable from "./components/ProductsTable";
import DashboardDetailPanel from "./components/DashboardDetailPanel";
import { fetchDashboardFiche } from "@/api/dashboardApi";
import { toast } from "react-toastify";
import { Box } from "@mui/material";
import RefCrnList from "./components/RefCrnList";
import RefExtList from "./components/RefExtList";
import { useSearchParams } from "react-router-dom";

export default function DashboardPage() {
    const { filters = {}, setFilterType, setFilters } = useLayout();
    const [searchParams] = useSearchParams();

    const [selectedCodPro, setSelectedCodPro] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRefCrn, setSelectedRefCrn] = useState("");
    const [selectedRefExt, setSelectedRefExt] = useState("");

    useEffect(() => {
        setFilterType("dashboard");

        const cod_pro = searchParams.get("cod_pro");
        const ref_crn = searchParams.get("ref_crn");
        const ref_ext = searchParams.get("ref_ext");
        const qualite = searchParams.get("qualite");
        const grouping_crn = searchParams.get("grouping_crn");

        const isFiltersEmpty = !filters?.cod_pro && !filters?.ref_crn && !filters?.ref_ext;

        if (isFiltersEmpty && (cod_pro || ref_crn || ref_ext || grouping_crn)) {
            setFilters({
                cod_pro,
                ref_crn,
                ref_ext,
                grouping_crn: grouping_crn === "1" ? 1 : 0,
                qualite,
                _forceRefresh: Date.now(),
            });
        }

        return () => setFilterType("none");
    }, []);

    const queryEnabled = useMemo(() => {
        return Boolean(
            filters &&
            (filters.cod_pro || filters.ref_crn || filters.ref_ext || filters.qualite)
        );
    }, [filters]);

    const { data } = useQuery({
        enabled: Boolean(queryEnabled),
        queryKey: ["dashboard-fiche", filters?._forceRefresh, filters],
        queryFn: () =>
            fetchDashboardFiche({
                cod_pro: filters?.cod_pro || null,
                ref_crn: filters?.ref_crn || null,
                refint: filters?.refint || null,
                ref_ext: filters?.ref_ext || null,
                famille: filters?.famille || 0,
                s_famille: filters?.s_famille || 0,
                qualite: filters?.qualite || null,
                statut: filters?.statut || 0,
                statut_clean: filters?.statut_clean || null,
                grouping_crn: filters?.grouping_crn || 0,
            }),
        onSuccess: (res) => {
            if (!res?.details?.length) {
                toast.info("Aucun produit trouvé pour les filtres sélectionnés.");
            }
        },
    });

    const groupData = data || {
        details: [],
        sales: [],
        stock: [],
        purchase: [],
        matches: [],
    };

    const refCrnList = useMemo(() => {
        return [...new Set(groupData.matches.map((d) => d.ref_crn).filter(Boolean))].sort();
    }, [groupData.matches]);

    const refExtList = useMemo(() => {
        return [...new Set(groupData.matches.map((d) => d.ref_ext).filter(Boolean))].sort();
    }, [groupData.matches]);

    const filteredData = useMemo(() => {
        const isActiveRefCrn = selectedRefCrn && selectedRefCrn.trim() !== "";
        const isActiveRefExt = selectedRefExt && selectedRefExt.trim() !== "";

        if (!isActiveRefCrn && !isActiveRefExt) return groupData;

        const filteredCodPro = groupData.details
            .filter(
                (p) =>
                    (!isActiveRefCrn || p.ref_crn === selectedRefCrn) &&
                    (!isActiveRefExt || p.ref_ext === selectedRefExt)
            )
            .map((p) => p.cod_pro);

        return {
            ...groupData,
            details: groupData.details.filter((d) => filteredCodPro.includes(d.cod_pro)),
            sales: groupData.sales.filter((s) => filteredCodPro.includes(s.cod_pro)),
            stock: groupData.stock.filter((st) => filteredCodPro.includes(st.cod_pro)),
            purchase: groupData.purchase.filter((p) => filteredCodPro.includes(p.cod_pro)),
        };
    }, [groupData, selectedRefCrn, selectedRefExt]);

    const kpiData = useMemo(() => {
        const sales = filteredData.sales || [];
        const details = filteredData.details || [];
        const stock = filteredData.stock || [];
        const caTotal = sales.reduce((sum, s) => sum + (s.ca_total || 0), 0);
        const quantiteTotal = sales.reduce((sum, s) => sum + (s.quantite_total || 0), 0);
        const margeTotal = sales.reduce((sum, s) => sum + (s.marge_total || 0), 0);
        const margeMoyenne = caTotal ? (margeTotal / caTotal) * 100 : 0;
        const stockTotalValorise = stock.reduce(
            (sum, s) => sum + (s.stock || 0) * (s.pmp || 0),
            0
        );
        const topFournisseurMap = sales.reduce((acc, s) => {
            const det = details.find((d) => d.cod_pro === s.cod_pro);
            if (det) acc[det.nom_fou] = (acc[det.nom_fou] || 0) + (s.ca_total || 0);
            return acc;
        }, {});
        const [topFournisseurNom, topFournisseurCA] =
            Object.entries(topFournisseurMap).sort((a, b) => b[1] - a[1])[0] || ["-", 0];

        return {
            totalProduits: details.length,
            caTotal,
            quantiteTotal,
            margeMoyenne,
            stockTotalValorise,
            topFournisseur: { nom: topFournisseurNom, ca: topFournisseurCA },
        };
    }, [filteredData]);

    if (!queryEnabled) {
        return (
            <PageWrapper>
                <PageTitle>📊 Dashboard Produits</PageTitle>
                <p>Aucun produit à afficher. Veuillez sélectionner des filtres et valider.</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageTitle>📊 Dashboard Produits</PageTitle>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    mb: 3,
                    alignItems: "flex-start",
                }}
            >
                <RefCrnList list={refCrnList} value={selectedRefCrn} onChange={setSelectedRefCrn} />
                <RefExtList list={refExtList} value={selectedRefExt} onChange={setSelectedRefExt} />
            </Box>

            <DashboardKPIs data={kpiData} />
            <GraphSection data={filteredData} selectedCodPro={selectedCodPro} />

            <ProductsTable
                data={filteredData.details}
                selectedCodPro={selectedCodPro}
                setSelectedCodPro={setSelectedCodPro}
                onInspectProduct={setSelectedProduct}
                sales={filteredData.sales}
                stock={filteredData.stock}
                purchase={filteredData.purchase}
            />

            <DashboardDetailPanel
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </PageWrapper>
    );
}