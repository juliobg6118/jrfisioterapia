import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_BRANDING } from '../config/constants';
import { supabase } from '../supabaseClient';

const SETTINGS_ID = 'main';

export default function useBranding() {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBranding = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('clinic_settings')
      .select('clinic_name, logo_url')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
      setBranding(DEFAULT_BRANDING);
    } else {
      setError(null);
      setBranding({
        clinicName: data?.clinic_name || DEFAULT_BRANDING.clinicName,
        logoUrl: data?.logo_url || DEFAULT_BRANDING.logoUrl,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadBranding();

    const channel = supabase
      .channel('clinic-settings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_settings' }, loadBranding)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadBranding]);

  return {
    branding,
    loading,
    error,
    refreshBranding: loadBranding,
  };
}
