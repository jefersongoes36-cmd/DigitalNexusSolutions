import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TimeRecord, SupportedLanguage, User } from '../types';
import { TRANSLATIONS } from '../constants';

export const calculateDuration = (startTime: string, endTime: string, lunchMinutes: number): number => {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  let duration = end - start - lunchMinutes;
  return duration > 0 ? duration / 60 : 0;
};

export const getGreeting = (lang: SupportedLanguage): string => {
  const hour = new Date().getHours();
  if (hour < 12) return TRANSLATIONS[lang].goodMorning;
  if (hour < 18) return TRANSLATIONS[lang].goodAfternoon;
  return TRANSLATIONS[lang].goodEvening;
};

export const formatCurrency = (value: number, currency: string, locale: string = 'pt-PT') => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
  } catch (error) {
    // Fallback in case of invalid currency code to prevent crash
    console.warn(`Invalid currency code: ${currency}. Falling back to simple formatting.`);
    return `${currency} ${value.toFixed(2)}`;
  }
};

// Helper to calculate totals
export const calculateTotals = (records: TimeRecord[], user: User) => {
  const totalHours = records.reduce((acc, curr) => {
    if (curr.isAbsent) return acc;
    return acc + calculateDuration(curr.startTime, curr.endTime, curr.lunchDuration);
  }, 0);

  const grossEarnings = totalHours * user.hourlyRate;
  
  // Calculate Global Profile Social Security Deduction
  let profileSSDeduction = 0;
  if (user.socialSecurity) {
    if (user.socialSecurity.type === 'percentage') {
       profileSSDeduction = grossEarnings * (user.socialSecurity.value / 100);
    } else {
       // Fixed value - applied if there is earnings
       profileSSDeduction = grossEarnings > 0 ? user.socialSecurity.value : 0;
    }
  }

  // Calculate Global Profile IRS Deduction
  let profileIRSDeduction = 0;
  if (user.irs) {
    if (user.irs.type === 'percentage') {
       profileIRSDeduction = grossEarnings * (user.irs.value / 100);
    } else {
       profileIRSDeduction = grossEarnings > 0 ? user.irs.value : 0;
    }
  }

  const totalManualSS = records.reduce((acc, curr) => acc + (curr.manualSocialSecurity || 0), 0);
  const totalAdvances = records.reduce((acc, curr) => acc + (curr.advance || 0), 0);
  
  const totalSS = profileSSDeduction + totalManualSS;
  const totalIRS = profileIRSDeduction;
  
  const netEarnings = Math.max(0, grossEarnings - totalSS - totalIRS - totalAdvances);

  return { totalHours, grossEarnings, totalAdvances, totalSS, totalIRS, netEarnings };
};

