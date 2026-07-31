import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const initialExercise = {
  title: '',
  description: '',
  image: '',
};

export default function ExercisePublisher() {
  const [exercise, setExercise] = useState(initialExercise);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const updateField = (field, value) => {
    setExercise((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const { error } = await supabase.from('exercises').insert([
      {
        title: exercise.title.trim(),
        description: exercise.description.trim(),
        image: exercise.image.trim(),
      },
    ]);

    if (error) {
      setNotice({ type: 'error', text: `No se pudo publicar el ejercicio: ${error.message}` });
    } else {
      setNotice({ type: 'success', text: 'Ejercicio publicado. Los pacientes lo verán actualizado al instante.' });
      setExercise(initialExercise);
    }

    setLoading(false);
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Ejercicios cloud"
        title="Publicar nuevo ejercicio"
        description="Crea rutinas con título, instrucciones y URL de imagen en la tabla exercises."
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

        {notice && <Alert type={notice.type}>{notice.text}</Alert>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar ejercicio'}
        </button>
      </form>
    </section>
  );
}
