import { useTheme } from '../../context/ThemeContext';
import SettingsRow from './SettingsRow';
import ComingSoonBadge from './ComingSoonBadge';

// About tab. Purely informational — app identity plus a set of links that
// don't have a real destination yet (no support inbox, policy pages, etc.
// exist in the app), so they're shown honestly as "Coming Soon" rather than
// as dead links.
export default function AboutCard() {
  const { theme } = useTheme();

  const sectionBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-extrabold text-lg ${textColor}`}>Maarifa Learn</h3>
            <p className={`${labelColor} text-xs mt-0.5`}>Version 1.0.0</p>
          </div>
        </div>
        <p className={`text-sm mt-4 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-gray-300'}`}>
          Maarifa Learn helps every high school student learn with confidence through AI-powered, curriculum-aligned
          lessons, practice, and support — built to make quality learning accessible to everyone.
        </p>
      </div>

      <div className={`rounded-xl border p-5 ${sectionBg}`}>
        <div className="mb-5">
          <h3 className={`font-bold text-base ${textColor}`}>Learn More & Get Help</h3>
          <p className={`${labelColor} text-xs mt-1`}>Information about the team and ways to reach us.</p>
        </div>

        <div className="space-y-4">
          <SettingsRow
            icon="🧑‍🤝‍🧑"
            label="Meet the Team"
            description="Learn about the people building Maarifa Learn."
            buildNote="Needs real team member data (names, photos, roles) — none exists in the app yet."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="✉️"
            label="Contact Support"
            description="Get help from our support team."
            buildNote="Needs a real support channel — email, help desk, or in-app form — none configured yet."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="📄"
            label="Privacy Policy"
            description="Read how we handle and protect your data."
            buildNote="Needs an actual policy document to link to."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="📋"
            label="Terms & Conditions"
            description="Review the terms of using Maarifa Learn."
            buildNote="Needs actual terms content to link to."
          >
            <ComingSoonBadge />
          </SettingsRow>
          <SettingsRow
            icon="🐞"
            label="Report a Bug"
            description="Let us know if something isn't working right."
            buildNote="Needs a destination — a form, email, or issue-tracker integration."
          >
            <ComingSoonBadge />
          </SettingsRow>
        </div>
      </div>
    </div>
  );
}
