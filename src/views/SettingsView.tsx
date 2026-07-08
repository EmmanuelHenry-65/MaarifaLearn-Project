import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AccountInformationCard from '../components/settings/AccountInformationCard';
import ChangePasswordCard from '../components/settings/ChangePasswordCard';
import PreferencesCard from '../components/settings/PreferencesCard';
import NotificationsCard from '../components/settings/NotificationsCard';
import PrivacySecurityCard from '../components/settings/PrivacySecurityCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import AboutCard from '../components/settings/AboutCard';

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

// Every tab now has a real component — kept as an empty list (rather than
// removing the block below) so a future new tab still gets an honest
// placeholder instead of being silently blank.
const PLACEHOLDER_TABS: Tab[] = [];

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
        <div className="glass-card overflow-hidden">
          {/* Tab bar — pill-style segmented control */}
          <div className="px-4 sm:px-5 pt-5 pb-4">
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
          </div>

          <div className="p-4 sm:p-5 pt-0 space-y-5">
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

            {activeTab === 'Privacy & Security' && <PrivacySecurityCard />}

            {activeTab === 'Appearance' && <AppearanceCard />}

            {activeTab === 'About' && <AboutCard />}

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
