import React, { useState, useMemo } from 'react';
import { Transaction, Profile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Sparkles, BrainCircuit } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

interface AnalyticsBIProps {
  transactions: Transaction[];
  profiles: Profile[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const AnalyticsBI: React.FC<AnalyticsBIProps> = ({ transactions, profiles }) => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(profiles.map(p => p.id));
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const toggleProfile = (id: string) => {
    setSelectedProfiles(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const filteredData = useMemo(() => {
    return transactions.filter(t => selectedProfiles.includes(t.profileId));
  }, [transactions, selectedProfiles]);

  // Data for Income vs Expense Chart
  const incomeVsExpense = useMemo(() => {
    const data = [
      { name: 'Rendas', value: 0 },
      { name: 'Despesas', value: 0 },
      { name: 'Dívidas', value: 0 },
    ];
    filteredData.forEach(t => {
      if (t.type === 'INCOME') data[0].value += t.value;
      if (t.type === 'EXPENSE') data[1].value += t.value;
      if (t.type === 'DEBT') data[2].value += t.value;
    });
    return data;
  }, [filteredData]);

  // Data for Category Pie Chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.filter(t => t.type === 'EXPENSE' || t.type === 'DEBT').forEach(t => {
       const cat = t.category || 'Outros';
       map.set(cat, (map.get(cat) || 0) + t.value);
    });
    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const handleAiAnalysis = async () => {
    setIsLoadingAi(true);
    const result = await GeminiService.analyzeFinances(filteredData, profiles.filter(p => selectedProfiles.includes(p.id)));
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" />
            Business Intelligence
          </h2>
          <p className="text-slate-500">Análise cruzada de dados financeiros</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <Filter size={18} className="text-slate-400 ml-2" />
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => toggleProfile(p.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                selectedProfiles.includes(p.id) 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Fluxo de Caixa (Selecionados)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f43f5e' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoria</h3>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Sem dados de despesas para exibir.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 shadow-lg text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-lg">
                <Sparkles className="text-yellow-400" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Consultor Financeiro IA</h3>
               <p className="text-indigo-200 text-sm">Análise inteligente baseada nos dados filtrados acima.</p>
             </div>
          </div>
          <button
            onClick={handleAiAnalysis}
            disabled={isLoadingAi}
            className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 disabled:opacity-50 transition-colors"
          >
            {isLoadingAi ? 'Analisando...' : 'Gerar Relatório Completo'}
          </button>
        </div>

        {aiAnalysis && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10 animate-in slide-in-from-bottom-4">
             <div 
               className="prose prose-invert max-w-none text-slate-100"
               dangerouslySetInnerHTML={{ __html: aiAnalysis }} 
             />
          </div>
        )}
      </div>
    </div>
  );
};