
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Platform, ExpenseCategory, UserProfile, CustomGoal } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './views/Dashboard';
import AddEarning from './views/AddEarning';
import AddExpense from './views/AddExpense';
import History from './views/History';
import EditTransaction from './views/EditTransaction';
import Reports from './views/Reports';
import Login from './views/Login';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import Toast, { ToastType } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [settingsSubView, setSettingsSubView] = useState<'menu' | 'profile' | 'goals' | 'new-goal'>('menu');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalValue, setNewGoalValue] = useState('');

  const notify = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    photo: '',
    dailyGoal: 0,
    customGoals: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setTransactions([]);
      setUserProfile({
        name: '',
        email: '',
        phone: '',
        photo: '',
        dailyGoal: 0,
        customGoals: []
      });
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch transactions
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!transError && transData) {
      setTransactions(transData as Transaction[]);
    }

    // Fetch profile
    const { data: profData, error: profError } = await supabase
      .from('profiles')
      .select('*, custom_goals(*)')
      .eq('id', user.id)
      .single();

    if (!profError && profData) {
      setUserProfile({
        name: profData.name || '',
        email: profData.email || user.email || '',
        phone: profData.phone || '',
        photo: profData.photo || '',
        dailyGoal: profData.daily_goal || 0,
        customGoals: profData.custom_goals || []
      });
    }
  };

  const handleLogin = () => {
    // Session is handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('dashboard');
    setSettingsSubView('menu');
  };

  const saveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        photo: userProfile.photo,
        daily_goal: userProfile.dailyGoal,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      notify('Erro ao salvar perfil: ' + error.message, 'error');
    } else {
      notify('Perfil salvo com sucesso!', 'success');
      setSettingsSubView('menu');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notify('A foto é muito grande! Tente uma imagem com menos de 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setUserProfile(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...t,
        user_id: user.id,
        date: t.date || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      notify('Erro ao adicionar transação: ' + error.message, 'error');
    } else if (data) {
      notify('Transação adicionada!', 'success');
      setTransactions(prev => [data as Transaction, ...prev]);
    }
  };

  const updateTransaction = async (updated: Transaction | Transaction[]) => {
    if (!user) return;

    const updates = Array.isArray(updated) ? updated : [updated];

    for (const u of updates) {
      const { error } = await supabase
        .from('transactions')
        .upsert({
          ...u,
          user_id: user.id,
          date: u.date || new Date().toISOString()
        })
        .eq('id', u.id);

      if (error) {
        notify('Erro ao atualizar transação: ' + error.message, 'error');
        return;
      }
    }
    notify('Transação atualizada!', 'success');

    // Refresh data
    fetchData();
    setEditingTransaction(null);
    setCurrentView('history');
  };

  const deleteTransaction = async (idOrIds: string | string[]) => {
    if (!user) return;
    const idsToDelete = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    const { error } = await supabase
      .from('transactions')
      .delete()
      .in('id', idsToDelete);

    if (error) {
      notify('Erro ao excluir transação: ' + error.message, 'error');
    } else {
      notify('Transação excluída!', 'success');
      setTransactions(prev => prev.filter(t => !idsToDelete.includes(t.id)));
      setEditingTransaction(null);
      setCurrentView('history');
    }
  };

  const handleEditRequest = (t: Transaction) => {
    setEditingTransaction(t);
    setCurrentView('edit');
  };

  const createCustomGoal = async () => {
    if (!user) return;
    if (!newGoalName || !newGoalValue) {
      notify("Preencha o nome e o valor da meta.", "info");
      return;
    }

    const { data, error } = await supabase
      .from('custom_goals')
      .insert([{
        user_id: user.id,
        name: newGoalName,
        target_value: parseFloat(newGoalValue.replace(',', '.'))
      }])
      .select()
      .single();

    if (error) {
      notify('Erro ao criar meta: ' + error.message, 'error');
    } else if (data) {
      notify('Nova meta criada!', 'success');
      setUserProfile(prev => ({
        ...prev,
        customGoals: [...(prev.customGoals || []), data as CustomGoal]
      }));
      setNewGoalName('');
      setNewGoalValue('');
      setSettingsSubView('menu');
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('custom_goals')
      .delete()
      .eq('id', id);

    if (error) {
      notify('Erro ao excluir meta: ' + error.message, 'error');
    } else {
      notify('Meta excluída!', 'success');
      setUserProfile(prev => ({
        ...prev,
        customGoals: prev.customGoals?.filter(g => g.id !== id) || []
      }));
    }
  };

  const renderView = () => {
    if (loading) return <div className="flex h-screen items-center justify-center bg-brand text-black font-black">Carregando...</div>;
    if (!user) return <Login onLogin={handleLogin} notify={notify} />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
      case 'add-earning':
        return (
          <AddEarning
            onBack={() => setCurrentView('dashboard')}
            onSave={(earnings, date) => {
              earnings.forEach(e => {
                if (e.amount > 0) {
                  addTransaction({ type: 'EARNING', amount: e.amount, platform: e.platform, date: date + 'T12:00:00Z' });
                }
              });
              setCurrentView('dashboard');
            }}
          />
        );
      case 'add-expense':
        return (
          <AddExpense
            onBack={() => setCurrentView('dashboard')}
            onSave={(amount, category, liters, date) => {
              addTransaction({ type: 'EXPENSE', amount, category, liters, date: date + 'T12:00:00Z' });
              setCurrentView('dashboard');
            }}
          />
        );
      case 'history':
        return <History transactions={transactions} onEdit={handleEditRequest} />;
      case 'reports':
        return <Reports transactions={transactions} userName={userProfile.name} />;
      case 'edit':
        return editingTransaction ? (
          <EditTransaction
            transaction={editingTransaction}
            allTransactions={transactions}
            onBack={() => setCurrentView('history')}
            onSave={updateTransaction}
            onDelete={deleteTransaction}
          />
        ) : null;
      case 'settings':
        return (
          <div className="flex flex-col h-full bg-brand overflow-y-auto pb-28 animate-in fade-in duration-500">
            <header className="p-6 sticky top-0 bg-brand/90 backdrop-blur-md z-20 flex items-center justify-between border-b border-black/5">
              <div className="flex items-center gap-3">
                {settingsSubView !== 'menu' && (
                  <button onClick={() => setSettingsSubView(settingsSubView === 'new-goal' ? 'goals' : 'menu')} className="p-1 -ml-2 rounded-full active:bg-black/10 transition-colors">
                    <span className="material-symbols-outlined text-black text-2xl">arrow_back</span>
                  </button>
                )}
                <h1 className="text-xl font-black text-black">Ajustes</h1>
              </div>
            </header>

            <div className="px-6 py-6">
              {settingsSubView === 'menu' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <button onClick={() => setSettingsSubView('profile')} className="w-full bg-white p-5 rounded-[32px] border border-black/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-brand text-3xl">person</span>
                      </div>
                      <div className="text-left"><p className="font-black text-black text-lg">Perfil</p><p className="text-[10px] font-black text-black/40 uppercase">Meus dados pessoais</p></div>
                    </div>
                    <span className="material-symbols-outlined text-black/20">chevron_right</span>
                  </button>
                  <button onClick={() => setSettingsSubView('goals')} className="w-full bg-white p-5 rounded-[32px] border border-black/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-brand text-3xl">flag</span>
                      </div>
                      <div className="text-left"><p className="font-black text-black text-lg">Metas</p><p className="text-[10px] font-black text-black/40 uppercase">Acompanhar objetivos</p></div>
                    </div>
                    <span className="material-symbols-outlined text-black/20">chevron_right</span>
                  </button>
                  <button onClick={handleLogout} className="w-full bg-white p-5 rounded-[32px] border border-black/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl">logout</span>
                      </div>
                      <div className="text-left"><p className="font-black text-red-600 text-lg">Sair</p><p className="text-[10px] font-black text-red-600/40 uppercase">Encerrar sessão</p></div>
                    </div>
                    <span className="material-symbols-outlined text-red-600/20">chevron_right</span>
                  </button>
                </div>
              )}

              {settingsSubView === 'profile' && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      <div className="size-32 rounded-full bg-white border-4 border-black shadow-xl overflow-hidden flex items-center justify-center">
                        {userProfile.photo ? (<img src={userProfile.photo} alt="Avatar" className="w-full h-full object-cover" />) : (<span className="material-symbols-outlined text-6xl text-black/20">person</span>)}
                      </div>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 size-10 bg-black text-brand rounded-full flex items-center justify-center border-4 border-brand shadow-lg active:scale-90">
                        <span className="material-symbols-outlined text-xl">photo_camera</span>
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </div>
                  </div>
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="bg-white p-5 rounded-[32px] border border-black/5 shadow-sm space-y-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Nome Completo</label><input type="text" value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} className="w-full h-12 bg-black/5 border-none rounded-xl px-4 text-sm font-bold text-black" placeholder="Seu nome" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">E-mail</label><input type="email" value={userProfile.email} onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} className="w-full h-12 bg-black/5 border-none rounded-xl px-4 text-sm font-bold text-black" placeholder="exemplo@email.com" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Telefone</label><input type="tel" value={userProfile.phone} onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })} className="w-full h-12 bg-black/5 border-none rounded-xl px-4 text-sm font-bold text-black" placeholder="(00) 00000-0000" /></div>
                    </div>
                    <button type="submit" className="w-full h-14 bg-black text-brand font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Salvar Perfil</button>
                  </form>
                </div>
              )}

              {settingsSubView === 'goals' && (
                <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                  <div className="bg-black p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="relative z-10"><span className="text-[10px] font-black text-brand/60 uppercase tracking-widest block mb-2">Sua meta diária atual</span><h2 className="text-5xl font-black text-brand tracking-tighter">R$ {userProfile.dailyGoal?.toLocaleString('pt-BR')}</h2></div>
                    <span className="material-symbols-outlined text-[120px] absolute -right-4 -bottom-4 text-white/5 font-light pointer-events-none">trending_up</span>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Definir Nova Meta Diária (R$)</label>
                      <input
                        type="number"
                        value={userProfile.dailyGoal || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, dailyGoal: parseFloat(e.target.value) || 0 })}
                        className="w-full h-14 bg-black/5 border-none rounded-xl px-4 text-xl font-black text-black"
                        placeholder="Ex: 300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    className="w-full h-14 bg-black text-brand font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
                  >
                    Atualizar Meta
                  </button>

                  <div className="flex justify-between items-center px-1 mt-8">
                    <h3 className="text-sm font-black text-black uppercase tracking-widest">Metas Personalizadas</h3>
                    <button onClick={() => setSettingsSubView('new-goal')} className="size-10 bg-black text-brand rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"><span className="material-symbols-outlined">add</span></button>
                  </div>

                  <div className="space-y-3">
                    {userProfile.customGoals?.length === 0 ? (
                      <div className="bg-white/40 border-2 border-dashed border-black/10 rounded-[32px] p-10 text-center">
                        <p className="text-black/30 font-black text-[10px] uppercase tracking-widest">Nenhuma meta criada</p>
                      </div>
                    ) : (
                      userProfile.customGoals?.map((goal) => (
                        <div key={goal.id} className="bg-white p-5 rounded-[32px] border border-black/5 shadow-sm flex items-center justify-between group">
                          <div className="flex-1">
                            <p className="font-black text-black text-lg">{goal.name}</p>
                            <p className="text-emerald-600 font-black text-xs">R$ {goal.targetValue.toLocaleString('pt-BR')}</p>
                          </div>
                          <button onClick={() => deleteGoal(goal.id)} className="size-10 text-red-600 bg-red-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xl">delete</span></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {settingsSubView === 'new-goal' && (
                <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                  <div className="text-center mb-8">
                    <div className="size-20 bg-black rounded-[28px] flex items-center justify-center mx-auto mb-4 shadow-xl"><span className="material-symbols-outlined text-brand text-4xl">flag</span></div>
                    <h2 className="text-2xl font-black text-black">Criar Nova Meta</h2>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Nome da Meta</label>
                      <input type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} className="w-full h-14 bg-black/5 border-none rounded-xl px-4 font-bold text-black" placeholder="Ex: Viagem de Fim de Ano" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Valor do Objetivo (R$)</label>
                      <input type="text" value={newGoalValue} onChange={(e) => setNewGoalValue(e.target.value)} className="w-full h-14 bg-black/5 border-none rounded-xl px-4 font-black text-black text-xl" placeholder="Ex: 5000,00" />
                    </div>
                  </div>

                  <button onClick={createCustomGoal} className="w-full h-14 bg-black text-brand font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Salvar Meta</button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
    }
  };

  const showNav = user && ['dashboard', 'history', 'reports', 'settings'].includes(currentView);

  return (
    <div className="relative max-w-[430px] mx-auto h-screen bg-brand shadow-2xl overflow-hidden border-x border-black/5">
      {renderView()}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-brand/95 backdrop-blur-xl border-t border-black/10 px-8 flex justify-between items-center z-20">
          {[
            { id: 'dashboard', label: 'Início', icon: 'home' },
            { id: 'history', label: 'Histórico', icon: 'history' },
            { id: 'reports', label: 'Relatórios', icon: 'analytics' },
            { id: 'settings', label: 'Ajustes', icon: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                if (item.id === 'settings') setSettingsSubView('menu');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${(currentView === item.id) ? 'text-black scale-110' : 'text-black/40'
                }`}
            >
              <span className={`material-symbols-outlined ${(currentView === item.id) ? 'fill-icon' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
