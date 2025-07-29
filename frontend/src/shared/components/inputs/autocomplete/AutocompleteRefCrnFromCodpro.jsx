// 📁 src/shared/components/inputs/autocomplete/AutocompleteRefCrnFromCodpro.jsx

import { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { getRefCrnByCodPro } from "@/api/suggestionApi";

export default function AutocompleteRefCrnFromCodpro({
    cod_pro,
    value,
    onChange,
    sx = {},
    disabled = false,
}) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!cod_pro) return;

        setLoading(true);
        getRefCrnByCodPro(cod_pro)
            .then((data) => {
                const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
                setOptions(results);
            })
            .catch((err) => {
                console.error("Erreur chargement ref_crn from cod_pro", err);
                setOptions([]);
            })
            .finally(() => setLoading(false));
    }, [cod_pro]);

    return (
        <Autocomplete
            options={options}
            value={value || ""}
            onChange={(_, newVal) => onChange(newVal)}
            disabled={disabled || !cod_pro}
            loading={loading}
            sx={sx}
            getOptionLabel={(option) => typeof option === "string" ? option : ""}
            isOptionEqualToValue={(option, val) => option === val}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Référence Constructeur"
                    size="small"
                    placeholder="Sélectionner"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading && <CircularProgress size={16} />}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
