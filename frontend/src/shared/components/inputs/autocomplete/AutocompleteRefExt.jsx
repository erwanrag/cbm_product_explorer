// src/shared/components/inputs/autocomplete/AutocompleteRefExt.jsx
import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefExt } from '@/api/services/suggestionService';

export default function AutocompleteRefExt(props) {
  return (
    <BaseRemoteAutocomplete
      label="Référence Externe"
      fetchOptions={autocompleteRefExt}
      {...props}
    />
  );
}
