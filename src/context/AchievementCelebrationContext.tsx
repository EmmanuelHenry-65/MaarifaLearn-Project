import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type { BadgeDefinition } from '../services/achievements.service';

interface AchievementCelebrationContextType {
  celebrate: (badges: BadgeDefinition[]) => void;
}

const AchievementCelebrationContext = createContext<AchievementCelebrationContextType | undefined>(undefined);

export function AchievementCelebrationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<BadgeDefinition[]>([]);

  const celebrate = useCallback((badges: BadgeDefinition[]) => {
    if (badges.length === 0) return;
    setQueue((prev) => [...prev, ...badges]);
  }, []);

  const current = queue[0] ?? null;

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    if (!current) return;
    confetti({
      particleCount: 130,
      spread: 95,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: ['#22d3ee', '#3b82f6', '#a855f7', '#facc15', '#34d399'],
    });
  }, [current]);

  return (
    <AchievementCelebrationContext.Provider value={{ celebrate }}>
      {children}
      {current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={dismiss}
        >
          <div
            className="glass-card p-8 max-w-sm w-full mx-4 text-center animate-achievement-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-cyan-400 text-xs font-bold tracking-wide uppercase mb-3">Achievement unlocked</p>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/40">
              {current.icon ?? '🏆'}
            </div>
            <h3 className="text-white text-xl font-extrabold mb-1">{current.name}</h3>
            <p className="text-gray-400 text-sm mb-6">{current.desc}</p>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </AchievementCelebrationContext.Provider>
  );
}

export function useAchievementCelebration() {
  const ctx = useContext(AchievementCelebrationContext);
  if (!ctx) throw new Error('useAchievementCelebration must be used inside AchievementCelebrationProvider');
  return ctx;
}
