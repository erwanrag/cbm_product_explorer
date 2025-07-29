import React from "react";
import Plot from "react-plotly.js";
import { Box, Typography } from "@mui/material";

export default function GraphRepartition({ produits = [], axis = "famille", metric = "ca_total" }) {
    const grouped = produits.reduce((acc, prod) => {
        const key = prod[axis] || "Inconnu";
        acc[key] = (acc[key] || 0) + (prod[metric] || 0);
        return acc;
    }, {});

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    if (!labels.length) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Répartition par {axis} ({metric})
            </Typography>
            <Plot
                data={[
                    {
                        type: "pie",
                        labels,
                        values,
                        textinfo: "label+percent",
                        hole: 0.4,
                    },
                ]}
                layout={{
                    showlegend: true,
                    margin: { t: 30, b: 30 },
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: "100%", height: 320 }}
            />
        </Box>
    );
}