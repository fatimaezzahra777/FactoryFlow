export default function StatCard({ label, value, hint }) {
  return (
    <div className="border border-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-4xl font-light">{value}</p>
      {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}
