import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { formatAppointmentDate } from '../../utils/formatters';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    const { data, error: loadError } = await supabase
      .from('appointments')
      .select('*')
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
      .channel('appointments-admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, loadAppointments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (appointment) => {
    if (!window.confirm(`¿Eliminar la cita de ${appointment.name}?`)) return;

    setDeletingId(appointment.id);
    const { error: deleteError } = await supabase.from('appointments').delete().eq('id', appointment.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      await loadAppointments();
    }
    setDeletingId(null);
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Citas realtime"
        title="Solicitudes de pacientes"
        description="Visualiza, gestiona y elimina reservas almacenadas en appointments."
      />

      {error && <Alert type="error">Error cargando citas: {error}</Alert>}

      <div className="mt-4 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando citas...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            No hay citas solicitadas.
          </div>
        ) : (
          appointments.map((appointment) => (
            <article
              key={appointment.id || `${appointment.name}-${appointment.date}`}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-950">{appointment.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-sky-700">{appointment.treatment}</p>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div>
                      <dt className="inline font-bold text-slate-800">Fecha: </dt>
                      <dd className="inline">{formatAppointmentDate(appointment.date)}</dd>
                    </div>
                    <div>
                      <dt className="inline font-bold text-slate-800">Teléfono: </dt>
                      <dd className="inline">{appointment.phone}</dd>
                    </div>
                  </dl>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(appointment)}
                  className="btn-danger"
                  disabled={!appointment.id || deletingId === appointment.id}
                >
                  {deletingId === appointment.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
