import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { formatAppointmentDate } from '../../utils/formatters';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

export default function PatientAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientEmail = user?.email?.toLowerCase();

  const loadAppointments = async () => {
    if (!patientEmail) return;

    const { data, error: loadError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_email', patientEmail)
      .order('date', { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setAppointments(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();

    const channel = supabase
      .channel(`patient-appointments-${patientEmail}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `patient_email=eq.${patientEmail}` },
        loadAppointments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientEmail]);

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Mi agenda"
        title="Mis citas asignadas"
        description="Solo verás las citas que el fisioterapeuta haya creado para tu correo electrónico."
      />

      {error && (
        <Alert type="error">
          No se pudieron cargar tus citas: {error}. Comprueba que la tabla appointments tenga la columna patient_email.
        </Alert>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando tus citas...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            Aún no tienes citas asignadas. Cuando el fisio te programe una, aparecerá aquí automáticamente.
          </div>
        ) : (
          appointments.map((appointment) => (
            <article key={appointment.id || `${appointment.name}-${appointment.date}`} className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Cita confirmada</p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">{appointment.treatment}</h3>
                  <p className="mt-2 text-sm text-slate-600">Paciente: {appointment.name}</p>
                  <p className="text-sm text-slate-600">Teléfono: {appointment.phone}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm">
                  🕒 {formatAppointmentDate(appointment.date)}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
