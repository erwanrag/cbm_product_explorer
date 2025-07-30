import BaseRemoteAutocomplete from '@/shared/components/inputs/autocomplete/BaseRemoteAutocomplete';
import { autocompleteRefintOrCodpro } from '@/api/services/suggestionService';

export default function AutocompleteRefint(props) {
  return (
    <BaseRemoteAutocomplete
      label="Réf Int./N° Produit"
      fetchOptions={autocompleteRefintOrCodpro}
      getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          if (!option) return '';
          return `${option.refint} (${option.cod_pro})`; // ou comme tu veux
       }}
      isOptionEqualToValue={(option, value) => option?.cod_pro === value?.cod_pro}
      {...props}
    />
  );
}
