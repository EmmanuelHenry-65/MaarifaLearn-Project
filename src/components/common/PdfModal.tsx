import { useEffect } from 'react';
import { forceDownloadUrl } from '../../utils/download';

interface PdfModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

export default function PdfModal({ title, url, onClose }: PdfModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden border border-[rgba(56,78,135,0.3)] bg-[#0a0e1a] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(56,78,135,0.3)] flex-shrink-0">
          <p className="font-bold text-sm text-white truncate pr-4">{title}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={forceDownloadUrl(url, `${title}.pdf`)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center transition-colors"
              aria-label="Close PDF"
            >
              ✕
            </button>
          </div>
        </div>
        <iframe className="flex-1 w-full bg-white" src={url} title={title} />
      </div>
    </div>
  );
}
