const VARIANTS = {
  primary: 'bg-brand text-ink hover:brightness-110',
  ghost: 'border border-field text-white hover:border-white',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`min-h-11 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}