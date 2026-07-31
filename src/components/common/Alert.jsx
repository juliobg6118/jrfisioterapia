export default function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[type]}`}>{children}</div>;
}
