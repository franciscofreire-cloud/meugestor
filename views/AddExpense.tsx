
import React, { useState, useRef } from 'react';
import { ExpenseCategory } from '../types';
import NumericKeypad from '../components/NumericKeypad';
import { EXPENSE_CATEGORIES } from '../constants';

interface AddExpenseProps {
  onBack: () => void;
  onSave: (amount: number, category: ExpenseCategory, liters: number | undefined, date: string) => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onBack, onSave }) => {
  const [category, setCategory] = useState<ExpenseCategory>('Combustível');
  const [amountString, setAmountString] = useState('0');
  const [litersString, setLitersString] = useState('');
  const [focusField, setFocusField] = useState<'amount' | 'liters'>('amount');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    const setter = focusField === 'amount' ? setAmountString : setLitersString;
    setter(prev => {
      if (key === ',') {
        if (!prev.includes(',')) return prev + ',';
        return prev;
      }
      return prev === '0' ? key : prev + key;
    });
  };

  const handleDelete = () => {
    const setter = focusField === 'amount' ? setAmountString : setLitersString;
    setter(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amountString.replace(',', '.'));
    const numericLiters = litersString ? parseFloat(litersString.replace(',', '.')) : undefined;
    if (numericAmount > 0) {
      onSave(numericAmount, category, numericLiters, selectedDate);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="flex items-center p-2">
        <button onClick={onBack} className="p-2 rounded-full active:bg-black/5">
          <span className="material-symbols-outlined text-black text-xl">chevron_left</span>
        </button>
        <h2 className="flex-1 text-center font-black text-base text-black mr-10">Registrar Despesa</h2>
      </header>

      <div className="px-5 py-2 space-y-6 flex-1 pb-6">
        <section className="flex flex-col items-center justify-center py-4 bg-white rounded-[40px] border border-black/5 shadow-sm">
          <p className="text-[10px] font-black text-black/30 mb-1 uppercase tracking-widest">Valor da Despesa</p>
          <button
            onClick={() => setFocusField('amount')}
            className={`text-5xl font-black tracking-tighter transition-all ${focusField === 'amount' ? 'text-red-600 scale-105' : 'text-black/20'
              }`}
          >
            <span className="text-xl font-bold mr-1 opacity-60">R$</span>
            {amountString}
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
                <option key={cat.label} value={cat.label} className="text-black">{cat.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-black/20 pointer-events-none text-2xl">expand_more</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block ml-1">Data</label>
            <div className="relative overflow-hidden">
              <input
                type="date"
                ref={dateInputRef}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
              />
              <button
                className="w-full h-14 bg-white border border-black/5 rounded-2xl px-4 flex items-center justify-between active:bg-black/5 transition-colors"
              >
                <span className="text-xs font-black text-black">{formatDateDisplay(selectedDate)}</span>
                <span className="material-symbols-outlined text-black/20 text-xl">calendar_month</span>
              </button>
            </div>
          </section>
          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block ml-1">Litros</label>
            <button
              onClick={() => setFocusField('liters')}
              className={`w-full h-14 bg-white border rounded-2xl px-4 flex items-center justify-between transition-all ${focusField === 'liters' ? 'border-black ring-2 ring-black/5' : 'border-black/5 opacity-60'
                }`}
            >
              <span className={`text-sm font-black ${litersString ? 'text-black' : 'text-black/20'}`}>
                {litersString || '0,00'}
              </span>
              <span className="text-[10px] font-black text-black/30">L</span>
            </button>
          </section>
        </div>
      </div>

      <div className="p-4 bg-background-dark/95 backdrop-blur-md border-t border-black/5 space-y-4 sticky bottom-0 pb-10 sm:pb-4">
        <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
        <button
          onClick={handleSave}
          className="w-full bg-black h-14 rounded-2xl text-brand font-black uppercase text-sm tracking-widest active:scale-[0.98] transition-all shadow-xl"
        >
          Salvar Despesa
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
