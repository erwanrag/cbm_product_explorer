import { useTranslation } from 'react-i18next';
import BaseRemoteAutocomplete from '@/shared/components/inputs/autocomplete/BaseRemoteAutocomplete';
import { autocompleteRefintOrCodpro } from '@/api/services/suggestionService';

export default function AutocompleteRefint(props) {
    const { t } = useTranslation();

    return (
        <BaseRemoteAutocomplete
            label={t('filters.labels.refint')}
            fetchOptions={autocompleteRefintOrCodpro}
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (!option) return '';
                return `${option.refint} (${option.cod_pro})`;
            }}
            isOptionEqualToValue={(option, value) => option?.cod_pro === value?.cod_pro}
            {...props}
        />
    );
}
