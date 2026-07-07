import { useRef, useState } from 'react';
import { validateAvatarFile } from '../../utils/settingsValidation';

interface AvatarUploaderProps {
  currentUrl: string | null;
  fullName: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

// Profile picture control: shows the current avatar (or initials if none is
// set — the field is optional per the requirements), lets the user pick a
// new image with an instant local preview, and upload/remove it.
export default function AvatarUploader({ currentUrl, fullName, onUpload, onRemove }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayUrl = previewUrl ?? currentUrl;

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setBusy(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload your profile picture.');
      setPreviewUrl(null);
    } finally {
      URL.revokeObjectURL(localPreview);
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setError(null);
    try {
      await onRemove();
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove your profile picture.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-2xl ring-4 ring-cyan-500/10 shadow-lg shadow-cyan-500/10">
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(fullName)
          )}
        </div>
        {busy && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-[10px] font-semibold">
            …
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Change photo'}
          </button>
          {currentUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-500">PNG, JPEG, or WEBP. Max 3MB. Optional.</p>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
}
