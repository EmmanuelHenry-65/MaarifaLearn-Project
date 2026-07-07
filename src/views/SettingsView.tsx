import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AccountInformationCard from '../components/settings/AccountInformationCard';
import ChangePasswordCard from '../components/settings/ChangePasswordCard';
import PreferencesCard from '../components/settings/PreferencesCard';
import NotificationsCard from '../components/settings/NotificationsCard';

const tabs = ['Account', 'Preferences', 'Notifications', 'Privacy & Security', 'Appearance', 'About'] as const;
type Tab = (typeof tabs)[number];

// Tabs beyond Account/Preferences/Notifications aren't part of this feature
// yet — shown as an honest placeholder rather than left silently empty.
const PLACEHOLDER_TABS: Tab[] = ['Privacy & Security', 'Appearance', 'About'];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>('Account');
  const { theme } = useTheme();

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="flex mt-2 flex-1 min-h-0">
      <div className="flex-1 min-w-0 overflow-y-auto pr-1">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-5 sm:gap-7 px-4 sm:px-5 pt-5 border-b border-[rgba(56,78,135,0.15)] overflow-x-auto">
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

          <div className="p-4 sm:p-5 space-y-5">
            {activeTab === 'Account' && (
              <>
                <AccountInformationCard />
                <ChangePasswordCard />

                <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-red-500 font-bold text-base">Danger Zone</h3>
                    <p className="text-gray-500 text-xs mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                  <button className="self-start px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Preferences' && <PreferencesCard />}

            {activeTab === 'Notifications' && <NotificationsCard />}

            {PLACEHOLDER_TABS.includes(activeTab) && (
              <div className="rounded-xl border border-dashed border-[rgba(56,78,135,0.25)] p-10 text-center">
                <p className={`font-semibold ${textColor}`}>{activeTab} settings are coming soon.</p>
                <p className={`text-xs mt-1 ${labelColor}`}>This section hasn't been built yet.</p>
              </div>
            )}

            <div className="pt-3 border-t border-[rgba(56,78,135,0.15)] flex items-center justify-center gap-4 text-gray-500 text-xs">
              <span>Maarifa Learn v1.0.0</span>
              <span>•</span>
              <span>Built with 💙 for every learner.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
