export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <div role="alert" className="bg-danger-bg px-3 py-2.5 text-[13px] text-danger">{message}</div>;
}