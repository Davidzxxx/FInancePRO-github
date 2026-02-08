import React, { useMemo } from 'react';
import { Transaction, Profile } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, AlertTriangle, TrendingUp, Activity, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  profiles: Profile[];
  onViewAll: (tab: 'INCOMES' | 'EXPENSES') => void;
}

const PRIORITY_COLORS = {
  CRITICAL: '#ef4444', // Red 500
  HIGH: '#f97316',     // Orange 500
  MEDIUM: '#6366f1',   // Indigo 500
  LOW: '#10b981'       // Emerald 500
};

const PRIORITY_LABELS = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
};

export const Dashboard: React.FC<DashboardProps> = ({ transactions, profiles, onViewAll }) => {
  
  // 1. Calculate Totals
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let debt = 0;

    transactions.forEach(t => {
      if (t.type === 'INCOME') income += t.value;
      if (t.type === 'EXPENSE') expense += t.value;
      if (t.type === 'DEBT') debt += t.value;
    });

    return { income, expense, debt, balance: income - expense - debt };
  }, [transactions]);

  // 2. Prepare Data for Income vs Expense Chart (Monthly Trend)
  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, { name: string, renda: number, despesa: number }>();

    transactions.forEach(t => {
      if (t.type === 'DEBT') return; // Exclude debts from cash flow flow for this chart

      const date = new Date(t.date);
      const key = `${date.getMonth()}-${date.getFullYear()}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      if (!dataMap.has(key)) {
        dataMap.set(key, { name: label, renda: 0, despesa: 0 });
      }

      const entry = dataMap.get(key)!;
      if (t.type === 'INCOME') entry.renda += t.value;
      if (t.type === 'EXPENSE') entry.despesa += t.value;
    });

    return Array.from(dataMap.values());
  }, [transactions]);

  // 3. Prepare Data for Priority Pie Chart (Expenses + Debts)
  const priorityData = useMemo(() => {
    // Initialize with all priorities to ensure they appear in legend
    const counts: Record<string, number> = {
      'CRITICAL': 0,
      'HIGH': 0,
      'MEDIUM': 0,
      'LOW': 0
    };
    
    transactions
      .filter(t => t.type === 'DEBT' || t.type === 'EXPENSE')
      .forEach(t => {
        const priority = t.priority || 'MEDIUM';
        if (counts[priority] !== undefined) {
           counts[priority] += t.value;
        }
      });

    return Object.entries(counts).map(([key, value]) => ({
      name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
      key: key,
      value
    }));
  }, [transactions]);

  const totalPriorityValue = useMemo(() => {
     return priorityData.reduce((acc, curr) => acc + curr.value, 0);
  }, [priorityData]);

  // 4. Recent Transactions Logic
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 5. Upcoming Due Dates Logic
  const upcomingDebts = useMemo(() => {
    return transactions
      .filter(t => 
        (t.type === 'EXPENSE' || t.type === 'DEBT') && 
        (t.remainingPercentage ?? 0) > 0 && 
        t.dueDate
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [transactions]);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bgClass} opacity-20 group-hover:scale-110 transition-transform duration-500`}></div>
      
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon size={22} />
        </div>
      </div>
      
      <div className="z-10 flex items-center gap-1 text-xs font-medium text-slate-400 mt-2">
        <Activity size={14} />
        <span>Atualizado agora</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Rendas Totais" 
          value={stats.income} 
          icon={ArrowUpCircle} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50"
        />
        <StatCard 
          title="Despesas" 
          value={stats.expense} 
          icon={ArrowDownCircle} 
          colorClass="text-rose-600" 
          bgClass="bg-rose-50"
        />
        <StatCard 
          title="Dívidas Ativas" 
          value={stats.debt} 
          icon={AlertTriangle} 
          colorClass="text-amber-600" 
          bgClass="bg-amber-50"
        />
        <StatCard 
          title="Saldo Líquido" 
          value={stats.balance} 
          icon={Wallet} 
          colorClass={stats.balance >= 0 ? "text-indigo-600" : "text-red-600"} 
          bgClass={stats.balance >= 0 ? "bg-indigo-50" : "bg-red-50"}
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa Geral</h3>
              <p className="text-sm text-slate-400">Comparativo de Entradas vs Saídas</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" verticalAlign="top" height={36}/>
                <Bar dataKey="renda" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="despesa" name="Despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
             <h3 className="text-lg font-bold text-slate-800">Compromissos por Prioridade</h3>
             <p className="text-sm text-slate-400">Despesas e Dívidas por urgência</p>
          </div>

          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.key as keyof typeof PRIORITY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text for Donut */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-6">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <p className="text-sm font-bold text-slate-700">
                 R$ {totalPriorityValue.toLocaleString('pt-BR', { notation: 'compact' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tables Row (Recent & Upcoming) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Debts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">Próximos Vencimentos</h3>
                   <p className="text-xs text-slate-400">Contas a pagar em breve</p>
                </div>
             </div>
             <button 
               onClick={() => onViewAll('EXPENSES')}
               className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
             >
               Ver todas
             </button>
           </div>
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead className="bg-slate-50">
                 <tr className="text-slate-500">
                   <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Vencimento</th>
                   <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Descrição</th>
                   <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Valor Pendente</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {upcomingDebts.map((t) => {
                   const today = new Date();
                   today.setHours(0,0,0,0);
                   const dueDate = new Date(t.dueDate!);
                   dueDate.setHours(0,0,0,0);
                   const isOverdue = dueDate < today;
                   const isToday = dueDate.getTime() === today.getTime();
                   
                   const remaining = t.value * ((t.remainingPercentage ?? 100) / 100);

                   return (
                     <tr key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                       <td className="px-6 py-4">
                         <div className={`flex items-center gap-2 font-bold ${isOverdue ? 'text-red-600' : isToday ? 'text-amber-600' : 'text-slate-700'}`}>
                           {isOverdue && <AlertTriangle size={14} />}
                           {dueDate.toLocaleDateString('pt-BR')}
                         </div>
                         <div className="text-xs text-slate-400">
                           {isOverdue ? 'Atrasado' : isToday ? 'Vence Hoje' : 'No prazo'}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-slate-700">{t.name}</div>
                         <div className="text-xs text-slate-500">
                            {t.priority === 'CRITICAL' && <span className="text-red-500 font-bold">Prioridade Crítica</span>}
                            {t.priority === 'HIGH' && <span className="text-orange-500">Alta Prioridade</span>}
                            {(!t.priority || t.priority === 'MEDIUM' || t.priority === 'LOW') && <span>{t.category || 'Geral'}</span>}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-right text-slate-700">
                         R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </td>
                     </tr>
                   );
                 })}
                 {upcomingDebts.length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                       <div className="flex flex-col items-center gap-2">
                         <CheckCircle2 size={32} className="text-emerald-300" />
                         <span>Tudo em dia! Nenhuma conta pendente.</span>
                       </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Activity size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">Transações Recentes</h3>
                   <p className="text-xs text-slate-400">Últimos lançamentos</p>
                </div>
             </div>
             <button 
               onClick={() => onViewAll('EXPENSES')}
               className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
             >
               Ver todas
             </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 truncate max-w-[150px]">{t.name}</div>
                      <div className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                         {profiles.find(p => p.id === t.profileId)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right 
                      ${t.type === 'INCOME' ? 'text-emerald-600' : t.type === 'DEBT' ? 'text-amber-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">Nenhum lançamento registrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};