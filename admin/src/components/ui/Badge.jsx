export default function Badge({ status, children }) {
  const colors = {
    active: 'bg-success text-primary',
    inactive: 'bg-text-secondary text-primary',
    pending: 'bg-warning text-primary',
    failed: 'bg-danger text-white',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>
      {children}
    </span>
  );
}
