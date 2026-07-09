import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllRead, type AppNotification, type NotificationType } from '../../services/notifications.service';
import { formatRelativeTime } from '../../utils/time';
import Spinner from '../common/Spinner';

const TYPE_ICON: Record<NotificationType, string> = {
  system: '⚙️',
  exam: '📝',
  planner: '📅',
  achievement: '🏆',
  ai: '✨',
};

export default function NotificationsCard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sectionBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const rowBg = theme === 'light' ? 'bg-white border-slate-200' : 'bg-[rgba(17,24,50,0.5)] border-[rgba(56,78,135,0.15)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    getNotifications(user.id, 50)
      .then((data) => {
        if (cancelled) return;
        setNotifications(data);
        return markAllRead(user.id);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load your notifications.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className={`rounded-xl border p-5 ${sectionBg}`}>
      <div className="mb-5">
        <h3 className={`font-bold text-base ${textColor}`}>Notifications</h3>
        <p className={`${labelColor} text-xs mt-1`}>Your last 50 notifications - badges earned, study reminders, and more.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : loadError ? (
        <p className="text-sm text-center py-6 text-red-500">{loadError}</p>
      ) : notifications.length === 0 ? (
        <p className={`text-sm text-center py-6 ${labelColor}`}>No notifications yet.</p>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${rowBg}`}>
              <span className="w-8 h-8 rounded-lg border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-sm flex-shrink-0">
                {TYPE_ICON[n.type] ?? '🔔'}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-tight ${textColor}`}>{n.title}</p>
                <p className={`text-xs mt-0.5 ${labelColor}`}>{n.message}</p>
                <p className="text-[10px] mt-1 text-gray-500">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
