import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import SupportDashboard from './components/SupportDashboard';
import Chat from './components/Chat';
import Help from './components/Help';
import SalesPage from './components/SalesPage';
import { User, TimeRecord, SupportedLanguage, SupportTicket, ChatMessage, CURRENCIES, SUPPORTED_LANGUAGES } from './types';
import { getGreeting } from './utils/helpers';
import { LayoutDashboard, PieChart, LogOut, Globe, Wallet, Users as UsersIcon, UserCircle, MessageCircle, HelpCircle, Headphones, Settings, Boxes, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<'splash' | 'sales' | 'login' | 'greeting' | 'app'>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [greetingOpacity, setGreetingOpacity] = useState(0);
  const [lang, setLang] = useState<SupportedLanguage>('pt');

  // --- Carregar usuários do backend ao iniciar ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };
    fetchUsers();
  }, []);

  // --- Login ---
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setLang(loggedInUser.language);
    if (loggedInUser.role === 'master') setActiveTab('admin');
    else if (loggedInUser.role === 'support') setActiveTab('support');
    else setActiveTab('dashboard');
    setPhase('greeting');
  };

  // --- Adicionar usuário (Admin) ---
  const handleAddUser = async (newUser: User) => {
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const createdUser = await res.json();
      if (res.ok) {
        setUsers(prev => [createdUser, ...prev]);
      } else {
        console.error("Erro ao criar usuário:", createdUser.error);
      }
    } catch (err) {
      console.error("Erro de rede:", err);
    }
  };

  // --- Editar usuário (Admin) ---
  const handleEditUser = async (updatedUser: User) => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === data.id ? data : u));
        if (user && user.id === data.id) setUser(data);
      } else {
        console.error("Erro ao atualizar usuário:", data.error);
      }
    } catch (err) {
      console.error("Erro de rede:", err);
    }
  };

  // --- Deletar usuário (Admin) ---
  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
      else console.error("Erro ao deletar usuário");
    } catch (err) {
      console.error("Erro de rede:", err);
    }
  };

  // --- Resto das funções (tickets, mensagens, logout, etc.) ---
  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleCreateTicket = (subject: string): string => {
    if (!user) return '';
    const newId = `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newTicket: SupportTicket = {
      id: newId,
      userId: user.id,
      subject,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `M-${Date.now()}`,
          senderId: user.id,
          text: `Início de chamado técnico: ${subject}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    setTickets(prev => [newTicket, ...prev]);
    return newId;
  };

  const handleSendMessageToTicket = (ticketId: string, text: string) => {
    if (!user) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, { id: `M-${Date.now()}`, senderId: user.id, text, timestamp: new Date().toISOString() }]
        };
      }
      return t;
    }));
  };

  const handleLogout = () => {
    setPhase('login');
    setUser(null);
  };

  useEffect(() => {
    if (phase === 'greeting') {
      setTimeout(() => setGreetingOpacity(1), 100);
      setTimeout(() => setGreetingOpacity(0), 3500);
      setTimeout(() => setPhase('app'), 5000);
    }
  }, [phase]);

  // --- Renderizar fases ---
  if (phase === 'splash') return <SplashScreen onLoginClick={() => setPhase('login')} onSalesClick={() => setPhase('sales')} lang={lang} setLang={setLang} />;
  if (phase === 'sales') return <SalesPage onRegister={(u) => setUsers(prev => [...prev, u])} lang={lang} setLang={setLang} onCancel={() => setPhase('splash')} />;
  if (phase === 'login') return <Login onLogin={handleLogin} lang={lang} users={users} onPasswordChange={() => {}} />;

  if (phase === 'greeting' && user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-[1500ms] ease-in-out" style={{ opacity: greetingOpacity }}>
        <h2 className="text-3xl font-black">{getGreeting(lang)}, {user.name.split(' ')[0]}</h2>
      </div>
    );
  }

  if (phase === 'app' && user) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* ... Sidebar, Mobile Header, Navigation ... */}

        <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full mb-20 md:mb-0">
          {activeTab === 'dashboard' && <Dashboard user={user} records={records} onUpdateRecord={(r) => setRecords(prev => [...prev.filter(x => x.date !== r.date), r])} lang={lang} />}
          {activeTab === 'reports' && <Reports user={user} records={records} lang={lang} />}
          {activeTab === 'admin' && 
            <AdminDashboard
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              lang={lang}
              records={records}
            />
          }
          {activeTab === 'support' && <SupportDashboard tickets={tickets} users={users} onUpdateTicket={handleUpdateTicket} lang={lang} currentUser={user} />}
          {activeTab === 'chat' && <Chat currentUser={user} users={users} messages={messages} onSendMessage={(t) => setMessages(prev => [...prev, {id: Date.now().toString(), userId: user.id, text: t, timestamp: new Date().toISOString(), originalLanguage: lang}])} lang={lang} />}
          {activeTab === 'help' && <Help lang={lang} user={user} tickets={tickets.filter(t => t.userId === user.id)} onContactHuman={handleCreateTicket} onSendMessageToTicket={handleSendMessageToTicket} />}
          {activeTab === 'profile' && <Profile user={user} onUpdateUser={(u) => { setUsers(prev => prev.map(x => x.id === u.id ? u : x)); setUser(u); }} lang={lang} records={records} onLogout={handleLogout} />}
        </main>
      </div>
    );
  }

  return null;
};

export default App;
