import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPreferences } from '../services/settings.service';
import { notifyDueTasksToday } from '../services/studyPlanner.service';

/**
 * Checks once per session (mounted in AppLayout, so it runs app-wide, not
 * just on the Study Planner page) whether any of today's tasks need a
 * reminder notification - and only if the user has Study Reminders enabled
 * in Preferences.
 */
export function useStudyReminders() {
  const { user } = useAuth();
  const checkedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || checkedForUserId.current === user.id) return;
    checkedForUserId.current = user.id;

    getPreferences(user.id)
      .then((preferences) => {
        if (!preferences.studyRemindersEnabled) return;
        return notifyDueTasksToday(user.id);
      })
      .catch(() => {
        // Non-critical: a missed reminder check shouldn't affect anything else.
      });
  }, [user]);
}
