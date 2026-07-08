import { useState } from 'react';

interface DeleteAccountModalProps {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const CONFIRM_WORD = 'DELETE';

export default function DeleteAccountModal({ onConfirm, onClose }: DeleteAccountModalProps) {
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setError('');
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete your account. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={deleting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#0a0e1a] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-red-500 font-bold text-base">Delete your account?</h3>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">
          This permanently deletes your profile, progress, exam history, notes, and everything else tied to your account. This cannot be undone.
        </p>
        <p className="text-gray-400 text-xs mt-3">
          Type <span className="font-mono font-bold text-red-400">{CONFIRM_WORD}</span> to confirm.
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={deleting}
          className="mt-2 w-full rounded-lg bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.3)] px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 disabled:opacity-60"
          autoFocus
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs font-bold hover:bg-[rgba(56,78,135,0.1)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={typed !== CONFIRM_WORD || deleting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
