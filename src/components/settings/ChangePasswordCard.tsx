import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { changePassword, SettingsError } from '../../services/settings.service';
import { validatePasswordStrength } from '../../utils/settingsValidation';
import PasswordInput from './PasswordInput';
import FormAlert from './FormAlert';

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: FormState = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordCard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const iconBg = theme === 'light' ? 'bg-cyan-50 border-cyan-100' : 'bg-cyan-500/10 border-cyan-500/20';

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFeedback(null);
  }

  function validate(current: FormState): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (!current.currentPassword) errors.currentPassword = 'Enter your current password.';

    const strengthError = validatePasswordStrength(current.newPassword);
    if (strengthError) errors.newPassword = strengthError;
    else if (current.newPassword === current.currentPassword) {
      errors.newPassword = 'New password must be different from the current password.';
    }

    if (current.confirmPassword !== current.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  async function handleSave() {
    if (!user?.email) return;
    if (!validate(form)) return;

    setSaving(true);
    setFeedback(null);

    try {
      // Re-authentication with the current password happens inside
      // changePassword() before the new password is ever applied.
      await changePassword(user.email, form.currentPassword, form.newPassword);
      setForm(EMPTY_FORM);
      setFeedback({ type: 'success', message: 'Password updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof SettingsError ? err.message : 'Could not update your password.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl border p-6 ${cardBg}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${iconBg}`}>🔒</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-600">Security</p>
          <h3 className={`font-bold text-base ${textColor}`}>Change Password</h3>
          <p className={`${labelColor} text-xs mt-0.5`}>Choose a strong password to keep your account secure.</p>
        </div>
      </div>

      {feedback && (
        <div className="mb-4">
          <FormAlert type={feedback.type} message={feedback.message} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PasswordInput
          label="Current Password"
          placeholder="Enter current password"
          value={form.currentPassword}
          onChange={(e) => updateField('currentPassword', e.target.value)}
          error={fieldErrors.currentPassword}
        />
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          value={form.newPassword}
          onChange={(e) => updateField('newPassword', e.target.value)}
          error={fieldErrors.newPassword}
        />
        <PasswordInput
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update Password'}
        </button>
        <button
          type="button"
          disabled={saving}
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
