// src/shared/layout/FiltersPanel.jsx
import React, { useState, useEffect } from "react";
import {
    Box, Typography, FormControlLabel, Checkbox, Button, Stack,
    IconButton, Tooltip, Divider
} from "@mui/material";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import AutocompleteRefint from "@/shared/components/inputs/autocomplete/AutocompleteRefint";
import AutocompleteRefCrn from "@/shared/components/inputs/autocomplete/AutocompleteRefCrn";
import AutocompleteRefCrnFromCodpro from "@/shared/components/inputs/autocomplete/AutocompleteRefCrnFromCodpro";
import AutocompleteRefExt from "@/shared/components/inputs/autocomplete/AutocompleteRefExt";
import SelectQualite from "@/shared/components/inputs/selects/SelectQualite";
import { toast } from "react-toastify";
import { useLayout } from "@/context/layout/LayoutContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const initialState = {
    cod_pro: null,
    ref_crn: null,
    ref_ext: null,
    qualite: null,
    use_grouping: false,
};

const FiltersPanel = () => {
    const { setFilters } = useLayout();
    const [localFilters, setLocalFilters] = useState(initialState);
    const [resetCount, setResetCount] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const codProParam = searchParams.get("cod_pro");
        const refCrnParam = searchParams.get("ref_crn");
        const refExtParam = searchParams.get("ref_ext");
        const qualiteParam = searchParams.get("qualite");
        const groupingParam = searchParams.get("grouping_crn");

        if (codProParam || refCrnParam || refExtParam || qualiteParam) {
            setLocalFilters({
                ...initialState,
                cod_pro: codProParam,
                ref_crn: refCrnParam || null,
                ref_ext: refExtParam || null,
                qualite: qualiteParam || null,
                use_grouping: groupingParam === "1",
            });
        }
    }, [searchParams]);

    const handleClear = () => {
        setLocalFilters(initialState);
        setFilters({});
        setResetCount((c) => c + 1);
        navigate("/dashboard");
    };

    const handleSubmit = () => {
        const payload = {
            cod_pro: localFilters.cod_pro || null,
            ref_crn: localFilters.ref_crn || null,
            ref_ext: localFilters.ref_ext || null,
            grouping_crn: localFilters.use_grouping ? 1 : 0,
            qualite: localFilters.qualite || null,
            _forceRefresh: Date.now(),
        };

        setFilters(payload);

        const query = new URLSearchParams();
        if (localFilters.cod_pro) query.set("cod_pro", localFilters.cod_pro);
        if (localFilters.ref_crn) query.set("ref_crn", localFilters.ref_crn);
        if (localFilters.ref_ext) query.set("ref_ext", localFilters.ref_ext);
        if (localFilters.qualite) query.set("qualite", localFilters.qualite);
        query.set("grouping_crn", localFilters.use_grouping ? "1" : "0");

        navigate(`/dashboard?${query.toString()}`);
    };

    useEffect(() => {
        if (!localFilters.cod_pro || localFilters.use_grouping || localFilters.ref_crn) return;

        import("@/api/suggestionApi")
            .then(({ getRefCrnByCodPro }) => {
                getRefCrnByCodPro(localFilters.cod_pro)
                    .then((list) => {
                        if (list.length === 1)
                            setLocalFilters((f) => ({ ...f, ref_crn: list[0] }));
                    })
                    .catch(console.error);
            });
    }, [localFilters.cod_pro, localFilters.use_grouping]);

    return (
        <Box sx={{ background: "#fff", borderRadius: 2, width: "100%", boxShadow: "0 2px 12px 0 #dde3ed", border: "1px solid #e0e7ed", maxWidth: 224 }}>
            <Box sx={{ bgcolor: "primary.main", color: "white", px: 2, py: 1.1, display: "flex", alignItems: "center", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>Filtres Produits</Typography>
                <Tooltip title="Réinitialiser les filtres">
                    <IconButton color="inherit" onClick={handleClear} size="small">
                        <ClearAllIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Divider />
            <Box sx={{ px: 2.5, py: 2 }}>
                <Stack spacing={2}>
                    <AutocompleteRefint
                        key={`refint-reset-${resetCount}`}
                        fullWidth
                        value={localFilters.cod_pro_object || null}
                        onChange={(selection) =>
                            setLocalFilters((f) => ({
                                ...f,
                                cod_pro_object: selection,
                                cod_pro: selection?.cod_pro ?? null,
                                ref_crn: null,
                            }))
                        }
                    />
                    {!localFilters.use_grouping &&
                        (localFilters.cod_pro ? (
                            <AutocompleteRefCrnFromCodpro
                                fullWidth
                                key={`from-codpro-${localFilters.cod_pro}-${resetCount}`}
                                cod_pro={localFilters.cod_pro}
                                value={localFilters.ref_crn}
                                onChange={(ref_crn) =>
                                    setLocalFilters((f) => ({
                                        ...f,
                                        ref_crn,
                                        use_grouping: false,
                                    }))
                                }
                            />
                        ) : (
                            <AutocompleteRefCrn
                                fullWidth
                                key={`crn-reset-${resetCount}`}
                                value={localFilters.ref_crn}
                                onChange={(ref_crn) =>
                                    setLocalFilters((f) => ({
                                        ...f,
                                        ref_crn,
                                        use_grouping: false,
                                    }))
                                }
                            />
                        ))}
                    <AutocompleteRefExt
                        key={`refext-reset-${resetCount}`}
                        fullWidth
                        value={localFilters.ref_ext}
                        onChange={(ref_ext) => setLocalFilters((f) => ({ ...f, ref_ext }))}
                    />
                    <SelectQualite
                        value={localFilters.qualite}
                        onChange={(qualite) => setLocalFilters((f) => ({ ...f, qualite }))}
                    />
                    <Tooltip title={localFilters.ref_crn ? "Indisponible si une référence constructeur est sélectionnée" : ""}>
                        <span>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={localFilters.use_grouping}
                                        onChange={(e) =>
                                            setLocalFilters((f) => ({
                                                ...f,
                                                use_grouping: e.target.checked,
                                                ref_crn: null,
                                            }))
                                        }
                                        disabled={!!localFilters.ref_crn}
                                    />
                                }
                                label="Grouper par CRN"
                            />
                        </span>
                    </Tooltip>
                    <Button variant="contained" color="primary" fullWidth sx={{ borderRadius: 2, fontWeight: 600, mt: 1.5 }} onClick={handleSubmit}>
                        Valider les filtres
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default FiltersPanel;
