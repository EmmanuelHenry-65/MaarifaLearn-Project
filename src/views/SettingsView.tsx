import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AccountInformationCard from '../components/settings/AccountInformationCard';
import ChangePasswordCard from '../components/settings/ChangePasswordCard';
import PreferencesCard from '../components/settings/PreferencesCard';

const tabs = ['Account', 'Preferences', 'Notifications', 'Privacy & Security', 'Appearance', 'About'] as const;
type Tab = (typeof tabs)[number];

const TAB_ICONS: Record<Tab, string> = {
  Account: '👤',
  Preferences: '⚡',
  Notifications: '🔔',
  'Privacy & Security': '🛡️',
  Appearance: '🎨',
  About: 'ℹ️',
};

// Tabs beyond Account/Preferences aren't part of this feature yet — shown as
// an honest placeholder rather than left silently empty.
const PLACEHOLDER_TABS: Tab[] = ['Notifications', 'Privacy & Security', 'Appearance', 'About'];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>('Account');
  const { theme } = useTheme();

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const tabBarBg = theme === 'light' ? 'bg-slate-100' : 'bg-[rgba(17,24,50,0.5)]';
  const tabInactive = theme === 'light' ? 'text-slate-500 hover:text-slate-700' : 'text-gray-400 hover:text-gray-200';

  return (
    <div className="flex mt-2 flex-1 min-h-0">
      <div className="flex-1 min-w-0 overflow-y-auto pr-1">
        <div className="max-w-4xl mx-auto space-y-5 pb-6">
          {/* Tab bar — premium pill-style segmented control */}
          <div className={`flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto ${tabBarBg}`}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : tabInactive
                }`}
              >
                <span className="text-sm">{TAB_ICONS[tab]}</span>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-5">
            {activeTab === 'Account' && (
              <>
                <AccountInformationCard />
                <ChangePasswordCard />

                <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <h3 className="text-red-500 font-bold text-base">Danger Zone</h3>
                      <p className="text-gray-500 text-xs mt-0.5">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                  </div>
                  <button className="self-start sm:self-center flex-shrink-0 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all duration-200">
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Preferences' && <PreferencesCard />}

            {PLACEHOLDER_TABS.includes(activeTab) && (
              <div className={`rounded-2xl border border-dashed p-12 text-center ${theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-[rgba(56,78,135,0.25)] bg-[rgba(17,24,50,0.25)]'}`}>
                <span className="text-3xl block mb-3">{TAB_ICONS[activeTab]}</span>
                <p className={`font-semibold ${textColor}`}>{activeTab} settings are coming soon.</p>
                <p className={`text-xs mt-1 ${labelColor}`}>This section hasn't been built yet.</p>
              </div>
            )}
          </div>

          <div className={`pt-4 border-t flex items-center justify-center gap-4 text-gray-500 text-xs ${theme === 'light' ? 'border-slate-200' : 'border-[rgba(56,78,135,0.15)]'}`}>
            <span>Maarifa Learn v1.0.0</span>
            <span>•</span>
            <span>Built with 💙 for every learner.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
