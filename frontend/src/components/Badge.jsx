const TONES = {
  ok: 'bg-ok-bg text-ok',
  danger: 'bg-danger-bg text-danger',
  muted: 'bg-line text-muted',
};

export default function Badge({ tone = 'muted', children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}
