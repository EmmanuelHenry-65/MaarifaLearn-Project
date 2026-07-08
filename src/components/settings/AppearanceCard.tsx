import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPreferences, updatePreferences, SettingsError, type PreferenceSettings } from '../../services/settings.service';
import SettingsRow from './SettingsRow';
import ComingSoonBadge from './ComingSoonBadge';
import FormAlert from './FormAlert';

// Appearance tab. Theme reuses the same account-level preference the
// Preferences tab already reads/writes (getPreferences/updatePreferences,
// useTheme) so both stay in sync — clicking Light/Dark here applies and
// saves immediately, the same as it would from Preferences. Everything
// else here (accent color, font size, etc.) has no supporting state or
// app-wide wiring yet, so it's presented as "Coming Soon".
export default function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<PreferenceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sectionBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    getPreferences(user.id)
      .then((data) => {
        if (!cancelled) setPreferences(data);
      })
      .catch((err) => {
        if (!cancelled) setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Could not load your appearance settings.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleThemeSelect(option: PreferenceSettings['theme']) {
    if (!user || !preferences || saving) return;

    setTheme(option); // instant visual feedback
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updatePreferences(user.id, { ...preferences, theme: option });
      setPreferences(updated);
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof SettingsError ? err.message : 'Could not save your theme.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${textColor}`}>Theme</h3>
          <p className={`${labelColor} text-xs mt-1`}>Choose how the application looks.</p>
        </div>

        {feedback && (
          <div className="mb-4">
            <FormAlert type={feedback.type} message={feedback.message} />
          </div>
        )}

        {loading || !preferences ? (
          <p className={`text-sm ${labelColor}`}>Loading…</p>
        ) : (
          <SettingsRow icon="🎨" label="App Theme" description="Applies immediately and is saved to your account.">
            <div className="flex gap-2 flex-wrap">
              {(['light', 'dark'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={saving}
                  onClick={() => handleThemeSelect(option)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-colors disabled:opacity-60 ${
                    preferences.theme === option
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : theme === 'light'
                        ? 'border-slate-200 text-slate-600'
                        : 'border-[rgba(56,78,135,0.3)] text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize opacity-50 cursor-not-allowed ${
                  theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-[rgba(56,78,135,0.3)] text-gray-300'
                }`}
              >
                System
              </span>
            </div>
          </SettingsRow>
        )}
        {!loading && preferences && (
          <p className="text-[11px] italic text-amber-500/80 mt-3 pl-11">
            🛠 "System" needs ThemeContext to support a system mode and listen for OS theme changes via matchMedia.
          </p>
        )}
      </div>

      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${textColor}`}>Customization</h3>
          <p className={`${labelColor} text-xs mt-1`}>Fine-tune the look and feel of the app.</p>
        </div>

        <div className="space-y-4">
          <SettingsRow
            icon="🖌️"
            label="Accent Color"
            description="Choose the color used for buttons, highlights, and interactive elements."
            buildNote="Needs a new preference column, plus swapping hardcoded colors for a CSS variable across the whole app."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="🔤"
            label="Font Size"
            description="Adjust text size for comfortable reading."
            buildNote="Needs a preference column and a root font-size variable applied app-wide."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="📐"
            label="Compact Mode"
            description="Reduce spacing to display more content."
            buildNote="Needs a preference column and conditional spacing across shared layout components."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="🎞️"
            label="Reduce Motion"
            description="Minimize animations throughout the app."
            buildNote="Needs a preference column (or the OS prefers-reduced-motion setting) wired into animations."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="🔲"
            label="High Contrast Mode"
            description="Improve readability and accessibility."
            buildNote="Needs a preference column and an alternate color palette applied conditionally."
          >
            <ComingSoonBadge />
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}
