import { useEffect } from 'react';
import { extractYouTubeId } from '../../utils/youtube';

interface VideoModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

export default function VideoModal({ title, url, onClose }: VideoModalProps) {
  const videoId = extractYouTubeId(url);

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
        className="w-full max-w-3xl rounded-2xl overflow-hidden border border-[rgba(56,78,135,0.3)] bg-[#0a0e1a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(56,78,135,0.3)]">
          <p className="font-bold text-sm text-white truncate pr-4">{title}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Close video"
          >
            ✕
          </button>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {videoId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              // No allowFullScreen -- YouTube's native fullscreen takes over
              // the entire browser viewport with no visible way back to this
              // modal's close button, leaving students stuck. The video stays
              // large and playable inside the modal, which always has a
              // visible X, click-outside-to-close, and an Escape handler.
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Couldn't load this video — <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 ml-1">open it directly instead</a>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
