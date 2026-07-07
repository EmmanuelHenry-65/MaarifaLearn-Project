import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPreferences, updatePreferences, SettingsError, type PreferenceSettings } from '../../services/settings.service';
import ToggleSwitch from './ToggleSwitch';
import SelectField from './SelectField';
import FormAlert from './FormAlert';

const LEARNING_VIEW_OPTIONS = [
  { label: 'Detailed', value: 'detailed' },
  { label: 'Compact', value: 'compact' },
];

export default function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [saved, setSaved] = useState<PreferenceSettings | null>(null);
  const [draft, setDraft] = useState<PreferenceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const iconBg = theme === 'light' ? 'bg-cyan-50 border-cyan-100' : 'bg-cyan-500/10 border-cyan-500/20';
  const rowBorder = theme === 'light' ? 'border-slate-100' : 'border-[rgba(56,78,135,0.15)]';

  // Loads the preferences saved against this account so they persist across
  // logout/login and across devices, not just via localStorage.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    getPreferences(user.id)
      .then((data) => {
        if (cancelled) return;
        setSaved(data);
        setDraft(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Could not load your preferences.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isDirty = Boolean(saved && draft && JSON.stringify(saved) !== JSON.stringify(draft));

  function updateDraft<K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    // Theme applies immediately for instant visual feedback; it's persisted
    // to the account (or rolled back) when Save/Cancel is pressed.
    if (key === 'theme') setTheme(value as PreferenceSettings['theme']);
  }

  function handleCancel() {
    if (!saved) return;
    setDraft(saved);
    setTheme(saved.theme);
    setFeedback(null);
  }

  async function handleSave() {
    if (!user || !draft) return;

    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updatePreferences(user.id, draft);
      setSaved(updated);
      setDraft(updated);
      setTheme(updated.theme);
      setFeedback({ type: 'success', message: 'Preferences saved successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof SettingsError ? err.message : 'Could not save your preferences.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !draft) {
    return (
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <p className={`text-sm ${labelColor}`}>Loading preferences…</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 ${cardBg}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${iconBg}`}>⚡</span>
        <div>
          <h3 className={`font-bold text-base ${textColor}`}>User Preferences</h3>
          <p className={`${labelColor} text-xs mt-0.5`}>These settings are saved to your account and follow you across devices.</p>
        </div>
      </div>

      {feedback && (
        <div className="mb-4">
          <FormAlert type={feedback.type} message={feedback.message} />
        </div>
      )}

      <div>
        <PreferenceRow icon="🎨" label="Theme" description="Switch between light and dark mode." borderClass={rowBorder}>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateDraft('theme', option)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all duration-200 ${
                  draft.theme === option
                    ? 'bg-cyan-600 border-cyan-600 text-white'
                    : theme === 'light'
                      ? 'border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'border-[rgba(56,78,135,0.3)] text-gray-300 hover:border-[rgba(56,78,135,0.5)]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </PreferenceRow>

        <PreferenceRow icon="🔔" label="Study Reminders" description="Get notified to keep up with your study plan." borderClass={rowBorder}>
          <ToggleSwitch
            label="Study reminders"
            checked={draft.studyRemindersEnabled}
            onChange={(value) => updateDraft('studyRemindersEnabled', value)}
          />
        </PreferenceRow>

        <PreferenceRow icon="💡" label="Show Quiz Hints" description="Display helpful hints while taking quizzes." borderClass={rowBorder}>
          <ToggleSwitch
            label="Show quiz hints"
            checked={draft.quizHintsEnabled}
            onChange={(value) => updateDraft('quizHintsEnabled', value)}
          />
        </PreferenceRow>

        <PreferenceRow icon="▦" label="Default Learning View" description="Choose how lessons are displayed by default." borderClass="" isLast>
          <div className="w-full sm:w-48">
            <SelectField
              label=""
              className="!py-2"
              value={draft.defaultLearningView}
              options={LEARNING_VIEW_OPTIONS}
              onChange={(e) => updateDraft('defaultLearningView', e.target.value as PreferenceSettings['defaultLearningView'])}
            />
          </div>
        </PreferenceRow>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          disabled={saving || !isDirty}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          disabled={saving || !isDirty}
          onClick={handleCancel}
          className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 disabled:opacity-60 ${
            theme === 'light' ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-[rgba(56,78,135,0.3)] text-gray-300 hover:bg-[rgba(56,78,135,0.1)]'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PreferenceRow({
  icon,
  label,
  description,
  children,
  borderClass,
  isLast,
}: {
  icon: string;
  label: string;
  description: string;
  children: React.ReactNode;
  borderClass: string;
  isLast?: boolean;
}) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${isLast ? '' : `border-b ${borderClass}`}`}>
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-sm text-cyan-500 flex-shrink-0">
          {icon}
        </span>
        <div>
          <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
          <p className={`text-xs ${labelColor}`}>{description}</p>
        </div>
      </div>
      <div className="sm:flex-shrink-0 sm:pl-12">{children}</div>
    </div>
  );
}
