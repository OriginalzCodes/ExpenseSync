import { Transaction, Wallet, Budget } from '../types';

export const mockWallets: Wallet[] = [
  { id: 'w1', name: 'Plaid Bank', type: 'bank', balance: 12450.82, currency: 'USD', connected: false },
  { id: 'w2', name: 'Stripe Merchant', type: 'mobile', balance: 3400.00, currency: 'USD', connected: false },
  { id: 'w3', name: 'Web3 Wallet', type: 'crypto', balance: 1.5, currency: 'ETH', connected: false },
];

export const mockTransactions: Transaction[] = [
  {
    transaction_id: 't1',
    timestamp: new Date().toISOString(),
    amount: -14.50,
    currency: 'USD',
    merchant_name: 'Blue Bottle Coffee',
    raw_description: 'BLUE BOTTLE COFFEE #123',
    wallet_id: 'w1',
    transaction_type: 'debit',
    category: 'Food & Drink > Coffee',
    category_confidence: 0.98,
    balance_after: 12436.32,
    status: 'pending',
    location: '75 Geary St, San Francisco',
    notes: 'Morning Latte & Pastry'
  },
  {
    transaction_id: 't2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    amount: -2.99,
    currency: 'USD',
    merchant_name: 'Apple Store',
    raw_description: 'APPLE.COM/BILL',
    wallet_id: 'w1',
    transaction_type: 'debit',
    category: 'Software > Subscriptions',
    category_confidence: 0.99,
    balance_after: 12439.31,
    status: 'completed',
    notes: 'iCloud+ Subscription'
  },
  {
    transaction_id: 't3',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    amount: -42.00,
    currency: 'USD',
    merchant_name: 'Uber Technologies',
    raw_description: 'UBER *TRIP',
    wallet_id: 'w1',
    transaction_type: 'debit',
    category: 'Transport > Rideshare',
    category_confidence: 0.92,
    balance_after: 12481.31,
    status: 'completed',
    notes: 'Ride to Terminal 4'
  },
  {
    transaction_id: 't4',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    amount: 6200.00,
    currency: 'USD',
    merchant_name: 'Salary Deposit',
    raw_description: 'ACH DEPOSIT ACME CORP',
    wallet_id: 'w1',
    transaction_type: 'credit',
    category: 'Income > Salary',
    category_confidence: 1.0,
    balance_after: 12523.31,
    status: 'completed',
    notes: 'Monthly Payout Oct'
  },
  {
    transaction_id: 't5',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    amount: -1240.00,
    currency: 'USD',
    merchant_name: 'Luxury Travel',
    raw_description: 'EXPEDIA TRAVEL',
    wallet_id: 'w1',
    transaction_type: 'debit',
    category: 'Travel > Flights',
    category_confidence: 0.85,
    balance_after: 6323.31,
    status: 'completed',
    location: 'Online',
  }
];

export const mockBudgets: Budget[] = [
  { id: 'b1', category: 'Housing', limit: 2500, spent: 1625, status: 'healthy', icon: 'Home' },
  { id: 'b2', category: 'Dining Out', limit: 400, spent: 448.20, status: 'critical', icon: 'Utensils' },
  { id: 'b3', category: 'Travel', limit: 1200, spent: 336, status: 'stable', icon: 'Plane' },
  { id: 'b4', category: 'Fun & Play', limit: 300, spent: 126, status: 'healthy', icon: 'Gamepad2' },
];
