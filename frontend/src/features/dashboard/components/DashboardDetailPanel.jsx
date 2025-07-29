import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { formatPrix } from "@/lib/format";
import Plot from "react-plotly.js";
import { fetchSalesHistory } from "@/api/salesApi";
import { fetchStockHistory } from "@/api/stockApi";

export default function DashboardDetailPanel({ product, onClose }) {
    const [salesHistory, setSalesHistory] = useState([]);
    const [stockHistory, setStockHistory] = useState([]);

    useEffect(() => {
        if (!product) return;

        const loadHistories = async () => {
            try {
                const [salesRes, stockRes] = await Promise.all([
                    fetchSalesHistory({ cod_pro_list: [product.cod_pro] }, 12),
                    fetchStockHistory({ cod_pro_list: [product.cod_pro] }, 12),
                ]);
                setSalesHistory(salesRes.items || []);
                setStockHistory(stockRes.items || []);
            } catch (err) {
                console.error("Erreur chargement historiques :", err);
            }
        };
        loadHistories();
    }, [product]);

    if (!product) return null;

    // === 1. Graphique Ventes (12 mois) ===
    const dates = salesHistory.map((s) => s.periode);
    const ca = salesHistory.map((s) => s.ca);
    const margePct = salesHistory.map((s) => s.marge_percent || 0);
    const qte = salesHistory.map((s) => s.quantite || 0);

    // === 2. Graphique Stock par Dépôt (Top 5 dépôts)
    const topDepots = [...new Set(stockHistory.map((s) => s.depot))].slice(0, 5);
    const depotSeries = topDepots.map((depot) => {
        const hist = stockHistory.filter((s) => s.depot === depot);
        return {
            x: hist.map((h) => h.dat_deb),
            y: hist.map((h) => (h.stock || 0) * (h.pmp || 0)),
            name: `Dépot ${depot}`,
            type: "scatter",
            mode: "lines+markers",
        };
    });

    return (
        <Drawer
            anchor="right"
            open={Boolean(product)}
            onClose={onClose}
            sx={{ zIndex: 1300 }}
        >
            <Box sx={{ p: 2, width: 400, maxWidth: "100vw" }}>
                <Typography variant="h6" gutterBottom>
                    Produit {product.cod_pro}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {product.refint} – {product.ref_ext}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* === Graph Ventes === */}
                {salesHistory.length > 0 && (
                    <>
                        <Typography variant="subtitle2" gutterBottom>
                            Historique Ventes (12 mois)
                        </Typography>
                        <Plot
                            data={[
                                {
                                    x: dates,
                                    y: ca,
                                    name: "CA (€)",
                                    type: "bar",
                                    marker: { color: "#1976d2" },
                                    yaxis: "y",
                                },
                                {
                                    x: dates,
                                    y: margePct,
                                    name: "Marge %",
                                    type: "scatter",
                                    mode: "lines+markers",
                                    line: { color: "#9C27B0", width: 3 },
                                    yaxis: "y2",
                                },
                                {
                                    x: dates,
                                    y: qte,
                                    name: "Quantité",
                                    type: "scatter",
                                    mode: "lines",
                                    line: { color: "#43a047", dash: "dot" },
                                    yaxis: "y",
                                },
                            ]}
                            layout={{
                                height: 250,
                                margin: { t: 20, b: 40, l: 40, r: 50 },
                                yaxis: { title: "CA (€) / Quantité" },
                                yaxis2: {
                                    title: "Marge %",
                                    overlaying: "y",
                                    side: "right",
                                    tickformat: ",.0%",
                                },
                                legend: { orientation: "h", x: 0, y: -0.2 },
                            }}
                            config={{ responsive: true }}
                        />
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {/* === Graph Stock === */}
                {depotSeries.length > 0 && (
                    <>
                        <Typography variant="subtitle2" gutterBottom>
                            Historique Stock Valorisé (Top 5 dépôts)
                        </Typography>
                        <Plot
                            data={depotSeries}
                            layout={{
                                height: 250,
                                margin: { t: 20, b: 60, l: 50, r: 20 },
                                xaxis: { tickangle: -45 },
                            }}
                            config={{ responsive: true }}
                        />
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {/* === Infos produit === */}
                <Typography variant="subtitle2">Informations</Typography>
                <List dense>
                    <ListItem>
                        <ListItemText primary={`Fournisseur : ${product.nom_fou || "-"}`} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={`Qualité : ${product.qualite}`} />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={`Prix Achat : ${formatPrix(product.px_achat_eur)}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={`Stock total : ${product.stock_total || 0} (Valorisé ${formatPrix(
                                product.stock_valorise || 0
                            )})`}
                        />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}
