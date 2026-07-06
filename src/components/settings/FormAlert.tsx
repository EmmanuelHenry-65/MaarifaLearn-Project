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
      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
        isSuccess
          ? 'bg-green-500/10 border-green-500/30 text-green-500'
          : 'bg-red-500/10 border-red-500/30 text-red-500'
      }`}
    >
      <span>{isSuccess ? '✅' : '⚠️'}</span>
      <span>{message}</span>
    </div>
  );
}
