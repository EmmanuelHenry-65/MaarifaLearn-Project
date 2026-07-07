import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateGrade, type ProfileInfo } from '../services/learning.service';
import { getNotifications, getUnreadCount, markAllRead, type AppNotification } from '../services/notifications.service';
import ThemeToggle from './ThemeToggle';

interface TopNavProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria'];
const GRADES = ['7', '8', '9', '10', '11', '12'];

function getPageIcon(title: string) {
  if (title === 'AI Tutor') {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 animate-float">
        <img src="/images/ai-robot.png" alt="AI Tutor" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (title === 'Study Planner') {
    return (
      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    );
  }
  if (title === 'Past Papers') {
    return (
      <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      </div>
    );
  }
  if (title === 'Settings') {
    return (
      <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 shadow-lg shadow-purple-500/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9c.14.32.22.66.22 1H21a2 2 0 1 1 0 4h-1.38c0 .34-.08.68-.22 1z" />
        </svg>
      </div>
    );
  }
  if (title === 'Accomplishments') {
    return (
      <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      </div>
    );
  }
  if (title === 'Resources') {
    return (
      <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
    );
  }
  return null;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TopNav({ title, subtitle, onMenuClick }: TopNavProps) {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState<'country' | 'grade' | 'notifications' | 'profile' | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => p && setProfile(p)).catch(() => {});
    getUnreadCount(user.id).then(setUnreadCount).catch(() => {});
  }, [user]);

  function showComingSoon(message: string) {
    setComingSoon(message);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoon(null), 2500);
  }

  function toggleMenu(menu: 'country' | 'grade' | 'notifications' | 'profile') {
    const opening = openMenu !== menu;
    setOpenMenu(opening ? menu : null);
    setComingSoon(null);
    if (opening && menu === 'notifications' && user) {
      getNotifications(user.id).then((list) => {
        setNotifications(list);
        setNotificationsLoaded(true);
        return markAllRead(user.id);
      }).then(() => setUnreadCount(0)).catch(() => {});
    }
  }

  async function handleGradeSelect(grade: string) {
    if (grade === '10') {
      setOpenMenu(null);
      if (user) {
        setProfile((prev) => (prev ? { ...prev, grade } : prev));
        try {
          await updateGrade(user.id, grade);
        } catch {
          // best-effort; UI already reflects the intended value
        }
      }
    } else {
      showComingSoon(`Grade ${grade} materials are coming soon`);
    }
  }

  function handleCountrySelect(country: string) {
    if (country === 'Kenya') {
      setOpenMenu(null);
    } else {
      showComingSoon(`${country} support is coming soon`);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const displayGrade = profile?.grade ?? '10';
  const dropdownPanel = theme === 'light' ? 'bg-white border-slate-200 shadow-lg' : 'bg-[#111832] border-[rgba(56,78,135,0.3)] shadow-xl';
  const buttonBase = `flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-200 hover:border-[rgba(56,78,135,0.5)]'}`;

  return (
    <header className="flex items-center justify-between mb-5 gap-3 min-w-0 w-full flex-nowrap transition-colors duration-300">
      <div className="min-w-0 flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className={`lg:hidden flex-shrink-0 p-2 rounded-xl border transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-300'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="hidden sm:block">{getPageIcon(title)}</div>
        <div className="min-w-0">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold flex items-center gap-3 leading-tight tracking-tight truncate transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {title}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-2 truncate transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <ThemeToggle />

        {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}

        {/* Country Selector */}
        <div className="relative hidden md:block">
          <button onClick={() => toggleMenu('country')} className={buttonBase}>
            <span className="flex items-center justify-center w-5 h-4 rounded-[3px] overflow-hidden relative text-[8px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #000 0 33%, #b91c1c 33% 66%, #16a34a 66% 100%)' }}>
              <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">KE</span>
            </span>
            <span>Kenya (CBC)</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
          {openMenu === 'country' && (
            <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border p-1.5 z-50 ${dropdownPanel}`}>
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${country === 'Kenya' ? 'text-cyan-500 font-semibold' : theme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-gray-300 hover:bg-[rgba(56,78,135,0.2)]'}`}
                >
                  {country}
                  {country === 'Kenya' && <span className="text-[10px]">Active</span>}
                </button>
              ))}
              {comingSoon && <p className="px-3 py-2 text-[11px] text-amber-500">🚧 {comingSoon}</p>}
            </div>
          )}
        </div>

        {/* Grade Selector */}
        <div className="relative hidden lg:block">
          <button onClick={() => toggleMenu('grade')} className={buttonBase}>
            <span>Grade {displayGrade}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
          {openMenu === 'grade' && (
            <div className={`absolute right-0 top-full mt-2 w-40 rounded-xl border p-1.5 z-50 ${dropdownPanel}`}>
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${grade === displayGrade ? 'text-cyan-500 font-semibold' : theme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-gray-300 hover:bg-[rgba(56,78,135,0.2)]'}`}
                >
                  Grade {grade}
                  {grade === '10' && <span className="text-[10px]">Available</span>}
                </button>
              ))}
              {comingSoon && <p className="px-3 py-2 text-[11px] text-amber-500">🚧 {comingSoon}</p>}
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative">
          <button onClick={() => toggleMenu('notifications')} className={`relative p-2.5 rounded-xl border transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-slate-300 shadow-sm' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] text-gray-400 hover:text-white hover:border-[rgba(56,78,135,0.5)]'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            )}
          </button>
          {openMenu === 'notifications' && (
            <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl border p-2 z-50 max-h-80 overflow-y-auto ${dropdownPanel}`}>
              {!notificationsLoaded ? (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`px-3 py-2.5 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-[rgba(56,78,135,0.15)]'}`}>
                    <p className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => toggleMenu('profile')} className={`flex items-center gap-2.5 pl-2 pr-2 sm:pr-3 py-1.5 rounded-xl border transition-all ${theme === 'light' ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300' : 'bg-[rgba(17,24,50,0.8)] border-[rgba(56,78,135,0.3)] hover:border-[rgba(56,78,135,0.5)]'}`}>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-teal-400 to-blue-600">
              {(profile?.fullName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className={`text-sm font-semibold leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{profile?.fullName ?? 'Learner'}</p>
              <p className="text-gray-500 text-[11px] leading-tight">Learner</p>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 ml-1 hidden sm:block">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
          {openMenu === 'profile' && (
            <div className={`absolute right-0 top-full mt-2 w-52 rounded-xl border p-1.5 z-50 ${dropdownPanel}`}>
              <div className="px-3 py-2 border-b border-[rgba(56,78,135,0.15)] mb-1">
                <p className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{profile?.fullName ?? 'Learner'}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.email ?? user?.email}</p>
              </div>
              <button
                onClick={() => { setOpenMenu(null); navigate('/settings'); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-gray-300 hover:bg-[rgba(56,78,135,0.2)]'}`}
              >
                Settings
              </button>
              <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
