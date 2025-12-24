
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

const INITIAL_USERS: User[] = [
  {
    id: 'MASTER-01',
    username: 'admin',
    password: '123',
    name: 'Master Admin',
    role: 'master',
    currency: 'EUR',
    country: 'PT',
    language: 'pt',
    hourlyRate: 0,
    isActive: true,
    isProvisionalPassword: false
  },
  {
    id: 'SUPPORT-01',
    username: 'support',
    password: '123',
    name: 'Técnico Axis',
    role: 'support',
    currency: 'EUR',
    country: 'PT',
    language: 'pt',
    hourlyRate: 15,
    isActive: true,
    isProvisionalPassword: false
  }
];

const App: React.FC = () => {
  const [phase, setPhase] = useState<'splash' | 'sales' | 'login' | 'greeting' | 'app'>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [greetingOpacity, setGreetingOpacity] = useState(0);
  const [lang, setLang] = useState<SupportedLanguage>('pt');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setLang(loggedInUser.language);
    if (loggedInUser.role === 'master') setActiveTab('admin');
    else if (loggedInUser.role === 'support') setActiveTab('support');
    else setActiveTab('dashboard');
    setPhase('greeting');
  };

  const handleRegister = (newUser: User) => {
      setUsers(prev => [...prev, newUser]);
      setPhase('login');
  };

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
          text: `Início de chamado técnico: ${subject}. Aguardando conexão com um especialista.`,
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
          messages: [
            ...t.messages,
            {
              id: `M-${Date.now()}`,
              senderId: user.id,
              text,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleGlobalConfigChange = (type: 'lang' | 'curr', value: string) => {
    if (!user) return;
    if (type === 'lang') {
        const newLang = value as SupportedLanguage;
        setLang(newLang);
        setUser({ ...user, language: newLang });
    } else {
        setUser({ ...user, currency: value });
    }
  };

  useEffect(() => {
    if (phase === 'greeting') {
      setTimeout(() => setGreetingOpacity(1), 100);
      setTimeout(() => setGreetingOpacity(0), 3500);
      setTimeout(() => setPhase('app'), 5000);
    }
  }, [phase]);

  const handlePasswordChange = (id: string, pass: string, firstAccess: boolean = false) => {
    const firstAccessDate = firstAccess ? new Date().toISOString() : undefined;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = {
          ...u, 
          password: pass, 
          isProvisionalPassword: false,
          ...(firstAccessDate && { firstAccessDate })
        };
        if (user && user.id === id) setUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const handleLogout = () => {
    setPhase('login');
    setUser(null);
  };

  if (phase === 'splash') return <SplashScreen onLoginClick={() => setPhase('login')} onSalesClick={() => setPhase('sales')} lang={lang} setLang={setLang} />;
  if (phase === 'sales') return <SalesPage onRegister={handleRegister} lang={lang} setLang={setLang} onCancel={() => setPhase('splash')} />;
  if (phase === 'login') return <Login onLogin={handleLogin} lang={lang} users={users} onPasswordChange={handlePasswordChange} />;

  if (phase === 'greeting' && user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-[1500ms] ease-in-out" style={{ opacity: greetingOpacity }}>
        <div className="mb-8 scale-150 transform animate-bounce">
           {user.profilePicture ? <img src={user.profilePicture} className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-100 shadow-2xl" /> : <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-black text-4xl shadow-2xl">{user.name.charAt(0)}</div>}
        </div>
        <div className="text-center px-6">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter">
                {getGreeting(lang)}, <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">{user.name.split(' ')[0]}</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">Digital Nexus Solutions</p>
        </div>
      </div>
    );
  }

  if (phase === 'app' && user) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-72 bg-slate-900 text-white flex-shrink-0 flex-col border-r border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5">
              <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-blue-600 rounded-lg"><Boxes size={20}/></div>
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">
                    Digital Nexus<br/>Solutions
                  </h1>
              </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {user.role === 'employee' && (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><LayoutDashboard size={20} /> Início</button>
                <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><PieChart size={20} /> Relatórios</button>
              </>
            )}
            {user.role === 'master' && (
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><UsersIcon size={20} /> Administração</button>
            )}
            {user.role === 'support' && (
              <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'support' ? 'bg-orange-600 text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><Headphones size={20} /> Suporte</button>
            )}
            <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><MessageCircle size={20} /> Network</button>
            <button onClick={() => setActiveTab('help')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'help' ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><HelpCircle size={20} /> Ajuda</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}><UserCircle size={20} /> Perfil</button>
          </nav>

          <div className="p-6 border-t border-white/5 space-y-4 bg-slate-900/50">
            <div className="space-y-2">
                <div className="bg-slate-800/80 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    <Globe size={16} className="text-blue-400" />
                    <select value={lang} onChange={(e) => handleGlobalConfigChange('lang', e.target.value)} className="bg-transparent text-[11px] font-black text-slate-200 outline-none w-full uppercase cursor-pointer appearance-none">
                        {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-slate-800">{l.code}</option>)}
                    </select>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    <Wallet size={16} className="text-emerald-400" />
                    <select value={user.currency} onChange={(e) => handleGlobalConfigChange('curr', e.target.value)} className="bg-transparent text-[11px] font-black text-slate-200 outline-none w-full uppercase cursor-pointer appearance-none">
                        {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-800">{c.code}</option>)}
                    </select>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"><LogOut size={18} /> Sair</button>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded-lg"><Boxes size={18} className="text-white"/></div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{getGreeting(lang)}</p>
                    <h2 className="text-sm font-black text-gray-800 leading-none">{user.name.split(' ')[0]}</h2>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Sair">
                    <LogOut size={20} />
                 </button>
                 <button onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm active:scale-90 transition-transform">
                    {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">{user.name.charAt(0)}</div>}
                 </button>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full mb-20 md:mb-0">
          {activeTab === 'dashboard' && <Dashboard user={user} records={records} onUpdateRecord={(r) => setRecords(prev => [...prev.filter(x => x.date !== r.date), r])} lang={lang} />}
          {activeTab === 'reports' && <Reports user={user} records={records} lang={lang} />}
          {activeTab === 'admin' && <AdminDashboard users={users} onAddUser={u => setUsers(p => [...p, u])} onEditUser={u => setUsers(p => p.map(x => x.id === u.id ? u : x))} onDeleteUser={id => setUsers(p => p.filter(x => x.id !== id))} lang={lang} records={records} />}
          {activeTab === 'support' && <SupportDashboard tickets={tickets} users={users} onUpdateTicket={handleUpdateTicket} lang={lang} currentUser={user} />}
          {activeTab === 'chat' && <Chat currentUser={user} users={users} messages={messages} onSendMessage={t => setMessages(p => [...p, {id: Date.now().toString(), userId: user.id, text: t, timestamp: new Date().toISOString(), originalLanguage: lang}])} lang={lang} />}
          {activeTab === 'help' && <Help lang={lang} user={user} tickets={tickets.filter(t => t.userId === user.id)} onContactHuman={handleCreateTicket} onSendMessageToTicket={handleSendMessageToTicket} />}
          {activeTab === 'profile' && <Profile user={user} onUpdateUser={u => { setUsers(p => p.map(x => x.id === u.id ? u : x)); setUser(u); }} lang={lang} records={records} onLogout={handleLogout} />}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 py-3 z-50 pb-safe">
            {user.role === 'employee' ? (
                <>
                    <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}`}>
                        <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'animate-bounce-slow' : ''}/>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Início</span>
                        {activeTab === 'dashboard' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'reports' ? 'text-blue-400' : 'text-slate-500'}`}>
                        <PieChart size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Relatórios</span>
                        {activeTab === 'reports' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>}
                    </button>
                </>
            ) : user.role === 'master' ? (
                <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'admin' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <UsersIcon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Admin</span>
                    {activeTab === 'admin' && <div className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full"></div>}
                </button>
            ) : (
                <button onClick={() => setActiveTab('support')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'support' ? 'text-orange-400' : 'text-slate-500'}`}>
                    <Headphones size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Suporte</span>
                    {activeTab === 'support' && <div className="absolute -bottom-1 w-1 h-1 bg-orange-400 rounded-full"></div>}
                </button>
            )}
            <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'chat' ? 'text-blue-400' : 'text-slate-500'}`}>
                <MessageCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Network</span>
                {activeTab === 'chat' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>}
            </button>
            <button onClick={() => setActiveTab('help')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'help' ? 'text-cyan-400' : 'text-slate-500'}`}>
                <HelpCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Ajuda</span>
                {activeTab === 'help' && <div className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full"></div>}
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 flex-1 transition-all relative ${activeTab === 'profile' ? 'text-blue-400' : 'text-slate-500'}`}>
                <UserCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
                {activeTab === 'profile' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>}
            </button>
        </nav>
      </div>
    );
  }
  return null;
};

export default App;
