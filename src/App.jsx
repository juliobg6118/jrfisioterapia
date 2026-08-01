import { useEffect, useMemo, useState } from 'react';
import AuthScreen from './components/auth/AuthScreen';
import Header from './components/common/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import PatientPortal from './components/patient/PatientPortal';
import { ADMIN_EMAIL } from './config/constants';
import useBranding from './hooks/useBranding';
import { supabase } from './supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { branding, refreshBranding } = useBranding();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user;
  const role = useMemo(() => {
    if (!user?.email) return null;
    return user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'patient';
  }, [user?.email]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          <p className="font-semibold">Conectando con Fisioterapia...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <AuthScreen branding={branding} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} role={role} onSignOut={handleSignOut} branding={branding} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {role === 'admin' ? (
          <AdminDashboard user={user} branding={branding} onBrandingUpdated={refreshBranding} />
        ) : (
          <PatientPortal user={user} branding={branding} />
        )}
      </main>
    </div>
  );
}
