import { getInitials } from '../../utils/formatters';

export default function Header({ user, role, onSignOut, branding }) {
  const displayName = user?.email || user?.phone || 'Usuario';
  const identifierLabel = user?.phone ? 'Teléfono autenticado' : 'Sesión autenticada';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 font-black text-white shadow-lg shadow-sky-200">
            {branding?.logoUrl ? <img src={branding.logoUrl} alt={branding.clinicName} className="h-full w-full object-cover" /> : 'FP'}
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-slate-950">{branding?.clinicName || 'FisioPro'}</p>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-600">
              {role === 'admin' ? 'Panel fisioterapeuta' : 'Portal paciente'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{identifierLabel}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            {user?.email ? getInitials(user.email) : user?.phone ? '📱' : 'FP'}
          </div>
          <button onClick={onSignOut} className="btn-danger">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
