import { useTranslation } from '@/store/contexts/LanguageContext'
import BaseRemoteAutocomplete from './BaseRemoteAutocomplete';
import { autocompleteRefExt } from '@/api/services/suggestionService';

export default function AutocompleteRefExt(props) {
    const { t } = useTranslation();

    return (
        <BaseRemoteAutocomplete
            label={t('filters.labels.ref_ext', 'Référence Externe')}
            fetchOptions={autocompleteRefExt}
            {...props}
        />
    );
}
