import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const initialExercise = {
  title: '',
  description: '',
  image: '',
  patient_email: '',
};

export default function ExercisePublisher() {
  const [exercise, setExercise] = useState(initialExercise);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [notice, setNotice] = useState(null);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('patient_email, name')
      .order('patient_email');

    if (!error && data) {
      // Deduplicate by patient_email
      const unique = [];
      const seen = new Set();
      for (const row of data) {
        const email = row.patient_email?.toLowerCase();
        if (email && !seen.has(email)) {
          seen.add(email);
          unique.push({ email, name: row.name });
        }
      }
      setPatients(unique);
    }
    setLoadingPatients(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const updateField = (field, value) => {
    setExercise((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const payload = {
      title: exercise.title.trim(),
      description: exercise.description.trim(),
      image: exercise.image.trim(),
      patient_email: exercise.patient_email.trim() ? exercise.patient_email.trim().toLowerCase() : null,
    };

    const { error } = await supabase.from('exercises').insert([payload]);

    if (error) {
      setNotice({ type: 'error', text: `No se pudo publicar el ejercicio: ${error.message}` });
    } else {
      setNotice({
        type: 'success',
        text: exercise.patient_email
          ? `Ejercicio publicado para ${exercise.patient_email}. El paciente lo verá en su portal.`
          : 'Ejercicio publicado como general. Todos los pacientes lo verán.',
      });
      setExercise(initialExercise);
    }

    setLoading(false);
  };

  const handleSelectPatient = (email) => {
    setExercise((current) => ({ ...current, patient_email: email }));
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Ejercicios cloud"
        title="Publicar nuevo ejercicio"
        description="Crea rutinas con título, instrucciones y URL de imagen. Asigna el ejercicio a un paciente específico o déjalo como general para todos."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Título</label>
          <input
            className="input"
            type="text"
            required
            value={exercise.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Ej. Movilidad cervical suave"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Instrucciones</label>
          <textarea
            className="input min-h-36 resize-y"
            required
            value={exercise.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe series, repeticiones, frecuencia, contraindicaciones y consejos de ejecución."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">URL de imagen</label>
          <input
            className="input"
            type="url"
            required
            value={exercise.image}
            onChange={(event) => updateField('image', event.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Patient assignment */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Asignar a paciente</label>
          {loadingPatients ? (
            <p className="text-sm text-slate-400">Cargando pacientes...</p>
          ) : patients.length > 0 ? (
            <div className="space-y-2">
              <select
                className="input"
                value={exercise.patient_email}
                onChange={(event) => handleSelectPatient(event.target.value)}
              >
                <option value="">🏋️ Todos los pacientes (ejercicio general)</option>
                {patients.map((p) => (
                  <option key={p.email} value={p.email}>
                    {p.name} — {p.email}
                  </option>
                ))}
              </select>
              {exercise.patient_email && (
                <div className="flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-2 text-sm text-sky-700">
                  <span className="font-bold">👤</span>
                  <span>
                    Ejercicio personalizado para <strong>{exercise.patient_email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectPatient('')}
                    className="ml-auto text-xs font-bold text-sky-500 hover:text-sky-800"
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                className="input"
                type="email"
                value={exercise.patient_email}
                onChange={(event) => updateField('patient_email', event.target.value)}
                placeholder="paciente@email.com (dejar vacío para todos)"
              />
              <p className="text-xs text-slate-400">
                No hay pacientes registrados aún. Introduce el email manualmente o déjalo vacío para un ejercicio general.
              </p>
            </div>
          )}
        </div>

        {notice && <Alert type={notice.type}>{notice.text}</Alert>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar ejercicio'}
        </button>
      </form>
    </section>
  );
}
