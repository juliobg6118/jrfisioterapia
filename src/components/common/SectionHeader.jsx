export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">{eyebrow}</p>}
      <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
    </div>
  );
}
