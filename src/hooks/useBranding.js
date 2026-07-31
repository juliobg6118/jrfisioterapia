import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_BRANDING } from '../config/constants';
import { supabase } from '../supabaseClient';
import {
  BRANDING_UPDATED_EVENT,
  getLocalBranding,
  isMissingClinicSettingsTable,
  normalizeBranding,
} from '../utils/brandingStorage';

const SETTINGS_ID = 'main';

export default function useBranding() {
  const [branding, setBranding] = useState(() => getLocalBranding());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);

  const loadBranding = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('clinic_settings')
      .select('clinic_name, logo_url')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (loadError) {
      if (isMissingClinicSettingsTable(loadError)) {
        setError(null);
        setUsingLocalFallback(true);
        setBranding(getLocalBranding());
      } else {
        setError(loadError.message);
        setBranding(getLocalBranding() || DEFAULT_BRANDING);
      }
    } else {
      setError(null);
      setUsingLocalFallback(false);
      setBranding(normalizeBranding(data));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadBranding();

    const channel = supabase
      .channel('clinic-settings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_settings' }, loadBranding)
      .subscribe();

    const handleLocalBrandingUpdate = (event) => {
      setBranding(normalizeBranding(event.detail));
      setUsingLocalFallback(true);
    };

    window.addEventListener(BRANDING_UPDATED_EVENT, handleLocalBrandingUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(BRANDING_UPDATED_EVENT, handleLocalBrandingUpdate);
    };
  }, [loadBranding]);

  return {
    branding,
    loading,
    error,
    usingLocalFallback,
    refreshBranding: loadBranding,
  };
}
