// frontend/src/shared/components/search/IdentifierSearch.jsx

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    FormHelperText,
    InputAdornment,
    Chip,
    Typography
} from '@mui/material';
import {
    Search,
    Clear
} from '@mui/icons-material';

/**
 * Composant de recherche par identifiant produit
 * Supporte : cod_pro, ref_crn, refint, ref_ext, etc.
 */
export default function IdentifierSearch({
    onSearch,
    placeholder = "Code produit, référence...",
    helperText = "Saisissez un identifiant pour rechercher",
    disabled = false
}) {
    const [searchValue, setSearchValue] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);

    const handleSearch = () => {
        if (!searchValue.trim()) return;

        // Tentative de parsing intelligent
        const payload = parseSearchInput(searchValue.trim());

        // Ajouter aux recherches récentes
        setRecentSearches(prev => {
            const newSearches = [searchValue, ...prev.filter(s => s !== searchValue)];
            return newSearches.slice(0, 5); // Garder seulement les 5 dernières
        });

        onSearch(payload);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setSearchValue('');
    };

    const handleRecentSearch = (recentValue) => {
        setSearchValue(recentValue);
        const payload = parseSearchInput(recentValue);
        onSearch(payload);
    };

    // Parsing intelligent de l'input
    const parseSearchInput = (input) => {
        // Si c'est un nombre, on assume que c'est un cod_pro
        if (/^\d+$/.test(input)) {
            return { cod_pro: parseInt(input) };
        }

        // Si ça contient "CBM-", on assume que c'est une ref interne
        if (input.toUpperCase().includes('CBM-')) {
            return { refint: input };
        }

        // Si ça commence par des lettres suivies de chiffres, probablement ref_crn
        if (/^[A-Z]+\d+/.test(input.toUpperCase())) {
            return { ref_crn: input };
        }

        // Sinon, on essaie en tant que référence générique
        return {
            ref_crn: input,
            // On peut aussi essayer plusieurs champs
            refint: input,
            ref_ext: input
        };
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                    fullWidth
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchValue && (
                            <InputAdornment position="end">
                                <Button
                                    size="small"
                                    onClick={handleClear}
                                    sx={{ minWidth: 'auto', p: 0.5 }}
                                >
                                    <Clear fontSize="small" />
                                </Button>
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={disabled || !searchValue.trim()}
                    startIcon={<Search />}
                    sx={{ minWidth: 120 }}
                >
                    Rechercher
                </Button>
            </Box>

            {helperText && (
                <FormHelperText sx={{ mt: 1 }}>
                    {helperText}
                </FormHelperText>
            )}

            {/* Recherches récentes */}
            {recentSearches.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Recherches récentes :
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                        {recentSearches.map((search, index) => (
                            <Chip
                                key={index}
                                label={search}
                                size="small"
                                variant="outlined"
                                onClick={() => handleRecentSearch(search)}
                                disabled={disabled}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Exemples de format */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Formats supportés : 23412 (cod_pro), CBM-15161 (ref_int), ATS52460 (ref_crn)
                </Typography>
            </Box>
        </Box>
    );
}