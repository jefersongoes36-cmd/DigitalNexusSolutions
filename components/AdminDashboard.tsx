import React, { useState, useEffect } from 'react';
import { User, SupportedLanguage, TimeRecord } from '../types';
import { TRANSLATIONS } from '../constants';
import { Users, UserPlus, Search, Pencil, Trash2, Clock, Database, ShieldCheck } from 'lucide-react';
import axios from 'axios';

interface Props {
  lang: SupportedLanguage;
  records: TimeRecord[];
}

const AdminDashboard: React.FC<Props> = ({ lang, records }) => {
  const t = TRANSLATIONS[lang];

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '', name: '', username: '', role: 'employee' as 'employee' | 'support',
    password: '', currency: 'EUR', country: 'PT', language: 'pt', hourlyRate: 0, isActive: true
  });

  // --- Carregar usuários do backend ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Abrir modal para novo usuário ---
  const handleOpenNewUserModal = () => {
    setIsEditing(false);
    setFormData({
      id: '', name: '', username: '', role: 'employee',
      password: '123', currency: 'EUR', country: 'PT', language: 'pt', hourlyRate: 0, isActive: true
    });
    setIsModalOpen(true);
  };

  // --- Abrir modal para editar usuário ---
  const handleOpenEditUserModal = (user: User) => {
    setIsEditing(true);
    setFormData({
      id: user.id, name: user.name, username: user.username, role: user.role as 'employee' | 'support',
      password: user.password || '', currency: user.currency, country: user.country, language: user.language,
      hourlyRate: user.hourlyRate, isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  // --- Enviar formulário para API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await axios.put(`/api/users/${formData.id}`, formData);
        setUsers(users.map(u => u.id === res.data.id ? res.data : u));
      } else {
        const res = await axios.post('/api/users', formData);
        setUsers([res.data, ...users]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  };

  // --- Deletar usuário ---
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
    }
  };

  // --- Filtro de busca ---
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Search + Add */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleOpenNewUserModal} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl">
          <UserPlus size={18} /> {t.newSubscription}
        </button>
      </div>

      {/* Lista de usuários */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[10px] uppercase tracking-widest">{t.id}</th>
              <th className="p-4 text-[10px] uppercase tracking-widest">{t.fullName}</th>
              <th className="p-4 text-[10px] uppercase tracking-widest">Role</th>
              <th className="p-4 text-[10px] uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-xs">{u.id}</td>
                <td className="p-4">{u.name} (@{u.username})</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4">{u.isActive ? 'ATIVO' : 'INATIVO'}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenEditUserModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{isEditing ? t.editUser : t.newSubscription}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl" />
              <input required placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-3 border rounded-xl" />
              <input required placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded-xl" />
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'employee'|'support'})} className="w-full p-3 border rounded-xl">
                <option value="employee">Employee</option>
                <option value="support">Support</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
