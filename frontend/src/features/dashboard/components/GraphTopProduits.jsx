// 📁 src/features/dashboard/components/GraphTopProduits.jsx
import React from "react";
import Plot from "react-plotly.js";
import { Box, Typography } from "@mui/material";

export default function GraphTopProduits({ produits = [], sales = [], stock = [], yAxis = "ca_total" }) {
    const merged = sales.map((s) => {
        const prod = produits.find((p) => p.cod_pro === s.cod_pro) || {};
        const stockValo = stock
            .filter((st) => st.cod_pro === s.cod_pro)
            .reduce((sum, st) => sum + (st.stock || 0) * (st.pmp || 0), 0);
        return {
            ...prod,
            ...s,
            stock: stockValo,
        };
    });

    const top = [...merged]
        .sort((a, b) => (b[yAxis] || 0) - (a[yAxis] || 0))
        .slice(0, 15);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Top 15 Produits – {yAxis}
            </Typography>
            <Plot
                data={[
                    {
                        type: "bar",
                        x: top.map((d) => d[yAxis]),
                        y: top.map((d) => `${d.cod_pro} – ${d.refint || ""}`),
                        orientation: "h",
                        marker: { color: "#0288d1" },
                    },
                ]}
                layout={{
                    margin: { l: 150, r: 30, t: 30, b: 30 },
                    yaxis: { automargin: true },
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: "100%", height: 480 }}
            />
        </Box>
    );
}
