import React, { useState } from 'react';
import { Profile, ProfileType } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { User, Building2, Plus, CreditCard, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';

interface ProfileManagerProps {
  profiles: Profile[];
  onUpdate: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ profiles, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<{ name: string; type: ProfileType; bankAccount: string }>({
    name: '',
    type: 'PERSONAL',
    bankAccount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SupabaseService.createProfile(formData);
      onUpdate();
      setIsCreating(false);
      setFormData({ name: '', type: 'PERSONAL', bankAccount: '' });
    } catch (err) {
      console.error('Error creating profile:', err);
      alert('Erro ao criar perfil. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este perfil?')) {
      try {
        await SupabaseService.deleteProfile(id);
        onUpdate();
      } catch (err) {
        console.error('Error deleting profile:', err);
        alert('Erro ao excluir perfil. Tente novamente.');
      }
    }
  };

  const handleFactoryReset = async () => {
    const confirmText = prompt("Para confirmar a exclusão de TODOS os dados, digite 'DELETAR' abaixo:");
    if (confirmText === 'DELETAR') {
      try {
        // Delete all data from Supabase
        const [profiles, transactions, goals] = await Promise.all([
          SupabaseService.getProfiles(),
          SupabaseService.getTransactions(),
          SupabaseService.getGoals()
        ]);

        await Promise.all([
          ...profiles.map(p => SupabaseService.deleteProfile(p.id)),
          ...transactions.map(t => SupabaseService.deleteTransaction(t.id)),
          ...goals.map(g => SupabaseService.deleteGoal(g.id))
        ]);

        alert('O aplicativo foi resetado com sucesso.');
        window.location.reload();
      } catch (err) {
        console.error('Error resetting app:', err);
        alert('Erro ao resetar aplicativo.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Perfis</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Novo Perfil
        </button>
      </div>

      {/* Create Profile Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Perfil</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Ex: João Pessoa Física"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Perfil</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as ProfileType })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="PERSONAL">Pessoal</option>
                  <option value="BUSINESS">Empresa (PJ)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Conta Bancária Principal</label>
              <input
                required
                type="text"
                value={formData.bankAccount}
                onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Banco Inter - Ag 0001 CC 12345-6"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Criar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <div key={profile.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
            <button
              onClick={() => handleDelete(profile.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Excluir Perfil"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-full ${profile.type === 'BUSINESS' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {profile.type === 'BUSINESS' ? <Building2 size={24} /> : <User size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{profile.name}</h3>
                <span className="text-xs uppercase tracking-wide font-semibold text-slate-500">
                  {profile.type === 'BUSINESS' ? 'Empresa' : 'Pessoal'}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard size={16} />
                <span className="text-sm font-medium">{profile.bankAccount}</span>
              </div>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            Nenhum perfil cadastrado. Crie um perfil para começar.
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <AlertTriangle className="text-amber-500" />
          Zona de Perigo
        </h3>
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-red-800">Resetar Aplicação</h4>
            <p className="text-sm text-red-600 mt-1">
              Isso apagará todas as transações, perfis e metas. Use isso para limpar os dados de demonstração e começar do zero.
              <br />
              <strong>Ação irreversível.</strong>
            </p>
          </div>
          <button
            onClick={handleFactoryReset}
            className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <RotateCcw size={18} />
            Apagar Tudo e Iniciar
          </button>
        </div>
      </div>
    </div>
  );
};