export const exportToPDF = (records: TimeRecord[], user: User, lang: SupportedLanguage) => {
  const doc = new jsPDF('l'); // Landscape for more columns
  const t = TRANSLATIONS[lang];
  const totals = calculateTotals(records, user);

  doc.setFontSize(18);
  doc.text(t.companyName, 14, 20);
  
  doc.setFontSize(14);
  doc.text(`${t.reports}: ${user.name}`, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`${t.date}: ${new Date().toLocaleDateString()}`, 14, 38);

  // Headers updated with Work Site and Notes
  const tableColumn = [
    t.date, 
    t.startTime, 
    t.endTime, 
    t.lunch, 
    t.hoursWorked, 
    t.advance, 
    t.workSite, 
    t.observations,
    t.status
  ];
  
  const tableRows: any[] = [];

  records.forEach(record => {
    const hours = calculateDuration(record.startTime, record.endTime, record.lunchDuration);
    const status = record.isAbsent ? t.absent : (hours >= 8 ? "OK" : "Partial");
    const advance = record.advance ? formatCurrency(record.advance, user.currency) : '-';
    
    const recordData = [
      record.date,
      record.startTime,
      record.endTime,
      record.lunchDuration,
      hours.toFixed(2),
      advance,
      record.workSite || '-',
      record.notes || '-',
      status
    ];
    tableRows.push(recordData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: { fontSize: 8 }, // Smaller font to fit more columns
    columnStyles: {
        7: { cellWidth: 40 } // Give more width to observations
    }
  });

  // Add Summary at the bottom
  // @ts-ignore - access finalY from lastAutoTable
  const finalY = (doc as any).lastAutoTable?.finalY || 50;
  let yPos = finalY + 15;

  // Check if we need a new page
  if (yPos > 180) { // Landscape height limit roughly
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro / Financial Summary", 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  yPos += 8;

  const summaryData = [
    { label: t.totalHours, value: `${totals.totalHours.toFixed(2)}h` },
    { label: t.grossEarnings, value: formatCurrency(totals.grossEarnings, user.currency) },
    { label: t.advancesReceived, value: formatCurrency(totals.totalAdvances, user.currency) },
    { label: t.socialSecurity, value: formatCurrency(totals.totalSS, user.currency) },
    { label: t.irs, value: formatCurrency(totals.totalIRS, user.currency) },
    { label: `${t.netEarnings} (Payout)`, value: formatCurrency(totals.netEarnings, user.currency) },
  ];

  summaryData.forEach((item) => {
    doc.text(`${item.label}:`, 14, yPos);
    doc.text(item.value, 80, yPos);
    yPos += 6;
  });

  doc.save(`timesheet_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (records: TimeRecord[], user: User, lang: SupportedLanguage) => {
  const t = TRANSLATIONS[lang];
  const totals = calculateTotals(records, user);

  // 1. Create Data Rows
  const worksheetData: any[] = records.map(record => {
    const hours = calculateDuration(record.startTime, record.endTime, record.lunchDuration);
    return {
      [t.date]: record.date,
      [t.startTime]: record.startTime,
      [t.endTime]: record.endTime,
      [t.lunch]: record.lunchDuration,
      [t.hoursWorked]: hours.toFixed(2),
      [t.advance]: record.advance || 0,
      [t.workSite]: record.workSite || '',
      [t.observations]: record.notes || '',
      [t.status]: record.isAbsent ? t.absent : (hours >= 8 ? "OK" : "Partial")
    };
  });

  // 2. Add Spacing Rows
  worksheetData.push({}); 
  worksheetData.push({}); 

  // 3. Add Summary Rows
  worksheetData.push({ [t.date]: "RESUMO / SUMMARY", [t.startTime]: "" });
  worksheetData.push({ [t.date]: t.totalHours, [t.startTime]: totals.totalHours.toFixed(2) + "h" });
  worksheetData.push({ [t.date]: t.grossEarnings, [t.startTime]: formatCurrency(totals.grossEarnings, user.currency) });
  worksheetData.push({ [t.date]: t.advancesReceived, [t.startTime]: formatCurrency(totals.totalAdvances, user.currency) });
  worksheetData.push({ [t.date]: t.socialSecurity, [t.startTime]: formatCurrency(totals.totalSS, user.currency) });
  worksheetData.push({ [t.date]: t.irs, [t.startTime]: formatCurrency(totals.totalIRS, user.currency) });
  worksheetData.push({ [t.date]: t.netEarnings, [t.startTime]: formatCurrency(totals.netEarnings, user.currency) });

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  
  // Adjust column widths slightly
  const wscols = [
    { wch: 12 }, // Date
    { wch: 10 }, // Start
    { wch: 10 }, // End
    { wch: 8 },  // Lunch
    { wch: 10 }, // Hours
    { wch: 10 }, // Advance
    { wch: 20 }, // Work Site
    { wch: 30 }, // Observations
    { wch: 12 }, // Status
  ];
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
  XLSX.writeFile(wb, `timesheet_${user.username}.xlsx`);
};

// Generate a JSON Backup file
export const generateBackupFile = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper for Tailwind classes based on attendance status
export const getStatusColor = (record: TimeRecord | undefined): string => {
  if (!record) return 'bg-white border-gray-200';
  if (record.isAbsent) return 'bg-red-100 border-red-400 text-red-700';
  
  const hours = calculateDuration(record.startTime, record.endTime, record.lunchDuration);
  if (hours >= 8) return 'bg-green-100 border-green-400 text-green-700';
  return 'bg-yellow-100 border-yellow-400 text-yellow-700';
};

// --- TRANSLATION SIMULATION SERVICE ---

// Dictionary for common phrases
const PHRASE_BOOK: { [key: string]: { [lang in SupportedLanguage]?: string } } = {
  "hello": { pt: "Olá", "pt-BR": "Olá", en: "Hello", it: "Ciao", fr: "Bonjour", es: "Hola", de: "Hallo" },
  "olá": { pt: "Olá", "pt-BR": "Olá", en: "Hello", it: "Ciao", fr: "Bonjour", es: "Hola", de: "Hallo" },
  "ciao": { pt: "Olá", "pt-BR": "Olá", en: "Hello", it: "Ciao", fr: "Bonjour", es: "Hola", de: "Hallo" },
  
  "bom dia": { pt: "Bom dia", "pt-BR": "Bom dia", en: "Good morning", it: "Buongiorno", fr: "Bonjour", es: "Buenos días", de: "Guten Morgen" },
  "good morning": { pt: "Bom dia", "pt-BR": "Bom dia", en: "Good morning", it: "Buongiorno", fr: "Bonjour", es: "Buenos días", de: "Guten Morgen" },
  "buongiorno": { pt: "Bom dia", "pt-BR": "Bom dia", en: "Good morning", it: "Buongiorno", fr: "Bonjour", es: "Buenos días", de: "Guten Morgen" },
  
  "boa tarde": { pt: "Boa tarde", "pt-BR": "Boa tarde", en: "Good afternoon", it: "Buon pomeriggio", fr: "Bon après-midi", es: "Buenas tardes", de: "Guten Tag" },
  "boa noite": { pt: "Boa noite", "pt-BR": "Boa noite", en: "Good evening", it: "Buonasera", fr: "Bonne soirée", es: "Buenas noches", de: "Guten Abend" },

  "trabalho": { pt: "Trabalho", "pt-BR": "Trabalho", en: "Work", it: "Lavoro", fr: "Travail", es: "Trabajo", de: "Arbeit" },
  "work": { pt: "Trabalho", "pt-BR": "Trabalho", en: "Work", it: "Lavoro", fr: "Travail", es: "Trabajo", de: "Arbeit" },
  "lavoro": { pt: "Trabalho", "pt-BR": "Trabalho", en: "Work", it: "Lavoro", fr: "Travail", es: "Trabajo", de: "Arbeit" },
  
  "obrigado": { pt: "Obrigado", "pt-BR": "Obrigado", en: "Thank you", it: "Grazie", fr: "Merci", es: "Gracias", de: "Danke" },
  "grazie": { pt: "Obrigado", "pt-BR": "Obrigado", en: "Thank you", it: "Grazie", fr: "Merci", es: "Gracias", de: "Danke" },
  "thank you": { pt: "Obrigado", "pt-BR": "Obrigado", en: "Thank you", it: "Grazie", fr: "Merci", es: "Gracias", de: "Danke" }
};

// Simulates a translation API call
export const simulateTranslation = async (text: string, fromLang: SupportedLanguage, toLang: SupportedLanguage): Promise<string> => {
  // If languages match, return original
  if (fromLang === toLang) return text;

  // Simple clean for dictionary lookup
  const cleanText = text.toLowerCase().trim();

  // 1. Check Dictionary
  if (PHRASE_BOOK[cleanText] && PHRASE_BOOK[cleanText]![toLang]) {
     // Simulate network delay for realism
     await new Promise(resolve => setTimeout(resolve, 300));
     return PHRASE_BOOK[cleanText]![toLang]!;
  }

  // 2. Fallback for demo: "Translate" visually by appending language tag
  // In a real app, this would call Google Translate API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return original text with a visual indicator that it was "processed" for that language
  return `${text}`;
};