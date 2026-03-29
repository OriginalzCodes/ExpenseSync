import { motion } from 'motion/react';
import { Home, Utensils, Plane, Gamepad2, Plus, Edit2, AlertTriangle, TrendingUp, History, Edit3 } from 'lucide-react';
import { Budget } from '../types';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BudgetsProps {
  budgets: Budget[];
  currency: string;
}

const forecastData = [
  { day: 'MON', actual: 120, projected: 150 },
  { day: 'TUE', actual: 200, projected: 220 },
  { day: 'WED', actual: 150, projected: 180 },
  { day: 'THU', actual: 300, projected: 250 },
  { day: 'FRI', actual: 180, projected: 200 },
  { day: 'SAT', actual: 250, projected: 280 },
  { day: 'SUN', actual: 100, projected: 120 },
];

export default function Budgets({ budgets, currency }: BudgetsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Utensils': return Utensils;
      case 'Plane': return Plane;
      case 'Gamepad2': return Gamepad2;
      default: return Home;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'stable': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6 pb-32">
      <header className="flex justify-between items-center mb-12">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase leading-none">Expense</h1>
          <h1 className="text-2xl font-black text-gray-100 tracking-tighter uppercase leading-none">Sync.</h1>
        </div>
        <div className="w-12 h-12 rounded-full neu-convex overflow-hidden border-2 border-[#050506] p-0.5">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full rounded-full object-cover" />
        </div>
      </header>

      <div className="mb-12">
        <div className="flex justify-between items-start mb-4">
          <div className="max-w-[200px]">
            <p className="text-[10px] font-black text-red-400 tracking-[0.2em] uppercase mb-2">System Status: Active</p>
            <h2 className="text-6xl font-black tracking-tighter leading-[0.85] text-gray-100 uppercase">Budget<br/>Control</h2>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 neu-button-blue rounded-2xl flex items-center justify-center text-white shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="h-px bg-gradient-to-r from-blue-400/50 to-transparent w-full mb-6"></div>
        <div className="flex gap-4">
          <button className="neu-pressed text-blue-400 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
            <Edit2 className="w-3 h-3" /> Edit Limits
          </button>
          <button className="neu-flat text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase">
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-12">
        {budgets.map((budget) => {
          const Icon = getIcon(budget.icon);
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const isCritical = budget.status === 'critical';

          return (
            <motion.div 
              key={budget.id}
              whileHover={{ y: -4 }}
              className="neu-flat rounded-[40px] p-6 relative group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 neu-pressed transition-colors duration-500",
                    isCritical ? "text-red-400" : "text-blue-400 group-hover:bg-blue-400 group-hover:text-white"
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-100 tracking-tight">{budget.category}</h3>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md tracking-tighter uppercase",
                        isCritical ? "bg-red-400/10 text-red-400" : "bg-emerald-400/10 text-emerald-400"
                      )}>
                        {budget.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {Math.round(percentage)}% Used
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Remaining</p>
                  <p className="font-black text-lg text-gray-100 tracking-tighter">
                    {formatAmount(budget.limit - budget.spent)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Spent: {formatAmount(budget.spent)}</span>
                  <span className="text-gray-400">Limit: {formatAmount(budget.limit)}</span>
                </div>
                <div className="neu-pressed h-3 rounded-full p-0.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={cn(
                      "h-full rounded-full shadow-lg",
                      isCritical ? "bg-red-400" : "bg-blue-400"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        <button className="w-full neu-flat border-2 border-dashed border-[#050506] rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-blue-400 hover:border-blue-400/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center group-hover:text-blue-400">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">Add New Category</span>
        </button>
      </div>

      <div className="neu-flat rounded-[48px] p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-bl-[100px]"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black mb-1 text-gray-100 tracking-tight uppercase">Spending Forecast</h3>
              <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Predictive Analysis • Last 90 Days</p>
            </div>
            <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="neu-pressed rounded-3xl p-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Projected</p>
              <p className="text-xl font-black text-blue-400 tracking-tighter">{formatAmount(4200)}</p>
            </div>
            <div className="neu-pressed rounded-3xl p-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Actual</p>
              <p className="text-xl font-black text-gray-100 tracking-tighter">{formatAmount(3850)}</p>
            </div>
          </div>
  
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 900 }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    background: 'rgba(42, 45, 53, 0.95)', 
                    color: '#f3f4f6', 
                    boxShadow: '12px 12px 24px rgba(0,0,0,0.4)',
                    padding: '16px'
                  }} 
                />
                <Bar dataKey="actual" radius={[10, 10, 10, 10]} barSize={20}>
                  {forecastData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.day === 'THU' ? '#60a5fa' : entry.day === 'SUN' ? '#f87171' : '#050506'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="neu-button-blue rounded-[40px] p-8 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
            <Utensils className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-blue-200 tracking-widest uppercase mb-1">Potential Savings</p>
          <h3 className="text-4xl font-extrabold tracking-tighter mb-4">{formatAmount(428.50)}</h3>
          <p className="text-sm text-blue-100 mb-8 leading-relaxed">
            If you reduce Dining Out by 15%, you'll hit your yearly goal early.
          </p>
          <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl py-4 font-bold text-sm transition-colors shadow-inner">
            View Strategies
          </button>
        </div>
      </div>
    </div>
  );
}
