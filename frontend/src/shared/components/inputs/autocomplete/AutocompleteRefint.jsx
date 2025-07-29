import BaseRemoteAutocomplete from "./BaseRemoteAutocomplete";
import { autocompleteRefintOrCodpro } from "@/api/suggestionApi";

export default function AutocompleteRefint(props) {
    return (
        <BaseRemoteAutocomplete
            label="Réf Int./N° Produit"
            fetchOptions={autocompleteRefintOrCodpro}
            getOptionLabel={(opt) =>
                typeof opt === "string"
                    ? opt
                    : `${opt?.refint ?? ""} (${opt?.cod_pro ?? "?"})`
            }
            isOptionEqualToValue={(option, value) =>
                option?.cod_pro === value?.cod_pro
            }
            {...props}
        />
    );
}