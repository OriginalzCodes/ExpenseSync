/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { Plus, AlertCircle } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Wallet, Transaction, Budget, UserSettings } from './types';
import { mockWallets, mockTransactions, mockBudgets } from './data/mockData';
import Login from './components/Login';
import Signup from './components/Signup';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Budgets from './components/Budgets';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import TransactionDetail from './components/TransactionDetail';

export type ViewState = 'login' | 'signup' | 'onboarding' | 'dashboard' | 'budgets' | 'settings' | 'transaction_detail';

const initialSettings: UserSettings = {
  currency: 'USD',
  notifications: true,
  notification_preferences: {
    budget_alerts: true,
    transaction_summaries: true,
    security_alerts: true,
  },
  auto_categorize: true,
  privacy_mode: false,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>(mockWallets);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // If logged in and on login/signup, move to dashboard or onboarding
        if (currentView === 'login') {
          setCurrentView('dashboard');
        } else if (currentView === 'signup') {
          setCurrentView('onboarding');
        }
      } else {
        // If logged out, only redirect to login if they are on a protected view
        // Dashboard, Budgets, Settings are protected.
        // Login, Signup, Onboarding are public/entry views.
        const protectedViews: ViewState[] = ['budgets', 'settings', 'transaction_detail'];
        if (protectedViews.includes(currentView)) {
          setCurrentView('login');
        }
      }
    });

    return () => unsubscribe();
  }, [currentView]);

  const handleLogin = () => {
    if (auth.currentUser) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('onboarding');
    }
  };

  const handleSignup = () => {
    setCurrentView('onboarding');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('login');
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  const handleSwitchToSignup = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleConnectWallet = (walletId: string) => {
    setWallets(wallets.map(w => w.id === walletId ? { ...w, connected: true } : w));
  };

  const handleCompleteOnboarding = () => {
    setCurrentView('dashboard');
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCurrentView('transaction_detail');
  };

  const handleBack = () => {
    if (currentView === 'transaction_detail') {
      setCurrentView('dashboard');
      setSelectedTransaction(null);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Simple budget alert check
  const checkBudgetAlerts = () => {
    if (!settings.notifications || !settings.notification_preferences.budget_alerts) return;

    mockBudgets.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage >= 90 && budget.status === 'critical') {
        toast.error(`Budget Alert: You've reached 90% of your ${budget.category} budget!`, {
          description: `Spent: ${budget.spent} / Limit: ${budget.limit}`,
          duration: 5000,
        });
      } else if (percentage >= 75) {
        toast.warning(`Budget Alert: You're close to your ${budget.category} budget limit.`, {
          description: `Spent: ${budget.spent} / Limit: ${budget.limit}`,
          duration: 4000,
        });
      }
    });
  };

  // Simulated transaction summary
  const showTransactionSummary = () => {
    if (!settings.notifications || !settings.notification_preferences.transaction_summaries) return;

    const totalSpent = mockTransactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    toast.info("Daily Transaction Summary", {
      description: `You've spent ${totalSpent.toFixed(2)} ${settings.currency} across ${mockTransactions.length} transactions today.`,
      duration: 6000,
    });
  };

  // Trigger notifications on initial load (simulating background events)
  useState(() => {
    setTimeout(checkBudgetAlerts, 2000);
    setTimeout(showTransactionSummary, 5000);
  });

  return (
    <div className="min-h-screen bg-neu-base text-gray-100 font-sans overflow-hidden flex flex-col max-w-md mx-auto relative shadow-2xl">
      <Toaster 
        theme="dark" 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1a1c21',
            border: '1px solid #050506',
            color: '#f3f4f6',
            borderRadius: '16px',
            boxShadow: 'inset 2px 2px 5px #050506, inset -2px -2px 5px #2a2d35',
          },
        }}
      />
      {!isAuthReady ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 overflow-y-auto"
            >
              <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
            </motion.div>
          )}

          {currentView === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 overflow-y-auto"
            >
              <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />
            </motion.div>
          )}

          {currentView === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto"
            >
              <Onboarding 
                wallets={wallets} 
                onConnect={handleConnectWallet} 
                onComplete={handleCompleteOnboarding} 
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto pb-40"
            >
              <Dashboard 
                transactions={transactions} 
                onViewTransaction={handleViewTransaction} 
                currency={settings.currency}
                user={user}
              />
            </motion.div>
          )}

          {currentView === 'transaction_detail' && selectedTransaction && (
            <motion.div
              key="transaction_detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-neu-base overflow-y-auto"
            >
              <TransactionDetail 
                transaction={selectedTransaction} 
                onClose={handleBack} 
                currency={settings.currency}
              />
            </motion.div>
          )}

          {currentView === 'budgets' && (
            <motion.div
              key="budgets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto pb-40"
            >
              <Budgets budgets={mockBudgets} currency={settings.currency} user={user} />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto pb-24"
            >
              <Settings 
                settings={settings} 
                onUpdateSettings={handleUpdateSettings} 
                onLogout={handleLogout} 
                user={user} 
                onAddTransactions={(newTransactions) => setTransactions(prev => [...newTransactions, ...prev])}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {isAuthReady && currentView !== 'login' && currentView !== 'signup' && currentView !== 'onboarding' && currentView !== 'transaction_detail' && (
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      )}

      {isAuthReady && currentView === 'dashboard' && (
        <button className="absolute bottom-28 right-6 w-14 h-14 sm:w-16 sm:h-16 neu-button-blue text-white rounded-full flex items-center justify-center z-30 shadow-xl transition-all active:scale-95">
          <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}
    </div>
  );
}
