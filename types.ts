export type ProfileType = 'PERSONAL' | 'BUSINESS';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  bankAccount: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'DEBT';

export type FrequencyType = 'FIXED' | 'VARIABLE' | 'TEMPORARY';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Transaction {
  id: string;
  profileId: string;
  type: TransactionType;
  name: string;
  value: number; // Monthly value or Total value depending on context
  date: string; // ISO Date
  
  // Specific to Expense/Debt
  remainingPercentage?: number; // 0-100
  amountPaid?: number;
  installmentValue?: number;
  numberOfInstallments?: number; // Total number of installments
  priority?: PriorityLevel;
  frequency?: FrequencyType;
  category?: string;
  dueDate?: string;
  
  // Specific to Income
  isFixedIncome?: boolean;
  
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}