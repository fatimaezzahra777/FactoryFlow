export default function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] text-muted">
      {label}
      <input
        className="min-h-11 border border-field bg-surface px-3 text-sm text-white focus:outline-2 focus:outline-brand"
        {...props}
      />
    </label>
  );
}