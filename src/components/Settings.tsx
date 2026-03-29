import { motion } from 'motion/react';
import { Shield, Lock, Bell, Download, Trash2, ChevronRight, User, CreditCard, HelpCircle, Globe } from 'lucide-react';
import { UserSettings } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
];

export default function Settings({ settings, onUpdateSettings }: SettingsProps) {
  const handleRequestPermissions = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications not supported in this environment.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Notification permission denied.');
    }
  };

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-gray-100 rounded-full relative before:absolute before:w-6 before:h-0.5 before:bg-gray-100 before:-top-2 before:rounded-full after:absolute after:w-4 after:h-0.5 after:bg-gray-100 after:top-2 after:rounded-full"></div>
        </div>
        <h1 className="text-xl font-extrabold text-blue-400 tracking-tight">ExpenseSync</h1>
        <div className="w-10 h-10 rounded-full neu-convex overflow-hidden border-2 border-[#050506]">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
        </div>
      </header>

      <div className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tighter leading-none mb-2 text-gray-100">Settings</h2>
        <p className="text-gray-500 text-sm">Manage your preferences and security.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 ml-2">Account</h3>
          <div className="neu-flat rounded-[32px] p-2">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#050506]/50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-blue-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Profile Details</h4>
                  <p className="text-xs text-gray-500">Update your personal info</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-px bg-[#050506] mx-4"></div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#050506]/50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Connected Wallets</h4>
                  <p className="text-xs text-gray-500">Manage bank & crypto links</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 ml-2">Preferences</h3>
          <div className="neu-flat rounded-[32px] p-2">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Base Currency</h4>
                  <p className="text-xs text-gray-500">Default for all displays</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => onUpdateSettings({ currency: c.code })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all",
                      settings.currency === c.code 
                        ? "neu-pressed text-blue-400 border-blue-400/30 border" 
                        : "neu-flat text-gray-400"
                    )}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-px bg-[#050506] mx-4"></div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-purple-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Global Notifications</h4>
                  <p className="text-xs text-gray-500">Enable all alerts</p>
                </div>
              </div>
              <div 
                onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                className={cn(
                  "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                  settings.notifications ? "neu-button-blue" : "neu-pressed"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                  settings.notifications ? "right-1" : "left-1"
                )}></div>
              </div>
            </div>

            {settings.notifications && (
              <div className="px-4 pb-4 space-y-4">
                <div className="h-px bg-[#050506] -mx-2 mb-4"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Budget Alerts</span>
                  <div 
                    onClick={() => onUpdateSettings({ 
                      notification_preferences: { ...settings.notification_preferences, budget_alerts: !settings.notification_preferences.budget_alerts } 
                    })}
                    className={cn(
                      "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                      settings.notification_preferences.budget_alerts ? "bg-blue-500/50" : "bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all",
                      settings.notification_preferences.budget_alerts ? "right-1" : "left-1"
                    )}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction Summaries</span>
                  <div 
                    onClick={() => onUpdateSettings({ 
                      notification_preferences: { ...settings.notification_preferences, transaction_summaries: !settings.notification_preferences.transaction_summaries } 
                    })}
                    className={cn(
                      "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                      settings.notification_preferences.transaction_summaries ? "bg-blue-500/50" : "bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all",
                      settings.notification_preferences.transaction_summaries ? "right-1" : "left-1"
                    )}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Security Alerts</span>
                  <div 
                    onClick={() => onUpdateSettings({ 
                      notification_preferences: { ...settings.notification_preferences, security_alerts: !settings.notification_preferences.security_alerts } 
                    })}
                    className={cn(
                      "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                      settings.notification_preferences.security_alerts ? "bg-blue-500/50" : "bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all",
                      settings.notification_preferences.security_alerts ? "right-1" : "left-1"
                    )}></div>
                  </div>
                </div>

                <button 
                  onClick={handleRequestPermissions}
                  className="w-full py-2 rounded-xl bg-[#050506] text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-[#050506]/80 transition-colors"
                >
                  Enable Browser Notifications
                </button>
              </div>
            )}

            <div className="h-px bg-[#050506] mx-4"></div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-orange-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Auto-Categorize</h4>
                  <p className="text-xs text-gray-500">Use AI to tag transactions</p>
                </div>
              </div>
              <div 
                onClick={() => onUpdateSettings({ auto_categorize: !settings.auto_categorize })}
                className={cn(
                  "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                  settings.auto_categorize ? "neu-button-blue" : "neu-pressed"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                  settings.auto_categorize ? "right-1" : "left-1"
                )}></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4 ml-2">Data & Privacy</h3>
          <div className="neu-flat rounded-[32px] p-2">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#050506]/50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-gray-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Export Data</h4>
                  <p className="text-xs text-gray-500">Download as JSON/CSV</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-px bg-[#050506] mx-4"></div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 rounded-2xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-red-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-red-400">Delete Account</h4>
                  <p className="text-xs text-red-400/70">Permanently remove all data</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-500 font-medium mb-2">ExpenseSync v1.0.0</p>
        <button className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center justify-center gap-1 mx-auto hover:underline">
          <HelpCircle className="w-4 h-4" /> Support & FAQ
        </button>
      </div>
    </div>
  );
}
