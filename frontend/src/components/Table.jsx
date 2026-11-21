export default function Table({ head, children }) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="p-3 font-mono text-xs font-normal uppercase tracking-[0.12em] text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
