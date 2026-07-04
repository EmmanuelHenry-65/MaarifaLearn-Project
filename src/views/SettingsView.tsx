import { useState } from 'react';
import { ThemeToggleCompact } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const tabs = ['Account', 'Preferences', 'Notifications', 'Privacy & Security', 'Appearance', 'About'] as const;

const quickSettings = [
  { label: 'Language', value: 'English', icon: '🌐', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'Time Zone', value: 'East Africa Time (EAT)', icon: '🕒', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'Currency', value: 'KES (Kenyan Shilling)', icon: '💳', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { label: 'Measurements', value: 'Metric (km, kg, °C)', icon: '📏', color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20' },
];

const preferencesList = [
  { label: 'Default View', value: 'Detailed', icon: '▦', color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20', type: 'text' },
  { label: 'Auto Play Lessons', icon: '▶', color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20', type: 'on' },
  { label: 'Show Hints in Quizzes', icon: '💡', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', type: 'on' },
  { label: 'Dark Mode', icon: '☾', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', type: 'on' },
  { label: 'Reduce Animations', icon: '✦', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', type: 'off' },
];

const reminders = [
  { label: 'Daily Study Reminder', time: '7:00 PM', icon: '🔔', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'Study Streak Reminder', time: '8:00 PM', icon: '🔥', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { label: 'Weekly Summary', time: 'Sunday, 6:00 PM', icon: '✉', color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20' },
];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-cyan-600' : 'bg-slate-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </span>
  );
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Account');
  const { theme } = useTheme();

  const sectionBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.42)] border-[rgba(56,78,135,0.18)]';
  const inputBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.2)]';
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const fieldTextColor = theme === 'light' ? 'text-slate-700' : 'text-gray-200';

  const Field = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <div>
      <label className={`block text-xs font-medium mb-2 ${labelColor}`}>{label}</label>
      <div className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-sm ${inputBg}`}>
        <span className="text-gray-500 text-sm">{icon}</span>
        <span className={fieldTextColor}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 mt-2 flex-1 min-h-0">
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto pr-1">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-7 px-5 pt-5 border-b border-[rgba(56,78,135,0.15)]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold pb-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab ? 'text-cyan-600 border-cyan-600 font-bold' : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            <div className={`rounded-xl border p-5 ${sectionBg}`}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className={`font-bold text-base ${textColor}`}>Account Information</h3>
                  <p className={`${labelColor} text-xs mt-1`}>Update your personal details and account information.</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-colors">
                  Edit Information
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value="Emmanuel Muuo Mutunga" icon="👤" />
                <Field label="Email Address" value="emmanuel.mutunga@example.com" icon="✉" />
                <Field label="Username" value="emmanuel_254" icon="🆔" />
                <Field label="Grade" value="Grade 10" icon="🏫" />
                <Field label="Curriculum" value="Kenya (CBC)" icon="📖" />
                <Field label="Learning Pathway" value="STEM (Science, Technology, Engineering & Mathematics)" icon="⚙" />
              </div>
            </div>

            <div className={`rounded-xl border p-5 ${sectionBg}`}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className={`font-bold text-base ${textColor}`}>Change Password</h3>
                  <p className={`${labelColor} text-xs mt-1`}>Choose a strong password to keep your account secure.</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-colors">
                  Update Password
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                  <div key={label}>
                    <label className={`block text-xs font-medium mb-2 ${labelColor}`}>{label}</label>
                    <div className={`flex items-center gap-2 px-3 py-3 rounded-lg border text-xs ${inputBg}`}>
                      <span>🔒</span>
                      <span className="text-gray-500">{label === 'Current Password' ? 'Enter current password' : label === 'New Password' ? 'Enter new password' : 'Confirm new password'}</span>
                      <span className="ml-auto text-gray-400">👁️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-red-500 font-bold text-base">Danger Zone</h3>
                <p className="text-gray-500 text-xs mt-1">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">
                Delete Account
              </button>
            </div>

            <div className="pt-3 border-t border-[rgba(56,78,135,0.15)] flex items-center justify-center gap-4 text-gray-500 text-xs">
              <span>Maarifa Learn v1.0.0</span>
              <span>•</span>
              <span>Built with 💙 for every learner.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-6">
        <div className="glass-card p-5">
          <h3 className={`font-bold text-base mb-4 ${textColor}`}>Quick Settings</h3>
          <div className="space-y-3">
            <ThemeToggleCompact />
            {quickSettings.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm ${item.color}`}>{item.icon}</span>
                  <span className={`text-xs font-semibold ${textColor}`}>{item.label}</span>
                </div>
                <span className="text-gray-500 text-[11px] text-right">{item.value} ›</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-base ${textColor}`}>Learning Preferences</h3>
            <button className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold">Edit</button>
          </div>
          <div className="space-y-3.5">
            {preferencesList.map((pref) => (
              <div key={pref.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm ${pref.color}`}>{pref.icon}</span>
                  <span className={`text-xs font-semibold ${textColor}`}>{pref.label}</span>
                </div>
                {pref.type === 'text' ? <span className="text-gray-500 text-[11px]">{pref.value}</span> : <Toggle enabled={pref.type === 'on'} />}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-base ${textColor}`}>Study Reminders</h3>
            <button className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold">Edit</button>
          </div>
          <div className="space-y-3.5">
            {reminders.map((reminder) => (
              <div key={reminder.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm ${reminder.color}`}>{reminder.icon}</span>
                  <span className={`text-xs font-semibold ${textColor}`}>{reminder.label}</span>
                </div>
                <span className="text-gray-500 text-[11px] whitespace-nowrap">{reminder.time} ›</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`glass-card p-5 ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-[#161044] to-[#101936]'}`}>
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 flex-shrink-0">
              🎧
            </div>
            <div>
              <h3 className={`font-bold text-base ${textColor}`}>Need Help?</h3>
              <p className={`${labelColor} text-xs mt-1 leading-relaxed`}>Visit our Help Center for guides and support articles.</p>
              <button className="mt-3 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 text-xs font-bold hover:bg-purple-500/20 transition-colors">
                Visit Help Center →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
