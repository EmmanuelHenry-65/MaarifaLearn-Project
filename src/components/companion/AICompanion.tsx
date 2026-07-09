import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type PopupKind = 'welcome-back' | 'nudge' | 'exit-intent';
export type Mood = 'happy' | 'excited' | 'sad';

interface Popup {
  kind: PopupKind;
  mood: Mood;
  message: string;
}

const WELCOME_BACK_MESSAGES = [
  "Hey, welcome back! Ready to pick up where you left off?",
  "Missed you! Let's make today count.",
  "You're back! Your subjects have been waiting for you.",
  "Good to see you again — let's keep that momentum going.",
];

const NUDGE_MESSAGES = [
  "You're doing great — want to explore a new topic?",
  "Quick reminder: consistency beats intensity. Keep going!",
  "Need a hand? I'm right here if you want to ask me anything.",
  "Every question you ask makes you sharper. Try me!",
  "Still here studying? That's the spirit.",
];

const EXIT_INTENT_MESSAGES = [
  "Leaving so soon? One more topic before you go?",
  "Aww, come back! Your streak is counting on you.",
  "Wait! Don't forget today's mission.",
  "Are you sure? A quick win is right around the corner.",
];

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const FIRST_NUDGE_DELAY_MS = 3 * 60 * 1000;
const NUDGE_INTERVAL_MS = 8 * 60 * 1000;
const AUTO_DISMISS_MS = 9000;
const LAST_VISIT_KEY = 'ml-companion-last-visit';

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export function CompanionFace({ mood }: { mood: Mood }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
      {mood === 'sad' ? (
        <>
          <path d="M9 18 Q12 15 15 18" />
          <circle cx="16.3" cy="16.2" r="0.9" fill="currentColor" stroke="none" />
        </>
      ) : (
        <path d="M9 16 Q12 19 15 16" strokeWidth={mood === 'excited' ? 2.2 : 1.8} />
      )}
    </svg>
  );
}

interface AICompanionProps {
  sidebarCollapsed: boolean;
}

export default function AICompanion({ sidebarCollapsed }: AICompanionProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [popup, setPopup] = useState<Popup | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const exitIntentShownRef = useRef(false);
  const autoDismissRef = useRef<number | null>(null);

  // The exam-taking and Workspace flows already have their own dedicated AI
  // surfaces (the mood check-in, AI side panels) -- don't compete with those
  // or fight their own bottom-left/bottom-right chrome for space.
  const suppressed = location.pathname.startsWith('/exams') || location.pathname.startsWith('/workspace');

  // Read (and stamp) the last-visit timestamp exactly once per mount, during
  // render rather than inside an effect. StrictMode's dev-mode double-invoke
  // of effects would otherwise read back the value the first pass just wrote,
  // always seeing a ~0ms gap on the pass that actually survives.
  const visitGapMsRef = useRef<number | null>(null);
  if (visitGapMsRef.current === null) {
    const last = localStorage.getItem(LAST_VISIT_KEY);
    const now = Date.now();
    visitGapMsRef.current = last ? now - Number(last) : Infinity;
    localStorage.setItem(LAST_VISIT_KEY, String(now));
  }

  useEffect(() => {
    popupRef.current = popup;
  }, [popup]);

  const show = (kind: PopupKind, mood: Mood, message: string) => {
    setPopup({ kind, mood, message });
    if (autoDismissRef.current) window.clearTimeout(autoDismissRef.current);
    autoDismissRef.current = window.setTimeout(() => setPopup(null), AUTO_DISMISS_MS);
  };

  const dismiss = () => {
    setPopup(null);
    if (autoDismissRef.current) window.clearTimeout(autoDismissRef.current);
  };

  // Warm greeting when returning after being away a while.
  useEffect(() => {
    if (!user) return;
    if ((visitGapMsRef.current ?? 0) > SIX_HOURS_MS) {
      const t = window.setTimeout(() => show('welcome-back', 'excited', pick(WELCOME_BACK_MESSAGES)), 2500);
      return () => window.clearTimeout(t);
    }
    // Keyed on user.id, not the user object -- AuthContext hands out a new
    // User reference on both getInitialSession() and the first
    // onAuthStateChange fire, which would otherwise cancel this timer via
    // cleanup before it ever fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Periodic in-session nudges -- first after ~3 min, then every ~8 min.
  useEffect(() => {
    if (!user) return;
    let timeoutId: number;
    const scheduleNext = (delay: number) => {
      timeoutId = window.setTimeout(() => {
        const active = document.activeElement;
        const typing = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
        if (!typing && !popupRef.current && !location.pathname.startsWith('/exams')) {
          show('nudge', 'happy', pick(NUDGE_MESSAGES));
        }
        scheduleNext(NUDGE_INTERVAL_MS);
      }, delay);
    };
    scheduleNext(FIRST_NUDGE_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Exit-intent -- mouse moving up toward the tab/back button. Desktop-only
  // heuristic; no website can truly stop someone from leaving, this is just
  // a friendly nudge while they're still on the page. Once per session.
  useEffect(() => {
    if (!user || suppressed) return;
    const handleMouseOut = (event: MouseEvent) => {
      if (exitIntentShownRef.current) return;
      if (event.clientY <= 0 && !event.relatedTarget) {
        exitIntentShownRef.current = true;
        show('exit-intent', 'sad', pick(EXIT_INTENT_MESSAGES));
      }
    };
    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [user?.id, suppressed]);

  if (!popup || suppressed) return null;

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0f1528] border-[rgba(56,78,135,0.35)] shadow-2xl';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const avatarBg =
    popup.mood === 'sad'
      ? 'bg-gradient-to-br from-slate-500 to-slate-600'
      : 'bg-gradient-to-br from-teal-400 to-blue-600';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-6 ${sidebarCollapsed ? 'lg:left-[88px]' : 'lg:left-[224px]'} z-40 w-[280px] max-w-[calc(100vw-3rem)] animate-companion-in`}
    >
      <div className={`rounded-2xl border p-4 flex gap-3 items-start ${cardBg}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${avatarBg}`}>
          <CompanionFace mood={popup.mood} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-snug ${textColor}`}>{popup.message}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={dismiss} className={`text-[11px] font-bold ${popup.kind === 'exit-intent' ? 'text-cyan-500' : mutedColor} hover:text-cyan-500 transition-colors`}>
              {popup.kind === 'exit-intent' ? "I'll stay!" : 'Got it'}
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className={`${mutedColor} hover:text-cyan-500 transition-colors flex-shrink-0`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}
