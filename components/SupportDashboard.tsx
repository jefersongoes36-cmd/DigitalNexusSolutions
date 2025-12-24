
import React, { useState } from 'react';
import { SupportTicket, User, SupportedLanguage } from '../types';
import { Headphones, Search, Clock, CheckCircle2, User as UserIcon, Send, MessageSquare, Info, Filter } from 'lucide-react';

interface Props {
  tickets: SupportTicket[];
  users: User[];
  onUpdateTicket: (ticket: SupportTicket) => void;
  lang: SupportedLanguage;
  currentUser: User;
}

const SupportDashboard: React.FC<Props> = ({ tickets, users, onUpdateTicket, lang, currentUser }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'open' | 'resolved'>('open');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const ticketUser = selectedTicket ? users.find(u => u.id === selectedTicket.userId) : null;

  const filteredTickets = tickets
    .filter(t => t.status === filterStatus)
    .filter(t => {
      const u = users.find(user => user.id === t.userId);
      return u?.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.includes(searchTerm);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: `M-${Date.now()}`,
          senderId: currentUser.id,
          text: replyText,
          timestamp: new Date().toISOString()
        }
      ]
    };

    onUpdateTicket(updatedTicket);
    setReplyText('');
  };

  const toggleStatus = (ticket: SupportTicket) => {
    const newStatus = ticket.status === 'open' ? 'resolved' : 'open';
    onUpdateTicket({ ...ticket, status: newStatus });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      
      {/* Sidebar: Ticket List */}
      <div className="w-80 md:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <Headphones size={24} />
            <h2 className="font-bold text-lg">Central de Suporte</h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button 
              onClick={() => setFilterStatus('open')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'open' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Clock size={14} /> Em Aberto ({tickets.filter(t => t.status === 'open').length})
            </button>
            <button 
              onClick={() => setFilterStatus('resolved')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'resolved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CheckCircle2 size={14} /> Tratados ({tickets.filter(t => t.status === 'resolved').length})
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar por Nome ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum chamado nesta categoria.</p>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const u = users.find(usr => usr.id === ticket.userId);
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition-all hover:bg-white flex items-start gap-3 ${selectedTicketId === ticket.id ? 'bg-white border-l-4 border-l-orange-500 shadow-inner' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                    {u?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-sm text-gray-800 truncate">{u?.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{ticket.id.split('-')[1].substring(0,6)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{ticket.subject}</p>
                    <p className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleString(lang, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content: Chat & User Info */}
      {selectedTicket ? (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-black text-gray-800 tracking-tight">{selectedTicket.subject}</h3>
                <p className="text-xs text-gray-500">Chamado ID: {selectedTicket.id}</p>
              </div>
              <button 
                onClick={() => toggleStatus(selectedTicket)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedTicket.status === 'open' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
              >
                {selectedTicket.status === 'open' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                {selectedTicket.status === 'open' ? 'Marcar como Resolvido' : 'Reabrir Chamado'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {selectedTicket.messages.map((msg, idx) => {
                const isSystem = msg.senderId === currentUser.id;
                return (
                  <div key={idx} className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${isSystem ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      {msg.text}
                      <p className={`text-[9px] mt-1 text-right ${isSystem ? 'text-orange-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Responda ao utilizador..."
                  className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  disabled={selectedTicket.status === 'resolved'}
                />
                <button 
                  type="submit" 
                  disabled={!replyText.trim() || selectedTicket.status === 'resolved'}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Send size={18} /> Enviar
                </button>
              </form>
            </div>
          </div>

          {/* User Details Sidebar */}
          <div className="w-72 bg-gray-50 border-l border-gray-200 p-6 space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white shadow-md mx-auto mb-4 flex items-center justify-center text-orange-600 text-3xl font-black overflow-hidden border-2 border-orange-50">
                {ticketUser?.profilePicture ? <img src={ticketUser.profilePicture} className="w-full h-full object-cover" /> : ticketUser?.name.charAt(0)}
              </div>
              <h4 className="font-bold text-gray-800">{ticketUser?.name}</h4>
              <p className="text-xs text-gray-500 font-mono">@{ticketUser?.username}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Info size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Digital ID</p>
                  <p className="text-xs font-mono text-gray-700 truncate">{ticketUser?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Filter size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">NIF / Tax ID</p>
                  <p className="text-xs font-bold text-gray-700">{ticketUser?.nif || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><UserIcon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">País</p>
                  <p className="text-xs font-bold text-gray-700">{ticketUser?.country}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Histórico do Utilizador</p>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-[11px] text-gray-600 space-y-1 shadow-sm">
                   <div className="flex justify-between"><span>Total Tickets:</span> <span className="font-bold">{tickets.filter(t => t.userId === ticketUser?.id).length}</span></div>
                   <div className="flex justify-between text-orange-600"><span>Pendentes:</span> <span className="font-bold">{tickets.filter(t => t.userId === ticketUser?.id && t.status === 'open').length}</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20">
          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col items-center gap-4">
            <Headphones size={80} className="text-orange-100" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">Selecione um Chamado</h3>
              <p className="text-sm">Clique em um ticket na lista ao lado para iniciar o atendimento.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
