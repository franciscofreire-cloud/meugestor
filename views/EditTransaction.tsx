
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Transaction, Platform, ExpenseCategory } from '../types';
import NumericKeypad from '../components/NumericKeypad';
import { EXPENSE_CATEGORIES } from '../constants';

interface EditTransactionProps {
  transaction: Transaction;
  allTransactions: Transaction[];
  onBack: () => void;
  onSave: (updated: Transaction | Transaction[]) => void;
  onDelete: (id: string | string[]) => void;
}

const EditTransaction: React.FC<EditTransactionProps> = ({ transaction, allTransactions, onBack, onSave, onDelete }) => {
  // Para ganhos, precisamos encontrar os "irmãos" da mesma data
  const siblingEarnings = useMemo(() => {
    if (transaction.type !== 'EARNING') return [];
    const dayKey = transaction.date.split('T')[0];
    return allTransactions.filter(t => t.type === 'EARNING' && t.date.startsWith(dayKey));
  }, [transaction, allTransactions]);

  const initialUber = siblingEarnings.find(t => t.platform === 'Uber')?.amount || 0;
  const initial99 = siblingEarnings.find(t => t.platform === '99')?.amount || 0;

  const [uberAmount, setUberAmount] = useState(initialUber.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('R$', '').trim());
  const [ninetynineAmount, setNinetynineAmount] = useState(initial99.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('R$', '').trim());
  
  const [expenseAmount, setExpenseAmount] = useState(transaction.type === 'EXPENSE' ? transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).replace('R$', '').trim() : '0');
  const [litersString, setLitersString] = useState(transaction.liters?.toString().replace('.', ',') || '');
  const [category, setCategory] = useState<ExpenseCategory>(transaction.category || 'Combustível');

  const [activePlatform, setActivePlatform] = useState<Platform>(transaction.platform || 'Uber');
  const [selectedDate, setSelectedDate] = useState(transaction.date.split('T')[0]);
  const [focusField, setFocusField] = useState<'amount' | 'liters'>( 'amount');
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    if (transaction.type === 'EARNING') {
      const setter = activePlatform === 'Uber' ? setUberAmount : setNinetynineAmount;
      setter(prev => {
        if (key === ',') return prev.includes(',') ? prev : prev + ',';
        return prev === '0' ? key : prev + key;
      });
    } else {
      const setter = focusField === 'amount' ? setExpenseAmount : setLitersString;
      setter(prev => {
        if (key === ',') return prev.includes(',') ? prev : prev + ',';
        return prev === '0' ? key : prev + key;
      });
    }
  };

  const handleDeleteKey = () => {
    if (transaction.type === 'EARNING') {
      const setter = activePlatform === 'Uber' ? setUberAmount : setNinetynineAmount;
      setter(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      const setter = focusField === 'amount' ? setExpenseAmount : setLitersString;
      setter(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  const parseValue = (val: string) => parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;

  const totalGanhos = useMemo(() => {
    return parseValue(uberAmount) + parseValue(ninetynineAmount);
  }, [uberAmount, ninetynineAmount]);

  const handleSave = () => {
    if (transaction.type === 'EARNING') {
      const results: Transaction[] = [];
      const uAmount = parseValue(uberAmount);
      const nAmount = parseValue(ninetynineAmount);

      // Criar/Atualizar Uber
      results.push({
        id: siblingEarnings.find(t => t.platform === 'Uber')?.id || Math.random().toString(36).substr(2, 9),
        type: 'EARNING',
        platform: 'Uber',
        amount: uAmount,
        date: selectedDate + 'T12:00:00Z'
      });

      // Criar/Atualizar 99
      results.push({
        id: siblingEarnings.find(t => t.platform === '99')?.id || Math.random().toString(36).substr(2, 9),
        type: 'EARNING',
        platform: '99',
        amount: nAmount,
        date: selectedDate + 'T12:00:00Z'
      });

      onSave(results);
    } else {
      onSave({
        ...transaction,
        amount: parseValue(expenseAmount),
        category,
        liters: litersString ? parseValue(litersString) : undefined,
        date: selectedDate + 'T12:00:00Z',
      });
    }
  };

  const handleDelete = () => {
    if (transaction.type === 'EARNING') {
      onDelete(siblingEarnings.map(t => t.id));
    } else {
      onDelete(transaction.id);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month) - 1]}`;
  };

  return (
    <div className="flex flex-col h-screen bg-brand animate-in slide-in-from-bottom duration-300 overflow-hidden">
      <header className="flex items-center p-2">
        <button onClick={onBack} className="p-2 rounded-full active:bg-black/5">
          <span className="material-symbols-outlined text-black text-xl">close</span>
        </button>
        <h2 className="flex-1 text-center font-black text-base">Editar {transaction.type === 'EARNING' ? 'Ganhos' : 'Despesa'}</h2>
        <button onClick={handleDelete} className="p-2 text-red-600 active:bg-red-50 rounded-full">
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </header>

      <div className="px-5 py-2 space-y-6 flex-1 overflow-y-auto">
        <section className="flex justify-between items-center bg-white p-3 rounded-2xl border border-black/5">
          <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Data</span>
          <div className="relative overflow-hidden">
            <input 
              type="date" 
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 z-10 cursor-pointer"
            />
            <button className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl active:bg-black/80 transition-colors">
              <span className="text-xs font-bold text-brand">{formatDateDisplay(selectedDate)}</span>
              <span className="material-symbols-outlined text-brand text-lg">calendar_month</span>
            </button>
          </div>
        </section>

        {transaction.type === 'EARNING' ? (
          <div className="space-y-4">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Plataformas</span>
            
            <button 
              onClick={() => setActivePlatform('Uber')}
              className={`w-full bg-white p-5 rounded-[32px] border-2 transition-all flex items-center justify-between ${activePlatform === 'Uber' ? 'border-black ring-4 ring-black/5 scale-[1.02]' : 'border-transparent opacity-60'}`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand">payments</span>
                </div>
                <span className="text-sm font-black text-black">Uber</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 block">R$</span>
                <span className="text-2xl font-black text-emerald-600">{uberAmount}</span>
              </div>
            </button>

            <button 
              onClick={() => setActivePlatform('99')}
              className={`w-full bg-white p-5 rounded-[32px] border-2 transition-all flex items-center justify-between ${activePlatform === '99' ? 'border-black ring-4 ring-black/5 scale-[1.02]' : 'border-transparent opacity-60'}`}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">payments</span>
                </div>
                <span className="text-sm font-black text-black">99</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 block">R$</span>
                <span className="text-2xl font-black text-emerald-600">{ninetynineAmount}</span>
              </div>
            </button>

            <div className="mt-4 p-5 bg-black rounded-[32px] flex justify-between items-center shadow-lg">
              <span className="text-xs font-bold text-brand/60 uppercase">Total do Dia</span>
              <p className="text-2xl font-black text-emerald-400">
                R$ {totalGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="flex flex-col items-center justify-center py-4 bg-white rounded-[40px] border border-black/5 shadow-sm">
              <p className="text-[10px] font-black text-black/30 mb-1 uppercase tracking-widest">Valor da Despesa</p>
              <button 
                onClick={() => setFocusField('amount')}
                className={`text-5xl font-black tracking-tighter transition-all ${
                  focusField === 'amount' ? 'text-red-600 scale-105' : 'text-black/30'
                }`}
              >
                <span className="text-xl font-bold mr-1 opacity-60">R$</span>
                {expenseAmount}
              </button>
            </section>

            <section>
              <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block ml-1">Categoria</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-14 bg-white border border-black/5 rounded-2xl px-5 text-sm font-black text-black appearance-none focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.label} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/20 pointer-events-none text-2xl">expand_more</span>
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block ml-1">Litros (Opcional)</label>
              <button 
                onClick={() => setFocusField('liters')}
                className={`w-full h-14 bg-white border rounded-2xl px-5 flex items-center justify-between transition-all ${
                  focusField === 'liters' ? 'border-black ring-2 ring-black/5 shadow-sm' : 'border-black/5 opacity-60'
                }`}
              >
                <span className="text-sm font-black">{litersString || '0,00'}</span>
                <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">L</span>
              </button>
            </section>
          </div>
        )}
      </div>

      <div className="p-4 bg-brand/95 backdrop-blur-md border-t border-black/5 space-y-4">
        <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDeleteKey} />
        <button 
          onClick={handleSave}
          className="w-full bg-black h-14 rounded-2xl text-brand font-black uppercase text-sm tracking-widest active:scale-[0.98] transition-all shadow-xl"
        >
          Confirmar Alterações
        </button>
      </div>
    </div>
  );
};

export default EditTransaction;
