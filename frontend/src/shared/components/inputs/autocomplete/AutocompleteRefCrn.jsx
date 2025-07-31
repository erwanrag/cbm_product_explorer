import { useTranslation } from 'react-i18next';
import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefCrn } from '@/api/services/suggestionService';

export default function AutocompleteRefCrn(props) {
    const { t } = useTranslation();

    return (
        <BaseRemoteAutocomplete
            label={t('filters.labels.ref_crn')}
            fetchOptions={autocompleteRefCrn}
            {...props}
        />
    );
}
