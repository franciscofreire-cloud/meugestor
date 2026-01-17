
import React from 'react';
import { Transaction, DailySummary } from '../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'EARNING') {
      acc.earnings += t.amount;
      if (t.platform === 'Uber') acc.uberEarnings += t.amount;
      if (t.platform === '99') acc.ninetynineEarnings += t.amount;
    } else {
      acc.expenses += t.amount;
    }
    acc.profit = acc.earnings - acc.expenses;
    return acc;
  }, { earnings: 0, expenses: 0, profit: 0, uberEarnings: 0, ninetynineEarnings: 0 } as DailySummary);

  const chartData = [
    { name: 'Uber', value: summary.uberEarnings },
    { name: '99', value: summary.ninetynineEarnings },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 animate-in fade-in duration-500 scroll-smooth bg-brand">
      <div className="flex items-center justify-between p-4 sticky top-0 bg-brand/90 backdrop-blur-md z-20 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center bg-black rounded-lg">
            <span className="material-symbols-outlined text-brand fill-icon">dashboard</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-black">Painel Principal</h1>
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
          </div>
        </div>
        <button className="size-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/10">
          <span className="material-symbols-outlined text-black text-2xl">account_circle</span>
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600 text-sm">payments</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Ganhos</span>
          </div>
          <p className="text-lg font-black text-emerald-600 whitespace-nowrap">{formatCurrency(summary.earnings)}</p>
          <div className="flex items-center gap-1 mt-1 text-emerald-600 text-[10px] font-black">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> +12%
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-red-600 text-sm">local_gas_station</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50">Despesas</span>
          </div>
          <p className="text-lg font-black text-red-600 whitespace-nowrap">{formatCurrency(summary.expenses)}</p>
          <div className="flex items-center gap-1 mt-1 text-red-600 text-[10px] font-black">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> +5%
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-black border border-black/20 p-5 rounded-2xl flex justify-between items-center shadow-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand mb-1">Lucro Líquido</p>
            <p className={`text-2xl font-black whitespace-nowrap ${summary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(summary.profit)}
            </p>
          </div>
          <div className="bg-brand p-3 rounded-xl">
            <span className="material-symbols-outlined text-black font-black text-3xl">account_balance_wallet</span>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3 mb-8">
        <button
          onClick={() => onNavigate('add-earning')}
          className="flex items-center justify-center gap-2 bg-black h-14 rounded-2xl text-brand font-black uppercase text-sm tracking-widest shadow-lg active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined font-black">add_circle</span> Adicionar Ganho
        </button>
        <button
          onClick={() => onNavigate('add-expense')}
          className="flex items-center justify-center gap-2 bg-white h-14 rounded-2xl text-black font-black uppercase text-sm tracking-widest shadow-sm active:scale-95 transition-all border border-black/5"
        >
          <span className="material-symbols-outlined font-black">remove_circle</span> Adicionar Despesa
        </button>
      </div>

      <div className="px-4 mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-black/50 mb-4 ml-1">Uber vs 99 (Semana)</h3>
        <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-sm">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#000000', fontSize: 12, fontWeight: 900 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#000000' : '#00000040'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
