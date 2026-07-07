import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  getProfileSettings,
  updateProfileSettings,
  requestEmailChange,
  uploadAvatar,
  removeAvatar,
  SettingsError,
  type ProfileSettings,
} from '../../services/settings.service';
import { validateFullName, validateEmail, validateUsername } from '../../utils/settingsValidation';
import { GRADE_OPTIONS, CURRICULUM_OPTIONS, LEARNING_PATHWAY_OPTIONS } from './accountOptions';
import FormInput from './FormInput';
import SelectField from './SelectField';
import FormAlert from './FormAlert';
import AvatarUploader from './AvatarUploader';

interface FormState {
  fullName: string;
  email: string;
  username: string;
  grade: string;
  curriculum: string;
  learningPathway: string;
}

function toFormState(profile: ProfileSettings): FormState {
  return {
    fullName: profile.fullName,
    email: profile.email,
    username: profile.username ?? '',
    grade: profile.grade ?? '',
    curriculum: profile.curriculum ?? '',
    learningPathway: profile.learningPathway ?? '',
  };
}

export default function AccountInformationCard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const badgePill = theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.3)] text-gray-200';

  // Load the account information stored against this user so it's
  // available as soon as the Settings page opens.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setLoading(true);
    getProfileSettings(user.id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm(toFormState(data));
      })
      .catch((err) => {
        if (cancelled) return;
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Could not load your account information.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCancel() {
    if (profile) setForm(toFormState(profile));
    setFieldErrors({});
    setFeedback(null);
    setEditing(false);
  }

  function validate(current: FormState): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {
      fullName: validateFullName(current.fullName) ?? undefined,
      email: validateEmail(current.email) ?? undefined,
      username: validateUsername(current.username) ?? undefined,
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  async function handleSave() {
    if (!user || !profile || !form) return;
    if (!validate(form)) return;

    setSaving(true);
    setFeedback(null);

    try {
      const emailChanged = form.email.trim() !== profile.email;

      const updated = await updateProfileSettings(user.id, {
        fullName: form.fullName,
        username: form.username,
        grade: form.grade || null,
        curriculum: form.curriculum || null,
        learningPathway: form.learningPathway || null,
      });

      if (emailChanged) {
        await requestEmailChange(form.email);
      }

      setProfile(updated);
      setForm(toFormState(updated));
      setEditing(false);
      setFeedback({
        type: 'success',
        message: emailChanged
          ? 'Account information saved. Check your new email address to confirm the change.'
          : 'Account information saved successfully.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof SettingsError ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return;
    const avatarUrl = await uploadAvatar(user.id, file);
    setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
  }

  async function handleAvatarRemove() {
    if (!user) return;
    await removeAvatar(user.id);
    setProfile((prev) => (prev ? { ...prev, avatarUrl: null } : prev));
  }

  if (loading || !profile || !form) {
    return (
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <p className={`text-sm ${labelColor}`}>Loading account information…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedback && <FormAlert type={feedback.type} message={feedback.message} />}

      {/* Profile Header — the main focal point of the Account tab */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <AvatarUploader
            currentUrl={profile.avatarUrl}
            fullName={profile.fullName}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />

          <div className="flex-1 min-w-0">
            <h2 className={`text-xl sm:text-2xl font-extrabold leading-tight truncate ${textColor}`}>{profile.fullName}</h2>
            <p className={`text-sm mt-0.5 ${labelColor}`}>{profile.username ? `@${profile.username}` : 'No username set'}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgePill}`}>
                🏫 {profile.grade || 'Grade not set'}
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgePill}`}>
                📖 {profile.curriculum || 'Curriculum not set'}
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgePill}`}>
                ⚙ {profile.learningPathway || 'Pathway not set'}
              </span>
            </div>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="self-start sm:self-center flex-shrink-0 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-all duration-200"
            >
              Edit Information
            </button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <SectionHeading icon="👤" title="Personal Information" description="Your name, username, and how we reach you." />

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <FormInput
              label="Full Name"
              icon="👤"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              error={fieldErrors.fullName}
            />
            <FormInput
              label="Username"
              icon="🆔"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              error={fieldErrors.username}
            />
            <FormInput
              label="Email Address"
              icon="✉"
              type="email"
              className="sm:col-span-2"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={fieldErrors.email}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <ReadOnlyField label="Full Name" value={profile.fullName} icon="👤" />
            <ReadOnlyField label="Username" value={profile.username || 'Not set'} icon="🆔" />
            <ReadOnlyField label="Email Address" value={profile.email} icon="✉" className="sm:col-span-2" />
          </div>
        )}
      </div>

      {/* Academic Information */}
      <div className={`rounded-2xl border p-6 ${cardBg}`}>
        <SectionHeading icon="🎓" title="Academic Information" description="Your grade, curriculum, and learning pathway." />

        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <SelectField
              label="Grade"
              icon="🏫"
              value={form.grade}
              placeholder="Select grade"
              options={GRADE_OPTIONS}
              onChange={(e) => updateField('grade', e.target.value)}
            />
            <SelectField
              label="Curriculum"
              icon="📖"
              value={form.curriculum}
              placeholder="Select curriculum"
              options={CURRICULUM_OPTIONS}
              onChange={(e) => updateField('curriculum', e.target.value)}
            />
            <SelectField
              label="Learning Pathway"
              icon="⚙"
              value={form.learningPathway}
              placeholder="Select pathway"
              options={LEARNING_PATHWAY_OPTIONS}
              onChange={(e) => updateField('learningPathway', e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <ReadOnlyField label="Grade" value={profile.grade || 'Not set'} icon="🏫" />
            <ReadOnlyField label="Curriculum" value={profile.curriculum || 'Not set'} icon="📖" />
            <ReadOnlyField label="Learning Pathway" value={profile.learningPathway || 'Not set'} icon="⚙" />
          </div>
        )}
      </div>

      {editing && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
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
      )}
    </div>
  );
}

function SectionHeading({ icon, title, description }: { icon: string; title: string; description: string }) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const iconBg = theme === 'light' ? 'bg-cyan-50 border-cyan-100' : 'bg-cyan-500/10 border-cyan-500/20';

  return (
    <div className="flex items-center gap-3">
      <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${iconBg}`}>{icon}</span>
      <div>
        <h3 className={`font-bold text-base ${textColor}`}>{title}</h3>
        <p className={`${labelColor} text-xs mt-0.5`}>{description}</p>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, icon, className }: { label: string; value: string; icon: string; className?: string }) {
  const { theme } = useTheme();
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.2)]';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const fieldTextColor = theme === 'light' ? 'text-slate-700' : 'text-gray-200';

  return (
    <div className={className}>
      <label className={`block text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${labelColor}`}>{label}</label>
      <div className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm ${inputBg}`}>
        <span className="text-gray-500 text-sm">{icon}</span>
        <span className={`truncate ${fieldTextColor}`}>{value}</span>
      </div>
    </div>
  );
}
