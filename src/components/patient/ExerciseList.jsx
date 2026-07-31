import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadExercises = async () => {
    const { data, error: loadError } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setExercises(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExercises();

    const channel = supabase
      .channel('exercises-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises' }, loadExercises)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Ejercicios"
        title="Rutinas interactivas"
        description="Contenido cargado desde la tabla exercises y actualizado automáticamente."
      />

      {error && <Alert type="error">No se pudieron cargar los ejercicios: {error}</Alert>}

      <div className="mt-4 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando ejercicios...</p>
        ) : exercises.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            Todavía no hay ejercicios publicados.
          </div>
        ) : (
          exercises.map((exercise) => (
            <article key={exercise.id || exercise.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              {exercise.image && (
                <img
                  src={exercise.image}
                  alt={exercise.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-950">{exercise.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{exercise.description}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
