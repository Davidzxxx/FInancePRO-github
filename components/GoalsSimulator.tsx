import React, { useState, useEffect } from 'react';
import { Target, Calculator, Plus, X, Calendar, TrendingUp, Trash2, Award } from 'lucide-react';
import { Goal } from '../types';
import { DataService } from '../services/dataService';

export const GoalsSimulator: React.FC = () => {
  // Simulator State
  const [goalAmount, setGoalAmount] = useState(10000);
  const [monthlySaving, setMonthlySaving] = useState(500);
  const [currentSavedSim, setCurrentSavedSim] = useState(0);

  // Goals Manager State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  const loadGoals = () => {
    setGoals(DataService.getGoals());
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: Goal = {
      id: generateId(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || '0'),
      deadline: newGoal.deadline
    };
    DataService.saveGoal(goal);
    loadGoals();
    setIsFormOpen(false);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      DataService.deleteGoal(id);
      loadGoals();
    }
  };

  // Simulator Calculations
  const monthsToGoal = Math.ceil((goalAmount - currentSavedSim) / monthlySaving);
  const yearsToGoal = (monthsToGoal / 12).toFixed(1);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="text-rose-500" />
          Metas e Simulação
        </h2>
      </div>

      {/* --- SIMULATOR SECTION --- */}
      <section className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Calculator size={120} className="text-indigo-600" />
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Calculator size={20} className="text-indigo-600" />
           Simulador de Conquistas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Qual o valor do seu objetivo?</label>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-slate-400">R$</span>
                 <input 
                    type="number" 
                    value={goalAmount} 
                    onChange={e => setGoalAmount(Number(e.target.value))}
                    className="w-full text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-indigo-100 focus:border-indigo-500 outline-none transition-colors"
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Quanto você já tem guardado?</label>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-slate-400">R$</span>
                 <input 
                    type="number" 
                    value={currentSavedSim} 
                    onChange={e => setCurrentSavedSim(Number(e.target.value))}
                    className="w-full text-xl font-bold text-slate-700 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none transition-colors"
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-4">Quanto você pode guardar por mês?</label>
              <input 
                type="range" 
                min="50" 
                max="5000" 
                step="50"
                value={monthlySaving} 
                onChange={e => setMonthlySaving(Number(e.target.value))}
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="mt-2 text-center bg-indigo-50 py-2 rounded-lg text-indigo-700 font-bold">
                R$ {monthlySaving.toLocaleString('pt-BR')} / mês
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 flex flex-col justify-center items-center text-center border border-slate-100">
             <p className="text-slate-500 font-medium mb-2">Você alcançará sua meta em:</p>
             <div className="text-5xl font-black text-indigo-600 mb-2">
               {isFinite(monthsToGoal) && monthsToGoal > 0 ? monthsToGoal : 0} <span className="text-2xl font-bold text-indigo-400">meses</span>
             </div>
             {monthsToGoal > 12 && (
               <p className="text-slate-400 text-sm">(Aprox. {yearsToGoal} anos)</p>
             )}

             <div className="w-full mt-8 bg-white rounded-full h-4 shadow-inner">
               <div 
                 className="bg-emerald-500 h-4 rounded-full transition-all duration-1000"
                 style={{ width: `${Math.min((currentSavedSim / goalAmount) * 100, 100)}%` }}
               ></div>
             </div>
             <p className="text-xs text-slate-400 mt-2">
               Progresso atual: {((currentSavedSim / goalAmount) * 100).toFixed(1)}%
             </p>
          </div>
        </div>
      </section>

      {/* --- GOALS LIST SECTION --- */}
      <section>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Award className="text-amber-500" />
             Minhas Metas Ativas
           </h3>
           <button 
             onClick={() => setIsFormOpen(true)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
           >
             <Plus size={18} /> Nova Meta
           </button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400">
             <Target size={48} className="mx-auto mb-4 opacity-50" />
             <p className="font-medium">Nenhuma meta cadastrada ainda.</p>
             <p className="text-sm">Defina objetivos financeiros para acompanhar seu progresso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => {
               const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
               return (
                 <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="mb-4">
                       <h4 className="font-bold text-lg text-slate-800">{goal.name}</h4>
                       <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar size={14} />
                          <span>Alvo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">Atual</p>
                             <p className="text-lg font-bold text-emerald-600">R$ {goal.currentAmount.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase font-bold">Alvo</p>
                             <p className="text-sm font-semibold text-slate-600">R$ {goal.targetAmount.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                          </div>
                       </div>

                       <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                             <span className="text-indigo-600">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                               style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                       </div>
                    </div>
                 </div>
               );
            })}
          </div>
        )}
      </section>

      {/* --- CREATE GOAL MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Criar Nova Meta</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                   <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Objetivo</label>
                   <input 
                     required
                     type="text" 
                     placeholder="Ex: Viagem para Europa, Reserva de Emergência..."
                     value={newGoal.name}
                     onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valor Alvo (R$)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={newGoal.targetAmount}
                        onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Já Guardado (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={newGoal.currentAmount}
                        onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Data Limite (Previsão)</label>
                   <input 
                     required
                     type="date" 
                     value={newGoal.deadline}
                     onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsFormOpen(false)}
                     className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                   >
                     Cancelar
                   </button>
                   <button 
                     type="submit"
                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                   >
                     <TrendingUp size={18} />
                     Criar Meta
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};