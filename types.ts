
export type Platform = 'Uber' | '99' | 'Outros';

export type TransactionType = 'EARNING' | 'EXPENSE';

export type ExpenseCategory = 'Combustível' | 'Alimentação' | 'Manutenção' | 'Lavação' | 'Taxas App' | 'Outros';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  platform?: Platform;
  category?: ExpenseCategory;
  liters?: number;
  description?: string;
}

export interface CustomGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  createdAt: string;
}

export interface DailySummary {
  earnings: number;
  expenses: number;
  profit: number;
  uberEarnings: number;
  ninetynineEarnings: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo?: string;
  dailyGoal?: number;
  customGoals?: CustomGoal[];
}