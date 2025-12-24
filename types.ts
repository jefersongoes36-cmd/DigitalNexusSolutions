
export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'master' | 'employee' | 'support';
  currency: string;
  language: SupportedLanguage;
  country: string;
  hourlyRate: number;
  nif?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  subscriptionDate?: string;
  firstAccessDate?: string; // Date when password was first changed
  isProvisionalPassword?: boolean;
  profilePicture?: string;
  socialSecurity?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  irs?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}

export interface TimeRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  lunchDuration: number;
  isAbsent: boolean;
  advance?: number;
  manualSocialSecurity?: number;
  workSite?: string;
  notes?: string;
}

export interface AvatarConfig {
  skinTone: string;
  profession: 'office' | 'construction' | 'crane' | 'electrician' | 'plumber' | 'carpenter';
  hairColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses';
  mouth: 'smile' | 'neutral' | 'braces';
  gender: 'male' | 'female';
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'resolved';
  createdAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  originalLanguage: SupportedLanguage;
}

export type SupportedLanguage = 
  | 'pt' | 'pt-BR' | 'en' | 'es' | 'fr' | 'it' | 'de' | 'nl' | 'ga' | 'hi' | 'ur' | 'ar';

export interface LanguageDictionary {
  [key: string]: {
    [key: string]: string;
  };
}

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
];

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'MAD', symbol: 'dh', name: 'Moroccan Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza' },
  { code: 'MZN', symbol: 'MT', name: 'Metical' },
];