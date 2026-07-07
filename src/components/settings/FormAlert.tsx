interface FormAlertProps {
  type: 'success' | 'error';
  message: string;
}

// Inline success/error banner shown at the top of a settings card after a
// save attempt.
export default function FormAlert({ type, message }: FormAlertProps) {
  const isSuccess = type === 'success';
  return (
    <div
      role="alert"
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
        isSuccess
          ? 'bg-green-500/10 border-green-500/30 text-green-500'
          : 'bg-red-500/10 border-red-500/30 text-red-500'
      }`}
    >
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {isSuccess ? '✅' : '⚠️'}
      </span>
      <span>{message}</span>
    </div>
  );
}
