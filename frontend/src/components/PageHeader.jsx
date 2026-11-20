export default function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-light">{title}</h1>
      {children}
    </div>
  );
}
