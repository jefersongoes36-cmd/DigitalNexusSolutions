
import React, { useState, useEffect } from 'react';
import { User, SupportedLanguage, CURRENCIES, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS, COUNTRIES, TESTIMONIALS } from '../constants';
import { CreditCard, CheckCircle, Smartphone, Lock, ShieldCheck, Sparkles, Globe, Wallet, Fingerprint, Loader2, XCircle, AlertCircle, Shield, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'pk_test_your_key_here'; 
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface Props {
  onRegister: (newUser: User) => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  onCancel: () => void;
}

const BASE_PRICE_EUR = 9.99;
const ORIGINAL_PRICE_EUR = 17.99;
const VAT_RATE = 0.23;

const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1, USD: 1.08, GBP: 0.84, BRL: 6.12, CHF: 0.94, INR: 90.45, PKR: 301.50, MAD: 10.85, JPY: 164.20, AOA: 945.00, MZN: 68.90
};

type PaymentStatus = 'idle' | 'validating' | 'authorizing' | 'waiting_mobile' | 'confirming' | 'success' | 'failed';

const AnimatedTestimonials: React.FC = () => {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
                setVisible(true);
            }, 600);
        }, 5500); // Reduzido ligeiramente para manter o dinamismo
        return () => clearInterval(interval);
    }, []);

    const t = TESTIMONIALS[index];

    return (
        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] p-6 relative overflow-hidden transition-all duration-700 min-h-[170px] flex items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -top-4 -right-4 opacity-[0.04] text-blue-900 pointer-events-none">
                <Quote size={110} />
            </div>
            
            <div className={`flex items-center gap-5 transition-all duration-500 w-full ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="relative shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white ring-4 ring-blue-50/50" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                        <CheckCircle size={12} />
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < t.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                        ))}
                    </div>
                    <p className="text-gray-700 text-sm font-medium italic leading-relaxed line-clamp-3 mb-2">"{t.text}"</p>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{t.name}</span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.1em]">{t.role}</span>
                    </div>
                </div>
            </div>

            {/* Pagination Indicators - Updated for more dots */}
            <div className="absolute bottom-4 right-8 flex gap-1">
                {TESTIMONIALS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-3 bg-blue-500' : 'w-1 bg-gray-200'}`}></div>
                ))}
            </div>
        </div>
    );
};

