import BaseRemoteAutocomplete from "./BaseRemoteAutocomplete";
import { autocompleteRefCrn } from "@/api/suggestionApi";

export default function AutocompleteRefCrn(props) {
    return (
        <BaseRemoteAutocomplete
            label="Référence Constructeur"
            fetchOptions={autocompleteRefCrn}
            {...props}
        />
    );
}
