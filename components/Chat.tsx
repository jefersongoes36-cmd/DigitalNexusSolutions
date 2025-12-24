import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../constants';
import { simulateTranslation } from '../utils/helpers';
import { Send, MessageCircle, Languages } from 'lucide-react';

interface Props {
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  lang: SupportedLanguage;
}

const Chat: React.FC<Props> = ({ currentUser, users, messages, onSendMessage, lang }) => {
  const [inputText, setInputText] = useState('');
  // Local cache for translations to avoid re-translating same messages
  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, translations]);

  // Effect to handle translations
  useEffect(() => {
    const translatePendingMessages = async () => {
        const newTranslations: Record<string, string> = {};
        let hasUpdates = false;

        for (const msg of messages) {
            // Only translate if:
            // 1. It's not my own message
            // 2. The original language is different from my current language
            // 3. We haven't translated it yet for this specific target language context
            const needsTranslation = msg.userId !== currentUser.id && 
                                     msg.originalLanguage !== lang && 
                                     !translations[msg.id];
            
            if (needsTranslation) {
                // In a real app, you would batch these requests
                const translatedText = await simulateTranslation(msg.text, msg.originalLanguage, lang);
                newTranslations[msg.id] = translatedText;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            setTranslations(prev => ({ ...prev, ...newTranslations }));
        }
    };

    translatePendingMessages();
  }, [messages, lang, currentUser.id, translations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  // Helper to find user info for a message
  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  // Helper to format time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <MessageCircle size={24} />
            <div>
            <h2 className="font-bold text-lg">{t.chat}</h2>
            <p className="text-xs text-blue-100">{users.length} users online</p>
            </div>
        </div>
        <div className="flex items-center gap-1 text-xs bg-blue-500/50 px-2 py-1 rounded">
             <Languages size={14} />
             <span>Auto-Translate: {lang.toUpperCase()}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={48} className="mb-2 opacity-50" />
            <p>{t.noMessages}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            const sender = getUserInfo(msg.userId);
            
            // Determine text to show: Translated or Original
            const showTranslated = !isMe && msg.originalLanguage !== lang && translations[msg.id];
            const displayText = showTranslated ? translations[msg.id] : msg.text;
            
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar for other users */}
                {!isMe && (
                   <div className="flex-shrink-0 self-end mb-1">
                     {sender?.profilePicture ? (
                       <img src={sender.profilePicture} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt={sender.name} />
                     ) : (
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                         {sender?.name.charAt(0) || '?'}
                       </div>
                     )}
                   </div>
                )}

                <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                   {!isMe && <span className="text-xs text-gray-500 ml-1 mb-0.5">{sender?.name}</span>}
                   
                   <div className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${
                       isMe 
                       ? 'bg-blue-600 text-white rounded-br-none' 
                       : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                   }`}>
                      {displayText}
                   </div>
                   
                   <div className="flex items-center gap-2 mt-1 mx-1">
                        <span className="text-[10px] text-gray-400">
                            {formatTime(msg.timestamp)}
                        </span>
                        {showTranslated && (
                            <span className="text-[9px] text-blue-400 flex items-center gap-0.5" title={`Original: ${msg.text}`}>
                                <Languages size={10} />
                                Translated from {msg.originalLanguage}
                            </span>
                        )}
                   </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
           <input 
             type="text" 
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder={t.typeMessage}
             className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
           />
           <button 
             type="submit" 
             disabled={!inputText.trim()}
             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors flex items-center justify-center"
           >
             <Send size={20} />
           </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;