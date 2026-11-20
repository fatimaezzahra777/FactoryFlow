export default function AuthLayout({ title, children }) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4 border border-line bg-surface p-7">
        <h1 className="text-3xl font-light">{title}</h1>
        {children}
      </div>
    </div>
  );
}