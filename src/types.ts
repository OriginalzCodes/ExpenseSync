export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  transaction_id: string;
  timestamp: string;
  amount: number;
  currency: string;
  merchant_name: string;
  raw_description: string;
  wallet_id: string;
  transaction_type: TransactionType;
  category: string;
  category_confidence: number;
  balance_after: number;
  status: 'pending' | 'completed';
  location?: string;
  notes?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'mobile';
  balance: number;
  currency: string;
  connected: boolean;
  last_synced?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  status: 'healthy' | 'stable' | 'critical';
  icon: string;
}

export interface UserSettings {
  currency: string;
  notifications: boolean;
  notification_preferences: {
    budget_alerts: boolean;
    transaction_summaries: boolean;
    security_alerts: boolean;
  };
  auto_categorize: boolean;
  privacy_mode: boolean;
}
