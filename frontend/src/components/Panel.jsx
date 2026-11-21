export default function Panel({ title, children }) {
  return (
    <section className="mb-6 flex flex-col gap-4 border border-line bg-surface p-5">
      <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{title}</h2>
      {children}
    </section>
  );
}
