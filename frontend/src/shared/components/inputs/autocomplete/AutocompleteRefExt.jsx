// src/shared/components/inputs/autocomplete/AutocompleteRefExt.jsx
import BaseRemoteAutocomplete from "./BaseRemoteAutocomplete";
import { autocompleteRefExt } from "@/api/suggestionApi";

export default function AutocompleteRefExt(props) {
    return (
        <BaseRemoteAutocomplete
            label="Référence Externe"
            fetchOptions={autocompleteRefExt}
            {...props}
        />
    );
}
