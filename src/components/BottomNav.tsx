import { Wallet as WalletIcon, PieChart, Settings, User } from 'lucide-react';
import { ViewState } from '../App';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: WalletIcon, label: 'WALLET' },
    { id: 'budgets', icon: PieChart, label: 'BUDGET' },
    { id: 'settings', icon: Settings, label: 'SETTINGS' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neu-base border-t border-[#1a1c21] px-6 py-4 pb-8 flex justify-between items-center z-40">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewState)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
              isActive ? "neu-pressed text-blue-400" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
