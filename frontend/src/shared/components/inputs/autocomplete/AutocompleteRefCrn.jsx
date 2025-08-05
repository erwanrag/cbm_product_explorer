import { useTranslation } from '@/store/contexts/LanguageContext';
import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefCrn } from '@/api/services/suggestionService';

export default function AutocompleteRefCrn(props) {
    const { t } = useTranslation();

    return (
        <BaseRemoteAutocomplete
            label={t('filters.labels.ref_crn', 'Référence Constructeur')}
            fetchOptions={autocompleteRefCrn}
            {...props}
        />
    );
}
