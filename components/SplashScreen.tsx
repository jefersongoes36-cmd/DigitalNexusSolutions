
import React, { useEffect, useState } from 'react';
import { Boxes, LogIn, Sparkles, Globe } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  onLoginClick: () => void;
  onSalesClick: () => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
}

const SplashScreen: React.FC<Props> = ({ onLoginClick, onSalesClick, lang, setLang }) => {
  const [stage, setStage] = useState<'intro' | 'main'>('intro');
  const [nameOpacity, setNameOpacity] = useState(0);
  const [mainOpacity, setMainOpacity] = useState(0);
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Initial Intro Animation
    // 1. Fade in name slowly (2.5s)
    setTimeout(() => setNameOpacity(1), 500);
    
    // 2. Fade out name slowly (2.5s) after some time
    setTimeout(() => setNameOpacity(0), 4000);
    
    // 3. Switch to main stage
    setTimeout(() => {
        setStage('main');
        setTimeout(() => setMainOpacity(1), 100);
    }, 6500);
  }, []);

  if (stage === 'intro') {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
              <h1 
                className="text-4xl md:text-6xl font-black tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 uppercase transition-opacity duration-[2500ms] ease-in-out"
                style={{ opacity: nameOpacity }}
              >
                Digital Nexus<br/>Solutions
              </h1>
          </div>
      );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-1000 ease-in-out`} style={{ opacity: mainOpacity }}>
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer appearance-none text-white font-medium pr-2"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="text-gray-900">{l.flag} {l.code.toUpperCase()}</option>
                ))}
              </select>
          </div>
      </div>

      <div className="bg-white/10 p-6 rounded-3xl mb-6 flex flex-col items-center border border-white/5 shadow-2xl">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
             <Boxes size={48} className="text-white" />
        </div>
        <p className="text-xs font-black tracking-[0.4em] text-blue-400 uppercase">Logo Space</p>
      </div>

      <h1 className="text-2xl font-black tracking-widest text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 uppercase">
        Digital Nexus Solutions
      </h1>
      <p className="mt-2 text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold">Time Management Systems</p>

      {/* Buttons Area */}
      <div className={`mt-12 flex flex-col gap-4 w-full max-w-sm px-6 animate-fade-in-up`}>
         <button 
           onClick={onSalesClick}
           className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
         >
           <Sparkles className="group-hover:animate-spin" size={18} />
           <span>{t.joinDiscount}</span>
         </button>

         <button 
            onClick={onLoginClick}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
         >
            <LogIn size={18} />
            <span>{t.alreadyActive}</span>
         </button>
      </div>
    </div>
  );
};

export default SplashScreen;
