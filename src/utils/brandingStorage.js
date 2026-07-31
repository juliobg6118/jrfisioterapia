import { DEFAULT_BRANDING } from '../config/constants';

export const BRANDING_STORAGE_KEY = 'fisiopro.branding';
export const BRANDING_UPDATED_EVENT = 'fisiopro-branding-updated';

export function isMissingClinicSettingsTable(error) {
  if (!error) return false;

  const message = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return error.code === 'PGRST205' || message.includes('clinic_settings') || message.includes('schema cache');
}

export function normalizeBranding(value) {
  return {
    clinicName: value?.clinicName || value?.clinic_name || DEFAULT_BRANDING.clinicName,
    logoUrl: value?.logoUrl || value?.logo_url || DEFAULT_BRANDING.logoUrl,
  };
}

export function getLocalBranding() {
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    return normalizeBranding(JSON.parse(raw));
  } catch (_error) {
    return DEFAULT_BRANDING;
  }
}

export function saveLocalBranding(branding) {
  const normalized = normalizeBranding(branding);
  window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(BRANDING_UPDATED_EVENT, { detail: normalized }));
  return normalized;
}
