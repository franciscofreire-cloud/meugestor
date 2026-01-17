
import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  userName?: string;
}

import ConfirmationModal from '../components/ConfirmationModal';

type FilterType = 'Dia' | 'Mês' | 'Ano' | 'Personalizado';

const Reports: React.FC<ReportsProps> = ({ transactions, userName }) => {
  const [filter, setFilter] = useState<FilterType>('Mês');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showShareModal, setShowShareModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter(t => {
      const tDate = new Date(t.date);

      if (filter === 'Dia') {
        return tDate.toDateString() === now.toDateString();
      }
      if (filter === 'Mês') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (filter === 'Ano') {
        return tDate.getFullYear() === now.getFullYear();
      }
      if (filter === 'Personalizado' && startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        return tDate >= start && tDate <= end;
      }
      return true;
    });
  }, [transactions, filter, startDate, endDate]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'EARNING') {
        acc.earnings += t.amount;
      } else {
        acc.expenses += t.amount;
      }
      return acc;
    }, { earnings: 0, expenses: 0 });
  }, [filteredTransactions]);

  const lucroLiquido = stats.earnings - stats.expenses;

  const mediaDiaria = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    const dates = filteredTransactions.map(t => new Date(t.date).toDateString());
    const uniqueDays = new Set(dates).size || 1;
    return lucroLiquido / uniqueDays;
  }, [filteredTransactions, lucroLiquido]);

  const chartData = [
    { name: 'Ganhos', value: stats.earnings || 1, color: '#10b981' }, // emerald-500
    { name: 'Despesas', value: stats.expenses || 0, color: '#ef4444' }, // red-500
  ];

  const formatCurrency = (val: number) => {
    return `R$ ${Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleShare = () => {
    const period = filter === 'Dia' ? 'Hoje' :
      filter === 'Mês' ? 'Mês Atual' :
        filter === 'Ano' ? 'Ano Atual' :
          `${formatDateLabel(startDate)} até ${formatDateLabel(endDate)}`;

    const message = `Olá, ${userName || 'Motorista'}! 🚗💨%0A%0A` +
      `Aqui está o resumo dos meus ganhos:%0A` +
      `📅 Período: *${period}*%0A%0A` +
      `💰 Ganhos Brutos: *${formatCurrency(stats.earnings)}*%0A` +
      `💸 Despesas: *${formatCurrency(stats.expenses)}*%0A` +
      `📈 Lucro Líquido: *${formatCurrency(lucroLiquido)}*%0A` +
      `🎯 Média Diária: *${formatCurrency(mediaDiaria)}*%0A%0A` +
      `Gerido com o *Meu Gestor*! 🚀`;

    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowShareModal(false);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '--/--';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  return (
    <div className="h-full overflow-y-auto pb-28 animate-in fade-in duration-500 bg-brand">
      {/* Header Estilizado */}
      <header className="flex items-center justify-between p-6 sticky top-0 bg-brand/80 backdrop-blur-md z-20 border-b border-black/5">
        <button className="size-10 flex items-center justify-center rounded-xl bg-black/5 active:bg-black/10 transition-colors">
          <span className="material-symbols-outlined text-black text-2xl">calendar_today</span>
        </button>
        <h1 className="text-xl font-black text-black tracking-tight">Relatórios</h1>
        <button
          onClick={() => setShowShareModal(true)}
          className="size-10 flex items-center justify-center rounded-xl bg-black/5 active:bg-black/10 transition-colors"
        >
          <span className="material-symbols-outlined text-black text-2xl font-light">share</span>
        </button>
      </header>

      <div className="px-6 space-y-6 mt-4">
        {/* Chips de Filtro */}
        <div className="bg-black/5 p-1.5 rounded-2xl flex gap-1 border border-black/5">
          {(['Dia', 'Mês', 'Ano', 'Personalizado'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 h-11 rounded-xl text-xs font-black transition-all duration-300 ${filter === f
                ? 'bg-black text-brand shadow-lg'
                : 'text-black/40 hover:text-black/60'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Seletores de Data (Aparecem apenas no Personalizado) */}
        {filter === 'Personalizado' && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="relative group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Data de início"
              />
              <div className="w-full bg-white border border-black/5 h-14 rounded-2xl px-4 flex items-center justify-between shadow-sm group-active:bg-black/5 transition-colors">
                <div className="text-left">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-tighter">DE</p>
                  <p className="text-sm font-black text-black">{formatDateLabel(startDate)}</p>
                </div>
                <span className="material-symbols-outlined text-black text-xl opacity-60">event_repeat</span>
              </div>
            </div>

            <div className="relative group">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Data de fim"
              />
              <div className="w-full bg-white border border-black/5 h-14 rounded-2xl px-4 flex items-center justify-between shadow-sm group-active:bg-black/5 transition-colors">
                <div className="text-left">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-tighter">ATÉ</p>
                  <p className="text-sm font-black text-black">{formatDateLabel(endDate)}</p>
                </div>
                <span className="material-symbols-outlined text-black text-xl opacity-60">event_available</span>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico Donut */}
        <div className="bg-white p-8 rounded-[40px] border border-black/5 relative shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-sm text-black">Ganhos vs. Despesas</h3>
            <span className="material-symbols-outlined text-black/20 text-xl cursor-help">info</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={12}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">TOTAL BRUTO</span>
              <span className="text-xl font-black text-emerald-600 whitespace-nowrap">{formatCurrency(stats.earnings)}</span>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Inferiores */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-[28px] border border-black/5 flex flex-col justify-center active:scale-95 transition-transform shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">LUCRO LÍQUIDO</p>
              <p className={`text-xl font-black leading-tight whitespace-nowrap ${lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(lucroLiquido)}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-black/5 flex flex-col justify-center active:scale-95 transition-transform shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">MÉDIA DIÁRIA</p>
              <p className={`text-xl font-black leading-tight whitespace-nowrap ${mediaDiaria >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(mediaDiaria)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showShareModal}
        title="Compartilhar"
        message="Deseja compartilhar o resumo dos seus ganhos via WhatsApp?"
        confirmLabel="Sim, Compartilhar"
        cancelLabel="Agora não"
        onConfirm={handleShare}
        onCancel={() => setShowShareModal(false)}
        icon="share"
      />
    </div>
  );
};

export default Reports;
