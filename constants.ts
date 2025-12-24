
import { LanguageDictionary } from './types';

export const TESTIMONIALS = [
  {
    name: "Marco Aurélio",
    role: "Barbeiro Profissional",
    text: "O Digital Nexus facilitou imenso a gestão da minha barbearia. Consigo controlar as horas e as comissões dos cortes de forma impecável. Recomendo!",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=marco"
  },
  {
    name: "Joaquim 'Martelo' Silva",
    role: "Pedreiro de Alvenaria",
    text: "Trabalho em várias obras por hora. Este app é o meu braço direito para garantir que os patrões paguem cada hora certa. O PDF é muito profissional!",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=joaquim"
  },
  {
    name: "Vítor Mendes",
    role: "Pintor Decorativo",
    text: "Muito simples de usar mesmo com as mãos ocupadas. Marco a entrada e no fim do mês tenho o gráfico de quanto vou receber. Estava farto de cadernos!",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=vitor"
  },
  {
    name: "Sérgio Costa",
    role: "Especialista em Pladur",
    text: "A animação do calendário ajuda-me a ver logo se completei as 8 horas ou se faltei. Para quem ganha à hora, não há melhor ferramenta no mercado.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=sergio"
  },
  {
    name: "Tiago Pereira",
    role: "Servente de Construção",
    text: "Uso todos os dias. É rápido, não falha e as mensagens de bom dia dão sempre um ânimo para começar o trabalho pesado. Nota 10!",
    stars: 4,
    avatar: "https://i.pravatar.cc/150?u=tiago"
  },
  {
    name: "André Santos",
    role: "Técnico de Acabamentos",
    text: "O melhor investimento que fiz. Agora exporto o Excel e mando por WhatsApp para o encarregado. Tudo limpo e sem confusões.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=andre"
  },
  {
    name: "Daniel Lourenço",
    role: "Eletricista",
    text: "Consigo registar os diferentes locais onde trabalho no mesmo dia usando as observações. O controlo de vales é o que mais gosto.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=daniel"
  },
  {
    name: "Luís 'Picheleiro' Castro",
    role: "Encanador / Picheleiro",
    text: "O app é top! O relatório detalhado com o NIF ajuda-me muito a organizar as contas com os meus fornecedores e clientes.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=luis"
  },
  {
    name: "Beatriz Oliveira",
    role: "Serviços de Limpeza",
    text: "Trabalho em várias casas por hora. O Digital Nexus deixa-me marcar tudo certinho e nunca mais me esqueci de cobrar nenhum dia!",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=beatriz"
  },
  {
    name: "Fernando Carpinteiro",
    role: "Carpintaria Geral",
    text: "As cores do calendário facilitam muito. Se o dia está verde, estou descansado. Se está amarelo, sei que tenho de recuperar horas.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=fernando"
  },
  {
    name: "Hugo Montador",
    role: "Montagem de Móveis",
    text: "Simples, direto e eficiente. O suporte técnico é muito rápido a responder se tivermos alguma dúvida. Vale cada cêntimo!",
    stars: 4,
    avatar: "https://i.pravatar.cc/150?u=hugo"
  },
  {
    name: "Carlos Serralheiro",
    role: "Serralharia Civil",
    text: "Um app feito por quem entende quem trabalha no duro. A multi-moeda ajuda-me quando faço trabalhos fora de Portugal.",
    stars: 5,
    avatar: "https://i.pravatar.cc/150?u=serralheiro"
  }
];

export const HOLIDAYS_DB: { [countryCode: string]: { [date: string]: string } } = {
  PT: {
    '01-01': 'Ano Novo',
    '04-25': 'Dia da Liberdade',
    '05-01': 'Dia do Trabalhador',
    '06-10': 'Dia de Portugal',
    '08-15': 'Assunção de Nossa Senhora',
    '10-05': 'Implantação da República',
    '11-01': 'Dia de Todos os Santos',
    '12-01': 'Restauração da Independência',
    '12-08': 'Imaculada Conceição',
    '12-25': 'Natal'
  },
  BR: {
    '01-01': 'Confraternização Universal',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalho',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '11-20': 'Dia da Consciência Negra',
    '12-25': 'Natal'
  }
};

export const COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'United States' },
  { code: 'ES', name: 'España' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Deutschland' },
  { code: 'IT', name: 'Italia' },
  { code: 'NL', name: 'Nederland' },
];

export const MOTIVATIONAL_QUOTES: { [key: string]: string[] } = {
  pt: [
    "O success é a soma de pequenos esforços repetidos dia após dia.",
    "Acredite que você pode, assim você já está no meio do caminho.",
    "Seu trabalho vai preencher uma grande parte da sua vida, a única maneira de estar verdadeiramente satisfeito é fazer o que você acredita ser um ótimo trabalho.",
    "A persistência é o caminho do êxito.",
    "Hoje é um dia perfeito para começar a concretizar seus sonhos."
  ],
  "pt-BR": [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Acredite que você pode, assim você já está no meio do caminho.",
    "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
    "A persistência realiza o impossível.",
    "Hoje é um dia perfeito para começar a concretizar seus sonhos."
  ],
  en: [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Believe you can and you're halfway there.",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "Persistence is the path to success.",
    "Today is a perfect day to start making your dreams come true."
  ]
};

export const APP_SYSTEM_INSTRUCTION = `
You are "Axis", the intelligent support assistant for the "Digital Nexus TimeKeeper" application.
Your goal is to help users understand how to use the app.
Be concise, friendly, and helpful. Use the user's language.
`;

