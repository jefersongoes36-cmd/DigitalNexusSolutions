
import React, { useState, useEffect, useRef } from 'react';
import { User, SupportedLanguage, TimeRecord } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateBackupFile } from '../utils/helpers';
import { User as UserIcon, Save, DollarSign, Percent, Briefcase, Camera, Trash2, Upload, Landmark, DownloadCloud, UploadCloud, LogOut } from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  lang: SupportedLanguage;
  records: TimeRecord[];
  onRestoreData?: (data: any) => void;
  onLogout?: () => void;
}

const Profile: React.FC<Props> = ({ user, onUpdateUser, lang, records, onRestoreData, onLogout }) => {
  const t = TRANSLATIONS[lang];
  
  const [hourlyRate, setHourlyRate] = useState(user.hourlyRate.toString());
  
  // SS State
  const [ssType, setSsType] = useState<'percentage' | 'fixed'>(user.socialSecurity?.type || 'percentage');
  const [ssValue, setSsValue] = useState(user.socialSecurity?.value?.toString() || '0');
  
  // IRS State
  const [irsType, setIrsType] = useState<'percentage' | 'fixed'>(user.irs?.type || 'percentage');
  const [irsValue, setIrsValue] = useState(user.irs?.value?.toString() || '0');

  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture State
  const [profilePicture, setProfilePicture] = useState<string | undefined>(user.profilePicture);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedUser: User = {
      ...user,
      hourlyRate: Number(hourlyRate) || 0,
      socialSecurity: {
        type: ssType,
        value: Number(ssValue) || 0
      },
      irs: {
        type: irsType,
        value: Number(irsValue) || 0
      },
      profilePicture: profilePicture
    };
    
    onUpdateUser(updatedUser);
    setSuccessMsg(t.profileUpdated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture(undefined);
  };

  const handleBackup = () => {
      const backupData = {
          type: 'digital-nexus-backup-single',
          version: '1.0',
          timestamp: new Date().toISOString(),
          userProfile: user,
          records: records 
      };
      generateBackupFile(backupData, `dns_backup_${user.username}_${new Date().toISOString().split('T')[0]}.json`);
      setSuccessMsg(t.backupSuccess);
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleRestoreFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !onRestoreData) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const parsedData = JSON.parse(content);
              onRestoreData(parsedData);
              setSuccessMsg(t.restoreSuccess);
          } catch (error) {
              console.error("Error parsing backup file:", error);
              alert(t.invalidBackupFile);
          }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
             <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative">
                    {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-blue-100" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-blue-50">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t.profileSettings}</h2>
                    <p className="text-gray-500">{user.name} (@{user.username})</p>
                </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={handleBackup}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors border border-indigo-200 text-sm"
                    title="Download Backup"
                >
                    <DownloadCloud size={18} />
                    <span className="hidden sm:inline">{t.backupData}</span>
                </button>
                <button 
                    onClick={handleRestoreClick}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition-colors border border-emerald-200 text-sm"
                    title="Restore Backup"
                >
                    <UploadCloud size={18} />
                    <span className="hidden sm:inline">{t.restoreBackup}</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".json"
                    onChange={handleRestoreFile}
                />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          
          <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
             <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2 mb-4">
               <Camera size={20} />
               {t.uploadPhoto}
             </h3>
             
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                    {profilePicture ? (
                        <img src={profilePicture} alt="Profile Large" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
                            <UserIcon size={48} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <p className="text-sm text-gray-600">{t.photoDescription}</p>
                    
                    <div className="flex flex-col md:flex-row gap-3 justify-center md:justify-start">
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                            <Upload size={18} />
                            {t.uploadPhoto}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        
                        {profilePicture && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
                            >
                                <Trash2 size={18} />
                                {t.removePhoto}
                            </button>
                        )}
                    </div>
                </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Briefcase size={20} className="text-gray-400" />
              Professional Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t.hourlyRate}</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                     {user.currency}
                   </div>
                   <input
                    type="number"
                    step="0.01"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency (Read Only)</label>
                <div className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-bold">
                  {user.currency}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Landmark size={20} className="text-gray-400" />
                    {t.socialSecurity}
                 </h3>

                 <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">{t.deductionType}</label>
                       <div className="flex gap-4">
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${ssType === 'percentage' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                             <input type="radio" name="ssType" value="percentage" checked={ssType === 'percentage'} onChange={() => setSsType('percentage')} className="hidden" />
                             <Percent size={18} />
                             <span className="font-medium">{t.percentage}</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${ssType === 'fixed' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                             <input type="radio" name="ssType" value="fixed" checked={ssType === 'fixed'} onChange={() => setSsType('fixed')} className="hidden" />
                             <DollarSign size={18} />
                             <span className="font-medium">{t.fixedValue}</span>
                          </label>
                       </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.value} {ssType === 'percentage' ? '(%)' : `(${user.currency})`}</label>
                        <input type="number" step="0.01" min="0" value={ssValue} onChange={(e) => setSsValue(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 11" />
                    </div>
                 </div>
             </div>

             <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign size={20} className="text-gray-400" />
                    {t.irs}
                 </h3>
                 <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">{t.deductionType}</label>
                       <div className="flex gap-4">
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${irsType === 'percentage' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                             <input type="radio" name="irsType" value="percentage" checked={irsType === 'percentage'} onChange={() => setIrsType('percentage')} className="hidden" />
                             <Percent size={18} />
                             <span className="font-medium">{t.percentage}</span>
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${irsType === 'fixed' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                             <input type="radio" name="irsType" value="fixed" checked={irsType === 'fixed'} onChange={() => setIrsType('fixed')} className="hidden" />
                             <DollarSign size={18} />
                             <span className="font-medium">{t.fixedValue}</span>
                          </label>
                       </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.value} {irsType === 'percentage' ? '(%)' : `(${user.currency})`}</label>
                        <input type="number" step="0.01" min="0" value={irsValue} onChange={(e) => setIrsValue(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 25" />
                    </div>
                 </div>
             </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row gap-4 border-t border-gray-100">
             <button
               type="submit"
               className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
             >
               <Save size={20} />
               {t.updateProfile}
             </button>
             
             {onLogout && (
               <button
                 type="button"
                 onClick={onLogout}
                 className="md:hidden flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-4 px-8 rounded-2xl border border-red-100 transition-all active:scale-95"
               >
                 <LogOut size={20} />
                 {t.logout}
               </button>
             )}
          </div>
          
          {successMsg && (
             <p className="text-green-600 text-center font-bold animate-fade-in-up">
               {successMsg}
             </p>
          )}

        </form>
      </div>
    </div>
  );
};

export default Profile;
