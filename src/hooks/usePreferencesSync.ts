import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getPreferences } from '../services/settings.service';

/**
 * Applies the signed-in user's saved theme once per session (mounted in
 * AppLayout, so it runs for every authenticated route, not just Settings).
 * This is what makes "load the saved preferences automatically when the
 * user logs in" true app-wide rather than only inside the Settings page.
 */
export function usePreferencesSync() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const syncedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedForUserId.current === user.id) return;
    syncedForUserId.current = user.id;

    getPreferences(user.id)
      .then((preferences) => setTheme(preferences.theme))
      .catch(() => {
        // Non-critical: silently keep whatever theme was already active
        // (falls back to the last theme cached in localStorage).
      });
  }, [user, setTheme]);
}