export const TRANSLATIONS: LanguageDictionary = {
  pt: {
    welcome: "Bem-vindo",
    goodMorning: "Bom dia",
    goodAfternoon: "Boa tarde",
    goodEvening: "Boa noite",
    login: "Entrar",
    username: "Utilizador",
    password: "Password",
    dashboard: "Início",
    reports: "Relatórios",
    profile: "Perfil",
    chat: "Chat / Network",
    help: "Ajuda",
    settings: "Definições",
    logout: "Sair",
    clockIn: "Registar Entrada",
    clockOut: "Registar Saída",
    date: "Data",
    startTime: "Hora Início",
    endTime: "Hora Fim",
    lunch: "Almoço (min)",
    notes: "Observações",
    save: "Guardar",
    cancel: "Cancelar",
    absent: "Marcar Falta",
    present: "Presente",
    totalHours: "Total de Horas",
    expectedHours: "Horas Esperadas",
    balance: "Saldo",
    exportPDF: "Exportar PDF",
    exportExcel: "Exportar Excel",
    mon: "Seg",
    tue: "Ter",
    wed: "Qua",
    thu: "Qui",
    fri: "Sex",
    sat: "Sáb",
    sun: "Dom",
    hoursWorked: "Horas Trabalhadas",
    dailyGoal: "Meta Diária (8h)",
    status: "Estado",
    editRecord: "Editar Registo",
    companyName: "Digital Nexus Solutions",
    adminDashboard: "Gestão de Assinaturas",
    activeSubscriptions: "Assinaturas Ativas",
    newSubscription: "Nova Assinatura",
    fullName: "Nome Completo",
    nif: "NIF",
    email: "Email",
    phone: "Telefone",
    hourlyRate: "Valor Hora",
    createAccount: "Criar Conta",
    noUsers: "Nenhum utilizador registado.",
    id: "ID",
    actions: "Ações",
    editUser: "Editar Utilizador",
    deleteUser: "Excluir",
    confirmDelete: "Tem a certeza que deseja excluir este utilizador?",
    generatedId: "ID Gerado",
    changePassword: "Alterar Password",
    newPassword: "Nova Password",
    confirmPassword: "Confirmar Password",
    passwordMismatch: "As passwords não coincidem",
    provisionalPasswordNotice: "Está a usar uma password provisória. Por favor, defina uma nova.",
    resetPassword: "Resetar Password (123)",
    passwordResetSuccess: "Password resetada para '123' com sucesso.",
    socialSecurity: "Segurança Social",
    irs: "IRS (Imposto)",
    socialSecurityManual: "Seg. Social (Manual)",
    advance: "Vale",
    advancesReceived: "Vales Recebidos",
    totalAdvances: "Total Vales",
    deductionType: "Tipo de Desconto",
    percentage: "Percentagem (%)",
    fixedValue: "Valor Fixo",
    value: "Valor",
    netEarnings: "Ganhos Líquidos",
    grossEarnings: "Ganhos Brutos",
    profileSettings: "Definições de Perfil",
    updateProfile: "Atualizar Perfil",
    profileUpdated: "Perfil atualizado com sucesso!",
    uploadPhoto: "Carregar Foto",
    removePhoto: "Remover Foto",
    photoDescription: "Carregue uma foto sua para personalizar o perfil.",
    typeMessage: "Escreva uma mensagem...",
    send: "Enviar",
    noMessages: "Nenhuma mensagem ainda. Diga olá!",
    country: "País",
    holiday: "Feriado",
    totalDays: "Dias Trabalhados",
    helpTitle: "Como podemos ajudar?",
    helpSubtitle: "Pergunte ao Axis, nosso Assistente Digital",
    contactSupport: "Contactar Suporte Humano",
    botPlaceholder: "Ex: Como exporto para PDF?",
    ticketCreated: "O seu pedido foi enviado para o suporte técnico. Entraremos em CONTACTO brevemente.",
    botName: "Axis",
    helpWelcome: "Olá! Sou o Axis, o seu assistente. Pode escrever no seu idioma — eu compreendo todos. Em que posso ajudar?",
    joinDiscount: "Quero aderir com DESCONTO!",
    alreadyActive: "Já ativei minha conta! Quero fazer Login",
    salesPageTitle: "Ative sua conta Digital Nexus",
    planMonthly: "Plano Mensal - Acesso Total",
    paymentMethod: "Método de Pagamento",
    mbway: "MBWAY",
    creditCard: "Cartão de Crédito",
    cardNumber: "Número do Cartão",
    expiryDate: "Validade (MM/AA)",
    cvv: "CVV",
    payAndActivate: "Pagar e Ativar Conta",
    processingPayment: "Processando pagamento...",
    paymentSuccess: "Pagamento confirmado! A sua conta foi criada.",
    mbwayNumber: "Número de Telemóvel MBWAY",
    planYearly: "Apenas 1 pagamento por ano",
    unlimitedAccess: "Acesso ILIMITADO",
    memberChat: "Chat entre membros",
    continueToPayment: "Continuar para Pagamento",
    back: "Voltar",
    limitedOfferApplied: "OFERTA LIMITADA aplicada",
    totalToday: "Total Hoje",
    perYear: "/ano",
    exportFeatures: "Exportar PDF/Excel",
    support247: "Suporte 24h/7",
    backupData: "Backup de Dados",
    backupSuccess: "Backup descarregado com sucesso!",
    restoreBackup: "Restaurar Backup",
    restoreSuccess: "Dados restaurados com sucesso!",
    invalidBackupFile: "Arquivo de backup inválido.",
    workSite: "Local/Serviço",
    observations: "Observações",
    subscriptionEnding: "Sua assinatura anual está a chegar ao fim.",
    daysRemaining: "dias restantes",
    renewNow: "Renovar Agora",
    awaitingFirstAccess: "Aguardando 1º Acesso"
  }
};