import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Building2, CreditCard, Bitcoin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Wallet } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  wallets: Wallet[];
  onConnect: (id: string) => void;
  onComplete: () => void;
}

export default function Onboarding({ wallets, onConnect, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building2;
      case 'mobile': return CreditCard;
      case 'crypto': return Bitcoin;
      default: return Building2;
    }
  };

  return (
    <div className="min-h-screen bg-neu-base pt-12">
      {step === 1 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="px-6 text-gray-100 text-center"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold tracking-tight text-blue-400">ExpenseSync</h1>
            <div className="w-8 h-8 rounded-full neu-convex flex items-center justify-center text-gray-400">
              <span className="text-sm font-bold">?</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-extrabold mb-4 leading-tight text-white">
            Welcome to<br/>ExpenseSync
          </h2>
          <p className="text-gray-200 mb-12 px-4 font-medium">
            Connect your digital assets to synchronize your financial life with tactile precision.
          </p>

          <div className="neu-flat rounded-t-[40px] p-8 text-white min-h-[60vh]">
            <div className="inline-block px-3 py-1 neu-pressed text-blue-400 rounded-full text-xs font-bold tracking-wider mb-6">
              SECURE SYNC
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white">Universal<br/>Connector</h3>
            <p className="text-gray-300 mb-8 leading-relaxed font-medium">
              Link your primary bank accounts using our secure gateway. We use bank-level encryption to keep your data invisible to us.
            </p>

            <button 
              onClick={() => setStep(2)}
              className="w-full neu-button-blue text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Connect Wallet
            </button>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="neu-pressed rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full neu-convex text-blue-400 flex items-center justify-center mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm mb-1 text-gray-200">Encrypted</h4>
                <p className="text-xs text-gray-500">AES-256 military-grade protection.</p>
              </div>
              <div className="neu-pressed rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full neu-convex text-blue-400 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm mb-1 text-gray-200">Real-time</h4>
                <p className="text-xs text-gray-500">Instant transaction sync.</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="bg-neu-base min-h-screen pt-12 px-6"
        >
          <div className="flex items-center mb-8">
            <button onClick={() => setStep(1)} className="p-2 -ml-2 text-gray-300 hover:text-white transition-colors">
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <h1 className="text-xl font-bold tracking-tight mx-auto pr-8 text-white">Connect Capital</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2 text-center text-white">Connect Your Wallet</h2>
          <p className="text-gray-300 text-center mb-8 font-medium">Link your accounts to sync transactions automatically.</p>

          <div className="space-y-4 mb-8">
            {wallets.map((wallet) => {
              const Icon = getIcon(wallet.type);
              return (
                <div 
                  key={wallet.id}
                  onClick={() => onConnect(wallet.id)}
                  className={cn(
                    "neu-flat rounded-3xl p-4 flex items-center gap-4 cursor-pointer transition-all border-2",
                    wallet.connected ? "border-blue-500" : "border-transparent"
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-gray-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white">{wallet.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">{wallet.type} & CREDIT</p>
                  </div>
                  {wallet.connected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  ) : (
                    <div className="px-3 py-1 neu-pressed text-blue-400 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                      <Shield className="w-3 h-3" /> SECURE
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="neu-pressed rounded-xl p-4 flex items-center gap-3 text-xs text-gray-300 mb-8 font-medium">
            <Shield className="w-4 h-4 shrink-0" />
            <p>Your data is encrypted and we never see your login credentials.</p>
          </div>

          <button 
            onClick={onComplete}
            disabled={!wallets.some(w => w.connected)}
            className="w-full neu-button-blue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            Complete Connection
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
