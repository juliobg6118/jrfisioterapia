import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_BRANDING } from '../../config/constants';
import { supabase } from '../../supabaseClient';
import Alert from '../common/Alert';
import SectionHeader from '../common/SectionHeader';

const SETTINGS_ID = 'main';
const MAX_LOGO_SIZE_BYTES = 750 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function BrandingCustomizer({ branding, onBrandingUpdated }) {
  const [clinicName, setClinicName] = useState(branding?.clinicName || DEFAULT_BRANDING.clinicName);
  const [logoUrl, setLogoUrl] = useState(branding?.logoUrl || '');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setClinicName(branding?.clinicName || DEFAULT_BRANDING.clinicName);
    setLogoUrl(branding?.logoUrl || '');
  }, [branding?.clinicName, branding?.logoUrl]);

  useEffect(() => {
    if (!file) {
      setFilePreview('');
      return undefined;
    }

    const preview = URL.createObjectURL(file);
    setFilePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [file]);

  const previewLogo = useMemo(() => filePreview || logoUrl, [filePreview, logoUrl]);

  const resolveLogoValue = async () => {
    if (!file) return logoUrl.trim();

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      throw new Error('El logo es demasiado grande. Usa una imagen menor de 750 KB o pega una URL pública.');
    }

    return fileToDataUrl(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const finalLogoUrl = await resolveLogoValue();
      const { error } = await supabase.from('clinic_settings').upsert(
        {
          id: SETTINGS_ID,
          clinic_name: clinicName.trim() || DEFAULT_BRANDING.clinicName,
          logo_url: finalLogoUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (error) throw error;

      setLogoUrl(finalLogoUrl);
      setFile(null);
      setNotice({ type: 'success', text: 'Marca actualizada. El logo y nombre aparecerán también a los pacientes.' });
      await onBrandingUpdated?.();
    } catch (error) {
      setNotice({
        type: 'error',
        text: `No se pudo guardar la personalización: ${error.message}. Revisa que exista la tabla clinic_settings.`,
      });
    }

    setLoading(false);
  };

  return (
    <section className="card p-6 sm:p-8">
      <SectionHeader
        eyebrow="Marca de la clínica"
        title="Personalizar logo e identidad"
        description="Sube un logo pequeño o pega una URL de imagen. Ya no necesitas crear un bucket de Storage para guardar el logo."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Nombre de la clínica</label>
          <input className="input" value={clinicName} onChange={(event) => setClinicName(event.target.value)} placeholder="Ej. JR Fisioterapia" required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">Subir logo desde el ordenador</label>
          <input
            className="input file:mr-4 file:rounded-xl file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-sky-700"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <p className="mt-2 text-xs text-slate-400">Recomendado: PNG/WebP cuadrado y menor de 750 KB.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">O usar URL de imagen</label>
          <input className="input" type="url" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://..." />
        </div>

        {previewLogo && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Vista previa</p>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-sm">
                <img src={previewLogo} alt="Vista previa del logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-950">{clinicName || DEFAULT_BRANDING.clinicName}</p>
                <p className="text-sm text-slate-500">Así se verá en la cabecera.</p>
              </div>
            </div>
          </div>
        )}

        {notice && <Alert type={notice.type}>{notice.text}</Alert>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Guardando marca...' : 'Guardar personalización'}
        </button>
      </form>
    </section>
  );
}
