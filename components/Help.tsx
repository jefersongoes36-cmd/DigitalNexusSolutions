
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SupportedLanguage, User, SupportTicket } from '../types';
import { TRANSLATIONS, APP_SYSTEM_INSTRUCTION } from '../constants';
import { Send, Bot, HelpCircle, CheckCircle, Headphones, MessageSquare, Clock, ArrowLeft, Sparkles } from 'lucide-react';

interface Props {
  lang: SupportedLanguage;
  user: User;
  tickets: SupportTicket[];
  onContactHuman: (subject: string) => string;
  onSendMessageToTicket: (ticketId: string, text: string) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Help: React.FC<Props> = ({ lang, user, tickets, onContactHuman, onSendMessageToTicket }) => {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<'ai' | 'human'>('ai');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [humanInputText, setHumanInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t.helpWelcome, sender: 'bot', timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, mode, selectedTicketId, tickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Fix: Implemented AI chat handling using Gemini API
  const handleAISend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg.text,
        config: { systemInstruction: APP_SYSTEM_INSTRUCTION }
      });
      const botMsg: Message = { id: Date.now().toString(), text: response.text || "...", sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "Erro ao conectar com Axis. Verifique sua conexão.", sender: 'bot', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHumanSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !humanInputText.trim()) return;
    onSendMessageToTicket(selectedTicketId, humanInputText);
    setHumanInputText('');
  };

  const handleStartTicket = (forcedSubject?: string) => {
      const subject = forcedSubject || prompt("Qual é o motivo do contacto técnico? / Reason for technical support:");
      if (subject && subject.trim()) {
          const newTicketId = onContactHuman(subject);
          setMode('human');
          setSelectedTicketId(newTicketId);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-140px)] gap-4 animate-fade-in">
      
      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          <button 
            onClick={() => { setMode('ai'); setSelectedTicketId(null); }}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all ${mode === 'ai' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:bg-gray-50'}`}
          >
              <Bot size={16} /> Assistente Axis IA
          </button>
          <button 
            onClick={() => setMode('human')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all ${mode === 'human' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-50'}`}
          >
              <Headphones size={16} /> Suporte Técnico Humano
          </button>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
          
          {mode === 'ai' ? (
              <>
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl"><Bot size={24} /></div>
                        <div>
                            <h2 className="font-black tracking-tight text-sm uppercase">Falar com Axis</h2>
                            <p className="text-[10px] opacity-80 uppercase tracking-widest">IA disponível 24/7</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleStartTicket("Solicitação via Chat IA")}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <Headphones size={12} /> Chamar Humano
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center shadow-sm"><Bot size={16} className="text-cyan-700" /></div>}
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>{msg.text}</div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3 justify-start items-center">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center animate-pulse"><Bot size={16} className="text-cyan-700" /></div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleAISend} className="flex gap-2">
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Como posso ajudar?" className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium text-sm" />
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all active:scale-95"><Send size={20} /></button>
                    </form>
                </div>
              </>
          ) : (
              <>
                {!selectedTicketId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 border-4 border-white shadow-xl animate-bounce-slow">
                            <Headphones size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-2">Suporte Humanizado</h3>
                        <p className="text-gray-500 text-sm max-w-xs mb-8">Deseja falar com nossa equipa técnica em tempo real?</p>
                        
                        <div className="w-full max-w-md space-y-3">
                            <button 
                                onClick={() => handleStartTicket()}
                                className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/40 transition-all active:scale-95"
                            >
                                Abrir Novo Chamado
                            </button>
                            {tickets.length > 0 && (
                                <div className="pt-4 text-left w-full">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Meus Chamados</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {tickets.map(tk => (
                                            <button key={tk.id} onClick={() => setSelectedTicketId(tk.id)} className="w-full p-3 bg-white border border-gray-100 rounded-xl hover:border-orange-200 transition-all text-left flex justify-between items-center group shadow-sm">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{tk.subject}</p>
                                                    <p className="text-[9px] text-gray-400">{new Date(tk.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${tk.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {tk.status}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-orange-600 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedTicketId(null)} className="p-1 hover:bg-white/20 rounded-full transition-all">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="font-black tracking-tight text-sm uppercase truncate max-w-[150px]">{selectedTicket?.subject}</h2>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Chat em direto</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-full bg-white/20 uppercase">{selectedTicket?.status}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                            {selectedTicket?.messages.map((msg) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleHumanSend} className="flex gap-2">
                                <input type="text" value={humanInputText} onChange={(e) => setHumanInputText(e.target.value)} placeholder="Escreva aqui..." className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-sm" disabled={selectedTicket?.status === 'resolved'} />
                                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50" disabled={!humanInputText.trim() || selectedTicket?.status === 'resolved'}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
              </>
          )}
      </div>
    </div>
  );
};

// Fix: Exporting the Help component as default to match App.tsx imports
export default Help;