const SalesPage: React.FC<Props> = ({ onRegister, lang, setLang, onCancel }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<'form' | 'payment' | 'processing'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'cc' | 'mbway'>('cc');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', username: '', nif: '', email: '', phone: '', country: 'PT', currency: 'EUR', password: '', confirmPassword: ''
  });

  useEffect(() => {
    setGeneratedId(`DNS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  }, []);

  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES[0];
  const rate = EXCHANGE_RATES[formData.currency] || 1;
  const basePriceConverted = BASE_PRICE_EUR * rate;
  const vatAmountConverted = basePriceConverted * VAT_RATE;
  const totalWithVatConverted = basePriceConverted + vatAmountConverted;
  const formatPrice = (val: number) => val.toFixed(2).replace('.', ',');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        alert(t.passwordMismatch || "Passwords do not match");
        return;
    }
    setStep('payment');
  };

  const processPaymentFlow = async () => {
      setStep('processing');
      setPaymentStatus('validating');
      setErrorMessage('');

      try {
          await new Promise(r => setTimeout(r, 1500));
          
          if (paymentMethod === 'mbway') {
              setPaymentStatus('waiting_mobile');
              await new Promise(r => setTimeout(r, 4500));
          } else {
              setPaymentStatus('authorizing');
              await new Promise(r => setTimeout(r, 3500));
          }

          setPaymentStatus('confirming');
          await new Promise(r => setTimeout(r, 2000));

          setPaymentStatus('success');
          setTimeout(() => {
              const newUser: User = {
                id: generatedId, username: formData.username, name: formData.name,
                role: 'employee', currency: formData.currency, country: formData.country,
                language: lang, hourlyRate: 10, nif: formData.nif, email: formData.email,
                phone: formData.phone, isActive: true, password: formData.password,
                isProvisionalPassword: false, subscriptionDate: new Date().toISOString()
              };
              onRegister(newUser);
          }, 2000);

      } catch (err: any) {
          setPaymentStatus('failed');
          setErrorMessage(err.message || "Falha na comunicação.");
          setTimeout(() => {
              setStep('payment');
              setPaymentStatus('idle');
          }, 5000);
      }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      processPaymentFlow();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative font-sans text-slate-900">
      
      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm flex items-center gap-2">
              <Wallet size={16} className="text-gray-400" />
              <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="bg-transparent focus:outline-none cursor-pointer appearance-none font-bold text-gray-700 pr-4">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm flex items-center gap-2">
              <Globe size={16} className="text-gray-400" />
              <select value={lang} onChange={(e) => setLang(e.target.value as SupportedLanguage)} className="bg-transparent focus:outline-none cursor-pointer appearance-none font-bold text-gray-700 pr-6">
                {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.code.toUpperCase()}</option>)}
              </select>
          </div>
      </div>

      {step === 'processing' ? (
          <div className="text-center max-w-md w-full p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
              <div className="mb-8 flex justify-center">
                 {paymentStatus === 'success' ? (
                    <div className="bg-emerald-50 p-8 rounded-full text-emerald-500 border border-emerald-100 scale-110">
                        <CheckCircle size={72} />
                    </div>
                 ) : (
                    <div className="relative">
                        <div className="bg-blue-50 p-10 rounded-full text-blue-600 border border-blue-100">
                            <Loader2 size={72} className="animate-spin" />
                        </div>
                    </div>
                 )}
              </div>
              <h2 className="text-2xl font-black mb-4 tracking-tight text-gray-800">
                {paymentStatus === 'success' ? "PAGAMENTO APROVADO!" : "A processar..."}
              </h2>
          </div>
      ) : (
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row border border-gray-200 max-h-[95vh] overflow-y-auto">
          
          {/* Left Panel: Pricing */}
          <div className="bg-[#0f172a] text-white p-8 md:p-14 md:w-[45%] flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
             
             <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-12">
                     <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl"><Shield size={28}/></div>
                     <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Digital Nexus<br/><span className="text-blue-400">Solutions</span></h2>
                 </div>
                 
                 <div className="space-y-6">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-4">Acesso Profissional Incluído:</p>
                    <ul className="space-y-4 text-slate-300">
                        <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={20} className="text-emerald-400 shrink-0"/> {t.planYearly}</li>
                        <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={20} className="text-emerald-400 shrink-0"/> {t.unlimitedAccess}</li>
                        <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={20} className="text-emerald-400 shrink-0"/> Exportação PDF e Excel</li>
                        <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={20} className="text-emerald-400 shrink-0"/> Backup Diário Automático</li>
                    </ul>
                 </div>
             </div>

             <div className="mt-12 relative z-10 bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-md">
                 <p className="text-[10px] uppercase font-black text-slate-500 mb-6 tracking-widest">{t.totalToday}</p>
                 <div className="flex flex-col gap-2">
                    <span className="text-lg text-slate-500 line-through font-bold opacity-50">
                        {selectedCurrency.symbol}{formatPrice(ORIGINAL_PRICE_EUR * rate * 1.23)}
                    </span>
                    <div className="flex flex-wrap items-end gap-3">
                        <p className="text-6xl font-black text-white leading-none">
                            {selectedCurrency.symbol}{formatPrice(totalWithVatConverted)}
                        </p>
                        <div className="flex flex-col pb-1">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total com IVA</span>
                            <span className="text-xs font-bold text-slate-500">{t.perYear}</span>
                        </div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Right Panel: Checkout */}
          <div className="p-8 md:p-16 md:w-[55%] bg-white flex flex-col justify-center">
             <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">
                    {step === 'form' ? 'Ativar Licença' : 'Pagamento Seguro'}
                </h1>
                <p className="text-gray-500 font-medium">
                    {step === 'form' ? 'Preencha os seus dados profissionais abaixo.' : 'Conclua a sua subscrição comercial com segurança.'}
                </p>
             </div>
             
             {step === 'form' && (
                 <form onSubmit={handleNext} className="space-y-5">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.fullName}</label><input required type="text" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.username}</label><input required type="text" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.email}</label><input required type="email" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.phone}</label><input required type="tel" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.password}</label><input required type="password" placeholder="••••••••" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.confirmPassword}</label><input required type="password" placeholder="••••••••" className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}/></div>
                     </div>
                     
                     <div className="pt-6 flex gap-4">
                         <button type="button" onClick={onCancel} className="flex-1 py-5 text-gray-400 font-black uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">{t.cancel}</button>
                         <button type="submit" className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-95">{t.continueToPayment}</button>
                     </div>
                     
                     {/* TESTIMONIALS ALSO ON FORM STEP TO REINFORCE TRUST */}
                     <AnimatedTestimonials />
                 </form>
             )}

             {step === 'payment' && (
                 <form onSubmit={handlePaymentSubmit} className="space-y-8 animate-fade-in-up">
                     <div className="grid grid-cols-2 gap-4">
                         <button type="button" onClick={() => setPaymentMethod('cc')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'cc' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105' : 'border-gray-100 text-gray-400'}`}>
                            <CreditCard size={32}/>
                            <span className="font-black text-[10px] uppercase tracking-widest">{t.creditCard}</span>
                         </button>
                         <button type="button" onClick={() => setPaymentMethod('mbway')} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'mbway' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105' : 'border-gray-100 text-gray-400'}`}>
                            <Smartphone size={32}/>
                            <span className="font-black text-[10px] uppercase tracking-widest">{t.mbway}</span>
                         </button>
                     </div>

                     <div className="space-y-4">
                        {paymentMethod === 'cc' ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cartão de Crédito</label>
                                <div className="p-5 border-2 border-gray-100 rounded-2xl bg-gray-50 flex items-center gap-4">
                                    <CreditCard size={20} className="text-gray-400" />
                                    <input required type="text" placeholder="0000 0000 0000 0000" className="bg-transparent font-bold flex-1 outline-none" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.mbwayNumber}</label>
                                <div className="p-5 border-2 border-gray-100 rounded-2xl bg-gray-50 flex items-center gap-4">
                                    <Smartphone size={20} className="text-gray-400" />
                                    <input required type="tel" defaultValue={formData.phone} className="bg-transparent font-bold flex-1 outline-none" />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-3 transition-all active:scale-95">
                            <Lock size={20}/> {t.payAndActivate}
                        </button>
                        
                        {/* ANIMATED TESTIMONIALS - PLACED DIRECTLY BELOW THE BUTTON */}
                        <AnimatedTestimonials />
                        
                        <div className="flex justify-center pt-4">
                            <button type="button" onClick={() => setStep('form')} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600">{t.back}</button>
                        </div>
                     </div>
                 </form>
             )}
          </div>
      </div>
      )}
    </div>
  );
};

export default SalesPage;
