export default function Input({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-text-primary">{label}</label>}
      <input className="w-full" {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
