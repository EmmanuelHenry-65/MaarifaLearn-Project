export default function FloatingAIButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-all"
      aria-label="Toggle AI Study Assistant"
    >
      {isOpen ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="10" rx="5" /><circle cx="8" cy="13" r="1" /><circle cx="16" cy="13" r="1" /><path d="M12 3v5" /><path d="M8 21h8" /></svg>
      )}
    </button>
  );
}