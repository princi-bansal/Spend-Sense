export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Housing & Rent'
  | 'Utilities & Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Education'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Gift & Bonus'
  | 'Side Hustle'
  | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Cash';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Budget {
  category: ExpenseCategory;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: 'purple' | 'blue' | 'mint' | 'orange';
  category: string;
}

export type NavView = 'overview' | 'transactions' | 'budgets' | 'goals' | 'analytics';

export interface SpendingInsight {
  id: string;
  title: string;
  description: string;
  metric: string;
  tone: 'positive' | 'warning' | 'alert' | 'info';
  category?: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Housing & Rent',
  'Utilities & Bills',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Education',
  'Other',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Gift & Bonus',
  'Side Hustle',
  'Other Income',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#FF6B4A',      // Coral Orange
  'Groceries': '#10B981',          // Mint Green
  'Transport': '#0D9488',          // Deep Teal
  'Housing & Rent': '#7C3AED',     // Vibrant Purple
  'Utilities & Bills': '#14B8A6',  // Bright Teal
  'Shopping': '#FB7185',           // Coral Rose
  'Entertainment': '#8B5CF6',      // Electric Purple
  'Health & Fitness': '#2DD4BF',   // Aqua Mint
  'Education': '#6366F1',          // Indigo Purple
  'Other': '#64748B',              // Neutral Slate
  'Salary': '#10B981',             // Mint Green
  'Freelance': '#14B8A6',          // Teal
  'Investments': '#7C3AED',        // Purple
  'Gift & Bonus': '#FF6B4A',       // Coral Orange
  'Side Hustle': '#0D9488',        // Deep Teal
  'Other Income': '#34D399',       // Soft Mint
};
