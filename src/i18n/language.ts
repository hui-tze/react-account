import i18n from './config';

export async function applyLanguage(lng: string) {
    if (!lng) return;

    // prevent unnecessary calls
    if (i18n.resolvedLanguage === lng) return;

    await i18n.changeLanguage(lng);
}

export function getCurrentLanguage() {
    return i18n.resolvedLanguage;
}