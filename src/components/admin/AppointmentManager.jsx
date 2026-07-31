import { useEffect, useState } from 'react';
import { TREATMENTS } from '../../config/constants';
import { supabase } from '../../supabaseClient';
import { formatAppointmentDate } from '../../utils/formatters';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const initialForm = {
  patient_email: '',
  name: '',
  phone: '',
  treatment: TREATMENTS[0],
  date: '',
};

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

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

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    const payload = {
      patient_email: form.patient_email.trim().toLowerCase(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      treatment: form.treatment,
      date: form.date,
    };

    const { error: insertError } = await supabase.from('appointments').insert([payload]);

    if (insertError) {
      setNotice({
        type: 'error',
        text: `No se pudo crear la cita: ${insertError.message}. Comprueba que exista la columna patient_email.`,
      });
    } else {
      setNotice({ type: 'success', text: 'Cita creada. El paciente la verá automáticamente en su portal.' });
      setForm(initialForm);
      await loadAppointments();
    }

    setSaving(false);
  };

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
        eyebrow="Gestión exclusiva del fisio"
        title="Crear y gestionar citas"
        description="Solo el fisioterapeuta crea citas. Cada paciente solo recibe las asignadas a su correo."
      />

      <form onSubmit={handleCreate} className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">Email del paciente</label>
          <input
            className="input"
            type="email"
            required
            value={form.patient_email}
            onChange={(event) => updateField('patient_email', event.target.value)}
            placeholder="paciente@email.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Nombre</label>
          <input className="input" required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Nombre del paciente" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Teléfono</label>
          <input className="input" type="tel" required value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="611 223 344" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Tratamiento</label>
          <select className="input" value={form.treatment} onChange={(event) => updateField('treatment', event.target.value)}>
            {TREATMENTS.map((treatment) => (
              <option key={treatment}>{treatment}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Fecha y hora</label>
          <input className="input" type="datetime-local" required value={form.date} onChange={(event) => updateField('date', event.target.value)} />
        </div>
        {notice && (
          <div className="sm:col-span-2">
            <Alert type={notice.type}>{notice.text}</Alert>
          </div>
        )}
        <button className="btn-primary sm:col-span-2" type="submit" disabled={saving}>
          {saving ? 'Creando cita...' : 'Crear cita para el paciente'}
        </button>
      </form>

      {error && <Alert type="error">Error cargando citas: {error}</Alert>}

      <div className="mt-4 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando citas...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            No hay citas creadas.
          </div>
        ) : (
          appointments.map((appointment) => (
            <article key={appointment.id || `${appointment.name}-${appointment.date}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-950">{appointment.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-sky-700">{appointment.treatment}</p>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div>
                      <dt className="inline font-bold text-slate-800">Email paciente: </dt>
                      <dd className="inline">{appointment.patient_email || 'Sin email asignado'}</dd>
                    </div>
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
                <button type="button" onClick={() => handleDelete(appointment)} className="btn-danger" disabled={!appointment.id || deletingId === appointment.id}>
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
