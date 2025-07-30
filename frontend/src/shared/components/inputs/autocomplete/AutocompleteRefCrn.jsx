import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefCrn } from '@/api/services/suggestionService';

export default function AutocompleteRefCrn(props) {
  return (
    <BaseRemoteAutocomplete
      label="Référence Constructeur"
      fetchOptions={autocompleteRefCrn}
      {...props}
    />
  );
}
