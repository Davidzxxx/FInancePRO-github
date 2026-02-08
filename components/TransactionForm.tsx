import React, { useState, useEffect } from 'react';
import { Profile, TransactionType, FrequencyType, PriorityLevel, Transaction } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { Check, X, Calculator, DollarSign } from 'lucide-react';

interface TransactionFormProps {
  profiles: Profile[];
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ profiles, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('INCOME');

  // Form States
  const [profileId, setProfileId] = useState('');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Income Specific
  const [isFixedIncome, setIsFixedIncome] = useState(false);

  // Expense/Debt Specific
  const [frequency, setFrequency] = useState<FrequencyType>('VARIABLE');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [remainingPercentage, setRemainingPercentage] = useState('100');
  const [amountPaid, setAmountPaid] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Set default profile if available
  useEffect(() => {
    if (profiles.length > 0 && !profileId) {
      setProfileId(profiles[0].id);
    }
  }, [profiles]);

  // Reset form when tab changes to avoid mixed data
  useEffect(() => {
    setName('');
    setValue('');
    setCategory('');
    setNotes('');
    setIsFixedIncome(false);
    setFrequency('VARIABLE');
    setPriority('MEDIUM');
    setRemainingPercentage('100');
    setAmountPaid('');
    setNumberOfInstallments('');
    setInstallmentValue('');
    setDueDate('');
  }, [activeTab]);

  // Effect to auto-calculate installment value based on Total / Count
  useEffect(() => {
    if (activeTab !== 'INCOME' && value && numberOfInstallments) {
      const val = parseFloat(value);
      const install = parseFloat(numberOfInstallments);
      if (!isNaN(val) && !isNaN(install) && install > 0) {
        setInstallmentValue((val / install).toFixed(2));
      }
    }
  }, [value, numberOfInstallments, activeTab]);

  // Handler for Amount Paid change -> Updates Percentage
  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPaid = e.target.value;
    setAmountPaid(newPaid);

    if (value && newPaid !== '') {
      const total = parseFloat(value);
      const paid = parseFloat(newPaid);
      if (!isNaN(total) && !isNaN(paid) && total > 0) {
        const remaining = Math.max(0, total - paid);
        const pct = (remaining / total) * 100;
        setRemainingPercentage(Math.max(0, Math.min(100, pct)).toFixed(0));
      }
    } else if (newPaid === '') {
      setRemainingPercentage('100');
    }
  };

  // Handler for Slider change -> Updates Amount Paid
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = e.target.value;
    setRemainingPercentage(newPercent);

    if (value) {
      const total = parseFloat(value);
      const pct = parseFloat(newPercent);
      if (!isNaN(total) && !isNaN(pct)) {
        const remaining = (total * pct) / 100;
        const paid = total - remaining;
        setAmountPaid(paid.toFixed(2));
      }
    }
  };

  // Handler for Total Value change -> Updates Amount Paid based on current %
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);

    if (newVal && remainingPercentage) {
      const total = parseFloat(newVal);
      const pct = parseFloat(remainingPercentage);
      if (!isNaN(total) && !isNaN(pct)) {
        const remaining = (total * pct) / 100;
        const paid = total - remaining;
        setAmountPaid(paid.toFixed(2));
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileId) {
      alert("Por favor, selecione um perfil.");
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      profileId,
      type: activeTab,
      name,
      value: parseFloat(value),
      date,
      category,
      notes,
    };

    if (activeTab === 'INCOME') {
      transaction.isFixedIncome = isFixedIncome;
    } else {
      transaction.frequency = frequency;
      transaction.priority = priority;
      transaction.remainingPercentage = parseFloat(remainingPercentage);
      transaction.dueDate = dueDate;
      if (amountPaid) transaction.amountPaid = parseFloat(amountPaid);
      if (numberOfInstallments) transaction.numberOfInstallments = parseFloat(numberOfInstallments);
      if (installmentValue) transaction.installmentValue = parseFloat(installmentValue);
    }

    try {
      await SupabaseService.createTransaction(transaction);
      onSuccess();

      // Reset Form
      setName('');
      setValue('');
      setCategory('');
      setNotes('');
      setNumberOfInstallments('');
      setInstallmentValue('');
      setAmountPaid('');
      setRemainingPercentage('100');
      setDueDate('');
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Erro ao salvar lançamento. Tente novamente.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`flex-1 py-4 font-medium text-sm text-center transition-colors ${activeTab === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          Lançar Renda
        </button>
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 py-4 font-medium text-sm text-center transition-colors ${activeTab === 'EXPENSE' ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          Despesa
        </button>
        <button
          onClick={() => setActiveTab('DEBT')}
          className={`flex-1 py-4 font-medium text-sm text-center transition-colors ${activeTab === 'DEBT' ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          Dívida (Passivo)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perfil Responsável</label>
            <select
              required
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="" disabled>Selecione um perfil</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Descrição</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Salário, Aluguel, Empréstimo..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor {activeTab === 'INCOME' ? '(Mensal)' : '(Total)'}</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
              <input
                required
                type="number"
                step="0.01"
                value={value}
                onChange={handleValueChange}
                className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <input
              required
              list="categories"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Moradia, Vendas..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <datalist id="categories">
              <option value="Moradia" />
              <option value="Alimentação" />
              <option value="Transporte" />
              <option value="Salário" />
              <option value="Dividendos" />
              <option value="Saúde" />
              <option value="Lazer" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Registro</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Specific Income Fields */}
        {activeTab === 'INCOME' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFixed"
              checked={isFixedIncome}
              onChange={(e) => setIsFixedIncome(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isFixed" className="text-sm text-slate-700">Renda Fixa Mensal (Recorrente)</label>
          </div>
        )}

        {/* Specific Expense/Debt Fields */}
        {(activeTab === 'EXPENSE' || activeTab === 'DEBT') && (
          <div className="bg-white p-4 rounded-lg space-y-4 border border-slate-200 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                <Calculator size={16} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Detalhes da Obrigação</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                >
                  <option value="FIXED">Fixa (Mensal)</option>
                  <option value="VARIABLE">Variável</option>
                  <option value="TEMPORARY">Temporária</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                >
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vencimento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Amount Paid and Progress Section */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valor Já Pago</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amountPaid}
                      onChange={handleAmountPaidChange}
                      placeholder="0,00"
                      className="w-full p-1.5 pl-7 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Restante a Pagar (%)</label>
                  <div className="flex items-center h-8">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={remainingPercentage}
                      onChange={handleSliderChange}
                      className="w-full mr-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-sm font-bold text-slate-700 w-12 text-right">{parseInt(remainingPercentage).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Qtde. Parcelas</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md"
                  placeholder="Ex: 12"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Valor da Parcela</label>
                <input
                  type="number"
                  step="0.01"
                  value={installmentValue}
                  onChange={(e) => setInstallmentValue(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-md bg-slate-50"
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Detalhes adicionais..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg text-white font-medium shadow-md transition-all transform hover:scale-105 ${activeTab === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' :
              activeTab === 'EXPENSE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <Check size={20} />
              Salvar Lançamento
            </div>
          </button>
        </div>

      </form>
    </div>
  );
};