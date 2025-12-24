
import React, { useState } from 'react';
import { User, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../constants';
import { User as UserIcon, Lock, LogIn, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  users: User[];
  onLogin: (user: User) => void;
  lang: SupportedLanguage;
  onPasswordChange: (userId: string, newPass: string, firstAccess?: boolean) => void;
}

const Login: React.FC<Props> = ({ users, onLogin, lang, onPasswordChange }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [opacity, setOpacity] = useState(0);
  const [error, setError] = useState('');
  
  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  React.useEffect(() => {
    setOpacity(1);
  }, []);

  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user in the passed list
    const foundUser = users.find(u => u.username === username);

    if (foundUser) {
        // Validate Password
        if (foundUser.password !== password) {
            setError('Senha incorreta / Incorrect password');
            return;
        }

        // Check if account is active
        if (!foundUser.isActive) {
            setError('Conta desativada / Account deactivated');
            return;
        }

        // Check for Provisional Password
        if (foundUser.isProvisionalPassword) {
            setCurrentUser(foundUser);
            setIsChangingPassword(true);
            return;
        }

        setOpacity(0);
        setTimeout(() => {
            onLogin(foundUser);
        }, 1000);
    } else {
        setError('Usuário não encontrado / User not found');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          setError(t.passwordMismatch);
          return;
      }
      if (currentUser) {
          const firstAccessDate = new Date().toISOString();
          onPasswordChange(currentUser.id, newPassword, true);
          setIsChangingPassword(false);
          setOpacity(0);
          setTimeout(() => {
              // Login with the updated user structure
              onLogin({
                ...currentUser, 
                password: newPassword, 
                isProvisionalPassword: false, 
                firstAccessDate: firstAccessDate 
              });
          }, 1000);
      }
  };

  if (isChangingPassword) {
      return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-100 transition-opacity duration-1000`} style={{ opacity }}>
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-orange-50 mb-4">
                        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin-slow" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{t.changePassword}</h2>
                    <p className="text-gray-500 text-sm mt-2">{t.provisionalPasswordNotice}</p>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPassword}</label>
                        <input
                            type="password"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
                        <input
                            type="password"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md"
                    >
                        {t.save}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 transition-opacity duration-1000`} style={{ opacity }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
           <div className="inline-block p-3 rounded-full bg-blue-50 mb-4">
             <UserIcon className="w-8 h-8 text-blue-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800">{t.login}</h2>
           <p className="text-gray-500 text-sm mt-2">{t.companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                <AlertCircle size={16} />
                {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <LogIn size={20} />
            {t.login}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;