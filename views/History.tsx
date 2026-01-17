
import React from 'react';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface HistoryProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

const History: React.FC<HistoryProps> = ({ transactions, onEdit }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Agrupar ganhos por dia, mas manter despesas separadas
  const groupedItems = transactions.reduce((acc, t) => {
    if (t.type === 'EARNING') {
      const dayKey = t.date.split('T')[0];
      const existing = acc.find(item => item.type === 'GROUPED_EARNING' && item.date.startsWith(dayKey));
      
      if (existing) {
        existing.transactions.push(t);
        existing.total += t.amount;
      } else {
        acc.push({
          id: `group-${dayKey}`,
          type: 'GROUPED_EARNING',
          date: t.date,
          total: t.amount,
          transactions: [t]
        });
      }
    } else {
      acc.push({ ...t, type: 'SINGLE_EXPENSE' });
    }
    return acc;
  }, [] as any[]);

  return (
    <div className="h-full overflow-y-auto pb-24 animate-in fade-in duration-500 bg-brand">
      <header className="flex items-center justify-between p-4 sticky top-0 bg-brand/90 backdrop-blur-md z-20 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center bg-black rounded-lg">
            <span className="material-symbols-outlined text-brand fill-icon">history</span>
          </div>
          <h1 className="text-lg font-black text-black">Histórico</h1>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {groupedItems.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-black/10 mb-4">inventory_2</span>
            <p className="text-black/40 font-black uppercase tracking-widest text-xs">Vazio</p>
          </div>
        ) : (
          groupedItems.map((item) => {
            if (item.type === 'GROUPED_EARNING') {
              const hasUber = item.transactions.some((t: any) => t.platform === 'Uber');
              const has99 = item.transactions.some((t: any) => t.platform === '99');
              
              return (
                <button
                  key={item.id}
                  onClick={() => onEdit(item.transactions[0])}
                  className="w-full bg-white p-4 rounded-3xl border border-black/5 flex flex-col gap-3 active:scale-[0.98] transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl">payments</span>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm text-black">Ganhos do Dia</p>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                          {formatDate(item.date)} • {formatTime(item.date)}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-lg text-emerald-600">
                      + {formatCurrency(item.total)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-black/5">
                    {hasUber && (
                       <div className="bg-black/[0.03] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-black"></div>
                          <span className="text-[10px] font-black text-black/60 uppercase">Uber</span>
                       </div>
                    )}
                    {has99 && (
                       <div className="bg-black/[0.03] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-amber-500"></div>
                          <span className="text-[10px] font-black text-black/60 uppercase">99</span>
                       </div>
                    )}
                  </div>
                </button>
              );
            } else {
              const cat = EXPENSE_CATEGORIES.find(c => c.label === item.category);
              return (
                <button
                  key={item.id}
                  onClick={() => onEdit(item)}
                  className="w-full bg-white p-4 rounded-3xl border border-black/5 flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-red-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-600 text-2xl">{cat?.icon || 'receipt'}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-black">{item.category}</p>
                      <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                        {formatDate(item.date)} • {formatTime(item.date)}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-lg text-red-600">
                    - {formatCurrency(item.amount)}
                  </p>
                </button>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default History;
