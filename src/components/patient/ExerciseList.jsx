import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

export default function ExerciseList({ user }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientEmail = user?.email?.toLowerCase();

  const loadExercises = async () => {
    if (!patientEmail) {
      setLoading(false);
      return;
    }

    // Fetch exercises assigned to this patient OR general exercises (patient_email is null)
    const { data, error: loadError } = await supabase
      .from('exercises')
      .select('*')
      .or(`patient_email.is.null,patient_email.eq.${patientEmail}`)
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
  }, [patientEmail]);

  const personalExercises = exercises.filter((e) => e.patient_email);
  const generalExercises = exercises.filter((e) => !e.patient_email);

  return (
    <aside className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Ejercicios"
        title="Rutinas interactivas"
        description="Aquí verás los ejercicios personalizados para ti y los ejercicios generales publicados por tu fisioterapeuta."
      />

      {error && <Alert type="error">No se pudieron cargar los ejercicios: {error}</Alert>}

      <div className="mt-4 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando ejercicios...</p>
        ) : exercises.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
            Todavía no hay ejercicios publicados para ti.
          </div>
        ) : (
          <>
            {/* Personal exercises */}
            {personalExercises.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-sky-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs">👤</span>
                  Ejercicios personalizados
                </h3>
                <div className="space-y-4">
                  {personalExercises.map((exercise) => (
                    <article key={exercise.id || exercise.title} className="overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50">
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
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                          👤 Personalizado
                        </div>
                        <h4 className="text-lg font-black text-slate-950">{exercise.title}</h4>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{exercise.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* General exercises */}
            {generalExercises.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">🏋️</span>
                  Ejercicios generales
                </h3>
                <div className="space-y-4">
                  {generalExercises.map((exercise) => (
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
                        <h4 className="text-lg font-black text-slate-950">{exercise.title}</h4>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{exercise.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
