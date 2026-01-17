
import React, { useState, useRef } from 'react';
import { Platform } from '../types';
import NumericKeypad from '../components/NumericKeypad';

interface AddEarningProps {
  onBack: () => void;
  onSave: (earnings: { platform: Platform, amount: number }[], date: string) => void;
}

const AddEarning: React.FC<AddEarningProps> = ({ onBack, onSave }) => {
  const [activeInput, setActiveInput] = useState<Platform>('Uber');
  const [uberAmount, setUberAmount] = useState('0');
  const [ninetynineAmount, setNinetynineAmount] = useState('0');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    const setter = activeInput === 'Uber' ? setUberAmount : setNinetynineAmount;
    setter(prev => {
      if (key === ',') {
        if (!prev.includes(',')) return prev + ',';
        return prev;
      }
      return prev === '0' ? key : prev + key;
    });
  };

  const handleDelete = () => {
    const setter = activeInput === 'Uber' ? setUberAmount : setNinetynineAmount;
    setter(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const parseAmount = (str: string) => parseFloat(str.replace(',', '.')) || 0;

  const total = parseAmount(uberAmount) + parseAmount(ninetynineAmount);

  const handleSave = () => {
    onSave([
      { platform: 'Uber', amount: parseAmount(uberAmount) },
      { platform: '99', amount: parseAmount(ninetynineAmount) }
    ], selectedDate);
  };

  const formatDateDisplay = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';

    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month) - 1]}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="flex items-center p-2">
        <button onClick={onBack} className="p-2 rounded-full active:bg-black/5">
          <span className="material-symbols-outlined text-black text-xl font-bold">chevron_left</span>
        </button>
        <h2 className="flex-1 text-center font-black text-base text-black mr-10">Registrar Ganhos</h2>
      </header>

      <div className="px-4 flex-1 space-y-4 pb-6">
        <div className="flex justify-between items-center py-2 bg-white/10 p-3 rounded-2xl border border-black/5">
          <span className="text-[10px] font-black text-black/60 uppercase tracking-wider">Data do Ganho</span>
          <div className="relative overflow-hidden">
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 z-10 cursor-pointer"
            />
            <button
              className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl active:bg-black/80 transition-colors"
            >
              <span className="text-xs font-bold text-brand">{formatDateDisplay(selectedDate)}</span>
              <span className="material-symbols-outlined text-brand text-lg">calendar_month</span>
            </button>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">PLATAFORMAS</h3>

          <div onClick={() => setActiveInput('Uber')} className="space-y-1 cursor-pointer">
            <div className={`bg-white p-4 rounded-[28px] border-2 transition-all flex items-center justify-between ${activeInput === 'Uber' ? 'border-black ring-4 ring-black/5 scale-[1.02]' : 'border-transparent opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-brand">payments</span>
                </div>
                <span className="text-sm font-black text-black">Uber</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-black/40 block">R$</span>
                <span className="text-2xl font-black text-black">{uberAmount}</span>
              </div>
            </div>
          </div>

          <div onClick={() => setActiveInput('99')} className="space-y-1 cursor-pointer">
            <div className={`bg-white p-4 rounded-[28px] border-2 transition-all flex items-center justify-between ${activeInput === '99' ? 'border-black ring-4 ring-black/5 scale-[1.02]' : 'border-transparent opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">payments</span>
                </div>
                <span className="text-sm font-black text-black">99</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-black/40 block">R$</span>
                <span className="text-2xl font-black text-black">{ninetynineAmount}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 p-5 bg-black rounded-[32px] flex justify-between items-center shadow-lg">
          <span className="text-xs font-bold text-brand/60 uppercase">Total do dia</span>
          <p className="text-2xl font-black text-emerald-400">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="p-4 bg-background-dark/95 backdrop-blur-md border-t border-black/5 space-y-4 sticky bottom-0 pb-10 sm:pb-4">
        <NumericKeypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
        <button
          onClick={handleSave}
          className="w-full bg-black h-14 rounded-2xl text-brand font-black uppercase text-sm tracking-widest active:scale-[0.98] transition-all shadow-xl"
        >
          Salvar Ganhos
        </button>
      </div>
    </div>
  );
};

export default AddEarning;
