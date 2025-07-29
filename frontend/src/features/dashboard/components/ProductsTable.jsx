// 📁 src/features/dashboard/components/ProductsTable.jsx
import React, { useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import PaginatedDataGrid from "@/shared/components/tables/PaginatedDataGrid";
import BadgeQualite from "@/shared/components/badges/BadgeQualite";
import MargeColorBox from "@/shared/components/badges/MargeColorBox";
import StatutBadge from "@/shared/components/badges/StatutBadge";
import { formatPrix } from "@/lib/format";
import { DataGrid } from "@mui/x-data-grid";
export default function ProductsTable({
    data = [],
    selectedCodPro,
    setSelectedCodPro,
    onInspectProduct,
    sales = [],
    stock = [],
    purchase = []
}) {
    const qualiteOrder = {
        OE: 1,
        OEM: 2,
        PMQ: 3,
        PMV: 4,
    };

    console.log("🔍 Données reçues dans ProductsTable");
    console.log("details", data?.length, data?.slice?.(0, 3));
    console.log("sales", sales?.length, sales?.slice?.(0, 3));
    console.log("stock", stock?.length, stock?.slice?.(0, 3));
    console.log("purchase", purchase?.length, purchase?.slice?.(0, 3));

    const rows = useMemo(() => {
        return data
            .filter((d) => d.cod_pro)
            .map((d) => {
                const vente = sales.find((s) => s.cod_pro === d.cod_pro) || {};
                const stockList = stock.filter((s) => s.cod_pro === d.cod_pro);
                const stockTotal = stockList.reduce((sum, s) => sum + (s.stock || 0), 0);
                const stockValorise = stockList.reduce((sum, s) => sum + (s.stock || 0) * (s.pmp || 0), 0);
                const achat = purchase.find((p) => p.cod_pro === d.cod_pro) || {};

                return {
                    ...d,
                    ca_total: vente.ca_total || 0,
                    quantite_total: vente.quantite_total || 0,
                    marge_percent_total: vente.marge_percent_total || 0,
                    stock_total: stockTotal,
                    stock_valorise: stockValorise,
                    px_achat_eur: achat.px_achat_eur || 0,
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                const qa = qualiteOrder[a.qualite] || 99;
                const qb = qualiteOrder[b.qualite] || 99;
                if (qa !== qb) return qa - qb;
                return (b.ca_total || 0) - (a.ca_total || 0);
            });
    }, [data, sales, stock, purchase]);

    console.log("✅ Produits calculés :", rows.length, rows.slice(0, 3));

    const columns = useMemo(
        () => [
            { field: "cod_pro", headerName: "Code Produit", width: 110 },
            { field: "refint", headerName: "Référence", width: 140 },
            {
                field: "ref_ext",
                headerName: "Réf. Externe",
                width: 140,
                renderCell: ({ value }) =>
                    value ? (
                        <Chip label={value} size="small" sx={{ bgcolor: "#fce4ec", color: "#880e4f", fontWeight: 600 }} />
                    ) : ("-"),
            },
            { field: "nom_fou", headerName: "Fournisseur", width: 200 },
            { field: "qualite", headerName: "Qualité", width: 90, renderCell: ({ value }) => <BadgeQualite qualite={value} /> },
            { field: "statut", headerName: "Statut", width: 90, renderCell: ({ value }) => <StatutBadge value={value} /> },
            {
                field: "ca_total",
                headerName: "CA Total (€)",
                width: 120,
                align: "right",
                sortable: true,
                renderCell: ({ value }) => formatPrix(value),
            },
            {
                field: "quantite_total",
                headerName: "Qté vendue",
                width: 110,
                align: "right",
                sortable: true,
                renderCell: ({ value }) => (value ? value.toLocaleString("fr-FR") : "-"),
            },
            {
                field: "marge_percent_total",
                headerName: "Marge (%)",
                width: 110,
                sortable: true,
                renderCell: ({ value }) => <MargeColorBox value={value} />,
            },
            {
                field: "stock_valorise",
                headerName: "Stock valorisé (€)",
                width: 140,
                align: "right",
                sortable: true,
                renderCell: ({ value }) => (
                    <Box sx={{ color: value <= 0 ? "#c62828" : "inherit", fontWeight: value <= 0 ? 600 : 400 }}>
                        {formatPrix(value)}
                    </Box>
                ),
            },
            {
                field: "stock_total",
                headerName: "Stock (Qté)",
                width: 110,
                align: "right",
                sortable: true,
                renderCell: ({ value }) => (
                    <Box sx={{ color: value <= 0 ? "#c62828" : "inherit", fontWeight: value <= 0 ? 600 : 400 }}>
                        {value || 0}
                    </Box>
                ),
            },
            {
                field: "px_achat_eur",
                headerName: "Prix Achat (€)",
                width: 120,
                align: "right",
                renderCell: ({ value }) => formatPrix(value),
            },
        ],
        []
    );

    const fakeFetchRows = (page, pageSize) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageRows = rows.slice(start, end);
        console.log("📦 fetchRows page", page, "→", pageRows.length, "lignes");
        return Promise.resolve({ rows: pageRows, total: rows.length });
    };

    return (
        <Box mt={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                🧾 Produits affichés – <strong>{rows.length}</strong> ligne(s)
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.cod_pro || row.id || `${row.refint}-${row.ref_ext}`}
                pagination
                pageSizeOptions={[20, 50, 100, 200]}
                initialState={{ pagination: { paginationModel: { pageSize: 50, page: 0 } } }}
                onRowClick={(params) => {
                    const selected = String(selectedCodPro) === String(params.row.cod_pro) ? null : params.row.cod_pro;
                    setSelectedCodPro(selected);
                    onInspectProduct(params.row);
                }}
                getRowClassName={(params) =>
                    String(params.row.cod_pro) === String(selectedCodPro) ? "highlighted-row" : ""
                }
                density="compact"
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    backgroundColor: "white",
                    "& .MuiDataGrid-columnHeaders": {
                        minHeight: 70,
                        height: 70,
                        maxHeight: 70,
                    },
                    "& .MuiDataGrid-columnHeader": {
                        minHeight: 70,
                        height: 70,
                        maxHeight: 70,
                    },
                }}
            />

        </Box>
    );
}