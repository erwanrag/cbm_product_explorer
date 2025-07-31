import { useTranslation } from 'react-i18next';
import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefExt } from '@/api/services/suggestionService';

export default function AutocompleteRefExt(props) {
    const { t } = useTranslation();

    return (
        <BaseRemoteAutocomplete
            label={t('filters.labels.ref_ext')}
            fetchOptions={autocompleteRefExt}
            {...props}
        />
    );
}
