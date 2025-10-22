// 📁 src/shared/components/inputs/autocomplete/BaseRemoteAutocomplete.jsx

import { Autocomplete, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import debounce from 'lodash.debounce';

export default function BaseRemoteAutocomplete({
    label = '',
    value,
    onChange,
    fetchOptions,
    getOptionLabel = (opt) => opt,
    minLength = 2,
    debounceMs = 300,
    sx = {},
    size = 'small',
    disabled = false,
}) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedFetch = useRef(
        debounce(async (query) => {
            if (query.length < minLength) return;
            setLoading(true);
            try {
                const data = await fetchOptions(query);
                const results = Array.isArray(data?.results)
                    ? data.results
                    : Array.isArray(data)
                        ? data
                        : [];
                setOptions(results);
            } catch (e) {
                console.error('Erreur chargement autocomplete :', e);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, debounceMs)
    ).current;

    return (
        <Autocomplete
            freeSolo
            options={options}
            value={value || null}
            loading={loading}
            onInputChange={(e, val) => debouncedFetch(val)}
            onChange={(e, val) => onChange(val || null)}
            getOptionLabel={getOptionLabel}
            sx={sx}
            disabled={disabled}
            renderInput={(params) => <TextField {...params} label={label} size={size} />}
            isOptionEqualToValue={(option, value) => {
                if (!value) return false;
                return option === value || option?.value === value;
            }}
        />
    );
}