
import React, { useState } from 'react';
import { User, TimeRecord, SupportedLanguage } from '../types';
import { TRANSLATIONS, MOTIVATIONAL_QUOTES, HOLIDAYS_DB } from '../constants';
import { calculateDuration, getStatusColor } from '../utils/helpers';
import { Calendar, Clock, XCircle, CheckCircle, ChevronLeft, ChevronRight, Banknote, PartyPopper, MapPin, StickyNote, Sparkles } from 'lucide-react';

interface Props {
  user: User;
  records: TimeRecord[];
  onUpdateRecord: (record: TimeRecord) => void;
  lang: SupportedLanguage;
}

const Dashboard: React.FC<Props> = ({ user, records, onUpdateRecord, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [lunchDuration, setLunchDuration] = useState(60);
  const [isAbsent, setIsAbsent] = useState(false);
  const [advance, setAdvance] = useState('0');
  const [workSite, setWorkSite] = useState('');
  const [notes, setNotes] = useState('');

  const t = TRANSLATIONS[lang];
  const quotes = MOTIVATIONAL_QUOTES[lang] || MOTIVATIONAL_QUOTES['en'];
  const randomQuote = quotes[new Date().getDate() % quotes.length];

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const existing = records.find(r => r.date === dateStr);
    
    setStartTime(existing?.startTime || '08:00');
    setEndTime(existing?.endTime || '17:00');
    setLunchDuration(existing?.lunchDuration || 60);
    setIsAbsent(existing?.isAbsent || false);
    setAdvance(existing?.advance?.toString() || '0');
    setWorkSite(existing?.workSite || '');
    setNotes(existing?.notes || '');
    
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedDate) return;
    onUpdateRecord({
      id: selectedDate, date: selectedDate, startTime, endTime, lunchDuration,
      isAbsent, advance: Number(advance) || 0, workSite, notes
    });
    setIsModalOpen(false);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const calendarGrid = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <div className="space-y-4 pb-24 md:pb-0 animate-fade-in">
      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70 flex items-center gap-2"><Sparkles size={12}/> Inspiração Diária</h3>
        <p className="text-sm md:text-xl font-medium italic">"{randomQuote}"</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 md:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-3 bg-gray-50 rounded-xl text-gray-400 active:scale-95 transition-all"><ChevronLeft size={20} /></button>
           <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight capitalize">
             {currentDate.toLocaleString(lang, { month: 'long', year: 'numeric' })}
           </h2>
           <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-3 bg-gray-50 rounded-xl text-gray-400 active:scale-95 transition-all"><ChevronRight size={20} /></button>
        </div>

        {/* Legend Mobile Friendly */}
        <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest mb-6 justify-center overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">● Meta OK</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100">● Incompleto</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100">● Falta</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {weekDays.map((day, idx) => (
             <div key={idx} className="text-center text-[9px] font-black text-gray-300 uppercase py-2">{day.substring(0, 1)}</div>
          ))}
          {calendarGrid.map(day => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = records.find(r => r.date === dateStr);
            const statusClass = getStatusColor(record);
            const hours = record && !record.isAbsent ? calculateDuration(record.startTime, record.endTime, record.lunchDuration).toFixed(0) : null;

            return (
              <button key={day} onClick={() => handleDateClick(day)} className={`h-11 md:h-24 rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-90 ${statusClass} shadow-sm`}>
                <span className="text-xs md:text-lg font-bold">{day}</span>
                {hours && <span className="hidden md:block text-[10px] font-black mt-1 uppercase">{hours} Horas</span>}
                {record && <div className="md:hidden w-1 h-1 rounded-full bg-current mt-1 opacity-50"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal - Bottom Sheet on Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up pb-safe">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                  <h3 className="font-black text-lg uppercase tracking-tight leading-none">Registar Horas</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{selectedDate}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"><XCircle /></button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <button onClick={() => setIsAbsent(!isAbsent)} className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all ${isAbsent ? 'bg-red-50 border-red-500 text-red-600 shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                <XCircle size={18} /> {isAbsent ? 'Falta Marcada' : 'Confirmar Presença'}
              </button>

              {!isAbsent && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.startTime}</label>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-xl font-bold focus:border-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.endTime}</label>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-xl font-bold focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Almoço (min)</label><input type="number" value={lunchDuration} onChange={(e) => setLunchDuration(Number(e.target.value))} className="w-full border-2 border-gray-100 rounded-xl p-4 bg-gray-50 font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vale ({user.currency})</label><input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-4 bg-blue-50 text-blue-700 font-bold" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.workSite}</label><input type="text" value={workSite} onChange={(e) => setWorkSite(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-4 bg-gray-50 font-bold" placeholder="Local da obra/serviço" /></div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex flex-col gap-3">
              <button onClick={handleSave} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"><CheckCircle size={20} /> {t.save}</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3 text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
