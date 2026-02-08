import { Profile, Transaction, Goal } from '../types';

const KEYS = {
  PROFILES: 'fincontrol_profiles',
  TRANSACTIONS: 'fincontrol_transactions',
  GOALS: 'fincontrol_goals'
};

// Initial Mock Data
const initialProfiles: Profile[] = [
  { id: '1', name: 'João Silva', type: 'PERSONAL', bankAccount: 'Nubank' },
  { id: '2', name: 'JS Soluções LTDA', type: 'BUSINESS', bankAccount: 'Inter PJ' }
];

const initialTransactions: Transaction[] = [
  // Rendas
  {
    id: 't1',
    profileId: '1',
    type: 'INCOME',
    name: 'Salário Mensal',
    value: 5000,
    date: new Date().toISOString().split('T')[0],
    category: 'Salário',
    isFixedIncome: true,
    notes: 'Salário referente ao mês atual'
  },
  {
    id: 't2',
    profileId: '2',
    type: 'INCOME',
    name: 'Projeto Consultoria TI',
    value: 8500,
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 dias atrás
    category: 'Vendas',
    isFixedIncome: false,
    notes: 'Cliente ABC Corp'
  },
  {
    id: 't3',
    profileId: '1',
    type: 'INCOME',
    name: 'Dividendos FIIs',
    value: 120.50,
    date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    category: 'Investimentos',
    isFixedIncome: false,
    notes: 'MXRF11'
  },
  
  // Despesas
  {
    id: 't4',
    profileId: '2',
    type: 'EXPENSE',
    name: 'Aluguel Escritório',
    value: 2000,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    category: 'Moradia',
    frequency: 'FIXED',
    priority: 'HIGH',
    remainingPercentage: 100,
    amountPaid: 0,
    notes: 'Vencimento dia 10'
  },
  {
    id: 't5',
    profileId: '1',
    type: 'EXPENSE',
    name: 'Supermercado Semanal',
    value: 450.75,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    category: 'Alimentação',
    frequency: 'VARIABLE',
    priority: 'MEDIUM',
    remainingPercentage: 0, // Pago
    amountPaid: 450.75,
    notes: 'Compra do mês'
  },
  {
    id: 't6',
    profileId: '2',
    type: 'EXPENSE',
    name: 'Licença Software CRM',
    value: 299.90,
    date: new Date().toISOString().split('T')[0],
    category: 'Software',
    frequency: 'FIXED',
    priority: 'CRITICAL',
    remainingPercentage: 100,
    amountPaid: 0
  },

  // Dívidas
  {
    id: 't7',
    profileId: '1',
    type: 'DEBT',
    name: 'Empréstimo Carro',
    value: 15000,
    date: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    category: 'Transporte',
    priority: 'HIGH',
    frequency: 'FIXED',
    numberOfInstallments: 36,
    installmentValue: 416.66,
    remainingPercentage: 80, // Parcialmente pago
    amountPaid: 3000,
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]
  },
  {
    id: 't8',
    profileId: '2',
    type: 'DEBT',
    name: 'Notebook Novo (Parcelado)',
    value: 4500,
    date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
    category: 'Equipamentos',
    priority: 'MEDIUM',
    frequency: 'TEMPORARY',
    numberOfInstallments: 10,
    installmentValue: 450,
    remainingPercentage: 90,
    amountPaid: 450,
    dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0]
  }
];

export const DataService = {
  getProfiles: (): Profile[] => {
    const data = localStorage.getItem(KEYS.PROFILES);
    return data ? JSON.parse(data) : initialProfiles;
  },
  saveProfile: (profile: Profile) => {
    const profiles = DataService.getProfiles();
    profiles.push(profile);
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  },
  deleteProfile: (id: string) => {
    const profiles = DataService.getProfiles().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
    
    // Optional: Clean up transactions related to this profile? 
    // For now, we keep them but they might show 'N/A' on profile name.
  },
  
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : initialTransactions;
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = DataService.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  deleteTransaction: (id: string) => {
    const transactions = DataService.getTransactions().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getGoals: (): Goal[] => {
    const data = localStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },
  saveGoal: (goal: Goal) => {
    const goals = DataService.getGoals();
    goals.push(goal);
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },
  deleteGoal: (id: string) => {
    const goals = DataService.getGoals().filter(g => g.id !== id);
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  // Novo método para limpar dados e iniciar do zero
  factoryReset: () => {
    // Cria um perfil padrão limpo
    const defaultProfile: Profile = { 
        id: Math.random().toString(36).substring(2, 9), 
        name: 'Meu Perfil', 
        type: 'PERSONAL', 
        bankAccount: 'Carteira' 
    };
    
    localStorage.setItem(KEYS.PROFILES, JSON.stringify([defaultProfile]));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.GOALS, JSON.stringify([]));
  }
};