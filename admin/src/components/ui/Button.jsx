export default function Button({ variant = 'primary', children, ...props }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors';

  const variants = {
    primary: 'bg-accent text-primary hover:bg-blue-600',
    secondary: 'bg-card text-text-primary hover:bg-secondary',
    danger: 'bg-danger text-white hover:bg-red-700',
    outline: 'border border-accent text-accent hover:bg-accent hover:text-primary',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
