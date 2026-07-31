import { useState } from 'react';
import { TREATMENTS } from '../../config/constants';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const initialForm = {
  name: '',
  phone: '',
  treatment: TREATMENTS[0],
  date: '',
};

export default function AppointmentForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const { error } = await supabase.from('appointments').insert([
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        treatment: form.treatment,
        date: form.date,
      },
    ]);

    if (error) {
      setNotice({ type: 'error', text: `No se pudo reservar la cita: ${error.message}` });
    } else {
      setNotice({ type: 'success', text: 'Cita solicitada correctamente. Te contactaremos para confirmarla.' });
      setForm(initialForm);
    }

    setLoading(false);
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Reservas online"
        title="Solicitar cita"
        description="La petición se guarda en la tabla appointments de Supabase y aparece al instante en el panel del fisioterapeuta."
      />

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Nombre completo</label>
          <input
            className="input"
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ej. Carlos Ruiz"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Teléfono</label>
          <input
            className="input"
            type="tel"
            required
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="Ej. 611 223 344"
          />
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
          <input
            className="input"
            type="datetime-local"
            required
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
        </div>

        {notice && (
          <div className="sm:col-span-2">
            <Alert type={notice.type}>{notice.text}</Alert>
          </div>
        )}

        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Reservando...' : 'Confirmar solicitud de cita'}
          </button>
        </div>
      </form>
    </section>
  );
}
