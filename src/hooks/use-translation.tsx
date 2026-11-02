import {useState, useEffect, useCallback} from 'react';
import i18n from 'i18next';
import {applyLanguage, getCurrentLanguage} from '@/i18n/language';

export function useSmartTranslation() {
    const [, setTick] = useState(0);

    const forceUpdate = useCallback(() => setTick(t => t + 1), []);

    useEffect(() => {
        i18n.on('languageChanged', forceUpdate);
        return () => {
            i18n.off('languageChanged', forceUpdate);
        };
    }, [forceUpdate]);

    const t = useCallback((key: string, options?: any): string => {
        const result = i18n.t(key, options);
        return typeof result === 'string' ? result : String(result);
    }, []);

    return { t, changeLanguage: applyLanguage, currentLanguage: getCurrentLanguage() };
}
