
import React, { useState } from 'react';
import { User, TimeRecord, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateDuration, calculateTotals, exportToExcel, exportToPDF, formatCurrency } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileDown, FileSpreadsheet, TrendingUp, DollarSign, Wallet, Banknote, Landmark, ChevronLeft, ChevronRight, Calendar, CalendarCheck } from 'lucide-react';

interface Props {
  user: User;
  records: TimeRecord[];
  lang: SupportedLanguage;
}

const Reports: React.FC<Props> = ({ user, records, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const t = TRANSLATIONS[lang];

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const selectedMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRecords = records.filter(r => r.date.startsWith(selectedMonthStr));
  const totals = calculateTotals(monthlyRecords, user);
  const totalDaysWorked = monthlyRecords.filter(r => !r.isAbsent && calculateDuration(r.startTime, r.endTime, r.lunchDuration) > 0).length;

  const chartData = [...monthlyRecords]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      date: r.date.split('-')[2],
      hours: r.isAbsent ? 0 : calculateDuration(r.startTime, r.endTime, r.lunchDuration)
    }));

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-fade-in">
      
      {/* Date Picker Mobile Friendly */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <button onClick={handlePrevMonth} className="p-3 bg-gray-50 rounded-xl text-gray-600"><ChevronLeft size={20} /></button>
          <div className="text-center">
             <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight capitalize">
               {currentDate.toLocaleString(lang, { month: 'long', year: 'numeric' })}
             </h2>
             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{monthlyRecords.length} registos</span>
          </div>
          <button onClick={handleNextMonth} className="p-3 bg-gray-50 rounded-xl text-gray-600"><ChevronRight size={20} /></button>
      </div>

      {/* Stats Cards - Optimized Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg w-fit"><CalendarCheck size={18} /></div>
          <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{t.totalDays}</p><p className="text-lg font-bold text-gray-900">{totalDaysWorked}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit"><TrendingUp size={18} /></div>
          <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{t.totalHours}</p><p className="text-lg font-bold text-gray-900">{totals.totalHours.toFixed(1)}h</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
           <div className="p-2 bg-green-50 text-green-600 rounded-lg w-fit"><DollarSign size={18} /></div>
           <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Bruto</p><p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(totals.grossEarnings, user.currency)}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit"><Banknote size={18} /></div>
           <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Vales</p><p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(totals.totalAdvances, user.currency)}</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 col-span-2 lg:col-span-1">
           <div className="p-2 bg-orange-50 text-orange-600 rounded-lg w-fit"><Landmark size={18} /></div>
           <div className="flex justify-between items-end">
                <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Deduções</p><p className="text-lg font-bold text-gray-900">{formatCurrency(totals.totalSS + totals.totalIRS, user.currency)}</p></div>
                <div className="text-[8px] text-gray-400 text-right font-bold uppercase">SS + IRS</div>
           </div>
        </div>
      </div>

      {/* Net Payout - Desktop Card turned into full width summary */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl flex flex-col gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
           <div className="flex items-center gap-4 relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl text-emerald-400 shadow-inner"><Wallet size={32} /></div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">{t.netEarnings} (Payout)</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(totals.netEarnings, user.currency)}</p>
                </div>
           </div>
           
           <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white/5 p-4 rounded-2xl relative z-10">
               <div className="flex justify-between border-b border-white/5 pb-1"><span>{t.grossEarnings}:</span> <span className="text-white">{formatCurrency(totals.grossEarnings, user.currency)}</span></div>
               <div className="flex justify-between border-b border-white/5 pb-1 text-red-400"><span>Seg. Social:</span> <span>-{formatCurrency(totals.totalSS, user.currency)}</span></div>
               <div className="flex justify-between border-b border-white/5 pb-1 text-red-400"><span>IRS:</span> <span>-{formatCurrency(totals.totalIRS, user.currency)}</span></div>
               <div className="flex justify-between border-b border-white/5 pb-1 text-indigo-400"><span>Vales:</span> <span>-{formatCurrency(totals.totalAdvances, user.currency)}</span></div>
           </div>
      </div>
      
      {/* Export Buttons */}
      <div className="flex gap-3">
           <button onClick={() => exportToPDF(monthlyRecords, user, lang)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 active:scale-95 transition-all"><FileDown size={18} /> {t.exportPDF}</button>
           <button onClick={() => exportToExcel(monthlyRecords, user, lang)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"><FileSpreadsheet size={18} /> {t.exportExcel}</button>
      </div>

      {/* Chart - Smaller on Mobile */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 h-64 md:h-80">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 px-1 flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> Horas por Dia</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
              formatter={(value: number) => [`${value.toFixed(1)}h`, 'Trabalhado']}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hours >= 8 ? '#10b981' : (entry.hours > 0 ? '#fbbf24' : '#ef4444')} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;
