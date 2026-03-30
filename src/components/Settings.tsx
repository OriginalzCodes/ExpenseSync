import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Bell, Download, Trash2, ChevronRight, ChevronLeft, User as UserIcon, CreditCard, HelpCircle, Globe, LogOut, Upload, Loader2, Landmark, Wallet, SmartphoneNfc, CheckCircle2, Smartphone } from 'lucide-react';
import { UserSettings, Transaction } from '../types';
import { User, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onLogout: () => void;
  user: User | null;
  onAddTransactions?: (transactions: Transaction[]) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
];

export default function Settings({ settings, onUpdateSettings, onLogout, user, onAddTransactions }: SettingsProps) {
  const [activeView, setActiveView] = useState<'main' | 'profile' | 'wallets'>('main');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);
      toast.success('Image uploaded successfully! Click Save Changes to apply.');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image. Storage might not be configured.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName, photoURL });
      toast.success('Profile updated successfully!');
      setActiveView('main');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleConnectWallet = async (walletId: string) => {
    setConnectingWallet(walletId);
    
    // Simulate requesting permissions
    if (['Apple Pay', 'Google Pay', 'Samsung Pay'].includes(walletId)) {
      toast.info(`Requesting permission to access ${walletId} transactions...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate user granting permission
      toast.success(`Permission granted for ${walletId}. Syncing data...`);
    }

    // Simulate API call / OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectedWallets(prev => [...prev, walletId]);
    setConnectingWallet(null);
    toast.success(`${walletId} connected successfully!`);

    // If it's a phone wallet, generate some mock transactions to summarize
    if (['Apple Pay', 'Google Pay', 'Samsung Pay'].includes(walletId) && onAddTransactions) {
      const mockWalletTransactions: Transaction[] = [
        {
          transaction_id: `tw-${Date.now()}-1`,
          amount: 14.50,
          category: 'Food & Dining',
          timestamp: new Date().toISOString(),
          raw_description: 'Coffee Shop (via Phone Wallet)',
          merchant_name: 'Starbucks',
          transaction_type: 'debit',
          wallet_id: walletId,
          currency: 'USD',
          category_confidence: 0.95,
          balance_after: 1000,
          status: 'completed'
        },
        {
          transaction_id: `tw-${Date.now()}-2`,
          amount: 45.00,
          category: 'Transportation',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          raw_description: 'Uber Ride (via Phone Wallet)',
          merchant_name: 'Uber',
          transaction_type: 'debit',
          wallet_id: walletId,
          currency: 'USD',
          category_confidence: 0.99,
          balance_after: 955,
          status: 'completed'
        },
        {
          transaction_id: `tw-${Date.now()}-3`,
          amount: 120.00,
          category: 'Shopping',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          raw_description: 'Grocery Store (via Phone Wallet)',
          merchant_name: 'Whole Foods',
          transaction_type: 'debit',
          wallet_id: walletId,
          currency: 'USD',
          category_confidence: 0.90,
          balance_after: 835,
          status: 'completed'
        }
      ];
      onAddTransactions(mockWalletTransactions);
      toast.success(`Synced 3 recent transactions from ${walletId}`);
    }
  };

  const handleDisconnectWallet = (walletId: string) => {
    setConnectedWallets(prev => prev.filter(id => id !== walletId));
    toast.success(`${walletId} disconnected.`);
  };

  if (activeView === 'wallets') {
    const europeanBanks = [
      { id: 'Revolut', name: 'Revolut', icon: Wallet, color: 'text-blue-500' },
      { id: 'iDEAL', name: 'iDEAL', icon: Landmark, color: 'text-pink-500' },
      { id: 'Wero', name: 'Wero', icon: SmartphoneNfc, color: 'text-indigo-500' },
    ];

    const phoneWallets = [
      { id: 'Apple Pay', name: 'Apple Pay', icon: Smartphone, color: 'text-gray-200' },
      { id: 'Google Pay', name: 'Google Pay', icon: Smartphone, color: 'text-blue-400' },
      { id: 'Samsung Pay', name: 'Samsung Pay', icon: Smartphone, color: 'text-blue-600' },
    ];

    return (
      <div className="min-h-screen bg-neu-base pt-12 px-6 pb-32">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setActiveView('main')}
            className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-100 tracking-tight">Connected Wallets</h1>
        </header>

        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold tracking-tighter leading-none mb-2 text-gray-100">Phone Wallets</h2>
            <p className="text-gray-500 text-sm">Sync transactions from your device wallet.</p>
          </div>

          <div className="neu-flat rounded-[32px] p-2 mb-8">
            {phoneWallets.map((wallet, index) => {
              const isConnected = connectedWallets.includes(wallet.id);
              const isConnecting = connectingWallet === wallet.id;
              const Icon = wallet.icon;

              return (
                <React.Fragment key={wallet.id}>
                  <div className="flex items-center justify-between p-4 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full neu-pressed flex items-center justify-center", wallet.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">{wallet.name}</h4>
                        <p className="text-xs text-gray-500">
                          {isConnected ? 'Syncing transactions' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <button 
                        onClick={() => handleDisconnectWallet(wallet.id)}
                        className="neu-pressed px-4 py-2 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleConnectWallet(wallet.id)}
                        disabled={isConnecting || connectingWallet !== null}
                        className="neu-button-blue px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    )}
                  </div>
                  {index < phoneWallets.length - 1 && (
                    <div className="h-px bg-[#050506] mx-4"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-extrabold tracking-tighter leading-none mb-2 text-gray-100">European Banks</h2>
            <p className="text-gray-500 text-sm">Connect your bank app securely.</p>
          </div>

          <div className="neu-flat rounded-[32px] p-2">
            {europeanBanks.map((bank, index) => {
              const isConnected = connectedWallets.includes(bank.id);
              const isConnecting = connectingWallet === bank.id;
              const Icon = bank.icon;

              return (
                <React.Fragment key={bank.id}>
                  <div className="flex items-center justify-between p-4 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full neu-pressed flex items-center justify-center", bank.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">{bank.name}</h4>
                        <p className="text-xs text-gray-500">
                          {isConnected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <button 
                        onClick={() => handleDisconnectWallet(bank.id)}
                        className="neu-pressed px-4 py-2 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleConnectWallet(bank.id)}
                        disabled={isConnecting || connectingWallet !== null}
                        className="neu-button-blue px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting
                          </>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    )}
                  </div>
                  {index < europeanBanks.length - 1 && (
                    <div className="h-px bg-[#050506] mx-4"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'profile') {
    return (
      <div className="min-h-screen bg-neu-base pt-12 px-6 pb-32">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setActiveView('main')}
            className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-100 tracking-tight">Profile Details</h1>
        </header>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="neu-flat rounded-[32px] p-6 space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24 rounded-full neu-convex overflow-hidden border-4 border-[#050506] mb-4 group">
                <img 
                  src={photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                {isUploadingImage ? 'Uploading...' : 'Tap Image to Upload'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 ml-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full neu-pressed rounded-2xl py-4 px-4 text-sm text-gray-200 placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 ml-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full neu-pressed rounded-2xl py-4 px-4 text-sm text-gray-500 border-none focus:outline-none opacity-50 cursor-not-allowed"
              />
              <p className="text-[10px] font-medium text-gray-500 mt-2 ml-2">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 ml-2">Avatar URL</label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full neu-pressed rounded-2xl py-4 px-4 text-sm text-gray-200 placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full neu-button-blue rounded-2xl py-4 text-white font-bold tracking-widest uppercase flex items-center justify-center gap-2"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-gray-100 rounded-full relative before:absolute before:w-6 before:h-0.5 before:bg-gray-100 before:-top-2 before:rounded-full after:absolute after:w-4 after:h-0.5 after:bg-gray-100 after:top-2 after:rounded-full"></div>
        </div>
        <h1 className="text-xl font-extrabold text-blue-400 tracking-tight">ExpenseSync</h1>
        <div className="w-10 h-10 rounded-full neu-convex overflow-hidden border-2 border-[#050506]">
          <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
            <div 
              onClick={() => setActiveView('profile')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#050506]/50 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-blue-400 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200">Profile Details</h4>
                  <p className="text-xs text-gray-500">Update your personal info</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-px bg-[#050506] mx-4"></div>
            <div 
              onClick={() => setActiveView('wallets')}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#050506]/50 rounded-2xl transition-colors"
            >
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
            <div 
              onClick={onLogout}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-500/10 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-pressed text-blue-400 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-400">Sign Out</h4>
                  <p className="text-xs text-blue-400/70">End your current session</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400" />
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
