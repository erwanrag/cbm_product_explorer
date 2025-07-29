// 📁 src/features/dashboard/components/GraphSection.jsx
import React from "react";
import { Box } from "@mui/material";
import GraphHistorique from "./GraphHistorique";
import GraphRepartition from "./GraphRepartition";
import GraphTopProduits from "./GraphTopProduits";

export default function GraphSection({ data }) {
    if (!data) return null;

    return (
        <Box mt={4} display="flex" flexDirection="column" gap={3}>
            <Box bgcolor="#fafaff" borderRadius={2} p={2} boxShadow={1}>
                <GraphHistorique data={data.sales} />
            </Box>

            <Box bgcolor="#fafaff" borderRadius={2} p={2} boxShadow={1}>
                <GraphRepartition
                    produits={data.details}
                    sales={data.sales}
                    axis="famille"
                    metric="ca_total"
                />
            </Box>

            <Box bgcolor="#fafaff" borderRadius={2} p={2} boxShadow={1}>
                <GraphTopProduits
                    produits={data.details}
                    sales={data.sales}
                    stock={data.stock}
                    yAxis="ca_total"
                />
            </Box>
        </Box>
    );
}
