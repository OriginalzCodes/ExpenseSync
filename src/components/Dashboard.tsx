import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Coffee, ShoppingBag, Car, Building, Plane, Plus, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { User } from 'firebase/auth';
import { format, isToday, isYesterday, isSameMonth } from 'date-fns';
import { cn } from '../lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  onViewTransaction: (t: Transaction) => void;
  currency: string;
  user: User | null;
}

export default function Dashboard({ transactions, onViewTransaction, currency: userCurrency, user }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Amount range search: amount:>100, amount:<50, amount:100
    if (query.startsWith('amount:')) {
      const amountPart = query.replace('amount:', '').trim();
      const operator = amountPart.match(/^[><=]/)?.[0] || '=';
      const value = parseFloat(amountPart.replace(/^[><=]/, ''));
      
      if (isNaN(value)) return true;
      
      if (operator === '>') return Math.abs(t.amount) > value;
      if (operator === '<') return Math.abs(t.amount) < value;
      return Math.abs(t.amount) === value;
    }

    // Merchant specific search: merchant:Amazon
    if (query.startsWith('merchant:')) {
      const merchantPart = query.replace('merchant:', '').trim();
      return t.merchant_name.toLowerCase().includes(merchantPart);
    }

    // Note specific search: note:lunch
    if (query.startsWith('note:')) {
      const notePart = query.replace('note:', '').trim();
      return (t.notes || '').toLowerCase().includes(notePart) || 
             t.raw_description.toLowerCase().includes(notePart);
    }

    // General search
    return (
      t.merchant_name.toLowerCase().includes(query) ||
      (t.notes || '').toLowerCase().includes(query) ||
      t.raw_description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  });

  const getIcon = (category: string) => {
    if (category.includes('Coffee')) return Coffee;
    if (category.includes('Shopping')) return ShoppingBag;
    if (category.includes('Transport')) return Car;
    if (category.includes('Income')) return Building;
    if (category.includes('Travel')) return Plane;
    return ShoppingBag;
  };

  const formatAmount = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency || currencyCode,
      signDisplay: 'always'
    }).format(amount);
  };

  const groupedTransactions = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.timestamp);
    let key = format(date, 'MMM dd, yyyy');
    if (isToday(date)) key = 'TODAY, ' + format(date, 'MMM dd').toUpperCase();
    else if (isYesterday(date)) key = 'YESTERDAY, ' + format(date, 'MMM dd').toUpperCase();

    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const currentMonth = new Date();
  const monthlySpendingByCategory = transactions
    .filter(t => t.transaction_type === 'debit' && isSameMonth(new Date(t.timestamp), currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(monthlySpendingByCategory)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6">
      <header className="flex justify-between items-center mb-8">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-6 h-0.5 bg-gray-100 rounded-full relative before:absolute before:w-6 before:h-0.5 before:bg-gray-100 before:-top-2 before:rounded-full after:absolute after:w-4 after:h-0.5 after:bg-gray-100 after:top-2 after:rounded-full"></div>
        </div>
        <h1 className="text-xl font-extrabold text-blue-400 tracking-tight">ExpenseSync</h1>
        <div className="w-10 h-10 rounded-full neu-convex overflow-hidden border-2 border-[#050506]">
          <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </header>

      <div className="text-center mb-8">
        <p className="text-xs font-bold text-red-400 tracking-widest uppercase mb-2">CURRENT BALANCE</p>
        <h2 className="text-5xl font-extrabold tracking-tighter mb-2 text-gray-100">
          {formatAmount(12450.82, userCurrency)}
        </h2>
        <p className="text-sm font-medium text-blue-400 flex items-center justify-center gap-1">
          <TrendingUp className="w-4 h-4" /> +4.2% from last month
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search merchant, amount:>100, note:lunch..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full neu-pressed rounded-2xl py-4 pl-12 pr-12 text-sm text-gray-200 placeholder-gray-500 border-none focus:outline-none focus:ring-1 focus:ring-[#050506]"
        />
        <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {searchQuery === '' && (
          <div className="absolute top-full left-0 right-0 mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['amount:>100', 'merchant:Amazon', 'note:lunch'].map((hint) => (
              <button
                key={hint}
                onClick={() => setSearchQuery(hint)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1a1c21] text-[10px] font-bold text-gray-400 border border-[#050506] hover:text-blue-400 transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Spending Summary Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Spending Summary</h3>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
          {sortedCategories.length > 0 ? (
            sortedCategories.map(([category, total]) => {
              const Icon = getIcon(category);
              return (
                <motion.div 
                  key={category}
                  whileTap={{ scale: 0.95 }}
                  className="min-w-[140px] neu-flat rounded-3xl p-4 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl neu-pressed flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{category}</h4>
                    <p className="text-lg font-extrabold text-gray-100">
                      {formatAmount(total, userCurrency)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="w-full py-8 neu-pressed rounded-3xl text-center">
              <p className="text-xs font-bold text-gray-500">No spending data for this month</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 neu-pressed rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-gray-400">No transactions found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateLabel, dayTransactions]) => (
            <div key={dateLabel}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-500 tracking-widest">{dateLabel}</h3>
                <span className="text-xs text-gray-500">{dayTransactions.length} Transactions</span>
              </div>
              <div className="space-y-4">
                {dayTransactions.map((t) => {
                  const Icon = getIcon(t.category);
                  const isPositive = t.amount > 0;
                  return (
                    <motion.div 
                      key={t.transaction_id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewTransaction(t)}
                      className="neu-flat rounded-3xl p-4 flex items-center gap-4 cursor-pointer"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 neu-pressed",
                        isPositive ? "text-emerald-400" : "text-blue-400"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-100 truncate">{t.merchant_name}</h4>
                        <p className="text-xs text-gray-400 truncate">{t.notes || t.raw_description}</p>
                        {t.category_confidence > 0.9 && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">CATEGORIZED ({Math.round(t.category_confidence * 100)}%)</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "font-extrabold text-lg",
                          isPositive ? "text-emerald-400" : "text-gray-100"
                        )}>
                          {formatAmount(t.amount, t.currency)}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {format(new Date(t.timestamp), 'hh:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
