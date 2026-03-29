import { motion } from 'motion/react';
import { X, MapPin, Calendar, Tag, ChevronDown, Edit3 } from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
  currency: string;
}

export default function TransactionDetail({ transaction, onClose, currency: userCurrency }: TransactionDetailProps) {
  const isPositive = transaction.amount > 0;

  const formatAmount = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency || currencyCode,
      signDisplay: 'never'
    }).format(Math.abs(amount));
  };

  return (
    <div className="min-h-screen bg-neu-base pt-12 px-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="w-10 h-10 neu-button rounded-full flex items-center justify-center text-gray-300">
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-gray-100">Transaction Detail</h1>
        <div className="px-3 py-1 neu-pressed text-blue-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
          {transaction.status}
        </div>
      </header>

      <div className="neu-flat rounded-[40px] p-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">AMOUNT</p>
          <h2 className={cn(
            "text-5xl font-extrabold tracking-tighter",
            isPositive ? "text-emerald-400" : "text-gray-100"
          )}>
            {isPositive ? '+' : ''}{formatAmount(transaction.amount, transaction.currency)}
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">CATEGORY</p>
            <div className="neu-pressed rounded-2xl p-4 flex justify-between items-center cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full neu-convex text-blue-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-200">{transaction.category.split(' > ').pop()}</span>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-end mb-2 px-2">
                <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">AI CATEGORY CONFIDENCE</p>
                <span className="text-sm font-extrabold text-emerald-400">{Math.round(transaction.category_confidence * 100)}%</span>
              </div>
              <div className="neu-pressed h-4 rounded-full p-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${transaction.category_confidence * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full shadow-inner",
                    transaction.category_confidence > 0.9 ? "bg-emerald-400" : 
                    transaction.category_confidence > 0.7 ? "bg-blue-400" : "bg-orange-400"
                  )}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 ml-2 leading-tight">
                Our AI is {transaction.category_confidence > 0.9 ? 'highly' : 'moderately'} confident in this categorization based on merchant data.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">DATE</p>
            <div className="neu-pressed rounded-2xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-200">
                {format(new Date(transaction.timestamp), 'MMM dd, yyyy • HH:mm')}
              </span>
            </div>
          </div>

          {transaction.location && (
            <div>
              <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">MERCHANT LOCATION</p>
              <div className="neu-pressed rounded-3xl h-40 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder for map */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <div className="w-10 h-10 neu-button-blue rounded-full flex items-center justify-center text-white z-10">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="absolute bottom-4 left-4 neu-flat px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider z-10 text-gray-200">
                  {transaction.location}
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">NOTES</p>
            <div className="neu-pressed rounded-2xl p-4 flex items-start gap-3">
              <Edit3 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p className={cn("text-sm", transaction.notes ? "text-gray-200 font-medium" : "text-gray-500 italic")}>
                {transaction.notes || "Add context to this transaction..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
