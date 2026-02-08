import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Wallet, BarChart2, Target, Menu, X, Rocket, Plus, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, AlertCircle, Calendar, CreditCard, FileText, Tag, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { SupabaseService } from './services/supabaseService';
import { Profile, Transaction } from './types';
import { Dashboard } from './components/Dashboard';
import { ProfileManager } from './components/ProfileManager';
import { TransactionForm } from './components/TransactionForm';
import { AnalyticsBI } from './components/AnalyticsBI';
import { GoalsSimulator } from './components/GoalsSimulator';

type View = 'DASHBOARD' | 'PROFILES' | 'TRANSACTIONS' | 'BI' | 'GOALS';
type TransactionTab = 'INCOMES' | 'EXPENSES';

function App() {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // App State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTransactionTab, setActiveTransactionTab] = useState<TransactionTab>('INCOMES');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profilesData, transactionsData] = await Promise.all([
        SupabaseService.getProfiles(),
        SupabaseService.getTransactions()
      ]);
      setProfiles(profilesData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to migrate data from localStorage if exists
        await SupabaseService.migrateFromLocalStorage();
      } catch (err) {
        console.error('Migration error (non-critical):', err);
      }
      // Load data regardless of migration result
      await loadData();
    };

    initializeApp();
  }, []);

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.')) {
      try {
        await SupabaseService.deleteTransaction(id);
        await loadData();
        setSelectedTransaction(null);
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Erro ao excluir lançamento. Tente novamente.');
      }
    }
  };

  const getProfileName = (id: string) => profiles.find(p => p.id === id)?.name || 'N/A';

  // Helper for compact date format
  const formatDateCompact = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const handleViewAll = (tab: TransactionTab) => {
    setActiveTransactionTab(tab);
    setCurrentView('TRANSACTIONS');
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === view
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-100'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const TransactionDetailsModal = ({ transaction, onClose }: { transaction: Transaction, onClose: () => void }) => {
    if (!transaction) return null;

    const isIncome = transaction.type === 'INCOME';
    const isDebt = transaction.type === 'DEBT';

    // Fix: Use static objects for colors instead of dynamic string interpolation for Tailwind to detect classes
    const getTheme = (type: string) => {
      if (type === 'INCOME') return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        iconBg: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        text: 'text-emerald-600'
      };
      if (type === 'DEBT') return {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        iconBg: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        text: 'text-amber-600'
      };
      return { // EXPENSE
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        iconBg: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
        text: 'text-rose-600'
      };
    };

    const theme = getTheme(transaction.type);
    const ThemeIcon = isIncome ? ArrowUpCircle : isDebt ? AlertCircle : ArrowDownCircle;

    const remaining = transaction.remainingPercentage ?? 100;
    const remainingValue = transaction.value * (remaining / 100);
    const amountPaid = transaction.amountPaid || (transaction.value - remainingValue);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className={`p-6 ${theme.bg} border-b ${theme.border} flex justify-between items-start`}>
            <div className="flex gap-4">
              <div className={`p-3 bg-white rounded-xl shadow-sm ${theme.iconBg}`}>
                <ThemeIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{transaction.name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mt-2 ${theme.badge}`}>
                  {transaction.type === 'INCOME' ? 'RENDA' : transaction.type === 'DEBT' ? 'DÍVIDA' : 'DESPESA'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-500">
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">

            {/* Main Value */}
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Total</p>
                <p className={`text-2xl font-bold ${theme.text}`}>
                  R$ {transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {!isIncome && (
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Pago</p>
                  <p className="text-lg font-bold text-slate-700">
                    R$ {amountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Calendar size={12} /> Data Registro
                </div>
                <p className="font-medium text-slate-700">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
              </div>

              {!isIncome && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                    <Clock size={12} /> Vencimento
                  </div>
                  <p className="font-medium text-slate-700">
                    {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Tag size={12} /> Categoria
                </div>
                <p className="font-medium text-slate-700">{transaction.category || 'Geral'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Users size={12} /> Perfil
                </div>
                <p className="font-medium text-slate-700">{getProfileName(transaction.profileId)}</p>
              </div>

              {!isIncome && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                      <CreditCard size={12} /> Parcelas
                    </div>
                    <p className="font-medium text-slate-700">
                      {transaction.numberOfInstallments
                        ? `${transaction.numberOfInstallments}x de R$ ${transaction.installmentValue?.toFixed(2)}`
                        : 'À vista / Única'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                      <AlertCircle size={12} /> Prioridade
                    </div>
                    <p className="font-medium text-slate-700">
                      {transaction.priority === 'CRITICAL' ? 'Crítica' :
                        transaction.priority === 'HIGH' ? 'Alta' :
                          transaction.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <FileText size={16} />
                <span className="text-sm font-bold uppercase">Observações</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {transaction.notes || 'Nenhuma observação registrada para este lançamento.'}
              </p>
            </div>

            {/* Status Bar for Expenses */}
            {!isIncome && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Progresso Pagamento</span>
                  <span>{remaining === 0 ? 'Quitado' : `${(100 - remaining).toFixed(0)}% Pago`}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${remaining === 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    style={{ width: `${100 - remaining}%` }}
                  ></div>
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="px-4 py-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Excluir
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const IncomesTable = ({ data }: { data: Transaction[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Data</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Nome / Descrição</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Perfil</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Categoria</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Tipo</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Observações</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...data].reverse().map(t => (
              <tr
                key={t.id}
                onClick={() => setSelectedTransaction(t)}
                className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{t.name}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                    <Users size={12} />
                    <span className="text-xs font-medium">{getProfileName(t.profileId)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-slate-600">
                  <span className="bg-white px-2 py-1 rounded text-xs border border-slate-200 shadow-sm">{t.category || 'Geral'}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${t.isFixedIncome
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                    {t.isFixedIncome ? 'Fixa (Mensal)' : 'Variável'}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-slate-500 max-w-xs truncate" title={t.notes}>
                  {t.notes || '-'}
                </td>
                <td className="px-3 py-3 text-sm text-right font-bold text-emerald-600">
                  + R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Nenhuma renda lançada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ExpensesTable = ({ data }: { data: Transaction[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Vencimento</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider w-1/4">Nome / Status</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Perfil</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Categoria</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Frequência</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider">Prioridade</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right">Parcela</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right">Valor Restante</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...data].reverse().map(t => {
              const frequencyLabel = t.frequency === 'FIXED' ? 'Fixa' : t.frequency === 'VARIABLE' ? 'Variável' : 'Temporária';
              const remaining = t.remainingPercentage ?? 100;
              const remainingValue = t.value * (remaining / 100);

              let installmentInfo = "";
              if (t.numberOfInstallments) {
                const paidRatio = (100 - remaining) / 100;
                const currentPaid = Math.round(t.numberOfInstallments * paidRatio);
                installmentInfo = `${currentPaid}/${t.numberOfInstallments}`;
              } else if (t.installmentValue && t.value > 0) {
                const totalInstallments = Math.round(t.value / t.installmentValue);
                if (totalInstallments > 0 && isFinite(totalInstallments)) {
                  const paidRatio = (100 - remaining) / 100;
                  const currentPaid = Math.round(totalInstallments * paidRatio);
                  installmentInfo = `${currentPaid}/${totalInstallments}`;
                }
              }

              // Priority Badge Logic
              let priorityLabel = 'Média';
              let priorityStyle = 'bg-blue-50 text-blue-700 border-blue-200';

              switch (t.priority) {
                case 'CRITICAL':
                  priorityLabel = 'Crítica';
                  priorityStyle = 'bg-red-50 text-red-700 border-red-200';
                  break;
                case 'HIGH':
                  priorityLabel = 'Alta';
                  priorityStyle = 'bg-orange-50 text-orange-700 border-orange-200';
                  break;
                case 'MEDIUM':
                  priorityLabel = 'Média';
                  priorityStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  break;
                case 'LOW':
                  priorityLabel = 'Baixa';
                  priorityStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  break;
              }

              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTransaction(t)}
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap align-top font-medium">
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDateCompact(t.dueDate || t.date)}
                    </div>
                  </td>

                  {/* Nome e Status (Porcentagem) */}
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{t.name}</div>
                    </div>
                    {/* Barra de Progresso e Porcentagem */}
                    <div className="flex flex-col gap-1 w-full max-w-[150px]">
                      <div className="flex justify-between items-center min-h-[16px]">
                        <span className="text-[10px] font-bold text-slate-500">
                          {installmentInfo && `Parcela ${installmentInfo}`}
                        </span>
                        <span className={`text-[10px] font-bold ${remaining === 0 ? 'text-emerald-500' : 'text-slate-600'}`}>
                          {remaining === 0 ? 'PAGO' : `${remaining}%`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${remaining === 0 ? 'bg-emerald-500' :
                            t.type === 'DEBT' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          style={{ width: `${remaining}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit mt-1">
                      <Users size={12} />
                      <span className="text-xs font-medium">{getProfileName(t.profileId)}</span>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-sm text-slate-600 align-top">
                    <span className="bg-white px-2 py-1 rounded text-xs border border-slate-200 shadow-sm inline-block mt-1">{t.category || 'Geral'}</span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-block mt-1 ${t.frequency === 'FIXED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      t.frequency === 'VARIABLE' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                      {frequencyLabel}
                    </span>
                  </td>

                  <td className="px-3 py-3 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-block mt-1 ${priorityStyle}`}>
                      {priorityLabel}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-sm text-right text-slate-500 align-top">
                    <div className="mt-1">
                      {t.installmentValue ? `R$ ${t.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-sm text-right font-medium text-slate-600 align-top">
                    <div className="mt-1">
                      R$ {remainingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  <td className={`px-3 py-3 text-sm text-right font-bold align-top ${t.type === 'DEBT' ? 'text-amber-600' : 'text-rose-600'}`}>
                    <div className="mt-1">
                      R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              )
            })}
            {data.length === 0 && (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Nenhuma despesa ou dívida lançada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const incomes = transactions.filter(t => t.type === 'INCOME');
  const expensesAndDebts = transactions.filter(t => t.type === 'EXPENSE' || t.type === 'DEBT');

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">

      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-white border-r border-slate-100 p-6 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Rocket className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">FinControl</h1>
            <p className="text-xs text-indigo-600 font-semibold tracking-wider">PRO EDITION</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="PROFILES" icon={Users} label="Perfis & Contas" />
          <NavItem view="TRANSACTIONS" icon={Wallet} label="Lançamentos" />
          <NavItem view="BI" icon={BarChart2} label="Análise BI" />
          <NavItem view="GOALS" icon={Target} label="Metas & Simulação" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-sm font-medium mb-1">Status da API</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-xs text-slate-400">
                {process.env.API_KEY ? 'Conectado (Gemini)' : 'API Key ausente'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">

          <header className="mb-8 md:flex md:justify-between md:items-center hidden">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {currentView === 'DASHBOARD' && 'Visão Geral'}
                {currentView === 'PROFILES' && 'Gestão de Entidades'}
                {currentView === 'TRANSACTIONS' && 'Controle Financeiro'}
                {currentView === 'BI' && 'Inteligência de Dados'}
                {currentView === 'GOALS' && 'Planejamento Futuro'}
              </h2>
              <p className="text-slate-500 text-sm">Bem-vindo ao seu painel financeiro.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-700">João Silva</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                JS
              </div>
            </div>
          </header>

          {currentView === 'DASHBOARD' && <Dashboard transactions={transactions} profiles={profiles} onViewAll={handleViewAll} />}
          {currentView === 'PROFILES' && <ProfileManager profiles={profiles} onUpdate={loadData} />}

          {currentView === 'TRANSACTIONS' && (
            <div className="space-y-6 animate-in fade-in duration-500">

              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Histórico de Transações</h3>
                <button
                  onClick={() => setIsTransactionFormOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus size={18} /> Novo Lançamento
                </button>
              </div>

              {/* Modal for Transaction Form */}
              {isTransactionFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                    <button
                      onClick={() => setIsTransactionFormOpen(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                    >
                      <X size={24} />
                    </button>
                    <div className="p-1">
                      <TransactionForm profiles={profiles} onSuccess={() => { loadData(); setIsTransactionFormOpen(false); }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal for Transaction Details */}
              <TransactionDetailsModal
                transaction={selectedTransaction!}
                onClose={() => setSelectedTransaction(null)}
              />

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTransactionTab('INCOMES')}
                  className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors border-b-2 ${activeTransactionTab === 'INCOMES'
                    ? 'text-emerald-600 border-emerald-500'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                >
                  <ArrowUpCircle size={18} />
                  Rendas (Entradas)
                </button>
                <button
                  onClick={() => setActiveTransactionTab('EXPENSES')}
                  className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors border-b-2 ${activeTransactionTab === 'EXPENSES'
                    ? 'text-rose-600 border-rose-500'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                >
                  <ArrowDownCircle size={18} />
                  Despesas e Dívidas (Saídas)
                </button>
              </div>

              <div className="mt-4">
                {activeTransactionTab === 'INCOMES' ? (
                  <IncomesTable data={incomes} />
                ) : (
                  <ExpensesTable data={expensesAndDebts} />
                )}
              </div>

            </div>
          )}
          {currentView === 'BI' && <AnalyticsBI transactions={transactions} profiles={profiles} />}
          {currentView === 'GOALS' && <GoalsSimulator />}
        </div>
      </main>
    </div>
  );
}

export default App;