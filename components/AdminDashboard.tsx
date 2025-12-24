
import React, { useState, useRef } from 'react';
import { User, SupportedLanguage, CURRENCIES, TimeRecord } from '../types';
import { TRANSLATIONS, COUNTRIES } from '../constants';
import { generateBackupFile } from '../utils/helpers';
import { Users, UserPlus, Search, Pencil, Trash2, Clock, Database, ShieldCheck, Sparkles, MoreVertical } from 'lucide-react';

interface Props {
  users: User[];
  onAddUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  lang: SupportedLanguage;
  records: TimeRecord[];
  onRestoreData?: (data: any) => void;
}

const AdminDashboard: React.FC<Props> = ({ users, onAddUser, onEditUser, onDeleteUser, lang, records }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', name: '', username: '', role: 'employee' as 'employee' | 'support',
    nif: '', email: '', phone: '', hourlyRate: '', currency: 'EUR',
    country: 'PT', isActive: true, password: '', isProvisionalPassword: false
  });

  const t = TRANSLATIONS[lang];
  const manageableUsers = users.filter(u => u.role !== 'master');
  const filteredUsers = manageableUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nif?.includes(searchTerm) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateSubscriptionDays = (user: User) => {
    if (!user.firstAccessDate) return null;
    const start = new Date(user.firstAccessDate);
    const expiry = new Date(start);
    expiry.setFullYear(start.getFullYear() + 1);
    const diffTime = expiry.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenNewUserModal = () => {
    setIsEditing(false);
    setFormData({
      id: `DNS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: '', username: '', role: 'employee', nif: '', email: '', phone: '',
      hourlyRate: '', currency: 'EUR', country: 'PT', isActive: true,
      password: '123', isProvisionalPassword: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditUserModal = (user: User) => {
    setIsEditing(true);
    setFormData({
      id: user.id, name: user.name, username: user.username,
      role: user.role as 'employee' | 'support', nif: user.nif || '',
      email: user.email || '', phone: user.phone || '',
      hourlyRate: user.hourlyRate.toString(), currency: user.currency,
      country: user.country || 'PT', isActive: user.isActive,
      password: user.password || '', isProvisionalPassword: user.isProvisionalPassword || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userPayload: User = {
      ...formData,
      hourlyRate: Number(formData.hourlyRate) || 0,
      language: lang,
      id: formData.id || `DNS-${Date.now()}`
    } as any;
    if (isEditing) onEditUser(userPayload);
    else onAddUser(userPayload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-slate-900 rounded-2xl p-4 md:p-6 text-white shadow-lg col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg"><Users size={20} /></div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.activeSubscriptions}</p>
              <h3 className="text-2xl font-bold">{manageableUsers.filter(u => u.isActive).length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
             <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Suporte</p>
                <h3 className="text-xl font-bold text-gray-800">{manageableUsers.filter(u => u.role === 'support').length}</h3>
             </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
             <button onClick={() => generateBackupFile({users, records}, 'dns_full_backup.json')} className="w-full flex items-center justify-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-tighter">
                <Database size={16} /> Backup
             </button>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={handleOpenNewUserModal} className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-transform"><UserPlus size={18} /> {t.newSubscription}</button>
      </div>

      {/* User List: Mobile Cards / Desktop Table */}
      <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:overflow-hidden">
        {/* Mobile Cards (Visible on Small Screens) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredUsers.map(u => {
                const daysLeft = calculateSubscriptionDays(u);
                return (
                    <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
                                <div>
                                    <h4 className="font-bold text-gray-800 leading-tight">{u.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-mono">@{u.username}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleOpenEditUserModal(u)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Pencil size={16}/></button>
                                <button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${u.role === 'support' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span>
                            <div className="flex items-center gap-2">
                                {daysLeft !== null && <span className="text-[10px] font-bold text-gray-500">{daysLeft} dias</span>}
                                <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Desktop Table (Visible on Medium+ Screens) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t.id}</th>
                        <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t.fullName}</th>
                        <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Assinatura</th>
                        <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t.status}</th>
                        <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">{t.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-[10px] text-gray-400">{u.id}</td>
                            <td className="p-4"><p className="font-bold text-gray-800">{u.name}</p><p className="text-[10px] text-gray-400">@{u.username}</p></td>
                            <td className="p-4">
                                {u.firstAccessDate ? (
                                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1"><Clock size={12}/> {calculateSubscriptionDays(u)} dias</span>
                                ) : (
                                    <span className="text-[10px] text-gray-400 italic">Pendente</span>
                                )}
                            </td>
                            <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'ATIVO' : 'SUSPENSO'}</span></td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-1">
                                    <button onClick={() => handleOpenEditUserModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                                    <button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal / Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4">
            <div className="bg-white rounded-t-[2.5rem] md:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in-up pb-safe max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-black uppercase tracking-tight">{isEditing ? t.editUser : t.newSubscription}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tipo de Conta</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setFormData({...formData, role: 'employee'})} className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'employee' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400'}`}>Trabalhador</button>
                                    <button type="button" onClick={() => setFormData({...formData, role: 'support'})} className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'support' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 text-gray-400'}`}>Suporte</button>
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.fullName}</label>
                                <input required className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.username}</label>
                                <input required className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none font-bold" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.nif}</label>
                                <input className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none font-bold" value={formData.nif} onChange={(e) => setFormData({...formData, nif: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 flex flex-col gap-3 border-t">
                        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30">{t.save}</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[10px]">{t.cancel}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
