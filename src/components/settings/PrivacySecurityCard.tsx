import { useTheme } from '../../context/ThemeContext';
import ChangePasswordCard from './ChangePasswordCard';
import SettingsRow from './SettingsRow';
import ComingSoonBadge from './ComingSoonBadge';

// Privacy & Security tab. Change Password is the existing, fully functional
// ChangePasswordCard reused as-is (also still shown on the Account tab,
// which is left untouched) — everything else here has no backing data or
// API yet, so those controls are presented honestly as "Coming Soon"
// rather than as fake toggles that don't actually do anything.
export default function PrivacySecurityCard() {
  const { theme } = useTheme();

  const sectionBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${textColor}`}>Privacy</h3>
          <p className={`${labelColor} text-xs mt-1`}>Control who can see your profile and activity.</p>
        </div>

        <div className="space-y-4">
          <SettingsRow
            icon="👁️"
            label="Profile Visibility"
            description="Control who can see your profile."
            buildNote="Needs a new profile column plus enforcement everywhere your profile is shown to others."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="📈"
            label="Learning Progress Visibility"
            description="Choose whether others can view your learning progress."
            buildNote="Needs a new profile column plus enforcement wherever progress is shown to others."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="🏅"
            label="Achievement Visibility"
            description="Choose whether your badges and achievements are visible to others."
            buildNote="Needs a new profile column plus enforcement wherever achievements are shown to others."
          >
            <ComingSoonBadge />
          </SettingsRow>
        </div>
      </div>

      <ChangePasswordCard />

      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${textColor}`}>Security</h3>
          <p className={`${labelColor} text-xs mt-1`}>Extra protection for your account.</p>
        </div>

        <div className="space-y-4">
          <SettingsRow
            icon="🔐"
            label="Two-Factor Authentication"
            description="Add an extra layer of protection to your account."
            buildNote="Needs Supabase Auth's MFA APIs (enroll/challenge/verify), a QR enrollment flow, and a code prompt at login."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="💻"
            label="Logged-in Devices"
            description="View devices currently signed into your account."
            buildNote="Supabase Auth has no client-side session-list API — needs custom device/IP/last-seen tracking."
          >
            <ComingSoonBadge />
          </SettingsRow>
        </div>
      </div>

      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
        <h3 className="text-red-500 font-bold text-base">Danger Zone</h3>
        <p className="text-gray-500 text-xs mt-1 mb-4">Actions here are permanent or affect every session — proceed carefully.</p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${textColor}`}>Delete Account</p>
              <p className="text-gray-500 text-xs mt-0.5">Permanently delete your account and all associated data.</p>
            </div>
            <button className="self-start sm:self-center flex-shrink-0 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-500/10">
            <div>
              <p className={`text-sm font-semibold ${textColor}`}>Sign Out of All Devices</p>
              <p className="text-gray-500 text-xs mt-0.5">Sign out from every device connected to your account.</p>
              <p className="text-[11px] italic text-amber-500/80 mt-1">🛠 Needs supabase.auth.signOut({'{'} scope: 'global' {'}'}) wired to this button, then a redirect to login.</p>
            </div>
            <ComingSoonBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
