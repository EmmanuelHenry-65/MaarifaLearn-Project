interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Small inline loading indicator -- replaces the bare "Loading..." text that was scattered across the app with a consistent, branded spinner + label. */
export default function Spinner({ label, size = 'sm', className = '' }: SpinnerProps) {
  const dimension = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className={`flex items-center justify-center gap-2 py-4 ${className}`}>
      <div className={`${dimension} rounded-full border-2 border-cyan-500/25 border-t-cyan-500 animate-spin`} />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
