import { useState, useRef, useEffect } from 'react';

// ─── DATI BASE ────────
const INITIAL_USERS = [
  {
    email: 'admin@edilslab.ch',
    password: 'admin123',
    role: 'admin',
    name: 'Tommaso Ferraris',
    status: 'approved',
  },
  {
    email: 'user@edilslab.ch',
    password: 'user123',
    role: 'user',
    name: 'Sara Fontana',
    status: 'approved',
  },
];
const INITIAL_PENDING = [
  {
    email: 'luca.ferrari@gmail.com',
    name: 'Luca Ferrari',
    password: 'test123',
    requestedAt: '18.05.2024',
  },
];
const CATEGORIES = [
  'Strutturale',
  'Impianti',
  'Normativa',
  'Sicurezza',
  'Contratti',
  'Cantiere',
];
const SAMPLE_DOCS = [
  {
    id: 1,
    name: 'Capitolato_Appalto_2024.pdf',
    category: 'Contratti',
    tag: 'PDF',
    size: '2.4 MB',
    date: '12.03.2024',
    color: '#ef4444',
    readable: true,
  },
  {
    id: 2,
    name: 'Piano_Sicurezza.pdf',
    category: 'Sicurezza',
    tag: 'PDF',
    size: '1.1 MB',
    date: '05.04.2024',
    color: '#ef4444',
    readable: true,
  },
  {
    id: 3,
    name: 'Relazione_Strutturale.pdf',
    category: 'Strutturale',
    tag: 'PDF',
    size: '4.7 MB',
    date: '20.04.2024',
    color: '#ef4444',
    readable: true,
  },
  {
    id: 4,
    name: 'Computo_Metrico.xlsx',
    category: 'Cantiere',
    tag: 'XLSX',
    size: '890 KB',
    date: '01.05.2024',
    color: '#059669',
    readable: true,
  },
];
const HISTORY = [
  { id: 1, title: 'Normativa SIA 118', date: 'ieri' },
  { id: 2, title: 'Checklist collaudo', date: '2 giorni fa' },
];
const ENTI = [
  {
    nome: 'SIA',
    url: 'https://www.sia.ch',
    desc: 'Norme tecniche',
    color: '#3b82f6',
  },
  {
    nome: 'SUVA',
    url: 'https://www.suva.ch',
    desc: 'Sicurezza lavoro',
    color: '#ef4444',
  },
  {
    nome: 'UPI',
    url: 'https://www.upi.ch',
    desc: 'Prevenzione',
    color: '#f59e0b',
  },
  {
    nome: 'SSIC',
    url: 'https://www.ssic.ch',
    desc: 'Costruttori',
    color: '#10b981',
  },
  {
    nome: 'simap',
    url: 'https://www.simap.ch',
    desc: 'Appalti pubblici',
    color: '#8b5cf6',
  },
  {
    nome: 'admin.ch',
    url: 'https://www.admin.ch',
    desc: 'Leggi federali',
    color: '#06b6d4',
  },
  {
    nome: 'Canton TI',
    url: 'https://www.ti.ch',
    desc: 'Normativa cantonale',
    color: '#64748b',
  },
];
const getEnti = (t) => {
  const tx = t.toLowerCase();
  const m = [];
  if (
    tx.includes('sia') ||
    tx.includes('struttur') ||
    tx.includes('calcestruzzo')
  )
    m.push('SIA');
  if (
    tx.includes('suva') ||
    tx.includes('sicurezza') ||
    tx.includes('dpi') ||
    tx.includes('quota')
  )
    m.push('SUVA');
  if (tx.includes('upi') || tx.includes('prevenzione')) m.push('UPI');
  if (tx.includes('appalto') || tx.includes('lcpubb') || tx.includes('bando'))
    m.push('simap');
  if (tx.includes('ssic') || tx.includes('impresa')) m.push('SSIC');
  if (tx.includes('legge') || tx.includes('federale')) m.push('admin.ch');
  if (tx.includes('ticino') || tx.includes('canton')) m.push('Canton TI');
  return [...new Set(m.length ? m : ['SIA', 'SUVA'])];
};

const NOTE =
  ' Le informazioni hanno carattere orientativo. Consultare sempre le norme ufficiali SIA su sia.ch e un professionista abilitato.';
const RDOCS = [
  'Dai documenti caricati emerge che la responsabilita dell appaltatore e disciplinata dalla normativa applicabile. Per i dettagli consultare il testo integrale della norma ufficiale.' +
    NOTE,
  'Il documento contiene indicazioni sulle misure di protezione per lavori in quota. Per i requisiti tecnici fare riferimento alle direttive SUVA su suva.ch.' +
    NOTE,
  'La documentazione fa riferimento alle norme SIA per il calcolo delle azioni. Per valori specifici consultare le norme SIA ufficiali.' +
    NOTE,
  'Il computo riporta le lavorazioni con i relativi importi. Per la verifica dei prezzi consultare il listino NPK ufficiale aggiornato.' +
    NOTE,
];
const RGEN = [
  'La norma SIA 261 tratta le azioni sulle strutture portanti ed e il riferimento per la progettazione strutturale in Svizzera. Per i valori tecnici specifici consultare la norma ufficiale su sia.ch.' +
    NOTE,
  'La LCPubb regola le procedure di appalto pubblico in Ticino. Per le soglie aggiornate fare riferimento alla versione vigente su ti.ch e al portale simap.ch.' +
    NOTE,
  'La norma SIA 262 e il riferimento per la progettazione di strutture in calcestruzzo armato. Per i requisiti tecnici consultare la norma ufficiale SIA 262 su sia.ch.' +
    NOTE,
  'La SUVA pubblica direttive per la sicurezza sui cantieri. Per i requisiti tecnici fare riferimento alle direttive SUVA aggiornate su suva.ch.' +
    NOTE,
];
const RPHOTO = [
  'Dall immagine rilevo una possibile fessurazione. Ti consiglio di documentarla e consultare un tecnico abilitato.' +
    NOTE,
  'L immagine mostra una zona con copriferro potenzialmente insufficiente. Per i requisiti fare riferimento alla norma SIA 262 su sia.ch.' +
    NOTE,
  'Dalla foto si nota presenza di umidita. Per i criteri di impermeabilizzazione fare riferimento alla norma SIA 272 su sia.ch.' +
    NOTE,
];
const REMAILS = [
  {
    ogg: 'Richiesta offerta opere murarie',
    corpo:
      'Gentile Sig./Sig.ra,\n\nLa contatto per richiedere un offerta per le seguenti opere murarie:\n\n- Muratura perimetrale\n- Intonaci interni ed esterni\n- Pavimentazioni\n\nLe chiedo di inviarci la Sua migliore offerta entro il [DATA].\n\nCordiali saluti,\n[NOME]\n[AZIENDA]',
  },
  {
    ogg: 'Convocazione riunione di cantiere',
    corpo:
      'Gentili colleghi,\n\nVi convoco alla riunione di cantiere del [DATA] alle [ORA] presso [LUOGO].\n\nOrdine del giorno:\n1. Avanzamento lavori\n2. Problematiche\n3. Prossime fasi\n\nConfermare partecipazione entro [DATA].\n\nCordiali saluti,\n[NOME]\nDirettore Lavori',
  },
  {
    ogg: 'Segnalazione non conformita',
    corpo:
      'Gentile [DESTINATARIO],\n\nIn seguito all ispezione del [DATA] presso [LUOGO], si segnalano le seguenti non conformita:\n\n1. [NON CONFORMITA 1]\n2. [NON CONFORMITA 2]\n\nSi richiede di provvedere entro il [TERMINE].\n\nCordiali saluti,\n[NOME]',
  },
];
const EXT_COLOR = {
  PDF: '#ef4444',
  DOCX: '#2563eb',
  DOC: '#2563eb',
  XLSX: '#059669',
  XLS: '#059669',
  PPTX: '#d97706',
  PPT: '#d97706',
  CSV: '#0891b2',
  TXT: '#64748b',
  JPG: '#7c3aed',
  JPEG: '#7c3aed',
  PNG: '#7c3aed',
  DWG: '#94a3b8',
  DXF: '#94a3b8',
};
const EXT_READ = {
  PDF: true,
  DOCX: true,
  DOC: true,
  XLSX: true,
  XLS: true,
  PPTX: true,
  PPT: true,
  CSV: true,
  TXT: true,
  JPG: true,
  JPEG: true,
  PNG: true,
  DWG: false,
  DXF: false,
};

// ─── REPORT TEMPLATES ────────────────────────────────────────────────────────
const TMPLS = [
  {
    id: 'perizia',
    label: 'Perizia Strutturale',
    icon: 'building',
    color: '#2563eb',
    desc: 'Valutazione stato di conservazione strutturale',
    fields: [
      { k: 'oggetto', l: 'Oggetto', ph: 'es. Edificio via Lugano 12' },
      { k: 'committente', l: 'Committente', ph: 'Nome' },
      { k: 'data', l: 'Data sopralluogo', ph: 'gg.mm.aaaa' },
      {
        k: 'elementi',
        l: 'Elementi esaminati',
        ph: 'Pilastri, soletta...',
        ta: true,
      },
      {
        k: 'anomalie',
        l: 'Anomalie riscontrate',
        ph: 'Fessurazioni...',
        ta: true,
      },
      { k: 'causa', l: 'Causa presunta', ph: 'Ritiro plastico...', ta: true },
      {
        k: 'interventi',
        l: 'Interventi consigliati',
        ph: 'Risanamento copriferro...',
        ta: true,
      },
      { k: 'urgenza', l: 'Urgenza', ph: 'Immediata / 3 mesi / Monitoraggio' },
      { k: 'perito', l: 'Perito', ph: 'Nome e qualifica' },
    ],
  },
  {
    id: 'ispezione',
    label: 'Rapporto di Ispezione',
    icon: 'search',
    color: '#7c3aed',
    desc: 'Verbale ispezione cantiere',
    fields: [
      { k: 'cantiere', l: 'Cantiere', ph: 'Nuova costruzione, Locarno' },
      { k: 'committente', l: 'Committente', ph: 'Nome' },
      { k: 'appaltatore', l: 'Appaltatore', ph: 'Impresa esecutrice' },
      { k: 'data', l: 'Data', ph: 'gg.mm.aaaa' },
      { k: 'presenti', l: 'Presenti', ph: 'DL Ing. Rossi...' },
      {
        k: 'avanzamento',
        l: 'Avanzamento lavori',
        ph: 'Stato attuale',
        ta: true,
      },
      { k: 'conformita', l: 'Conformita', ph: 'Elementi conformi', ta: true },
      { k: 'nc', l: 'Non conformita', ph: 'Anomalie riscontrate', ta: true },
      {
        k: 'prescrizioni',
        l: 'Prescrizioni',
        ph: 'Azioni richieste',
        ta: true,
      },
      { k: 'prossima', l: 'Prossima ispezione', ph: 'Data o evento' },
    ],
  },
  {
    id: 'collaudo',
    label: 'Rapporto di Collaudo',
    icon: 'check',
    color: '#059669',
    desc: 'Verbale collaudo finale con esito',
    fields: [
      { k: 'opera', l: 'Opera', ph: 'Solaio piano primo' },
      { k: 'committente', l: 'Committente', ph: 'Nome' },
      { k: 'esecutore', l: 'Esecutore', ph: 'Ragione sociale' },
      { k: 'data', l: 'Data', ph: 'gg.mm.aaaa' },
      { k: 'normativa', l: 'Normativa', ph: 'SIA 260, SIA 262' },
      {
        k: 'prove',
        l: 'Prove eseguite',
        ph: 'Carotaggio, prova di carico',
        ta: true,
      },
      { k: 'risultati', l: 'Risultati', ph: 'Esiti delle prove', ta: true },
      { k: 'difetti', l: 'Difetti residui', ph: 'Nessuno o elenco', ta: true },
      { k: 'esito', l: 'Esito', ph: 'Positivo / Con riserve / Negativo' },
      { k: 'collaudatore', l: 'Collaudatore', ph: 'Nome e qualifica' },
    ],
  },
  {
    id: 'libero',
    label: 'Rapporto Libero AI',
    icon: 'spark',
    color: '#d97706',
    desc: 'Descrivi, l AI genera il rapporto completo',
    fields: [
      {
        k: 'desc',
        l: 'Descrivi la situazione',
        ph: 'Ho effettuato un sopralluogo...',
        ta: true,
        rows: 6,
      },
      { k: 'tipo', l: 'Tipo di rapporto', ph: 'Perizia strutturale' },
      { k: 'dest', l: 'Destinatario', ph: 'Committente, Comune' },
    ],
  },
];
const genReport = (tmpl, f) => {
  const d = new Date().toLocaleDateString('it-CH');
  const disc =
    '\n\n---\nNOTA: Informazioni orientative. Consultare norme SIA ufficiali su sia.ch e un professionista abilitato.';
  if (tmpl.id === 'libero')
    return (
      'RELAZIONE TECNICA\nData: ' +
      d +
      '\nDestinatario: ' +
      (f.dest || '---') +
      '\n\nOGGETTO: ' +
      (f.tipo || 'Rapporto tecnico') +
      '\n\nSITUAZIONE\n' +
      (f.desc || '---') +
      '\n\nVALUTAZIONE\nLe anomalie descritte richiedono analisi approfondita da un professionista qualificato.\n\nRACCOMANDAZIONI\n- Indagine diagnostica\n- Monitoraggio continuo\n- Coinvolgimento tecnico abilitato' +
      disc
    );
  if (tmpl.id === 'perizia')
    return (
      'PERIZIA STRUTTURALE\nData: ' +
      d +
      '\nPerito: ' +
      (f.perito || '---') +
      '\n\nOGGETTO: ' +
      (f.oggetto || '---') +
      '\nCOMMITTENTE: ' +
      (f.committente || '---') +
      '\nDATA SOPRALLUOGO: ' +
      (f.data || '---') +
      '\n\nELEMENTI ESAMINATI\n' +
      (f.elementi || '---') +
      '\n\nANOMALIE RISCONTRATE\n' +
      (f.anomalie || '---') +
      '\n\nCAUSA PRESUNTA\n' +
      (f.causa || '---') +
      '\n\nINTERVENTI CONSIGLIATI\n' +
      (f.interventi || '---') +
      '\n\nURGENZA: ' +
      (f.urgenza || '---') +
      '\n\nFirma: ___________________' +
      disc
    );
  if (tmpl.id === 'ispezione')
    return (
      'RAPPORTO DI ISPEZIONE\nData: ' +
      (f.data || d) +
      '\n\nCANTIERE: ' +
      (f.cantiere || '---') +
      '\nCOMMITTENTE: ' +
      (f.committente || '---') +
      '\nAPPALTATORE: ' +
      (f.appaltatore || '---') +
      '\nPRESENTI: ' +
      (f.presenti || '---') +
      '\n\nAVANZAMENTO\n' +
      (f.avanzamento || '---') +
      '\n\nCONFORMITA\n' +
      (f.conformita || '---') +
      '\n\nNON CONFORMITA\n' +
      (f.nc || 'Nessuna.') +
      '\n\nPRESCRIZIONI\n' +
      (f.prescrizioni || '---') +
      '\n\nPROSSIMA ISPEZIONE: ' +
      (f.prossima || '---') +
      '\n\nFirma DL: ___________________' +
      disc
    );
  return (
    'RAPPORTO DI COLLAUDO\nData: ' +
    (f.data || d) +
    '\n\nOPERA: ' +
    (f.opera || '---') +
    '\nCOMMITTENTE: ' +
    (f.committente || '---') +
    '\nESECUTORE: ' +
    (f.esecutore || '---') +
    '\nNORMATIVA: ' +
    (f.normativa || '---') +
    '\n\nPROVE\n' +
    (f.prove || '---') +
    '\n\nRISULTATI\n' +
    (f.risultati || '---') +
    '\n\nDIFETTI\n' +
    (f.difetti || 'Nessuno.') +
    '\n\nESITO: ' +
    (f.esito || '---') +
    '\nCOLLAUDATORE: ' +
    (f.collaudatore || '---') +
    '\n\nFirma: ___________________' +
    disc
  );
};

// ─── GARE ─────────────────────────────────────────────────────────────────────
const GARE_INIT = [
  {
    id: 1,
    nome: 'Opere murarie Cantiere A',
    desc: 'Muratura, intonaci, pavimenti',
    data: '12.05.2024',
    stato: 'chiusa',
    offerte: [
      { id: 1, ditta: 'Costruzioni Rossi SA', importo: '48500', note: '90gg' },
      { id: 2, ditta: 'Impresa Bianchi Sagl', importo: '52300', note: '75gg' },
      { id: 3, ditta: 'Edil Ferrari', importo: '45900', note: '100gg' },
      { id: 4, ditta: 'Costruzioni Verdi SA', importo: '51200', note: '' },
    ],
  },
  {
    id: 2,
    nome: 'Impianto idraulico Edificio B',
    desc: 'Sanitario e riscaldamento',
    data: '20.05.2024',
    stato: 'aperta',
    offerte: [
      { id: 1, ditta: 'Termosanitaria Luini', importo: '31800', note: '' },
      {
        id: 2,
        ditta: 'Impianti Generosi SA',
        importo: '29400',
        note: 'Mat. esclusi',
      },
    ],
  },
];

// ─── GANTT ────────────────────────────────────────────────────────────────────
const DEFAULT_FESTIVI = [
  '2026-01-01',
  '2026-01-06',
  '2026-04-03',
  '2026-04-06',
  '2026-05-01',
  '2026-05-14',
  '2026-05-25',
  '2026-06-11',
  '2026-08-01',
  '2026-08-15',
  '2026-11-01',
  '2026-12-08',
  '2026-12-25',
  '2026-12-26',
];

// Palette colori per il Gantt con nome, valore hex e colore chiaro per testo
const GANTT_COLORS = [
  { hex: '#2563eb', label: 'Blu' },
  { hex: '#7c3aed', label: 'Viola' },
  { hex: '#059669', label: 'Verde' },
  { hex: '#d97706', label: 'Arancio' },
  { hex: '#0891b2', label: 'Ciano' },
  { hex: '#dc2626', label: 'Rosso' },
  { hex: '#475569', label: 'Grigio' },
  { hex: '#db2777', label: 'Rosa' },
  { hex: '#ea580c', label: 'Arancio scuro' },
  { hex: '#65a30d', label: 'Verde lime' },
  { hex: '#0284c7', label: 'Azzurro' },
  { hex: '#7e22ce', label: 'Indaco' },
];

function addDays(ds, n) {
  const d = new Date(ds);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}
function fmtD(ds) {
  return new Date(ds).toLocaleDateString('it-CH', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
function fmtDLong(ds) {
  return new Date(ds).toLocaleDateString('it-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function diffD(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}
// Durata flessibile: 2h=2 ore, 0.5=mezza giornata, 3=3 giorni, 2w=2 settimane, 1m=1 mese
// Internamente tutto in giorni (float). 1 giorno = esattamente quel giorno (fine=inizio).
// Sabato (6) e domenica (0) sempre esclusi.
function parseDurata(val) {
  if (val === null || val === undefined) return 1;
  const s = String(val).trim().toLowerCase();
  if (s.endsWith('h')) {
    const h = parseFloat(s);
    return h / 8;
  } // 8h = 1 giorno
  if (s.endsWith('w')) {
    const w = parseFloat(s);
    return w * 5;
  } // 1 settimana = 5 gg lav.
  if (s.endsWith('m')) {
    const m = parseFloat(s);
    return m * 22;
  } // 1 mese ≈ 22 gg lav.
  return parseFloat(s) || 1;
}
function fmtDurata(gg) {
  if (gg < 1) {
    const h = Math.round(gg * 8 * 10) / 10;
    return h + 'h';
  }
  if (gg >= 22 && gg % 22 === 0) {
    return gg / 22 + 'm';
  }
  if (gg >= 5 && gg % 5 === 0) {
    return gg / 5 + 'w';
  }
  return gg % 1 === 0 ? String(gg) : gg.toFixed(1) + 'gg';
}
function isWorkDay(ds, fs) {
  const d = new Date(ds);
  const w = d.getDay();
  return w !== 0 && w !== 6 && !fs.has(ds);
}
function nextWorkDay(ds, fs) {
  let d = new Date(ds);
  while (true) {
    const s = d.toISOString().split('T')[0];
    if (isWorkDay(s, fs)) return s;
    d.setDate(d.getDate() + 1);
  }
}
function addWorkDays(ds, n, fs) {
  // n può essere float (es. 0.5 = mezza giornata = stesso giorno)
  const days = parseDurata(n);
  if (days <= 1) return ds; // 1 giorno o meno = stessa data (lavori in quel giorno)
  let d = new Date(ds);
  let added = 0;
  while (added < days - 1) {
    d.setDate(d.getDate() + 1);
    const s = d.toISOString().split('T')[0];
    if (isWorkDay(s, fs)) added++;
  }
  return d.toISOString().split('T')[0];
}
function countWorkDays(a, b, fs) {
  if (a === b) return 1; // stesso giorno = 1 giorno
  let d = new Date(a);
  const e = new Date(b);
  let c = 0;
  while (d <= e) {
    const s = d.toISOString().split('T')[0];
    if (isWorkDay(s, fs)) c++;
    d.setDate(d.getDate() + 1);
  }
  return Math.max(1, c);
}

const AI_TEMPLATES = {
  residenziale: [
    {
      nome: 'PROGETTAZIONE E PERMESSI',
      durata: 30,
      color: '#2563eb',
      subs: ['Progetto esecutivo', 'Richiesta permessi', 'Approvazione'],
    },
    {
      nome: 'PREPARAZIONE CANTIERE',
      durata: 5,
      color: '#7c3aed',
      subs: ['Installazione cantiere', 'Recinzioni e ponteggi'],
    },
    {
      nome: 'OPERE DI SCAVO',
      durata: 10,
      color: '#059669',
      subs: ['Scavi fondazioni', 'Smaltimento terra'],
    },
    {
      nome: 'FONDAZIONI',
      durata: 12,
      color: '#d97706',
      subs: ['Armatura fondazioni', 'Getto calcestruzzo', 'Stagionatura'],
    },
    {
      nome: 'STRUTTURA',
      durata: 40,
      color: '#0891b2',
      subs: [
        'Pilastri piano 1',
        'Solaio piano 1',
        'Pilastri piano 2',
        'Solaio piano 2',
      ],
    },
    {
      nome: 'TAMPONAMENTI',
      durata: 20,
      color: '#dc2626',
      subs: ['Muratura esterna', 'Muratura interna'],
    },
    {
      nome: 'IMPIANTI',
      durata: 25,
      color: '#475569',
      subs: ['Impianto elettrico', 'Impianto idraulico', 'Riscaldamento'],
    },
    {
      nome: 'FINITURE',
      durata: 30,
      color: '#2563eb',
      subs: ['Intonaci', 'Pavimenti', 'Tinteggiature', 'Infissi'],
    },
  ],
  ristrutturazione: [
    {
      nome: 'PONTEGGI',
      durata: 5,
      color: '#2563eb',
      subs: ['Installazione ponteggio', 'Smontaggio ponteggio'],
    },
    {
      nome: 'DEMOLIZIONI',
      durata: 10,
      color: '#dc2626',
      subs: [
        'Rimozione finiture',
        'Demolizioni murarie',
        'Smaltimento macerie',
      ],
    },
    {
      nome: 'OPERE STRUTTURALI',
      durata: 15,
      color: '#7c3aed',
      subs: ['Consolidamenti', 'Nuove aperture', 'Solai'],
    },
    {
      nome: 'IMPIANTI',
      durata: 20,
      color: '#059669',
      subs: ['Impianto elettrico', 'Impianto idraulico'],
    },
    {
      nome: 'FINITURE',
      durata: 25,
      color: '#d97706',
      subs: ['Intonaci', 'Pavimenti', 'Tinteggiature'],
    },
  ],
  copertura: [
    {
      nome: 'PONTEGGI',
      durata: 5,
      color: '#2563eb',
      subs: ['Installazione ponteggio', 'Smontaggio ponteggio'],
    },
    {
      nome: 'RIMOZIONE MANTO',
      durata: 8,
      color: '#dc2626',
      subs: ['Rimozione tegole', 'Rimozione listelli', 'Smaltimento'],
    },
    {
      nome: 'STRUTTURA TETTO',
      durata: 10,
      color: '#7c3aed',
      subs: ['Ispezione struttura', 'Riparazione travatura'],
    },
    {
      nome: 'IMPERMEABILIZZAZIONE',
      durata: 6,
      color: '#059669',
      subs: ['Posa barriera vapore', 'Posa isolamento', 'Posa guaina'],
    },
    {
      nome: 'NUOVO MANTO',
      durata: 10,
      color: '#d97706',
      subs: ['Posa listelli', 'Posa tegole', 'Colmo e gronde'],
    },
    {
      nome: 'LATTONERIE',
      durata: 5,
      color: '#0891b2',
      subs: ['Gronde', 'Pluviali', 'Raccordi'],
    },
  ],
  impermeabilizzazione: [
    {
      nome: 'PONTEGGI',
      durata: 5,
      color: '#2563eb',
      subs: ['Installazione ponteggio', 'Smontaggio ponteggio'],
    },
    {
      nome: 'DEMOLIZIONI',
      durata: 6,
      color: '#dc2626',
      subs: ['Rimozione strati esistenti', 'Smaltimento'],
    },
    {
      nome: 'PREPARAZIONE SUPPORTO',
      durata: 4,
      color: '#7c3aed',
      subs: ['Rilievo altimetrico', 'Trattamento supporto'],
    },
    {
      nome: 'IMPERMEABILIZZAZIONE',
      durata: 12,
      color: '#059669',
      subs: [
        'Posa barriera vapore',
        'Posa isolamento pendenziato',
        'Impermeabilizzazione a due strati',
        'Posa strati protezione',
      ],
    },
    {
      nome: 'LATTONERIE',
      durata: 5,
      color: '#0891b2',
      subs: ['Scossaline', 'Raccordi', 'Griglie'],
    },
    {
      nome: 'RIPRISTINO FINITURE',
      durata: 5,
      color: '#d97706',
      subs: ['Posa ghiaia/protezione', 'Riposizionamento elementi'],
    },
  ],
  facciata: [
    {
      nome: 'PONTEGGI',
      durata: 6,
      color: '#2563eb',
      subs: ['Installazione ponteggio', 'Smontaggio ponteggio'],
    },
    {
      nome: 'DIAGNOSI E PREPARAZIONE',
      durata: 5,
      color: '#7c3aed',
      subs: ['Ispezione facciate', 'Rimozione parti distaccate'],
    },
    {
      nome: 'RISANAMENTO',
      durata: 15,
      color: '#dc2626',
      subs: [
        'Riparazione crepe',
        'Trattamento superfici',
        'Applicazione rasante',
      ],
    },
    {
      nome: 'ISOLAMENTO',
      durata: 12,
      color: '#059669',
      subs: [
        'Posa pannelli isolanti',
        'Rete di armatura',
        'Intonaco di finitura',
      ],
    },
    {
      nome: 'TINTEGGIATURA',
      durata: 8,
      color: '#d97706',
      subs: ['Mano a fondo', 'Mano finale', 'Ritocchi'],
    },
  ],
  sottosuolo: [
    {
      nome: 'SCAVI E SBANCAMENTI',
      durata: 15,
      color: '#dc2626',
      subs: ['Scavo a cielo aperto', 'Smaltimento terra'],
    },
    {
      nome: 'STRUTTURE INTERRATE',
      durata: 20,
      color: '#2563eb',
      subs: ['Armatura pareti', 'Getto pareti', 'Solaio interrato'],
    },
    {
      nome: 'IMPERMEABILIZZAZIONE',
      durata: 8,
      color: '#059669',
      subs: ['Guaina esterna', 'Drenaggio perimetrale'],
    },
    {
      nome: 'IMPIANTI INTERRATI',
      durata: 10,
      color: '#7c3aed',
      subs: ['Fognature', 'Condotte tecniche'],
    },
    {
      nome: 'RINTERRI',
      durata: 5,
      color: '#d97706',
      subs: ['Rinterro a strati', 'Compattazione'],
    },
  ],
  personalizzato: [
    {
      nome: 'FASE 1',
      durata: 10,
      color: '#2563eb',
      subs: ['Attivita 1.1', 'Attivita 1.2'],
    },
    {
      nome: 'FASE 2',
      durata: 15,
      color: '#7c3aed',
      subs: ['Attivita 2.1', 'Attivita 2.2', 'Attivita 2.3'],
    },
    {
      nome: 'FASE 3',
      durata: 10,
      color: '#059669',
      subs: ['Attivita 3.1', 'Attivita 3.2'],
    },
  ],
};

// ─── TEMA ─────────────────────────────────────────────────────────────────────
const T = {
  sidebar: '#0d1117',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  surface: '#e2e7ef',
  surfaceAlt: '#d6dce6',
  border: '#c4ccd8',
  blue: '#2563eb',
  purple: '#7c3aed',
  green: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  text: '#0f172a',
  textSub: '#64748b',
  textMuted: '#94a3b8',
  gradBlue: 'linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)',
  gradDark: 'linear-gradient(135deg,#0d1117,#1e293b,#0f172a)',
  gradPurple: 'linear-gradient(135deg,#4c1d95,#7c3aed)',
  shadow: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.10)',
  shadowLg: '0 20px 60px rgba(0,0,0,0.25)',
};

// ─── ICONE ────────────────────────────────────────────────────────────────────
const PATHS = {
  home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  docs: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  send: 'M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z',
  search: 'M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35',
  file: 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7',
  check: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  building: ['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10'],
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  users: [
    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
    'M23 21v-2a4 4 0 00-3-3.87',
    'M16 3.13a4 4 0 010 7.75',
    'M9 11a4 4 0 100-8 4 4 0 000 8z',
  ],
  folder:
    'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  camera:
    'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z',
  menu: 'M3 12h18 M3 6h18 M3 18h18',
  close: 'M18 6L6 18 M6 6l12 12',
  trash: 'M3 6h18 M19 6l-1 14H6L5 6 M8 6V4h8v2',
  plus: 'M12 5v14 M5 12h14',
  podio: 'M8 21V11H3v10h5z M13 21V3h-2v18h2z M21 21V8h-5v13h5z',
  gantt: 'M3 5h18v3H3z M3 10h13v3H3z M3 15h16v3H3z',
  link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  eyeoff: [
    'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94',
    'M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24',
    'M1 1l22 22',
  ],
  spark: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  palette:
    'M12 2a10 10 0 100 20 10 10 0 000-20z M8 12a1 1 0 100-2 1 1 0 000 2z M12 8a1 1 0 100-2 1 1 0 000 2z M16 12a1 1 0 100-2 1 1 0 000 2z M12 16a1 1 0 100-2 1 1 0 000 2z',
  drag: 'M8 6h2 M8 10h2 M8 14h2 M14 6h2 M14 10h2 M14 14h2',
  copy: 'M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2 M8 4a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2z',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  arrowUp: 'M18 15l-6-6-6 6',
  arrowDown: 'M6 9l6 6 6-6',
  info: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 16v-4 M12 8h.01',
};

const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
}

const inp = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #c4ccd8',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: T.text,
  background: '#dce1ea',
};
const btnP = {
  width: '100%',
  padding: 12,
  background: T.gradBlue,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

// ─── COLOR PICKER DROPDOWN ────────────────────────────────────────────────────
function ColorPicker({ value, onChange, size = 'md' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const isSmall = size === 'sm';

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = GANTT_COLORS.find((c) => c.hex === value) || GANTT_COLORS[0];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: isSmall ? '4px 8px' : '9px 12px',
          border: '1.5px solid ' + T.border,
          borderRadius: 10,
          background: '#dce1ea',
          userSelect: 'none',
          minWidth: isSmall ? 80 : 130,
        }}
        title="Scegli colore"
      >
        <div
          style={{
            width: isSmall ? 14 : 18,
            height: isSmall ? 14 : 18,
            borderRadius: 4,
            background: current.hex,
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.15)',
          }}
        />
        {!isSmall && (
          <span style={{ fontSize: 13, color: T.text, flex: 1 }}>
            {current.label}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.textMuted}
          strokeWidth="2"
        >
          <path d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: '#fff',
            border: '1.5px solid ' + T.border,
            borderRadius: 12,
            padding: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            minWidth: 180,
          }}
        >
          {GANTT_COLORS.map((c) => (
            <div
              key={c.hex}
              onClick={() => {
                onChange(c.hex);
                setOpen(false);
              }}
              title={c.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 4px',
                borderRadius: 8,
                cursor: 'pointer',
                background: value === c.hex ? c.hex + '20' : 'transparent',
                border:
                  value === c.hex
                    ? '2px solid ' + c.hex
                    : '2px solid transparent',
                transition: 'all 0.1s',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: c.hex,
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow:
                    value === c.hex ? '0 0 0 2px ' + c.hex + '40' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: T.textSub,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function Homepage({ onLogin, onRegister }) {
  const mob = useIsMobile();
  return (
    <div
      style={{
        fontFamily: "'Inter',-apple-system,sans-serif",
        background: '#c8d0dc',
        minHeight: '100vh',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 62,
          borderBottom: '1px solid #b8c2d0',
          position: 'sticky',
          top: 0,
          background: 'rgba(200,208,220,0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: T.gradBlue,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d={PATHS.building} size={17} stroke="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: T.text }}>
            Edilslab
          </span>
        </div>
        <button
          onClick={onLogin}
          style={{
            padding: '9px 22px',
            background: T.gradBlue,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Accedi
        </button>
      </nav>
      <div
        style={{
          background: T.gradDark,
          padding: mob ? '56px 20px 64px' : '80px 40px 96px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background:
              'radial-gradient(circle,rgba(37,99,235,0.15),transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            background: 'rgba(37,99,235,0.15)',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 20,
            border: '1px solid rgba(37,99,235,0.3)',
            color: '#93c5fd',
          }}
        >
          <Icon d={PATHS.spark} size={13} stroke="#93c5fd" /> Piattaforma AI per
          l edilizia svizzera
        </div>
        <h1
          style={{
            fontSize: mob ? 32 : 52,
            fontWeight: 800,
            margin: '0 0 18px',
            lineHeight: 1.15,
            color: '#fff',
            letterSpacing: '-1px',
          }}
        >
          Lavora meglio.
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#60a5fa,#a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Edilslab ti affianca.
          </span>
        </h1>
        <p
          style={{
            fontSize: mob ? 16 : 18,
            color: '#94a3b8',
            maxWidth: 540,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Consulta normative, analizza documenti e foto di cantiere, genera
          report, confronta offerte e pianifica i lavori.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={onLogin}
            style={{
              padding: '13px 30px',
              background: T.gradBlue,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Accedi alla piattaforma
          </button>
          <button
            onClick={onRegister}
            style={{
              padding: '13px 24px',
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Richiedi accesso
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 28,
            marginTop: 48,
            flexWrap: 'wrap',
          }}
        >
          {[
            'Architetti',
            'Ingegneri',
            'Direttori Lavori',
            'Impresari',
            'Tecnici',
          ].map((p) => (
            <div
              key={p}
              style={{
                fontSize: 13,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ color: '#22c55e', fontSize: 10 }}>&#9679;</span>
              {p}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: mob ? '48px 20px' : '72px 40px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.blue,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: 10,
            }}
          >
            Funzionalita
          </div>
          <h2
            style={{
              fontSize: mob ? 24 : 34,
              fontWeight: 800,
              color: T.text,
              margin: 0,
            }}
          >
            Tutto quello che serve, in un posto
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)',
            gap: 20,
          }}
        >
          {[
            {
              icon: PATHS.docs,
              title: 'Chat Documenti',
              desc: 'L AI risponde dai tuoi PDF tecnici: SIA, SUVA, capitolati.',
              color: T.purple,
              bg: '#ccd3dd',
            },
            {
              icon: PATHS.chat,
              title: 'Chat Edilizia',
              desc: 'Assistente per normative, tecniche costruttive e sicurezza.',
              color: T.blue,
              bg: '#c8d0dc',
            },
            {
              icon: PATHS.camera,
              title: 'Analisi Foto',
              desc: 'Fotografa dal cantiere e ricevi analisi tecnica.',
              color: T.amber,
              bg: '#ccd3dd',
            },
            {
              icon: PATHS.podio,
              title: 'Graduatorie Offerte',
              desc: 'Confronto automatico offerte per prezzo.',
              color: T.green,
              bg: '#c8d0dc',
            },
            {
              icon: PATHS.gantt,
              title: 'Programma Lavori',
              desc: 'Gantt con giorni lavorativi, festivi e dipendenze.',
              color: '#0891b2',
              bg: '#ccd3dd',
            },
            {
              icon: PATHS.file,
              title: 'Rapporti Tecnici',
              desc: 'Genera perizie, ispezioni e verbali di collaudo.',
              color: '#475569',
              bg: '#c8d0dc',
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: f.bg,
                border: '1px solid ' + f.color + '20',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: f.color + '18',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: f.color,
                  marginBottom: 14,
                }}
              >
                <Icon d={f.icon} size={20} />
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: T.text,
                  marginBottom: 8,
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          background: '#c8d0dc',
          borderTop: '1px solid #b8c2d0',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: T.gradBlue,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d={PATHS.building} size={13} stroke="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>
            Edilslab
          </span>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          Piattaforma privata · Svizzera Italiana
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN / REGISTER ─────────────────────────────────────────────────────────
function Login({ users, onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const go = () => {
    const u = users.find((u) => u.email === email && u.password === pw);
    if (!u) {
      setErr('Credenziali non valide.');
      return;
    }
    if (u.status !== 'approved') {
      setErr('Account in attesa di approvazione.');
      return;
    }
    if (remember) {
      try {
        sessionStorage.setItem('es_u', JSON.stringify(u));
      } catch (e) {}
    }
    onLogin(u);
  };
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.gradDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}
    >
      <div
        style={{
          background: '#dce1ea',
          borderRadius: 20,
          padding: '44px 36px',
          width: '100%',
          maxWidth: 400,
          boxShadow: T.shadowLg,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 54,
              height: 54,
              background: T.gradBlue,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Icon d={PATHS.building} size={26} stroke="#fff" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>
            Edilslab
          </div>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
            Bentornato
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: T.text,
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            style={inp}
            type="email"
            placeholder="nome@azienda.ch"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && go()}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: T.text,
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inp, paddingRight: 44 }}
              type={showPw ? 'text' : 'password'}
              placeholder="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && go()}
            />
            <div
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: T.textMuted,
              }}
            >
              <Icon d={showPw ? PATHS.eyeoff : PATHS.eye} size={17} />
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            marginTop: 10,
          }}
        >
          <div
            onClick={() => setRemember((v) => !v)}
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              border: '2px solid',
              borderColor: remember ? T.blue : '#b0b8c4',
              background: remember ? T.blue : '#dce1ea',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {remember && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="#fff"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <span
            style={{ fontSize: 13, color: T.textSub, cursor: 'pointer' }}
            onClick={() => setRemember((v) => !v)}
          >
            Ricordami su questo dispositivo
          </span>
        </div>
        {err && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 13,
              color: T.red,
              marginBottom: 14,
            }}
          >
            {err}
          </div>
        )}
        <button onClick={go} style={btnP}>
          Accedi
        </button>
        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 13,
            color: T.textSub,
          }}
        >
          Prima volta?{' '}
          <span
            onClick={onRegister}
            style={{ color: T.blue, fontWeight: 700, cursor: 'pointer' }}
          >
            Richiedi accesso
          </span>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: '10px 14px',
            background: '#c8d0dc',
            borderRadius: 8,
            fontSize: 12,
            color: T.textMuted,
            textAlign: 'center',
            border: '1px solid #b8c2d0',
          }}
        >
          Admin: admin@edilslab.ch / admin123
          <br />
          User: user@edilslab.ch / user123
        </div>
      </div>
    </div>
  );
}
function PendingScreen({ onBack }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.gradDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}
    >
      <div
        style={{
          background: '#dce1ea',
          borderRadius: 20,
          padding: '44px 36px',
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: T.shadowLg,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            background: '#fef3c7',
            border: '2px solid #fcd34d',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: T.amber,
          }}
        >
          <Icon d={PATHS.clock} size={26} />
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: T.text,
            marginBottom: 10,
          }}
        >
          Richiesta inviata
        </div>
        <p
          style={{
            color: T.textSub,
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          La tua richiesta e stata ricevuta. L amministratore la verifichera e
          ti dara accesso a breve.
        </p>
        <button onClick={onBack} style={btnP}>
          Torna al login
        </button>
      </div>
    </div>
  );
}
function Register({ users, pending, onBack, onSuccess }) {
  const [name, setName] = useState('');
  const [surn, setSurn] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const go = () => {
    if (!name.trim() || !surn.trim()) {
      setErr('Inserisci nome e cognome.');
      return;
    }
    if (!email.includes('@')) {
      setErr('Email non valida.');
      return;
    }
    if (
      users.find((u) => u.email === email) ||
      pending.find((p) => p.email === email)
    ) {
      setErr('Email gia registrata o in attesa.');
      return;
    }
    if (pw.length < 6) {
      setErr('Password min. 6 caratteri.');
      return;
    }
    if (pw !== pw2) {
      setErr('Le password non coincidono.');
      return;
    }
    onSuccess({
      email,
      password: pw,
      name: name.trim() + ' ' + surn.trim(),
      requestedAt: new Date().toLocaleDateString('it-CH'),
    });
  };
  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.gradDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}
    >
      <div
        style={{
          background: '#dce1ea',
          borderRadius: 20,
          padding: '44px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: T.shadowLg,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              background: T.gradBlue,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Icon d={PATHS.building} size={26} stroke="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>
            Richiedi accesso
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Nome
            </label>
            <input
              style={inp}
              placeholder="Mario"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErr('');
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Cognome
            </label>
            <input
              style={inp}
              placeholder="Rossi"
              value={surn}
              onChange={(e) => {
                setSurn(e.target.value);
                setErr('');
              }}
            />
          </div>
        </div>
        {[
          ['Email', 'mario.rossi@azienda.ch', 'email', email, setEmail],
          ['Password', 'Min. 6 caratteri', 'password', pw, setPw],
          ['Conferma password', 'Ripeti', 'password', pw2, setPw2],
        ].map(([l, ph, tp, val, set]) => (
          <div key={l} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              {l}
            </label>
            <input
              style={inp}
              type={tp}
              placeholder={ph}
              value={val}
              onChange={(e) => {
                set(e.target.value);
                setErr('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && go()}
            />
          </div>
        ))}
        {err && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '9px 12px',
              fontSize: 13,
              color: T.red,
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        )}
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
          Accesso soggetto ad approvazione — riceverai conferma a breve.
        </div>
        <button onClick={go} style={btnP}>
          Invia richiesta
        </button>
        <div
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 13,
            color: T.textSub,
          }}
        >
          Hai gia un account?{' '}
          <span
            onClick={onBack}
            style={{ color: T.blue, fontWeight: 700, cursor: 'pointer' }}
          >
            Accedi
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── EMAIL BLOCK ──────────────────────────────────────────────────────────────
function EmailBlock({ data }) {
  const [ogg, setOgg] = useState(data.ogg);
  const [corpo, setCorpo] = useState(data.corpo);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        marginTop: 10,
        border: '1.5px solid #c4ccd8',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#dce1ea',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'linear-gradient(135deg,#c8d0dc,#ccd3dd)',
          borderBottom: '1px solid #c4ccd8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon d={PATHS.mail} size={15} stroke={T.blue} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>
            Bozza email
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setEditing((v) => !v)}
            style={{
              padding: '4px 12px',
              background: editing ? T.blue : '#d6dce6',
              color: editing ? '#fff' : T.textSub,
              border: '1px solid #c4ccd8',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {editing ? 'Fine' : 'Modifica'}
          </button>
          <button
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              padding: '4px 12px',
              background: copied ? T.green : '#d6dce6',
              color: copied ? '#fff' : T.textSub,
              border: '1px solid #c4ccd8',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
      </div>
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid #c4ccd8',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.textMuted,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          Oggetto
        </span>
        {editing ? (
          <input
            value={ogg}
            onChange={(e) => setOgg(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #c4ccd8',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 13,
              outline: 'none',
              color: T.text,
              background: '#dce1ea',
            }}
          />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
            {ogg}
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        {editing ? (
          <textarea
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            style={{
              width: '100%',
              minHeight: 200,
              border: '1px solid #c4ccd8',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.7,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              color: T.text,
              boxSizing: 'border-box',
              background: '#dce1ea',
            }}
          />
        ) : (
          <pre
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              lineHeight: 1.7,
              color: T.text,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {corpo}
          </pre>
        )}
      </div>
      <div
        style={{
          padding: '7px 14px',
          background: '#d6dce6',
          borderTop: '1px solid #c4ccd8',
          fontSize: 11,
          color: T.textMuted,
        }}
      >
        I campi [TRA PARENTESI] sono da personalizzare
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
// ─── HOOK: Salva in progetto ─────────────────────────────────────────────────
function useSalvaInProgetto(userEmail) {
  const [progetti, setProjetti] = useState(() => {
    try {
      const s = localStorage.getItem('es_progetti');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });
  const [modal, setModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [selProg, setSelProg] = useState('');
  const [saved, setSaved] = useState(false);

  const miei = progetti.filter(
    (p) => p.owner === userEmail || (p.condivisiCon || []).includes(userEmail)
  );

  const salva = (tipo, testo) => {
    setPendingItem({ tipo, testo });
    setSelProg(miei[0]?.id || '');
    setModal(true);
    setSaved(false);
  };

  const conferma = () => {
    if (!selProg || !pendingItem) return;
    const item = {
      id: Date.now(),
      tipo: pendingItem.tipo,
      testo: pendingItem.testo,
      data: new Date().toLocaleDateString('it-CH'),
      autore: 'me',
    };
    const updated = progetti.map((p) =>
      String(p.id) === String(selProg) ? { ...p, items: [...p.items, item] } : p
    );
    setProjetti(updated);
    try {
      localStorage.setItem('es_progetti', JSON.stringify(updated));
    } catch (e) {}
    setModal(false);
    setPendingItem(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const modalJSX = modal ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#dce1ea',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 6,
          }}
        >
          Salva in progetto
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Scegli in quale cartella salvare questo elemento.
        </div>
        {miei.length === 0 ? (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: 10,
              fontSize: 13,
              color: '#92400e',
              marginBottom: 16,
            }}
          >
            Nessun progetto disponibile. Creane uno dalla sezione Cartelle
            Progetto.
          </div>
        ) : (
          <select
            value={selProg}
            onChange={(e) => setSelProg(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1.5px solid #c4ccd8',
              borderRadius: 10,
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              color: '#0f172a',
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            {miei.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={conferma}
            disabled={!selProg || miei.length === 0}
            style={{
              flex: 1,
              padding: 11,
              background: 'linear-gradient(135deg,#1e40af,#2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              opacity: !selProg || miei.length === 0 ? 0.5 : 1,
            }}
          >
            Salva
          </button>
          <button
            onClick={() => {
              setModal(false);
              setPendingItem(null);
            }}
            style={{
              padding: '11px 18px',
              background: '#d6dce6',
              color: '#64748b',
              border: '1px solid #c4ccd8',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { salva, saved, modalJSX, hasProjetti: miei.length > 0 };
}

// ─── HOOK: Cronologia chat per utente ────────────────────────────────────────
function useChatHistory(userEmail, mode) {
  const key = 'es_chat_' + userEmail + '_' + mode;
  const [convs, setConvs] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeCid, setActiveCid] = useState(null);

  const saveConv = (msgs) => {
    if (msgs.length <= 1) return; // solo welcome, non salvare
    const firstUser = msgs.find((m) => m.role === 'user');
    if (!firstUser) return;
    const title =
      firstUser.text.substring(0, 50) +
      (firstUser.text.length > 50 ? '...' : '');
    const cid = activeCid || Date.now();
    if (!activeCid) setActiveCid(cid);
    const entry = {
      id: cid,
      title,
      date: new Date().toLocaleDateString('it-CH'),
      msgs: msgs.map((m) => ({ role: m.role, text: m.text })),
    };
    setConvs((prev) => {
      const updated = [entry, ...prev.filter((c) => c.id !== cid)].slice(0, 20);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const loadConv = (cid) => {
    setActiveCid(cid);
    return convs.find((c) => c.id === cid);
  };

  const newConv = () => {
    setActiveCid(null);
  };
  const delConv = (cid) => {
    setConvs((prev) => {
      const u = prev.filter((c) => c.id !== cid);
      try {
        localStorage.setItem(key, JSON.stringify(u));
      } catch (e) {}
      return u;
    });
    if (activeCid === cid) setActiveCid(null);
  };

  return { convs, activeCid, saveConv, loadConv, newConv, delConv };
}

function Chat({ user, mode, onAddHistory }) {
  const mob = useIsMobile();
  const isDoc = mode === 'docs';
  const acc = isDoc ? T.purple : T.blue;
  const grad = isDoc ? T.gradPurple : T.gradBlue;
  const welcome = isDoc
    ? 'Ciao ' +
      user.name.split(' ')[0] +
      '! Sono la Chat Documenti.\n\nRispondo dai tuoi documenti e cerco in tempo reale su SUVA, SIA e altri enti ufficiali quando serve.'
    : 'Ciao ' +
      user.name.split(' ')[0] +
      '! Sono la Chat Edilizia.\n\nSono il tuo assistente tecnico per l edilizia svizzera. Posso aiutarti con normative e scrivere email professionali.';

  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: welcome, enti: [], webResults: [] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [webSearch, setWebSearch] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef();
  const fileRef = useRef();
  const { salva, saved, modalJSX } = useSalvaInProgetto(user.email);
  const { convs, activeCid, saveConv, loadConv, newConv, delConv } =
    useChatHistory(user.email, mode);

  const isEmailReq = (t) => {
    const tx = t.toLowerCase();
    return (
      tx.includes('mail') ||
      tx.includes('email') ||
      (tx.includes('scrivi') &&
        (tx.includes('offerta') ||
          tx.includes('convoca') ||
          tx.includes('segnala'))) ||
      tx.includes('redigi') ||
      tx.includes('bozza')
    );
  };

  useEffect(() => {
    setMsgs([{ role: 'assistant', text: welcome, enti: [], webResults: [] }]);
    setPhoto(null);
    setInput('');
    setWebSearch(true);
  }, [mode]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhoto({ url: ev.target.result, name: f.name });
    r.readAsDataURL(f);
  };

  const callAPI = async (question, imageUrl) => {
    const systemPrompt = isDoc
      ? `Sei un assistente tecnico specializzato in edilizia svizzera. Hai accesso a documenti tecnici caricati dall'utente e puoi cercare sul web in tempo reale per trovare normative aggiornate su SUVA (suva.ch), SIA (sia.ch), admin.ch, ti.ch e altri enti ufficiali svizzeri. Quando cerchi sul web, specifica sempre la fonte. Rispondi sempre in italiano. Aggiungi questa nota alla fine: "Le informazioni hanno carattere orientativo. Consultare sempre le norme ufficiali e un professionista abilitato."`
      : `Sei un assistente tecnico per l'edilizia svizzera. Rispondi in italiano su normative SIA, SUVA, sicurezza cantieri, tecniche costruttive. Puoi generare bozze di email professionali se richiesto.`;

    const tools = webSearch
      ? [
          {
            type: 'web_search_20250305',
            name: 'web_search',
          },
        ]
      : undefined;

    const messages = [];
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageUrl.split(',')[1] || imageUrl,
            },
          },
          {
            type: 'text',
            text:
              question ||
              'Analizza questa immagine dal punto di vista tecnico edilizio.',
          },
        ],
      });
    } else {
      messages.push({ role: 'user', content: question });
    }

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    };
    if (tools) body.tools = tools;

    const storedKey = (() => {
      try {
        return localStorage.getItem('es_anthropic_key') || '';
      } catch (e) {
        return '';
      }
    })();
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': storedKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();

    // Extract text and web results
    let text = '';
    const webResults = [];
    if (data.content) {
      data.content.forEach((block) => {
        if (block.type === 'text') text += block.text;
        if (block.type === 'tool_result' || block.type === 'mcp_tool_result') {
          try {
            const r = JSON.parse(block.content?.[0]?.text || '{}');
            if (r.results) webResults.push(...r.results.slice(0, 3));
          } catch (e) {}
        }
      });
    }
    if (!text && data.error)
      text =
        'Errore API: ' + (data.error.message || JSON.stringify(data.error));
    if (!text)
      text =
        data.content
          ?.filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('') || 'Nessuna risposta ricevuta.';
    return { text, webResults };
  };

  const send = async (txt) => {
    const q = txt || input.trim();
    if (!q && !photo) return;
    const umsg = {
      role: 'user',
      text: q || 'Ho inviato una foto.',
      image: photo ? photo.url : null,
    };
    setInput('');
    setPhoto(null);
    setMsgs((m) => [...m, umsg]);
    setTyping(true);

    try {
      // Try real API first
      const { text, webResults } = await callAPI(q, photo?.url);
      const enti = getEnti(text + ' ' + q);
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          text,
          enti,
          webResults,
          emailData:
            !isDoc && isEmailReq(q)
              ? REMAILS[Math.floor(Math.random() * 3)]
              : null,
        },
      ]);
      if (onAddHistory && q)
        onAddHistory(
          q.substring(0, 60) + (q.length > 60 ? '...' : ''),
          mode,
          user.name
        );
      setMsgs((m) => {
        const updated = [...m];
        saveConv(updated);
        return updated;
      });
    } catch (e) {
      // Fallback to mock if API not available
      let resp;
      let emailData = null;
      if (photo) {
        resp = RPHOTO[Math.floor(Math.random() * 3)];
      } else if (!isDoc && isEmailReq(q)) {
        emailData = REMAILS[Math.floor(Math.random() * 3)];
        resp = 'Ho preparato una bozza email.';
      } else {
        resp = (isDoc ? RDOCS : RGEN)[Math.floor(Math.random() * 4)];
      }
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          text: resp,
          enti: getEnti(resp + ' ' + q),
          webResults: [],
          emailData,
        },
      ]);
      if (onAddHistory && q)
        onAddHistory(
          q.substring(0, 60) + (q.length > 60 ? '...' : ''),
          mode,
          user.name
        );
      setMsgs((m) => {
        saveConv(m);
        return m;
      });
    }
    setTyping(false);
  };

  const quickDoc = [
    'SIA 118',
    'Sicurezza in quota',
    'Calcolo carichi',
    'Normativa SUVA cantieri',
  ];
  const quickGen = [
    'Normativa LCPubb',
    'Norme SIA strutturali',
    'Sicurezza SUVA',
    'Scrivi mail richiesta offerta',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: mob ? 'calc(100vh - 116px)' : 'calc(100vh - 108px)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          background: acc + '08',
          border: '1px solid ' + acc + '20',
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: grad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon d={isDoc ? PATHS.docs : PATHS.chat} size={13} stroke="#fff" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: acc }}>
          {isDoc ? 'Chat Documenti' : 'Chat Edilizia'}
        </span>
        {!mob && (
          <span style={{ fontSize: 12, color: T.textMuted }}>
            {isDoc
              ? 'Documenti + ricerca web in tempo reale'
              : 'Assistente edilizia svizzera'}
          </span>
        )}
        {/* Web search toggle - solo in Chat Documenti */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isDoc && (
            <div
              onClick={() => setWebSearch((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                border: '1.5px solid ' + (webSearch ? acc : T.border),
                background: webSearch ? acc + '12' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon
                d={PATHS.search}
                size={12}
                stroke={webSearch ? acc : T.textMuted}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: webSearch ? acc : T.textMuted,
                }}
              >
                Web
              </span>
              <div
                style={{
                  width: 28,
                  height: 14,
                  borderRadius: 7,
                  background: webSearch ? acc : '#c4ccd8',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: webSearch ? 14 : 2,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => setShowHistory((v) => !v)}
            title="Cronologia conversazioni"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              borderRadius: 20,
              border: '1.5px solid ' + (showHistory ? acc : T.border),
              background: showHistory ? acc + '12' : 'transparent',
              cursor: 'pointer',
              color: showHistory ? acc : T.textMuted,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Icon d={PATHS.clock} size={12} />
            {!mob && 'Cronologia'}
          </button>
          {msgs.length > 1 && (
            <button
              onClick={() =>
                salva(
                  'chat',
                  msgs
                    .filter(
                      (m) => m.role !== 'assistant' || msgs.indexOf(m) > 0
                    )
                    .map((m) => (m.role === 'user' ? 'Tu: ' : 'AI: ') + m.text)
                    .join('\n\n')
                    .substring(0, 2000)
                )
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 9px',
                borderRadius: 20,
                border: '1.5px solid ' + (saved ? T.green : T.border),
                background: saved ? T.green + '12' : 'transparent',
                cursor: 'pointer',
                color: saved ? T.green : T.textMuted,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {saved ? '✓ Salvato' : '💾 Salva'}
            </button>
          )}
          <button
            onClick={() => {
              newConv();
              setMsgs([
                { role: 'assistant', text: welcome, enti: [], webResults: [] },
              ]);
            }}
            title="Nuova conversazione"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              borderRadius: 20,
              border: '1.5px solid ' + T.border,
              background: 'transparent',
              cursor: 'pointer',
              color: T.textMuted,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Icon d={PATHS.plus} size={12} />
            {!mob && 'Nuova'}
          </button>
        </div>
      </div>

      {/* Pannello cronologia */}
      {showHistory && (
        <div
          style={{
            background: '#dce1ea',
            border: '1px solid ' + T.border,
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
              Cronologia conversazioni
            </div>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: T.textMuted,
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>
          {convs.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: T.textMuted,
                textAlign: 'center',
                padding: '10px 0',
              }}
            >
              Nessuna conversazione salvata
            </div>
          )}
          {convs.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 9,
                marginBottom: 4,
                background: activeCid === c.id ? acc + '12' : '#d6dce6',
                border:
                  '1px solid ' + (activeCid === c.id ? acc + '30' : T.border),
              }}
            >
              <div
                onClick={() => {
                  const cv = loadConv(c.id);
                  if (cv)
                    setMsgs(
                      cv.msgs.map((m) => ({ ...m, enti: [], webResults: [] }))
                    );
                  setShowHistory(false);
                }}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: activeCid === c.id ? 700 : 500,
                    color: activeCid === c.id ? acc : T.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.title}
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{c.date}</div>
              </div>
              <button
                onClick={() => delConv(c.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#b0b8c4',
                  padding: 2,
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 4 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16,
              gap: 10,
              alignItems: 'flex-end',
            }}
          >
            {m.role === 'assistant' && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: grad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  d={isDoc ? PATHS.docs : PATHS.chat}
                  size={13}
                  stroke="#fff"
                />
              </div>
            )}
            <div style={{ maxWidth: mob ? '85%' : '72%' }}>
              {m.image && (
                <img
                  src={m.image}
                  alt="foto"
                  style={{
                    maxWidth: '100%',
                    borderRadius: 12,
                    marginBottom: 6,
                    display: 'block',
                    maxHeight: 200,
                    objectFit: 'cover',
                  }}
                />
              )}
              <div
                style={{
                  padding: '11px 16px',
                  borderRadius:
                    m.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                  background: m.role === 'user' ? grad : '#dce1ea',
                  color: T.text,
                  fontSize: 13,
                  lineHeight: 1.65,
                  boxShadow: T.shadow,
                  border: m.role === 'user' ? 'none' : '1px solid ' + T.border,
                }}
              >
                {m.text.split('\n').map((l, li) => (
                  <span key={li}>
                    {l}
                    {li < m.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              {/* Web results */}
              {m.role === 'assistant' &&
                m.webResults &&
                m.webResults.length > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '8px 12px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.blue,
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      🔍 Fonti trovate sul web
                    </div>
                    {m.webResults.map((r, ri) => (
                      <div key={ri} style={{ marginBottom: 4 }}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: T.blue,
                            textDecoration: 'none',
                          }}
                        >
                          {r.title || r.url}
                        </a>
                        {r.snippet && (
                          <div
                            style={{
                              fontSize: 10,
                              color: T.textSub,
                              marginTop: 1,
                            }}
                          >
                            {r.snippet.substring(0, 120)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              {m.role === 'assistant' && m.emailData && (
                <EmailBlock data={m.emailData} />
              )}
              {m.role === 'assistant' && m.enti && m.enti.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '10px 12px',
                    background: '#d6dce6',
                    border: '1px solid ' + T.border,
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.textMuted,
                      marginBottom: 7,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Fonti ufficiali
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.enti.map((nm) => {
                      const e = ENTI.find((x) => x.nome === nm);
                      if (!e) return null;
                      return (
                        <a
                          key={e.nome}
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            background: '#dce1ea',
                            border: '1px solid ' + e.color + '30',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            color: e.color,
                            textDecoration: 'none',
                          }}
                        >
                          <Icon d={PATHS.link} size={10} stroke={e.color} />
                          {e.nome}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-end',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: grad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                d={isDoc ? PATHS.docs : PATHS.chat}
                size={13}
                stroke="#fff"
              />
            </div>
            <div
              style={{
                padding: '11px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#dce1ea',
                border: '1px solid ' + T.border,
                fontSize: 13,
                color: T.textMuted,
                display: 'flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <span style={{ animation: 'pulse 1s infinite' }}>●</span>
              <span
                style={{ animation: 'pulse 1s 0.2s infinite', opacity: 0.6 }}
              >
                ●
              </span>
              <span
                style={{ animation: 'pulse 1s 0.4s infinite', opacity: 0.3 }}
              >
                ●
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {modalJSX}

      {/* Quick actions */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          padding: '8px 0 6px',
        }}
      >
        {(isDoc ? quickDoc : quickGen).map((q) => (
          <div
            key={q}
            onClick={() => send(q)}
            style={{
              padding: '5px 11px',
              background: '#d6dce6',
              border: '1px solid ' + acc + '30',
              borderRadius: 16,
              fontSize: 12,
              cursor: 'pointer',
              color: acc,
              fontWeight: 500,
              boxShadow: T.shadow,
            }}
          >
            {q}
          </div>
        ))}
      </div>

      {/* Photo preview */}
      {photo && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: '#d6dce6',
            border: '1px solid ' + T.border,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <img
            src={photo.url}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: 'cover',
            }}
          />
          <span style={{ fontSize: 12, color: T.textSub, flex: 1 }}>
            {photo.name}
          </span>
          <div
            onClick={() => setPhoto(null)}
            style={{ cursor: 'pointer', color: T.textMuted }}
          >
            <Icon d={PATHS.close} size={16} />
          </div>
        </div>
      )}

      {/* Input bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid ' + T.border,
        }}
      >
        <button
          onClick={() => fileRef.current.click()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: '#d6dce6',
            border: '1px solid ' + T.border,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.textSub,
            flexShrink: 0,
          }}
        >
          <Icon d={PATHS.camera} size={18} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handlePhoto}
        />
        <textarea
          style={{
            flex: 1,
            padding: '11px 14px',
            border: '1.5px solid ' + T.border,
            borderRadius: 10,
            fontSize: 14,
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            color: T.text,
            lineHeight: '20px',
            background: '#dce1ea',
          }}
          placeholder={
            isDoc
              ? 'Cerca nei documenti o chiedi info aggiornate...'
              : 'Domanda tecnica o richiedi una email...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        <button
          onClick={() => send()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: input.trim() || photo ? grad : '#c8d0dc',
            border: 'none',
            cursor: input.trim() || photo ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: input.trim() || photo ? '#fff' : T.textMuted,
            flexShrink: 0,
          }}
        >
          <Icon d={PATHS.send} size={16} />
        </button>
      </div>
    </div>
  );
}
// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
function Documents() {
  const mob = useIsMobile();
  const [docs, setDocs] = useState(SAMPLE_DOCS);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Tutti');
  const [drag, setDrag] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState('');
  const fileRef = useRef();
  const catC = {
    Strutturale: T.blue,
    Impianti: T.purple,
    Normativa: T.red,
    Sicurezza: T.amber,
    Contratti: T.green,
    Cantiere: '#0891b2',
  };
  const add = (name) => {
    const ext = name.split('.').pop().toUpperCase();
    setDocs((d) => [
      ...d,
      {
        id: Date.now(),
        name,
        category: 'Normativa',
        tag: ext,
        size: '---',
        date: new Date().toLocaleDateString('it-CH'),
        color: EXT_COLOR[ext] || '#64748b',
        readable: EXT_READ[ext] !== false,
      },
    ]);
  };
  const del = (id) => setDocs((d) => d.filter((x) => x.id !== id));
  const filtered = docs.filter(
    (d) =>
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.tag.toLowerCase().includes(search.toLowerCase())) &&
      (cat === 'Tutti' || d.category === cat)
  );

  const openDrive = async () => {
    setDriveOpen(true);
    setDriveLoading(true);
    setDriveError('');
    setDriveFiles([]);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:
            'Elenca i file dell utente da Google Drive. Rispondi SOLO con un array JSON: [{id, name, mimeType, modifiedTime, size}]. Nessun testo aggiuntivo.',
          messages: [
            {
              role: 'user',
              content:
                'Lista i file del mio Google Drive, massimo 20 file recenti.',
            },
          ],
          mcp_servers: [
            {
              type: 'url',
              url: 'https://drivemcp.googleapis.com/mcp/v1',
              name: 'gdrive',
            },
          ],
        }),
      });
      const data = await resp.json();
      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      let files = [];
      try {
        files = JSON.parse(text);
      } catch (e) {
        const m = text.match(/\[[\s\S]*\]/);
        if (m) files = JSON.parse(m[0]);
      }
      if (!Array.isArray(files) || files.length === 0) {
        setDriveError(
          'Nessun file trovato o Drive non connesso. Collega Google Drive dal menu strumenti.'
        );
      } else {
        setDriveFiles(files);
      }
    } catch (e) {
      setDriveError('Errore connessione Drive: ' + e.message);
    }
    setDriveLoading(false);
  };

  const importFromDrive = (file) => {
    const ext = (file.name || '').split('.').pop().toUpperCase() || 'PDF';
    setDocs((d) => [
      ...d,
      {
        id: Date.now(),
        name: file.name,
        category: 'Normativa',
        tag: ext,
        size: file.size || '---',
        date: new Date().toLocaleDateString('it-CH'),
        color: EXT_COLOR[ext] || '#64748b',
        readable: EXT_READ[ext] !== false,
        driveId: file.id,
      },
    ]);
  };

  const getMimeLabel = (mt = '') => {
    if (mt.includes('pdf')) return { label: 'PDF', color: '#ef4444' };
    if (mt.includes('spreadsheet') || mt.includes('excel'))
      return { label: 'XLSX', color: '#059669' };
    if (mt.includes('document') || mt.includes('word'))
      return { label: 'DOCX', color: '#2563eb' };
    if (mt.includes('presentation')) return { label: 'PPTX', color: '#d97706' };
    if (mt.includes('folder')) return { label: '📁', color: '#64748b' };
    return { label: 'FILE', color: '#94a3b8' };
  };

  return (
    <div>
      <div
        style={{
          background: '#dce1ea',
          border: '1px solid #c4a800',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#92400e',
            marginBottom: 10,
          }}
        >
          Formati supportati
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { ext: 'PDF', c: '#ef4444', ai: true },
            { ext: 'DOCX', c: '#2563eb', ai: true },
            { ext: 'XLSX', c: '#059669', ai: true },
            { ext: 'PPTX', c: '#d97706', ai: true },
            { ext: 'CSV', c: '#0891b2', ai: true },
            { ext: 'TXT', c: '#64748b', ai: true },
            { ext: 'JPG/PNG', c: '#7c3aed', ai: true },
            { ext: 'DWG/DXF', c: '#94a3b8', ai: false },
          ].map((f) => (
            <span
              key={f.ext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                background: f.c + '12',
                color: f.ai ? f.c : '#94a3b8',
                border: '1px solid ' + f.c + '25',
              }}
            >
              {f.ext}
              <span style={{ fontSize: 9, opacity: 0.7 }}>
                {f.ai ? 'AI' : 'archiviazione'}
              </span>
            </span>
          ))}
        </div>
      </div>
      {/* Google Drive import */}
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <button
          onClick={openDrive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: '#fff',
            border: '1.5px solid #c4ccd8',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            color: T.text,
            boxShadow: T.shadow,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 87.3 78"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
              fill="#0066da"
            />
            <path
              d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
              fill="#00ac47"
            />
            <path
              d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
              fill="#ea4335"
            />
            <path
              d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
              fill="#00832d"
            />
            <path
              d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
              fill="#2684fc"
            />
            <path
              d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
              fill="#ffba00"
            />
          </svg>
          Importa da Google Drive
        </button>
      </div>

      {/* Drive modal */}
      {driveOpen && (
        <div
          style={{
            background: '#dce1ea',
            border: '1.5px solid #4285f440',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            boxShadow: T.shadowMd,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
              📁 Google Drive
            </div>
            <button
              onClick={() => setDriveOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: T.textMuted,
              }}
            >
              ×
            </button>
          </div>
          {driveLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#4285f4',
                fontWeight: 600,
                padding: '20px 0',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid #4285f4',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Connessione a Google Drive...
            </div>
          )}
          {driveError && (
            <div
              style={{
                padding: '12px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                fontSize: 13,
                color: T.red,
                marginBottom: 10,
              }}
            >
              {driveError}
            </div>
          )}
          {driveFiles.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: T.textSub, marginBottom: 10 }}>
                {driveFiles.length} file trovati — clicca per importare
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {driveFiles.map((f) => {
                  const { label, color } = getMimeLabel(f.mimeType);
                  const alreadyImported = docs.some((d) => d.driveId === f.id);
                  return (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        background: alreadyImported ? '#f0fdf4' : '#d6dce6',
                        border:
                          '1px solid ' +
                          (alreadyImported ? '#bbf7d0' : T.border),
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: color + '18',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color,
                          fontWeight: 800,
                          fontSize: 10,
                          flexShrink: 0,
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {f.name}
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted }}>
                          {f.modifiedTime?.substring(0, 10) || ''}{' '}
                          {f.size ? '· ' + f.size : ''}
                        </div>
                      </div>
                      {alreadyImported ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: T.green,
                            fontWeight: 700,
                          }}
                        >
                          ✓ Importato
                        </span>
                      ) : (
                        <button
                          onClick={() => importFromDrive(f)}
                          style={{
                            padding: '6px 14px',
                            background: T.gradBlue,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Importa
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div
        style={{
          border: '2px dashed',
          borderColor: drag ? T.blue : '#b0b8c4',
          borderRadius: 14,
          padding: mob ? 20 : 28,
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 20,
          background: drag ? '#eff6ff' : '#d6dce6',
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          [...e.dataTransfer.files].forEach((f) => add(f.name));
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onClick={() => fileRef.current.click()}
      >
        <div
          style={{
            width: 44,
            height: 44,
            background: T.blue + '12',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            color: T.blue,
          }}
        >
          <Icon d={PATHS.upload} size={22} />
        </div>
        <p
          style={{
            margin: '0 0 4px',
            fontWeight: 700,
            color: T.text,
            fontSize: 14,
          }}
        >
          {mob ? 'Tocca per caricare' : 'Trascina qui o clicca per caricare'}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>
          PDF · Word · Excel · PowerPoint · CSV · TXT · JPG/PNG · DWG
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => [...e.target.files].forEach((f) => add(f.name))}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.jpg,.jpeg,.png,.dwg,.dxf"
        />
      </div>
      <div
        style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <span
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: T.textMuted,
            }}
          >
            <Icon d={PATHS.search} size={15} />
          </span>
          <input
            style={{ ...inp, paddingLeft: 36, fontSize: 13 }}
            placeholder="Cerca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Tutti', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: '7px 13px',
                borderRadius: 8,
                border: '1.5px solid',
                borderColor: cat === c ? T.blue : T.border,
                background: cat === c ? T.blue : '#d6dce6',
                color: cat === c ? '#fff' : T.textSub,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mob
            ? '1fr'
            : 'repeat(auto-fill,minmax(240px,1fr))',
          gap: 14,
        }}
      >
        {filtered.map((d) => (
          <div
            key={d.id}
            style={{
              background: '#dce1ea',
              border: '1px solid ' + T.border,
              borderRadius: 14,
              padding: 16,
              boxShadow: T.shadow,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: (d.color || T.blue) + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: d.color || T.blue,
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                {d.tag}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {d.readable === false && (
                  <span
                    style={{
                      fontSize: 10,
                      color: T.amber,
                      fontWeight: 600,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 6,
                      padding: '2px 6px',
                    }}
                  >
                    Solo archivio
                  </span>
                )}
                <div
                  onClick={() => del(d.id)}
                  style={{ cursor: 'pointer', color: '#b0b8c4', padding: 4 }}
                >
                  <Icon d={PATHS.trash} size={15} />
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.text,
                marginBottom: 8,
                wordBreak: 'break-all',
              }}
            >
              {d.name}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  background: (catC[d.category] || T.blue) + '15',
                  color: catC[d.category] || T.blue,
                }}
              >
                {d.category}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: T.textMuted,
              }}
            >
              <span>{d.size}</span>
              <span>{d.date}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              color: T.textMuted,
              padding: 32,
            }}
          >
            Nessun documento trovato
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashHome({ user, setPage, users }) {
  const mob = useIsMobile();
  const stats = [
    {
      label: 'Documenti',
      val: '4',
      icon: PATHS.docs,
      color: T.blue,
      bg: '#c8d0dc',
    },
    {
      label: 'Conversazioni',
      val: '12',
      icon: PATHS.chat,
      color: T.purple,
      bg: '#ccd3dd',
    },
    {
      label: 'Report',
      val: '3',
      icon: PATHS.file,
      color: T.green,
      bg: '#c8d0dc',
    },
    {
      label: 'Utenti attivi',
      val: user.role === 'admin' ? String(users.length) : '---',
      icon: PATHS.users,
      color: T.amber,
      bg: '#ccd3dd',
    },
  ];
  const recents = [
    {
      text: 'Checklist collaudo strutturale',
      time: '10 min fa',
      icon: PATHS.chat,
      color: T.blue,
    },
    {
      text: 'SIA_261.pdf caricato',
      time: '1 ora fa',
      icon: PATHS.upload,
      color: T.green,
    },
    {
      text: 'Foto cantiere analizzata',
      time: '2 ore fa',
      icon: PATHS.camera,
      color: T.purple,
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>
          Buongiorno, {user.name.split(' ')[0]}
        </div>
        <div style={{ fontSize: 14, color: T.textSub, marginTop: 3 }}>
          Ecco un riepilogo della tua attivita
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4,1fr)',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {stats.map((st, i) => (
          <div
            key={i}
            style={{
              background: '#dce1ea',
              border: '1px solid ' + T.border,
              borderRadius: 14,
              padding: 18,
              boxShadow: T.shadow,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: st.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: st.color,
                marginBottom: 12,
              }}
            >
              <Icon d={st.icon} size={18} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>
              {st.val}
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#dce1ea',
            border: '1px solid ' + T.border,
            borderRadius: 14,
            padding: 20,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              marginBottom: 16,
            }}
          >
            Attivita recenti
          </div>
          {recents.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom:
                  i < recents.length - 1 ? '1px solid #c4ccd8' : 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: r.color + '12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: r.color,
                  flexShrink: 0,
                }}
              >
                <Icon d={r.icon} size={15} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                  {r.text}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{r.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: '#dce1ea',
            border: '1px solid ' + T.border,
            borderRadius: 14,
            padding: 20,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              marginBottom: 16,
            }}
          >
            Azioni rapide
          </div>
          {[
            {
              label: 'Chat Documenti',
              icon: PATHS.docs,
              color: T.purple,
              grad: T.gradPurple,
              page: 'chat_docs',
            },
            {
              label: 'Chat Edilizia',
              icon: PATHS.chat,
              color: T.blue,
              grad: T.gradBlue,
              page: 'chat_ai',
            },
            {
              label: 'Programma Lavori',
              icon: PATHS.gantt,
              color: '#0891b2',
              grad: 'linear-gradient(135deg,#0e7490,#0891b2)',
              page: 'gantt',
            },
          ].map((a, i) => (
            <div
              key={i}
              onClick={() => setPage(a.page)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                background: '#d6dce6',
                borderRadius: 10,
                marginBottom: 8,
                cursor: 'pointer',
                border: '1px solid ' + T.border,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: a.grad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon d={a.icon} size={15} stroke="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCESS DENIED ────────────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fef2f2',
          border: '2px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.red,
        }}
      >
        <Icon d={PATHS.shield} size={28} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: T.text,
            marginBottom: 6,
          }}
        >
          Accesso non autorizzato
        </div>
        <div style={{ fontSize: 14, color: T.textSub }}>
          Sezione riservata all amministratore.
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
function AdminUsers({ users, pending, onApprove, onReject }) {
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    boxShadow: T.shadow,
  };
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={pc}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
            Richieste in attesa
          </div>
          {pending.length > 0 && (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: '#fef3c7',
                color: T.amber,
              }}
            >
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: T.textMuted,
              fontSize: 13,
              padding: '12px 0',
            }}
          >
            Nessuna richiesta in attesa
          </div>
        )}
        {pending.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 0',
              borderBottom:
                i < pending.length - 1 ? '1px solid #c4ccd8' : 'none',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: T.gradBlue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {p.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {p.email} · {p.requestedAt}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onApprove(p.email)}
                style={{
                  padding: '7px 14px',
                  background: T.green,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Approva
              </button>
              <button
                onClick={() => onReject(p.email)}
                style={{
                  padding: '7px 14px',
                  background: '#d6dce6',
                  color: T.red,
                  border: '1.5px solid #fecaca',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Rifiuta
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={pc}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
          }}
        >
          Utenti attivi ({users.length})
        </div>
        {users.map((u, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: i < users.length - 1 ? '1px solid #c4ccd8' : 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: T.gradBlue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {u.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                {u.name}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{u.email}</div>
            </div>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: u.role === 'admin' ? '#eff6ff' : '#f0fdf4',
                color: u.role === 'admin' ? T.blue : T.green,
              }}
            >
              {u.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
// ─── API KEY PANEL ───────────────────────────────────────────────────────────
function ApiKeyPanel() {
  const [key, setKey] = useState(() => {
    try {
      return localStorage.getItem('es_anthropic_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const save = () => {
    try {
      localStorage.setItem('es_anthropic_key', key.trim());
    } catch (e) {}
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasKey = key.trim().length > 0;

  return (
    <div
      style={{
        background: '#dce1ea',
        border: '1.5px solid ' + (hasKey ? '#bbf7d0' : T.amber + '60'),
        borderRadius: 14,
        padding: 22,
        marginBottom: 16,
        boxShadow: T.shadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: hasKey
              ? 'linear-gradient(135deg,#047857,#059669)'
              : 'linear-gradient(135deg,#b45309,#d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          🔑
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
            API Key Anthropic
          </div>
          <div style={{ fontSize: 11, color: T.textSub }}>
            Necessaria per le funzioni AI del sito
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {hasKey && !editing && (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: '#f0fdf4',
                color: T.green,
                border: '1px solid #bbf7d0',
              }}
            >
              ✓ Configurata
            </span>
          )}
          {!hasKey && (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: '#fffbeb',
                color: T.amber,
                border: '1px solid #fde68a',
              }}
            >
              ⚠ Mancante
            </span>
          )}
        </div>
      </div>

      {!editing && hasKey && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: '#d6dce6',
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: T.textSub,
              flex: 1,
              fontFamily: 'monospace',
            }}
          >
            {key.substring(0, 8)}••••••••••••••••••••{key.slice(-4)}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '4px 12px',
              background: '#eff6ff',
              color: T.blue,
              border: '1px solid #bfdbfe',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Modifica
          </button>
          <button
            onClick={() => {
              setKey('');
              try {
                localStorage.removeItem('es_anthropic_key');
              } catch (e) {}
            }}
            style={{
              padding: '4px 12px',
              background: '#fef2f2',
              color: T.red,
              border: '1px solid #fecaca',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Rimuovi
          </button>
        </div>
      )}

      {(!hasKey || editing) && (
        <div>
          {!hasKey && (
            <div
              style={{
                fontSize: 12,
                color: T.textSub,
                marginBottom: 10,
                lineHeight: 1.6,
              }}
            >
              Inserisci la tua API key di Anthropic. La puoi trovare su{' '}
              <a
                href="https://console.anthropic.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.blue }}
              >
                console.anthropic.com/keys
              </a>
              . Viene salvata solo su questo browser.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              style={{ ...inp, flex: 1, fontFamily: 'monospace', fontSize: 13 }}
              placeholder="sk-ant-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') save();
              }}
            />
            <button
              onClick={save}
              disabled={!key.trim()}
              style={{
                padding: '0 18px',
                background: key.trim() ? T.gradBlue : '#d6dce6',
                color: key.trim() ? '#fff' : T.textMuted,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: key.trim() ? 'pointer' : 'default',
              }}
            >
              {saved ? '✓ Salvata' : 'Salva'}
            </button>
            {editing && (
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '0 14px',
                  background: '#d6dce6',
                  color: T.textSub,
                  border: '1px solid ' + T.border,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
            ⚠ Salvata solo in questo browser (localStorage). Non condividerla
            mai con altri.
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ user, onDeleteAccount }) {
  const ini = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    boxShadow: T.shadow,
  };

  const handleDelete = () => {
    if (confirmText !== user.email) return;
    setDeleting(true);
    // Clear all local data for this user
    try {
      localStorage.removeItem('es_shared_history');
      localStorage.removeItem('es_chat_' + user.email + '_docs');
      localStorage.removeItem('es_chat_' + user.email + '_general');
      // Remove user projects
      const projs = JSON.parse(localStorage.getItem('es_progetti') || '[]');
      localStorage.setItem(
        'es_progetti',
        JSON.stringify(projs.filter((p) => p.owner !== user.email))
      );
    } catch (e) {}
    setTimeout(() => onDeleteAccount(user.email), 800);
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={pc}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: T.gradBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {ini}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: T.text }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: T.textSub, marginTop: 2 }}>
              {user.email}
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  background: user.role === 'admin' ? '#eff6ff' : '#f0fdf4',
                  color: user.role === 'admin' ? T.blue : T.green,
                }}
              >
                {user.role === 'admin' ? 'Amministratore' : 'Utente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={pc}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
          }}
        >
          Informazioni account
        </div>
        {[
          { l: 'Nome', v: user.name },
          { l: 'Email', v: user.email },
          {
            l: 'Ruolo',
            v: user.role === 'admin' ? 'Amministratore' : 'Utente standard',
          },
          {
            l: 'Accesso documenti',
            v: user.role === 'admin' ? 'Completo' : 'Solo tramite Chat',
          },
          { l: 'Sessione', v: 'Attiva' },
        ].map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #c4ccd8',
              fontSize: 13,
            }}
          >
            <span style={{ color: T.textSub }}>{r.l}</span>
            <span style={{ fontWeight: 600, color: T.text }}>{r.v}</span>
          </div>
        ))}
      </div>

      {user.role === 'admin' && <ApiKeyPanel />}

      {/* Zona pericolosa */}
      <div
        style={{
          background: '#dce1ea',
          border: '1.5px solid #fecaca',
          borderRadius: 14,
          padding: 22,
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: T.red,
            marginBottom: 6,
          }}
        >
          Elimina account
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textSub,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          L eliminazione è permanente. Verranno cancellati tutti i tuoi dati:
          cronologia chat, progetti, preferenze. Questa azione non può essere
          annullata.
        </div>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            style={{
              padding: '9px 20px',
              background: '#fef2f2',
              color: T.red,
              border: '1.5px solid #fecaca',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Elimina il mio account
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 10 }}>
              Per confermare scrivi il tuo indirizzo email:{' '}
              <strong>{user.email}</strong>
            </div>
            <input
              style={{
                ...inp,
                marginBottom: 12,
                border: '1.5px solid #fecaca',
              }}
              placeholder={user.email}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleDelete}
                disabled={confirmText !== user.email || deleting}
                style={{
                  flex: 1,
                  padding: 11,
                  background:
                    confirmText === user.email ? '#dc2626' : '#e2e7ef',
                  color: confirmText === user.email ? '#fff' : T.textMuted,
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: confirmText === user.email ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {deleting
                  ? 'Eliminazione in corso...'
                  : 'Conferma eliminazione'}
              </button>
              <button
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText('');
                }}
                style={{
                  padding: '11px 18px',
                  background: '#d6dce6',
                  color: T.textSub,
                  border: '1px solid ' + T.border,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RANKING ─────────────────────────────────────────────────────────────────
function Ranking() {
  const mob = useIsMobile();
  const [gare, setGare] = useState(GARE_INIT);
  const [view, setView] = useState('list');
  const [sel, setSel] = useState(null);

  // Offerta: {id, ditta, importoNetto, iva, sconto, importoLordo, note}
  const emptyO = (id) => ({
    id,
    ditta: '',
    importoNetto: '',
    iva: '8.1',
    sconto: '0',
    ribasso: '0',
    importoLordo: '',
    note: '',
  });
  const [ng, setNg] = useState({
    nome: '',
    desc: '',
    contesto: '',
    offerte: [emptyO(1), emptyO(2), emptyO(3)],
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfResults, setPdfResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [situazione, setSituazione] = useState(null);
  const [situazioneLoading, setSituazioneLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [editOfferta, setEditOfferta] = useState(null); // id offerta in modifica nel dettaglio
  const pdfRef = useRef();
  const printRef = useRef();

  // ── Calcoli importi ──
  // Sconto = riduzione commerciale (su listino), Ribasso = ribasso d asta (su importo base)
  // Formula: (Netto × (1-Sconto%) × (1-Ribasso%)) × (1+IVA%)
  const calcLordo = (netto, iva, sconto, ribasso) => {
    const n = parseFloat(netto) || 0;
    const sc = parseFloat(sconto) || 0;
    const rb = parseFloat(ribasso) || 0;
    const iv = parseFloat(iva) || 0;
    return n * (1 - sc / 100) * (1 - rb / 100) * (1 + iv / 100);
  };
  const updO = (id, field, val) =>
    setNg((g) => ({
      ...g,
      offerte: g.offerte.map((o) => {
        if (o.id !== id) return o;
        const u = { ...o, [field]: val };
        // Ricalcola lordo automaticamente
        const netto = field === 'importoNetto' ? val : u.importoNetto;
        const iva = field === 'iva' ? val : u.iva;
        const sconto = field === 'sconto' ? val : u.sconto;
        const ribasso = field === 'ribasso' ? val : u.ribasso;
        u.importoLordo = calcLordo(netto, iva, sconto, ribasso).toFixed(2);
        return u;
      }),
    }));

  const { salva, modalJSX: rankingModalJSX } = useSalvaInProgetto(
    sel?.owner || 'guest'
  );
  const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('it-CH', { minimumFractionDigits: 2 });
  const posC = [T.green, T.blue, T.amber, T.textMuted];
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    boxShadow: T.shadow,
  };

  // ranked usa importoLordo se disponibile, altrimenti importoNetto o importo (legacy)
  const getImporto = (o) => parseFloat(o.importoLordo || o.importo || 0);
  const ranked = (offerte) =>
    [...offerte]
      .filter((o) => getImporto(o) > 0)
      .sort((a, b) => getImporto(a) - getImporto(b));
  const diff = (v, mn) => (((v - mn) / mn) * 100).toFixed(1);

  // ── Estrai da PDF ──
  const handlePdf = async (file) => {
    if (!file) return;
    setPdfLoading(true);
    setPdfError('');
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Errore lettura'));
        r.readAsDataURL(file);
      });
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system:
            'Estrai TUTTE le offerte da questo PDF di offerta edile svizzera. Per ogni offerta restituisci: ditta (nome impresa), importoNetto (CHF numerico senza simboli), iva (aliquota %, default 8.1), sconto (% sconto commerciale, default 0), ribasso (% ribasso asta, default 0), importoLordo (CHF finale numerico), note (max 80 caratteri). Rispondi SOLO con array JSON valido senza testo e senza backtick. Se non trovi offerte: []',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: b64,
                  },
                },
                {
                  type: 'text',
                  text: 'Estrai tutte le offerte con importo netto, IVA, sconti/ribassi e importo lordo finale.',
                },
              ],
            },
          ],
        }),
      });
      const data = await resp.json();
      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      let parsed = [];
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const m = text.match(/\[[\s\S]*\]/);
        if (m) parsed = JSON.parse(m[0]);
      }
      if (!Array.isArray(parsed) || !parsed.length) {
        setPdfError('Nessuna offerta trovata nel PDF.');
        return;
      }
      const newO = parsed.map((o, i) => ({
        id: Date.now() + i,
        ditta: o.ditta || '',
        importoNetto: String(o.importoNetto || ''),
        iva: String(o.iva || '8.1'),
        sconto: String(o.sconto || '0'),
        ribasso: String(o.ribasso || '0'),
        importoLordo: String(
          o.importoLordo ||
            calcLordo(
              o.importoNetto,
              o.iva || 8.1,
              o.sconto || 0,
              o.ribasso || 0
            ).toFixed(2)
        ),
        note: o.note || '',
      }));
      setNg((g) => {
        const ex = g.offerte.filter((x) => x.ditta.trim() || x.importoNetto);
        return { ...g, offerte: [...ex, ...newO] };
      });
      setPdfResults((p) => [...p, ...parsed]);
    } catch (e) {
      setPdfError('Errore: ' + e.message);
    }
    setPdfLoading(false);
  };

  // ── Analisi offerte ──
  const analyzeOfferte = async (gara) => {
    setAnalysis(null);
    setAnalysisLoading(true);
    const r = ranked(gara.offerte);
    const offerteText = r
      .map((o, i) => {
        const lordo = getImporto(o);
        const netto = parseFloat(o.importoNetto || o.importo || 0);
        const sconto = parseFloat(o.sconto || 0);
        const iva = parseFloat(o.iva || 0);
        const ribasso = parseFloat(o.ribasso || 0);
        return `Offerta ${i + 1} - ${o.ditta}:\n IVA escl.: CHF ${fmt(
          netto
        )}\n Sconto comm.: ${sconto}% Ribasso: ${ribasso}%\n IVA: ${iva}%\n IVA incl.: CHF ${fmt(
          lordo
        )}${o.note ? '\n Note: ' + o.note : ''}`;
      })
      .join('\n\n');
    try {
      const rKey = (() => {
        try {
          return localStorage.getItem('es_anthropic_key') || '';
        } catch (e) {
          return '';
        }
      })();
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': rKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system:
            'Sei un esperto di appalti edili svizzeri. Analizza le offerte e rispondi SOLO con JSON valido: {sintesi, raccomandazione:{ditta,motivo}, analisi_per_offerta:[{ditta, punti_attenzione:[], costi_nascosti:[], valutazione:"positiva|neutra|negativa", commento}], elementi_da_verificare:[], avvertenze:[]}. Rispondi SOLO con JSON valido.',
          messages: [
            {
              role: 'user',
              content: `Lavoro: ${gara.nome}\n${
                gara.desc ? 'Desc: ' + gara.desc + '\n' : ''
              }\n${offerteText}\n\nAnalizza tenendo conto di: varianti in offerta, elementi esclusi, costi aggiuntivi, IVA, sconti, condizioni particolari.`,
            },
          ],
        }),
      });
      const data = await resp.json();
      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      setAnalysis(
        parsed || {
          sintesi: text,
          analisi_per_offerta: [],
          elementi_da_verificare: [],
          avvertenze: [],
        }
      );
    } catch (e) {
      setAnalysis({
        sintesi: 'Errore: ' + e.message,
        analisi_per_offerta: [],
        elementi_da_verificare: [],
        avvertenze: [],
      });
    }
    setAnalysisLoading(false);
  };

  // ── Analisi situazione cantiere ──
  const analyzeSituazione = async (gara, contestoExtra) => {
    setSituazione(null);
    setSituazioneLoading(true);
    const r = ranked(gara.offerte);
    const offerteText = r
      .map(
        (o, i) =>
          `${i + 1}. ${o.ditta}: CHF ${fmt(getImporto(o))} lordo${
            o.note ? ', ' + o.note : ''
          }`
      )
      .join('\n');
    try {
      const rKey = (() => {
        try {
          return localStorage.getItem('es_anthropic_key') || '';
        } catch (e) {
          return '';
        }
      })();
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': rKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2500,
          system:
            'Sei un esperto direttore lavori svizzero. Genera un report professionale sulla situazione del cantiere/appalto. Rispondi SOLO con JSON con questi campi: titolo, situazione_generale (paragrafo), punti_critici (array di {titolo, descrizione, priorita: alta|media|bassa}), varianti_offerta (array stringhe), raccomandazioni_operative (array), rischi (array), prossimi_passi (array). SOLO JSON valido.',
          messages: [
            {
              role: 'user',
              content: `Lavoro: ${gara.nome}\n${
                gara.desc ? 'Descrizione: ' + gara.desc + '\n' : ''
              }\n${
                contestoExtra
                  ? 'Informazioni aggiuntive:\n' + contestoExtra + '\n'
                  : ''
              }\nOfferte ricevute:\n${offerteText}\n\nGenera un report dettagliato sulla situazione, con particolare attenzione a varianti in offerta, rischi, e raccomandazioni operative.`,
            },
          ],
        }),
      });
      const data = await resp.json();
      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      const result = parsed || {
        titolo: 'Report situazione',
        situazione_generale: text,
        punti_critici: [],
        varianti_offerta: [],
        raccomandazioni_operative: [],
        rischi: [],
        prossimi_passi: [],
      };
      setSituazione(result);
      setEditText(JSON.stringify(result, null, 2));
    } catch (e) {
      setSituazione({
        titolo: 'Errore',
        situazione_generale: 'Errore: ' + e.message,
        punti_critici: [],
        varianti_offerta: [],
        raccomandazioni_operative: [],
        rischi: [],
        prossimi_passi: [],
      });
    }
    setSituazioneLoading(false);
  };

  // ── Export PDF ──
  const exportPDF = (gara, anal, sit) => {
    const r = ranked(gara.offerte);
    const mn = getImporto(r[0]) || 0;
    const priC = ['#059669', '#2563eb', '#d97706', '#94a3b8'];
    const style = document.createElement('style');
    style.id = 'rank-print';
    style.innerHTML = `@media print{body>*{display:none!important}#rank-print-area{display:block!important}@page{size:A4;margin:12mm}}#rank-print-area{display:none;font-family:Arial,sans-serif;font-size:11px;color:#0f172a}`;
    document.head.appendChild(style);
    const area = document.createElement('div');
    area.id = 'rank-print-area';
    area.innerHTML = `
<div style="padding:16px">
<div style="display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:10px;margin-bottom:16px">
<div><div style="font-size:18px;font-weight:800">${
      gara.nome
    }</div><div style="font-size:11px;color:#64748b">${
      gara.desc || ''
    }</div></div>
<div style="text-align:right;font-size:10px;color:#64748b">Edilslab · ${new Date().toLocaleDateString(
      'it-CH'
    )}</div>
</div>
<div style="font-size:13px;font-weight:700;margin-bottom:8px">Graduatoria offerte</div>
<table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px">
<thead><tr style="background:#e2e7ef">
<th style="padding:6px 8px;text-align:left;border:1px solid #c4ccd8">Pos.</th>
<th style="padding:6px 8px;text-align:left;border:1px solid #c4ccd8">Ditta</th>
<th style="padding:6px 8px;text-align:right;border:1px solid #c4ccd8">Netto CHF</th>
<th style="padding:6px 8px;text-align:center;border:1px solid #c4ccd8">Sconto</th>
<th style="padding:6px 8px;text-align:center;border:1px solid #c4ccd8">IVA</th>
<th style="padding:6px 8px;text-align:right;border:1px solid #c4ccd8">Lordo CHF</th>
<th style="padding:6px 8px;text-align:right;border:1px solid #c4ccd8">Scarto</th>
<th style="padding:6px 8px;text-align:left;border:1px solid #c4ccd8">Note</th>
</tr></thead>
<tbody>${r
      .map((o, i) => {
        const lordo = getImporto(o);
        return `<tr style="background:${i === 0 ? '#dcfce7' : '#fff'}">
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center;font-weight:700;color:${
          priC[i] || '#94a3b8'
        }">${i + 1}</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;font-weight:${
          i === 0 ? 700 : 400
        }">${o.ditta}</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right">${fmt(
          o.importoNetto || o.importo || 0
        )}</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center">${
          o.sconto || 0
        }%</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center">${
          o.iva || '—'
        }%</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right;font-weight:700">${fmt(
          lordo
        )}</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right;color:${
          i === 0 ? '#059669' : '#dc2626'
        }">${i === 0 ? '—' : '+' + diff(lordo, mn) + '%'}</td>
<td style="padding:5px 8px;border:1px solid #e2e7ef;color:#64748b;font-size:9px">${
          o.note || '—'
        }</td>
</tr>`;
      })
      .join('')}</tbody>
</table>
${
  anal
    ? `<div style="margin-bottom:14px;padding:10px;background:#f5f3ff;border-left:3px solid #7c3aed">
<div style="font-weight:700;margin-bottom:4px">Analisi AI — Sintesi</div>
<div>${anal.sintesi || ''}</div>
${
  anal.raccomandazione
    ? `<div style="margin-top:6px;color:#059669;font-weight:700">Offerta consigliata: ${anal.raccomandazione.ditta} — ${anal.raccomandazione.motivo}</div>`
    : ''
}
</div>`
    : ''
}
${
  sit
    ? `<div style="margin-bottom:14px">
<div style="font-size:13px;font-weight:700;margin-bottom:6px">Situazione cantiere</div>
<div style="margin-bottom:8px">${sit.situazione_generale || ''}</div>
${
  sit.punti_critici && sit.punti_critici.length
    ? `<div style="font-weight:700;margin-bottom:4px">Punti critici</div>${sit.punti_critici
        .map(
          (p) =>
            `<div style="margin-bottom:4px;padding:4px 8px;background:#fef3c7;border-left:3px solid #d97706"><strong>${p.titolo}</strong> [${p.priorita}]: ${p.descrizione}</div>`
        )
        .join('')}`
    : ''
}
${
  sit.varianti_offerta && sit.varianti_offerta.length
    ? `<div style="font-weight:700;margin:8px 0 4px">Varianti in offerta</div>${sit.varianti_offerta
        .map((v) => `<div>• ${v}</div>`)
        .join('')}`
    : ''
}
${
  sit.raccomandazioni_operative && sit.raccomandazioni_operative.length
    ? `<div style="font-weight:700;margin:8px 0 4px">Raccomandazioni</div>${sit.raccomandazioni_operative
        .map((r) => `<div>• ${r}</div>`)
        .join('')}`
    : ''
}
</div>`
    : ''
}
<div style="font-size:9px;color:#94a3b8;border-top:1px solid #e2e7ef;padding-top:8px;margin-top:8px">Generato da Edilslab · ${new Date().toLocaleDateString(
      'it-CH'
    )} · Documento indicativo</div>
</div>`;
    document.body.appendChild(area);
    window.print();
    setTimeout(() => {
      document.body.removeChild(area);
      document.head.removeChild(style);
    }, 1000);
  };

  // ── VIEWS ──
  if (view === 'list')
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
              Confronto offerte
            </div>
            <div style={{ fontSize: 13, color: T.textSub }}>
              Graduatoria automatica con IVA e sconti
            </div>
          </div>
          <button
            onClick={() => {
              setView('new');
              setAnalysis(null);
              setSituazione(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              background: T.gradBlue,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <Icon d={PATHS.plus} size={15} /> Nuova
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
            gap: 14,
          }}
        >
          {gare.map((g) => {
            const r = ranked(g.offerte);
            const best = r[0];
            return (
              <div
                key={g.id}
                style={{
                  background: '#dce1ea',
                  border: '1px solid ' + T.border,
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: T.shadow,
                }}
              >
                <div
                  onClick={() => {
                    setSel(g);
                    setView('detail');
                    setAnalysis(null);
                    setSituazione(null);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: T.text,
                          marginBottom: 3,
                        }}
                      >
                        {g.nome}
                      </div>
                      {g.desc && (
                        <div style={{ fontSize: 12, color: T.textSub }}>
                          {g.desc}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          g.stato === 'chiusa' ? '#c4ccd8' : '#eff6ff',
                        color: g.stato === 'chiusa' ? T.textSub : T.blue,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {g.stato === 'chiusa' ? 'Chiusa' : 'Aperta'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#c8d8c8',
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: T.green,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 13, fontWeight: 700, color: T.text }}
                      >
                        {best ? best.ditta : '---'}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: T.green,
                          fontWeight: 800,
                        }}
                      >
                        CHF {best ? fmt(getImporto(best)) : '---'} lordo
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: T.textMuted,
                  }}
                >
                  <span>
                    {g.offerte.length} offerte · {g.data}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSel(g);
                      setView('detail');
                      analyzeOfferte(g);
                    }}
                    style={{
                      padding: '4px 12px',
                      background: T.purple + '15',
                      color: T.purple,
                      border: '1px solid ' + T.purple + '30',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✦ Analizza
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

  if (view === 'detail' && sel) {
    const r = ranked(sel.offerte);
    const mn = getImporto(r[0]) || 0;
    return (
      <div style={{ maxWidth: 760 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setView('list')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.blue,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            Indietro
          </button>
          <span style={{ color: '#b0b8c4' }}>|</span>
          <span
            style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}
          >
            {sel.nome}
          </span>
          <button
            onClick={() => setEditOfferta(null)}
            style={{
              display: editOfferta ? 'flex' : 'none',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: '#eff6ff',
              color: T.blue,
              border: '1px solid #bfdbfe',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ✓ Fine modifica
          </button>
          <button
            onClick={() =>
              salva(
                'graduatoria',
                'Graduatoria: ' +
                  sel.nome +
                  '\n\n' +
                  ranked(sel.offerte)
                    .map(
                      (o, i) =>
                        `${i + 1}. ${o.ditta} — IVA incl. CHF ${fmt(
                          getImporto(o)
                        )}`
                    )
                    .join('\n')
              )
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: '#f0fdf4',
              color: T.green,
              border: '1px solid #bbf7d0',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            💾 Progetto
          </button>
          <button
            onClick={() => exportPDF(sel, analysis, situazione)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: '#fef2f2',
              color: T.red,
              border: '1px solid #fecaca',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⬇ PDF
          </button>
        </div>

        {/* Graduatoria */}
        <div style={pc}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: T.text,
              marginBottom: 16,
            }}
          >
            Graduatoria
          </div>
          {r.map((o, i) => {
            const lordo = getImporto(o);
            const netto = parseFloat(o.importoNetto || o.importo || 0);
            const isEditing = editOfferta === o.id;
            const updSel = (field, val) => {
              const updList = sel.offerte.map((x) => {
                if (x.id !== o.id) return x;
                const u = { ...x, [field]: val };
                u.importoLordo = calcLordo(
                  field === 'importoNetto' ? val : u.importoNetto,
                  field === 'iva' ? val : u.iva,
                  field === 'sconto' ? val : u.sconto,
                  field === 'ribasso' ? val : u.ribasso
                ).toFixed(2);
                return u;
              });
              setSel((s) => ({ ...s, offerte: updList }));
              setGare((gs) =>
                gs.map((g) =>
                  g.id === sel.id ? { ...g, offerte: updList } : g
                )
              );
            };
            return (
              <div
                key={o.id}
                style={{
                  padding: '13px 0',
                  borderBottom: i < r.length - 1 ? '1px solid #c4ccd8' : 'none',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: (posC[i] || T.textMuted) + '15',
                      border: '2px solid ' + (posC[i] || T.textMuted),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: posC[i] || T.textMuted,
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          style={{
                            ...inp,
                            fontWeight: 700,
                            fontSize: 14,
                            flex: 1,
                          }}
                          value={o.ditta}
                          onChange={(e) => updSel('ditta', e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder="Nome ditta"
                        />
                        <button
                          onClick={() => {
                            const updList = sel.offerte.filter(
                              (x) => x.id !== o.id
                            );
                            setSel((s) => ({ ...s, offerte: updList }));
                            setGare((gs) =>
                              gs.map((g) =>
                                g.id === sel.id ? { ...g, offerte: updList } : g
                              )
                            );
                            setEditOfferta(null);
                          }}
                          style={{
                            padding: '6px 10px',
                            background: '#fef2f2',
                            color: T.red,
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          ✕ Elimina
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: T.text,
                          marginBottom: 4,
                        }}
                      >
                        {o.ditta}
                      </div>
                    )}
                    {isEditing ? (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 1fr',
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        {[
                          ['IVA escl.', 'importoNetto', 'number'],
                          ['Sconto%', 'sconto', 'number'],
                          ['Ribasso%', 'ribasso', 'number'],
                          ['IVA%', 'iva', 'number'],
                        ].map(([lbl, field, tp]) => (
                          <div key={field}>
                            <div
                              style={{
                                fontSize: 10,
                                color: T.textMuted,
                                marginBottom: 2,
                              }}
                            >
                              {lbl}
                            </div>
                            <input
                              style={{
                                ...inp,
                                padding: '6px 8px',
                                fontSize: 12,
                                textAlign: 'right',
                              }}
                              type={tp}
                              step="0.01"
                              value={o[field] || ''}
                              onChange={(e) => updSel(field, e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: T.textSub }}>
                          IVA escl.:{' '}
                          <strong style={{ color: T.text }}>
                            CHF {fmt(netto)}
                          </strong>
                        </span>
                        {parseFloat(o.sconto || 0) > 0 && (
                          <span style={{ color: T.green }}>
                            Sconto: <strong>{o.sconto}%</strong>
                          </span>
                        )}
                        {parseFloat(o.ribasso || 0) > 0 && (
                          <span style={{ color: '#0891b2' }}>
                            Ribasso: <strong>{o.ribasso}%</strong>
                          </span>
                        )}
                        {o.iva && (
                          <span style={{ color: T.textSub }}>
                            IVA: {o.iva}%
                          </span>
                        )}
                      </div>
                    )}
                    {isEditing ? (
                      <input
                        style={{
                          ...inp,
                          padding: '6px 8px',
                          fontSize: 11,
                          marginTop: 4,
                        }}
                        value={o.note || ''}
                        onChange={(e) => updSel('note', e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Note..."
                      />
                    ) : (
                      o.note && (
                        <div
                          style={{
                            fontSize: 11,
                            color: T.textSub,
                            marginTop: 3,
                            fontStyle: 'italic',
                          }}
                        >
                          {o.note}
                        </div>
                      )
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: posC[i] || T.textMuted,
                      }}
                    >
                      CHF {fmt(lordo)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: T.textMuted,
                        marginBottom: 2,
                      }}
                    >
                      IVA incl.
                    </div>
                    {i === 0 ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: T.green,
                          fontWeight: 700,
                        }}
                      >
                        Offerta piu bassa
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: T.red }}>
                        +{diff(lordo, mn)}%
                      </div>
                    )}
                    <button
                      onClick={() => setEditOfferta(isEditing ? null : o.id)}
                      style={{
                        marginTop: 4,
                        padding: '3px 10px',
                        background: isEditing ? T.green : '#d6dce6',
                        color: isEditing ? '#fff' : T.textSub,
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isEditing ? '✓ Ok' : '✎ Modifica'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabella dettagliata */}
        <div style={pc}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: T.text,
              marginBottom: 12,
            }}
          >
            Tabella dettagliata
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: '#d6dce6' }}>
                  {[
                    '#',
                    'Ditta',
                    'IVA escl. CHF',
                    'Sconto%',
                    'Ribasso%',
                    'IVA%',
                    'IVA incl. CHF',
                    'Scarto',
                    'Note',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 10px',
                        textAlign: [
                          'Netto CHF',
                          'Lordo CHF',
                          'Scarto',
                        ].includes(h)
                          ? 'right'
                          : 'left',
                        color: T.textSub,
                        fontWeight: 700,
                        borderBottom: '1px solid ' + T.border,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.map((o, i) => {
                  const lordo = getImporto(o);
                  const netto = parseFloat(o.importoNetto || o.importo || 0);
                  return (
                    <tr
                      key={o.id}
                      style={{
                        background: i === 0 ? '#dcfce7' : 'transparent',
                      }}
                    >
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: posC[i] || T.textMuted,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          fontWeight: i === 0 ? 700 : 400,
                          color: T.text,
                        }}
                      >
                        {o.ditta}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'right',
                          color: T.textSub,
                        }}
                      >
                        {fmt(netto)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'center',
                          color:
                            parseFloat(o.sconto || 0) > 0
                              ? T.green
                              : T.textMuted,
                          fontWeight: parseFloat(o.sconto || 0) > 0 ? 700 : 400,
                        }}
                      >
                        {o.sconto || 0}%
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'center',
                          color:
                            parseFloat(o.ribasso || 0) > 0
                              ? '#0891b2'
                              : T.textMuted,
                          fontWeight:
                            parseFloat(o.ribasso || 0) > 0 ? 700 : 400,
                        }}
                      >
                        {o.ribasso || 0}%
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'center',
                          color: T.textSub,
                        }}
                      >
                        {o.iva || '—'}%
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: posC[i] || T.textMuted,
                        }}
                      >
                        {fmt(lordo)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          textAlign: 'right',
                          color: i === 0 ? T.green : T.red,
                          fontWeight: 700,
                        }}
                      >
                        {i === 0 ? '—' : '+' + diff(lordo, mn) + '%'}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #c4ccd8',
                          color: T.textSub,
                          fontSize: 10,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {o.note || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: '9px 14px',
              background: '#d6dce6',
              borderRadius: 10,
              fontSize: 12,
              color: T.textSub,
              border: '1px solid ' + T.border,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span>
              Risparmio massimo lordo:{' '}
              <strong style={{ color: T.green }}>
                CHF {fmt(getImporto(r[r.length - 1]) - mn)}
              </strong>
            </span>
            <span style={{ color: T.textMuted }}>
              rispetto all offerta piu alta
            </span>
          </div>
        </div>

        {/* Analisi AI offerte */}
        <div style={{ ...pc, border: '1.5px solid ' + T.purple + '40' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: T.gradPurple,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon d={PATHS.spark} size={15} stroke="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                  Analisi AI offerte
                </div>
                <div style={{ fontSize: 11, color: T.textSub }}>
                  Elementi esclusi, costi nascosti, varianti, raccomandazione
                </div>
              </div>
            </div>
            {!analysisLoading && (
              <button
                onClick={() => analyzeOfferte(sel)}
                style={{
                  padding: '7px 14px',
                  background: T.gradPurple,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {analysis ? '↻ Rianalizza' : '✦ Analizza'}
              </button>
            )}
          </div>
          {analysisLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 0',
                color: T.purple,
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid ' + T.purple,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Analisi in corso...
            </div>
          )}
          {analysis && !analysisLoading && (
            <div>
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: 10,
                  marginBottom: 12,
                  fontSize: 13,
                  color: '#4c1d95',
                  lineHeight: 1.6,
                }}
              >
                {analysis.sintesi}
              </div>
              {analysis.raccomandazione && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 10,
                    marginBottom: 12,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: T.green }}
                    >
                      Offerta consigliata: {analysis.raccomandazione.ditta}
                    </div>
                    <div style={{ fontSize: 12, color: '#166534' }}>
                      {analysis.raccomandazione.motivo}
                    </div>
                  </div>
                </div>
              )}
              {analysis.analisi_per_offerta &&
                analysis.analisi_per_offerta.map((a, i) => {
                  const vC =
                    a.valutazione === 'positiva'
                      ? T.green
                      : a.valutazione === 'negativa'
                      ? T.red
                      : T.amber;
                  return (
                    <div
                      key={i}
                      style={{
                        background: '#d6dce6',
                        border: '1px solid ' + T.border,
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: (posC[i] || T.textMuted) + '20',
                            border: '2px solid ' + (posC[i] || T.textMuted),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: posC[i] || T.textMuted,
                            fontWeight: 800,
                            fontSize: 10,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span
                          style={{ fontWeight: 700, fontSize: 13, flex: 1 }}
                        >
                          {a.ditta}
                        </span>
                        <span
                          style={{
                            padding: '2px 9px',
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 700,
                            background: vC + '15',
                            color: vC,
                            border: '1px solid ' + vC + '40',
                          }}
                        >
                          {a.valutazione}
                        </span>
                      </div>
                      {a.commento && (
                        <div
                          style={{
                            fontSize: 12,
                            color: T.textSub,
                            marginBottom: 6,
                            fontStyle: 'italic',
                          }}
                        >
                          {a.commento}
                        </div>
                      )}
                      {a.punti_attenzione && a.punti_attenzione.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: T.amber,
                              marginBottom: 3,
                            }}
                          >
                            ⚠ Attenzione
                          </div>
                          {a.punti_attenzione.map((p, pi) => (
                            <div
                              key={pi}
                              style={{
                                fontSize: 11,
                                padding: '2px 0 2px 10px',
                                borderLeft: '2px solid ' + T.amber + '60',
                                marginBottom: 2,
                              }}
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      )}
                      {a.costi_nascosti && a.costi_nascosti.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: T.red,
                              marginBottom: 3,
                            }}
                          >
                            💶 Costi extra potenziali
                          </div>
                          {a.costi_nascosti.map((c, ci) => (
                            <div
                              key={ci}
                              style={{
                                fontSize: 11,
                                padding: '2px 0 2px 10px',
                                borderLeft: '2px solid ' + T.red + '60',
                                marginBottom: 2,
                              }}
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              {analysis.elementi_da_verificare &&
                analysis.elementi_da_verificare.length > 0 && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.blue,
                        marginBottom: 6,
                      }}
                    >
                      ❓ Domande da fare agli offerenti
                    </div>
                    {analysis.elementi_da_verificare.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          color: '#1e40af',
                          padding: '2px 0',
                          display: 'flex',
                          gap: 6,
                        }}
                      >
                        <span>{i + 1}.</span>
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              {analysis.avvertenze && analysis.avvertenze.length > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.red,
                      marginBottom: 5,
                    }}
                  >
                    ⚠ Avvertenze
                  </div>
                  {analysis.avvertenze.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: '#991b1b',
                        padding: '2px 0',
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!analysis && !analysisLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: T.textMuted,
                fontSize: 13,
              }}
            >
              Clicca <strong style={{ color: T.purple }}>✦ Analizza</strong> per
              l analisi dettagliata
            </div>
          )}
        </div>

        {/* Situazione cantiere */}
        <div style={{ ...pc, border: '1.5px solid #0891b2' + '40' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: 'linear-gradient(135deg,#0e7490,#0891b2)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon d={PATHS.info} size={15} stroke="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                  Situazione cantiere
                </div>
                <div style={{ fontSize: 11, color: T.textSub }}>
                  Report AI: varianti, rischi, raccomandazioni operative
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {situazione && !situazioneLoading && (
                <>
                  <button
                    onClick={() => {
                      setEditMode((v) => !v);
                      setEditText(JSON.stringify(situazione, null, 2));
                    }}
                    style={{
                      padding: '6px 12px',
                      background: editMode ? '#d6dce6' : '#eff6ff',
                      color: editMode ? T.textSub : T.blue,
                      border: '1px solid ' + (editMode ? T.border : '#bfdbfe'),
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {editMode ? 'Annulla' : '✎ Modifica'}
                  </button>
                  {editMode && (
                    <button
                      onClick={() => {
                        try {
                          setSituazione(JSON.parse(editText));
                          setEditMode(false);
                        } catch (e) {
                          alert('JSON non valido');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        background: T.green,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Salva
                    </button>
                  )}
                </>
              )}
              {!situazioneLoading && (
                <button
                  onClick={() => analyzeSituazione(sel, sel.contesto || '')}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg,#0e7490,#0891b2)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {situazione ? '↻ Rigenera' : '✦ Genera'}
                </button>
              )}
            </div>
          </div>

          {/* Campo contesto libero */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: T.textSub,
                marginBottom: 5,
              }}
            >
              Informazioni aggiuntive sul cantiere (opzionale)
            </label>
            <textarea
              style={{
                ...inp,
                minHeight: 72,
                resize: 'vertical',
                fontSize: 13,
                lineHeight: 1.6,
              }}
              placeholder="Es: il cantiere è in zona montana, accesso difficile, ci sono vincoli storici, il committente vuole completare entro marzo, la variante A proposta dalla ditta X riguarda..."
              value={sel.contesto || ''}
              onChange={(e) =>
                setSel((s) => ({ ...s, contesto: e.target.value }))
              }
            />
          </div>

          {situazioneLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 0',
                color: '#0891b2',
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #0891b2',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Generazione report situazione...
            </div>
          )}

          {situazione && !situazioneLoading && !editMode && (
            <div>
              <div
                style={{
                  padding: '10px 14px',
                  background: '#ecfeff',
                  border: '1px solid #a5f3fc',
                  borderRadius: 10,
                  marginBottom: 12,
                  fontSize: 13,
                  color: '#164e63',
                  lineHeight: 1.7,
                }}
              >
                {situazione.situazione_generale}
              </div>
              {situazione.punti_critici &&
                situazione.punti_critici.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.text,
                        marginBottom: 8,
                      }}
                    >
                      Punti critici
                    </div>
                    {situazione.punti_critici.map((p, i) => {
                      const pC =
                        p.priorita === 'alta'
                          ? T.red
                          : p.priorita === 'media'
                          ? T.amber
                          : T.green;
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '9px 12px',
                            background: '#d6dce6',
                            border: '1px solid ' + pC + '30',
                            borderLeft: '3px solid ' + pC,
                            borderRadius: '0 8px 8px 0',
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              marginBottom: 3,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: T.text,
                              }}
                            >
                              {p.titolo}
                            </span>
                            <span
                              style={{
                                padding: '1px 8px',
                                background: pC + '15',
                                color: pC,
                                border: '1px solid ' + pC + '30',
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {p.priorita}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: T.textSub }}>
                            {p.descrizione}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              {situazione.varianti_offerta &&
                situazione.varianti_offerta.length > 0 && (
                  <div
                    style={{
                      marginBottom: 12,
                      padding: '10px 14px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.amber,
                        marginBottom: 6,
                      }}
                    >
                      📋 Varianti in offerta
                    </div>
                    {situazione.varianti_offerta.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 12,
                          color: '#92400e',
                          padding: '2px 0',
                          display: 'flex',
                          gap: 6,
                        }}
                      >
                        <span>•</span>
                        {v}
                      </div>
                    ))}
                  </div>
                )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
                  gap: 10,
                }}
              >
                {situazione.raccomandazioni_operative &&
                  situazione.raccomandazioni_operative.length > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: T.green,
                          marginBottom: 6,
                        }}
                      >
                        ✓ Raccomandazioni
                      </div>
                      {situazione.raccomandazioni_operative.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 12,
                            color: '#166534',
                            padding: '2px 0',
                          }}
                        >
                          • {r}
                        </div>
                      ))}
                    </div>
                  )}
                {situazione.prossimi_passi &&
                  situazione.prossimi_passi.length > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: T.blue,
                          marginBottom: 6,
                        }}
                      >
                        → Prossimi passi
                      </div>
                      {situazione.prossimi_passi.map((p, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 12,
                            color: '#1e40af',
                            padding: '2px 0',
                          }}
                        >
                          {i + 1}. {p}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              {situazione.rischi && situazione.rischi.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.red,
                      marginBottom: 5,
                    }}
                  >
                    ⚠ Rischi identificati
                  </div>
                  {situazione.rischi.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: '#991b1b',
                        padding: '2px 0',
                      }}
                    >
                      • {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {editMode && (
            <div>
              <div
                style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}
              >
                Modifica il JSON del report — usa la struttura esistente
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  ...inp,
                  minHeight: 300,
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              />
            </div>
          )}

          {!situazione && !situazioneLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                color: T.textMuted,
                fontSize: 13,
              }}
            >
              Aggiungi informazioni sul cantiere e clicca{' '}
              <strong style={{ color: '#0891b2' }}>✦ Genera</strong> per il
              report situazione
            </div>
          )}
        </div>
        {rankingModalJSX}
      </div>
    );
  }

  if (view === 'new')
    return (
      <div style={{ maxWidth: 640 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => {
              setView('list');
              setPdfResults([]);
              setPdfError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.blue,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            Annulla
          </button>
          <span style={{ color: '#b0b8c4' }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
            Nuova gara
          </span>
        </div>

        <div style={pc}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              marginBottom: 14,
            }}
          >
            Dati gara
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Nome lavoro *
            </label>
            <input
              style={inp}
              placeholder="es. Opere murarie Cantiere B"
              value={ng.nome}
              onChange={(e) => setNg((g) => ({ ...g, nome: e.target.value }))}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Descrizione
            </label>
            <input
              style={inp}
              placeholder="opzionale"
              value={ng.desc}
              onChange={(e) => setNg((g) => ({ ...g, desc: e.target.value }))}
            />
          </div>
        </div>

        <div style={pc}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                Offerte
              </div>
              <div style={{ fontSize: 11, color: T.textSub, marginTop: 2 }}>
                Carica PDF o aggiungi manualmente — le offerte si sommano
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => !pdfLoading && pdfRef.current.click()}
                disabled={pdfLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  background: T.gradPurple,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: pdfLoading ? 'default' : 'pointer',
                  opacity: pdfLoading ? 0.7 : 1,
                }}
              >
                {pdfLoading ? (
                  <>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Lettura...
                  </>
                ) : (
                  <>
                    <Icon d={PATHS.upload} size={13} />
                    Carica PDF
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  setNg((g) => ({
                    ...g,
                    offerte: [...g.offerte, emptyO(Date.now())],
                  }))
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 13px',
                  background: '#eff6ff',
                  color: T.blue,
                  border: '1px solid #bfdbfe',
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Icon d={PATHS.plus} size={13} />
                Manuale
              </button>
            </div>
          </div>
          <input
            ref={pdfRef}
            type="file"
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              [...e.target.files].forEach((f) => handlePdf(f));
              e.target.value = '';
            }}
          />
          {pdfError && (
            <div
              style={{
                padding: '9px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 9,
                fontSize: 12,
                color: T.red,
                marginBottom: 10,
              }}
            >
              {pdfError}
            </div>
          )}
          {pdfResults.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 9,
                fontSize: 12,
                color: T.green,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              ✓ {pdfResults.length} offerte estratte — puoi aggiungerne altre
            </div>
          )}

          {/* Intestazione colonne */}
          {ng.offerte.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 2fr 1fr 72px 72px 80px 1fr 32px',
                gap: 6,
                marginBottom: 4,
                padding: '0 4px',
              }}
            >
              {[
                '',
                'Ditta',
                'IVA escl. CHF',
                'Sconto%',
                'Ribasso%',
                'IVA%',
                'IVA incl. CHF',
                'Note',
                '',
              ].map((h, i) => (
                <div
                  key={i}
                  style={{ fontSize: 10, fontWeight: 700, color: T.textMuted }}
                >
                  {h}
                </div>
              ))}
            </div>
          )}

          {ng.offerte.map((o, i) => (
            <div
              key={o.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 2fr 1fr 72px 72px 80px 1fr 32px',
                gap: 6,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#d6dce6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.textSub,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <input
                style={{ ...inp, padding: '8px 10px', fontSize: 12 }}
                placeholder="Nome ditta"
                value={o.ditta}
                onChange={(e) => updO(o.id, 'ditta', e.target.value)}
              />
              <input
                style={{ ...inp, padding: '8px 10px', fontSize: 12 }}
                placeholder="es. 44000"
                type="number"
                value={o.importoNetto}
                onChange={(e) => updO(o.id, 'importoNetto', e.target.value)}
              />
              <input
                style={{
                  ...inp,
                  padding: '8px 10px',
                  fontSize: 12,
                  textAlign: 'center',
                }}
                placeholder="0"
                type="number"
                step="0.1"
                value={o.sconto}
                onChange={(e) => updO(o.id, 'sconto', e.target.value)}
              />
              <input
                style={{
                  ...inp,
                  padding: '8px 10px',
                  fontSize: 12,
                  textAlign: 'center',
                }}
                placeholder="0"
                type="number"
                step="0.1"
                value={o.ribasso}
                onChange={(e) => updO(o.id, 'ribasso', e.target.value)}
              />
              <input
                style={{
                  ...inp,
                  padding: '8px 10px',
                  fontSize: 12,
                  textAlign: 'center',
                }}
                placeholder="8.1"
                type="number"
                step="0.1"
                value={o.iva}
                onChange={(e) => updO(o.id, 'iva', e.target.value)}
              />
              <div
                style={{
                  padding: '8px 10px',
                  background: '#c8d8c8',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.green,
                  textAlign: 'right',
                  border: '1px solid #bbf7d0',
                }}
              >
                {o.importoLordo ? fmt(o.importoLordo) : '—'}
              </div>
              <input
                style={{ ...inp, padding: '8px 10px', fontSize: 11 }}
                placeholder="Note..."
                value={o.note}
                onChange={(e) => updO(o.id, 'note', e.target.value)}
              />
              {ng.offerte.length > 1 ? (
                <button
                  onClick={() =>
                    setNg((g) => ({
                      ...g,
                      offerte: g.offerte.filter((x) => x.id !== o.id),
                    }))
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#b0b8c4',
                    padding: 4,
                  }}
                >
                  <Icon d={PATHS.trash} size={14} />
                </button>
              ) : (
                <div />
              )}
            </div>
          ))}
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
            IVA incl. = IVA escl. × (1−Sconto%) × (1−Ribasso%) × (1+IVA%)
          </div>
        </div>

        <button
          onClick={() => {
            if (!ng.nome.trim()) return;
            const v = ng.offerte.filter(
              (o) => o.ditta && (o.importoNetto || o.importo)
            );
            if (!v.length) return;
            setGare((gs) => [
              ...gs,
              {
                ...ng,
                id: Date.now(),
                data: new Date().toLocaleDateString('it-CH'),
                stato: 'aperta',
                offerte: v,
              },
            ]);
            setNg({
              nome: '',
              desc: '',
              contesto: '',
              offerte: [emptyO(1), emptyO(2), emptyO(3)],
            });
            setPdfResults([]);
            setPdfError('');
            setView('list');
          }}
          style={{ ...btnP, marginTop: 0 }}
        >
          Genera graduatoria
        </button>
      </div>
    );
  return null;
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({ user }) {
  const mob = useIsMobile();
  const [view, setView] = useState('list');
  const {
    salva,
    saved: projSaved,
    modalJSX,
  } = useSalvaInProgetto(user?.email || 'guest');
  const [tmpl, setTmpl] = useState(null);
  const [fields, setFields] = useState({});
  const [gen, setGen] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState([
    {
      id: 1,
      nome: 'Perizia strutturale via Lugano 12',
      tipo: 'Perizia Strutturale',
      data: '12.05.2024',
      color: T.blue,
      createdAt: Date.now() - 25 * 86400000,
    },
    {
      id: 2,
      nome: 'Ispezione Cantiere B',
      tipo: 'Rapporto di Ispezione',
      data: '20.05.2024',
      color: T.purple,
      createdAt: Date.now() - 5 * 86400000,
    },
  ]);
  const daysLeft = (ca) =>
    Math.max(0, 30 - Math.floor((Date.now() - ca) / 86400000));
  const doGen = () => {
    setBusy(true);
    setTimeout(() => {
      setGen(genReport(tmpl, fields));
      setBusy(false);
      setView('preview');
    }, 1400);
  };
  const doSave = () => {
    setSaved((sv) => [
      ...sv,
      {
        id: Date.now(),
        nome:
          fields.oggetto ||
          fields.cantiere ||
          fields.opera ||
          fields.tipo ||
          'Rapporto',
        tipo: tmpl.label,
        data: new Date().toLocaleDateString('it-CH'),
        color: tmpl.color,
        createdAt: Date.now(),
      },
    ]);
    setView('list');
  };
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 22,
    boxShadow: T.shadow,
  };
  if (view === 'list')
    return (
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.textSub,
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          Nuovo rapporto
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4,1fr)',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {TMPLS.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setTmpl(t);
                setFields({});
                setGen('');
                setView('form');
              }}
              style={{
                background: '#dce1ea',
                border: '1.5px solid ' + t.color + '25',
                borderRadius: 14,
                padding: 18,
                cursor: 'pointer',
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: t.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: t.color,
                  marginBottom: 12,
                }}
              >
                <Icon d={PATHS[t.icon] || PATHS.file} size={19} />
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.text,
                  marginBottom: 5,
                }}
              >
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>
                {t.desc}
              </div>
            </div>
          ))}
        </div>
        {saved.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.textSub,
                marginBottom: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Rapporti salvati
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mob ? '1fr' : '1fr 1fr',
                gap: 12,
              }}
            >
              {saved.map((r) => {
                const left = daysLeft(r.createdAt);
                const urg = left <= 7;
                return (
                  <div
                    key={r.id}
                    style={{
                      background: '#dce1ea',
                      border: '1px solid ' + (urg ? '#fecaca' : T.border),
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: T.shadow,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: r.color + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: r.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon d={PATHS.file} size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {r.nome}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>
                        {r.tipo} · {r.data}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 2,
                          color: urg ? T.red : T.textMuted,
                          fontWeight: urg ? 700 : 400,
                        }}
                      >
                        {left === 0
                          ? 'Scade oggi'
                          : left <= 7
                          ? 'Scade tra ' + left + 'gg'
                          : 'Eliminazione tra ' + left + ' giorni'}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSaved((sv) => sv.filter((x) => x.id !== r.id))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#b0b8c4',
                        padding: 6,
                      }}
                    >
                      <Icon d={PATHS.trash} size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  if (view === 'form' && tmpl)
    return (
      <div style={{ maxWidth: 620 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setView('list')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.blue,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            Indietro
          </button>
          <span style={{ color: '#b0b8c4' }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
            {tmpl.label}
          </span>
        </div>
        <div style={pc}>
          <div
            style={{
              background: tmpl.color + '0c',
              border: '1px solid ' + tmpl.color + '25',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 20,
              fontSize: 12,
              color: tmpl.color,
              fontWeight: 600,
            }}
          >
            {tmpl.id === 'libero'
              ? 'Descrivi liberamente, l AI generera un rapporto professionale'
              : 'Compila i campi, l AI formattera il rapporto'}
          </div>
          {tmpl.fields.map((f) => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 6,
                }}
              >
                {f.l}
              </label>
              {f.ta ? (
                <textarea
                  style={{
                    ...inp,
                    resize: 'vertical',
                    minHeight: f.rows ? f.rows * 24 : 80,
                    lineHeight: 1.6,
                  }}
                  placeholder={f.ph}
                  value={fields[f.k] || ''}
                  onChange={(e) =>
                    setFields((fv) => ({ ...fv, [f.k]: e.target.value }))
                  }
                />
              ) : (
                <input
                  style={inp}
                  placeholder={f.ph}
                  value={fields[f.k] || ''}
                  onChange={(e) =>
                    setFields((fv) => ({ ...fv, [f.k]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
          <button
            onClick={doGen}
            disabled={busy}
            style={{
              ...btnP,
              background: busy ? '#c4ccd8' : T.gradBlue,
              color: busy ? T.textMuted : '#fff',
            }}
          >
            {busy ? 'Generazione in corso...' : 'Genera rapporto'}
          </button>
        </div>
      </div>
    );
  if (view === 'preview')
    return (
      <>
        <div style={{ maxWidth: 700 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setView('form')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: T.blue,
                fontSize: 13,
                fontWeight: 700,
                padding: 0,
              }}
            >
              Modifica
            </button>
            <span style={{ color: '#b0b8c4' }}>|</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
              Anteprima
            </span>
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  padding: '7px 14px',
                  background: copied ? T.green : '#d6dce6',
                  color: copied ? '#fff' : T.textSub,
                  border: '1px solid ' + T.border,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copiato!' : 'Copia testo'}
              </button>
              <button
                style={{
                  padding: '7px 14px',
                  background: '#eff6ff',
                  color: T.blue,
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Word
              </button>
              <button
                style={{
                  padding: '7px 14px',
                  background: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                PDF
              </button>
              <button
                style={{
                  padding: '7px 14px',
                  background: '#f0fdf4',
                  color: T.green,
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Excel
              </button>
              <button
                onClick={doSave}
                style={{
                  padding: '7px 16px',
                  background: T.gradBlue,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Salva
              </button>
              <button
                onClick={() => salva('rapporto', gen)}
                style={{
                  padding: '7px 14px',
                  background: projSaved ? '#f0fdf4' : '#d6dce6',
                  color: projSaved ? T.green : T.textSub,
                  border: '1px solid ' + (projSaved ? '#bbf7d0' : T.border),
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {projSaved ? '✓ Salvato' : '💾 Progetto'}
              </button>
            </div>
          </div>
          <div
            style={{
              background: '#dce1ea',
              border: '1px solid ' + T.border,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: T.shadowMd,
            }}
          >
            <div
              style={{
                background: T.gradBlue,
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon d={PATHS.building} size={20} stroke="#fff" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
                    Edilslab
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    Svizzera Italiana
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                  {new Date().toLocaleDateString('it-CH')}
                </div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {tmpl.label}
                </div>
              </div>
            </div>
            <div style={{ padding: mob ? 20 : 32 }}>
              <pre
                style={{
                  fontFamily: 'inherit',
                  fontSize: 13,
                  lineHeight: 1.85,
                  color: T.text,
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {gen}
              </pre>
            </div>
            <div
              style={{
                padding: '12px 28px',
                background: '#d6dce6',
                borderTop: '1px solid ' + T.border,
                fontSize: 11,
                color: T.textMuted,
              }}
            >
              Generato da Edilslab · {new Date().toLocaleDateString('it-CH')} ·
              Verificare con professionista abilitato
            </div>
          </div>
        </div>
        {modalJSX}
      </>
    );
  return null;
}

// ─── GANTT PLANNER V3 ────────────────────────────────────────────────────────
function GanttPlanner({ user }) {
  const mob = useIsMobile();
  const today = new Date().toISOString().split('T')[0];
  const {
    salva,
    saved: ganttSaved,
    modalJSX: ganttModalJSX,
  } = useSalvaInProgetto(user?.email || 'guest');

  // ── State ──
  const [tasks, setTasks] = useState([]);
  const [pName, setPName] = useState('Programma Lavori');
  const [pLoc, setPLoc] = useState('');
  const [pClient, setPClient] = useState('');
  const [festivi, setFestivi] = useState(DEFAULT_FESTIVI);
  const [newFest, setNewFest] = useState('');
  const [panel, setPanel] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // AI
  const [aiMode, setAiMode] = useState('template'); // "template" | "prompt"
  const [aiType, setAiType] = useState('');
  const [aiCustomName, setAiCustomName] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStart, setAiStart] = useState(today);
  const [generating, setGenerating] = useState(false);

  // Drag
  const [dragging, setDragging] = useState(null); // {id, startX, origInizio}
  const [linkMode, setLinkMode] = useState(false);
  const [linkFrom, setLinkFrom] = useState(null);

  // New task form
  const emptyTask = {
    nome: '',
    durata: '5',
    inizio: today,
    isGroup: false,
    color: '#2563eb',
    level: 0,
    dep: '',
  };
  const [nt, setNt] = useState({ ...emptyTask });

  const ganttRef = useRef();
  const fs = new Set(festivi);

  // ── Core: applica dipendenze con ordinamento topologico ──
  // Riceve i festivi come parametro per evitare closure stale dentro setTasks
  const applyDepsWithFs = (tl, fsSet) => {
    const map = {};
    tl.forEach((t) => {
      map[t.id] = { ...t };
    });
    // Topological visit: garantisce che il predecessore sia già aggiornato prima del successore
    const visited = new Set();
    const sorted = [];
    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      const t = map[id];
      if (t && t.dep) {
        const depId = parseInt(t.dep);
        if (map[depId]) visit(depId);
      }
      sorted.push(id);
    };
    tl.forEach((t) => visit(t.id));
    // Propaga date in ordine topologico
    sorted.forEach((id) => {
      const t = map[id];
      if (!t || !t.dep) return;
      const p = map[parseInt(t.dep)];
      if (!p) return;
      // Il successore inizia il primo giorno lavorativo dopo la fine del predecessore
      const ni = nextWorkDay(addDays(p.fine, 1), fsSet);
      map[id] = { ...t, inizio: ni, fine: addWorkDays(ni, t.durata, fsSet) };
    });
    return tl.map((t) => map[t.id] || t);
  };

  // ── updTaskFn: aggiorna un campo e poi propaga dipendenze ──
  const updTaskFn = (ts, id, field, val, fsSet) => {
    const updated = ts.map((t) => {
      if (t.id !== id) return t;
      const u = { ...t, [field]: val };
      if (field === 'inizio') {
        const s = nextWorkDay(val, fsSet);
        u.inizio = s;
        u.fine = addWorkDays(s, u.durata, fsSet);
      }
      if (field === 'durata') {
        u.durata = val;
        u.fine = addWorkDays(u.inizio, val, fsSet);
      }
      if (field === 'fine') {
        u.fine = val;
        u.durata = countWorkDays(u.inizio, val, fsSet);
      }
      return u;
    });
    return applyDepsWithFs(updated, fsSet);
  };

  // updTask: cattura i festivi correnti al momento della chiamata (no stale closure)
  const updTask = (id, field, val) => {
    const currentFs = new Set(festivi);
    setTasks((ts) => updTaskFn(ts, id, field, val, currentFs));
  };

  const applyDepsFn = (tl) => applyDepsWithFs(tl, new Set(festivi));
  const propagate = () => {
    const currentFs = new Set(festivi);
    setTasks((ts) => applyDepsWithFs(ts, currentFs));
  };

  // ── Task ops ──
  const addTask = () => {
    if (!nt.nome.trim()) return;
    const ini = nextWorkDay(nt.inizio, fs);
    const fine = addWorkDays(ini, nt.durata, fs); // durata is flexible string
    const cfAdd = new Set(festivi);
    setTasks((t) =>
      applyDepsWithFs(
        [...t, { ...nt, id: Date.now(), inizio: ini, fine }],
        cfAdd
      )
    );
    setNt((n) => ({ ...emptyTask, inizio: n.inizio, color: n.color }));
    // keep panel open for quick multi-add
  };
  const delTask = (id) => setTasks((t) => t.filter((x) => x.id !== id));
  const moveUp = (id) =>
    setTasks((t) => {
      const i = t.findIndex((x) => x.id === id);
      if (i <= 0) return t;
      const n = [...t];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });
  const moveDown = (id) =>
    setTasks((t) => {
      const i = t.findIndex((x) => x.id === id);
      if (i >= t.length - 1) return t;
      const n = [...t];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n;
    });
  const duplicateTask = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const cfDup = new Set(festivi);
    setTasks((ts) =>
      applyDepsWithFs(
        [...ts, { ...t, id: Date.now(), nome: t.nome + ' (copia)', dep: '' }],
        cfDup
      )
    );
  };
  const indentTask = (id) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id ? { ...t, level: Math.min(t.level + 1, 3) } : t
      )
    );
  const outdentTask = (id) =>
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id ? { ...t, level: Math.max(t.level - 1, 0) } : t
      )
    );

  // ── Link (dependency) mode ──
  // After linking A->B, linkFrom resets to B so user can immediately
  // click C to chain A->B->C without re-pressing the button each time.
  const handleBarClick = (taskId) => {
    if (!linkMode) return;
    if (!linkFrom) {
      setLinkFrom(taskId);
      return;
    }
    if (linkFrom === taskId) {
      setLinkFrom(null);
      return;
    } // deselect
    const cfLink = new Set(festivi);
    setTasks((ts) =>
      applyDepsWithFs(
        ts.map((t) => (t.id === taskId ? { ...t, dep: String(linkFrom) } : t)),
        cfLink
      )
    );
    // Keep linkMode ON, set linkFrom = taskId so next click chains forward
    setLinkFrom(taskId);
  };
  const removeLink = (id) => {
    const cfRl = new Set(festivi);
    setTasks((ts) =>
      applyDepsWithFs(
        ts.map((t) => (t.id === id ? { ...t, dep: '' } : t)),
        cfRl
      )
    );
  };

  // ── Drag ──
  const DAY_W = mob ? 10 : 18;
  const ROW_H = 40;
  const LEFT_W = mob ? 190 : 360;

  const onBarMouseDown = (e, task) => {
    if (linkMode) {
      handleBarClick(task.id);
      return;
    }
    e.preventDefault();
    setDragging({ id: task.id, startX: e.clientX, origInizio: task.inizio });
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragging.startX;
      const daysDelta = Math.round(dx / DAY_W);
      if (daysDelta === 0) return;
      const newDate = addDays(dragging.origInizio, daysDelta);
      const snapped = nextWorkDay(newDate, fs);
      const cfDrag = new Set(festivi);
      setTasks((ts) => updTaskFn(ts, dragging.id, 'inizio', snapped, cfDrag));
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  // ── AI generation ──
  const parsePromptToTasks = (prompt, startDate) => {
    const lines = prompt
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const result = [];
    let id = 1;
    const colors = GANTT_COLORS.map((c) => c.hex);
    let colorIdx = 0;
    let curr = nextWorkDay(startDate, fs);

    lines.forEach((line) => {
      // Pattern: "nome lavoro (Ngg)" or "nome lavoro Ngg" or just "nome lavoro"
      const dMatch =
        line.match(/\((\d+)\s*gg?\)/i) || line.match(/(\d+)\s*gg?\b/i);
      const durata = dMatch ? parseInt(dMatch[1]) : 5;
      const nome =
        line
          .replace(/\(?\d+\s*gg?\)?/i, '')
          .replace(/^\W+|\W+$/g, '')
          .trim() || line;
      const isGroup = /^[A-Z\s]{4,}$/.test(nome) || nome.endsWith(':');
      const color = colors[colorIdx % colors.length];
      if (!isGroup) colorIdx++;
      const fine = addWorkDays(curr, durata, fs);
      result.push({
        id: id++,
        nome: nome.replace(/:$/, '').trim(),
        durata,
        inizio: curr,
        fine,
        isGroup,
        color,
        level: isGroup ? 0 : 1,
        dep: '',
      });
      if (!isGroup) curr = nextWorkDay(addDays(fine, 1), fs);
    });
    return result;
  };

  const genAI = () => {
    if (aiMode === 'template' && !aiType) return;
    if (aiMode === 'prompt' && !aiPrompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      if (aiMode === 'prompt') {
        const gen = parsePromptToTasks(aiPrompt, aiStart);
        setTasks(gen);
      } else {
        const tpl = AI_TEMPLATES[aiType] || AI_TEMPLATES['residenziale'];
        let curr = nextWorkDay(aiStart, fs);
        let id = 1;
        const gen = [];
        tpl.forEach((cat) => {
          const cs = curr;
          const catName =
            aiCustomName && aiType === 'personalizzato'
              ? cat.nome.replace('FASE', aiCustomName)
              : cat.nome;
          gen.push({
            id: id++,
            nome: catName,
            durata: cat.durata,
            inizio: cs,
            fine: addWorkDays(cs, cat.durata, fs),
            isGroup: true,
            color: cat.color,
            level: 0,
            dep: '',
          });
          let ss = cs;
          const sd = Math.max(1, Math.floor(cat.durata / cat.subs.length));
          cat.subs.forEach((sub, si) => {
            const se =
              si === cat.subs.length - 1
                ? addWorkDays(cs, cat.durata, fs)
                : addWorkDays(ss, sd, fs);
            gen.push({
              id: id++,
              nome: sub,
              durata: sd,
              inizio: ss,
              fine: se,
              isGroup: false,
              color: cat.color,
              level: 1,
              dep: '',
            });
            ss = nextWorkDay(addDays(se, 1), fs);
          });
          curr = nextWorkDay(addDays(addWorkDays(cs, cat.durata, fs), 1), fs);
        });
        setTasks(gen);
      }
      setGenerating(false);
      setPanel(null);
    }, 900);
  };

  // ── Gantt geometry ──
  const allDates = tasks.flatMap((t) => [new Date(t.inizio), new Date(t.fine)]);
  const minDate = allDates.length
    ? new Date(Math.min(...allDates))
    : new Date(today);
  const maxDate = allDates.length
    ? new Date(Math.max(...allDates))
    : new Date(addDays(today, 60));
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 10);
  const totalDays = diffD(
    minDate.toISOString().split('T')[0],
    maxDate.toISOString().split('T')[0]
  );
  const getX = (ds) => diffD(minDate.toISOString().split('T')[0], ds) * DAY_W;
  const getW = (s, e) => Math.max((diffD(s, e) + 1) * DAY_W, DAY_W * 2);
  const todayX = getX(today);

  // Month headers
  const months = [];
  let mcur = new Date(minDate);
  while (mcur <= maxDate) {
    const ms = new Date(mcur);
    const y = mcur.getFullYear(),
      m = mcur.getMonth();
    const nm = new Date(y, m + 1, 1);
    const end =
      nm > maxDate ? new Date(maxDate) : new Date(nm.getTime() - 86400000);
    const days =
      diffD(ms.toISOString().split('T')[0], end.toISOString().split('T')[0]) +
      1;
    months.push({
      label: ms.toLocaleDateString('it-CH', { month: 'long' }),
      days,
      x: getX(ms.toISOString().split('T')[0]),
    });
    mcur = new Date(y, m + 1, 1);
  }

  // ── Export Excel ──
  const exportExcel = () => {
    try {
      const XLSX =
        window.XLSX ||
        (typeof require !== 'undefined' ? require('xlsx') : null);
      if (!XLSX) {
        alert(
          'Libreria XLSX non disponibile in questo ambiente. Copia i dati manualmente.'
        );
        return;
      }
      const ws_data = [
        [
          '#',
          'Nome attività',
          'Tipo',
          'Livello',
          'Inizio',
          'Fine',
          'Durata (gg lav.)',
          'Dipende da',
        ],
        ...tasks.map((t, i) => [
          i + 1,
          t.nome,
          t.isGroup ? 'Categoria' : 'Attività',
          t.level,
          fmtD(t.inizio),
          fmtD(t.fine),
          t.durata,
          t.dep
            ? tasks.findIndex((x) => x.id === parseInt(t.dep)) + 1 || ''
            : '',
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws['!cols'] = [
        { wch: 4 },
        { wch: 35 },
        { wch: 12 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Programma Lavori');
      XLSX.writeFile(wb, (pName || 'programma_lavori') + '.xlsx');
    } catch (e) {
      alert('Errore esportazione Excel: ' + e.message);
    }
  };

  // ── Export PDF (print) ──
  const exportPDF = () => {
    const style = document.createElement('style');
    style.id = 'gantt-print-style';
    style.innerHTML = `
@media print {
body > * { display: none !important; }
#gantt-print-area { display: block !important; }
#gantt-print-area { position: fixed; top: 0; left: 0; width: 100%; }
@page { size: A3 landscape; margin: 10mm; }
}
#gantt-print-area { display: none; }
`;
    document.head.appendChild(style);

    const area = document.createElement('div');
    area.id = 'gantt-print-area';
    area.innerHTML = `
<div style="font-family:Arial,sans-serif;padding:10px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:2px solid #2563eb;padding-bottom:8px">
<div>
<div style="font-size:18px;font-weight:800;color:#0f172a">${
      pName || 'Programma Lavori'
    }</div>
<div style="font-size:11px;color:#64748b">${[pClient, pLoc]
      .filter(Boolean)
      .join(' · ')}</div>
</div>
<div style="text-align:right;font-size:10px;color:#64748b">Edilslab · ${fmtD(
      today
    )}</div>
</div>
<table style="width:100%;border-collapse:collapse;font-size:10px">
<thead>
<tr style="background:#e2e7ef">
<th style="padding:5px 8px;text-align:left;border:1px solid #c4ccd8;width:30px">#</th>
<th style="padding:5px 8px;text-align:left;border:1px solid #c4ccd8;min-width:180px">Attività</th>
<th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:70px">Inizio</th>
<th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:70px">Fine</th>
<th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:40px">GG</th>
${months
  .map(
    (m) =>
      `<th style="padding:5px 4px;text-align:center;border:1px solid #c4ccd8;min-width:${
        m.days * 4
      }px;font-weight:600;color:#2563eb">${m.label}</th>`
  )
  .join('')}
</tr>
</thead>
<tbody>
${tasks
  .map((t, i) => {
    const bar_left = getX(t.inizio);
    const bar_width = getW(t.inizio, t.fine);
    const total_w = totalDays * 4;
    return `<tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
<td style="padding:4px 6px;border:1px solid #e2e7ef;color:#94a3b8;text-align:center">${
      i + 1
    }</td>
<td style="padding:4px 6px;border:1px solid #e2e7ef;font-weight:${
      t.isGroup ? 700 : 400
    };color:${t.isGroup ? t.color : '#0f172a'};padding-left:${
      8 + t.level * 12
    }px">${t.isGroup ? '▶ ' : ''}${t.nome}</td>
<td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;color:#64748b">${fmtD(
      t.inizio
    )}</td>
<td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;color:#64748b">${fmtD(
      t.fine
    )}</td>
<td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;font-weight:600;color:${
      t.color
    }">${t.durata}</td>
<td colspan="${
      months.length
    }" style="padding:2px;border:1px solid #e2e7ef;position:relative;height:22px">
<div style="position:relative;width:${total_w}px;height:18px">
<div style="position:absolute;left:${(bar_left / DAY_W) * 4}px;width:${
      (bar_width / DAY_W) * 4
    }px;height:14px;top:2px;background:${
      t.color
    };border-radius:3px;opacity:0.85"></div>
</div>
</td>
</tr>`;
  })
  .join('')}
</tbody>
</table>
<div style="margin-top:10px;font-size:9px;color:#94a3b8">Cronoprogramma indicativo · Generato da Edilslab · ${fmtD(
      today
    )}</div>
</div>
`;
    document.body.appendChild(area);
    window.print();
    setTimeout(() => {
      document.body.removeChild(area);
      document.head.removeChild(style);
    }, 1000);
  };

  // ── Styles ──
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    boxShadow: T.shadow,
  };
  const iL = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: T.textSub,
    marginBottom: 5,
  };
  const totalWorkDays =
    Math.round(
      tasks
        .filter((t) => !t.isGroup)
        .reduce((s, t) => s + parseDurata(t.durata), 0) * 10
    ) / 10;
  const projectStart = tasks.length
    ? tasks.reduce((a, b) => (a.inizio < b.inizio ? a : b)).inizio
    : null;
  const projectEnd = tasks.length
    ? tasks.reduce((a, b) => (a.fine > b.fine ? a : b)).fine
    : null;

  return (
    <div style={{ userSelect: dragging ? 'none' : 'auto' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>
            {pName || 'Programma Lavori'}
          </div>
          <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
            {[pClient, pLoc].filter(Boolean).join(' · ')}
            {projectStart && projectEnd && (
              <span>
                {' '}
                · {fmtDLong(projectStart)} → {fmtDLong(projectEnd)}
              </span>
            )}
            {tasks.length > 0 && (
              <span style={{ color: T.blue, fontWeight: 600 }}>
                {' '}
                · {tasks.filter((t) => !t.isGroup).length} attività,{' '}
                {totalWorkDays} gg lav.
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'info', label: '⚙ Progetto', col: T.blue },
            { id: 'ai', label: '✦ Genera AI', col: T.purple },
            { id: 'add', label: '+ Attività', col: T.green },
            { id: 'deps', label: '⛓ Dipendenze', col: T.purple },
            { id: 'festivi', label: '📅 Festivi', col: T.amber },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setPanel(panel === b.id ? null : b.id)}
              style={{
                padding: '8px 13px',
                background: panel === b.id ? b.col : '#dce1ea',
                color: panel === b.id ? '#fff' : T.textSub,
                border: '1.5px solid ' + (panel === b.id ? b.col : T.border),
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() => {
              setLinkMode((v) => !v);
              setLinkFrom(null);
            }}
            style={{
              padding: '8px 13px',
              background: linkMode ? T.purple : '#dce1ea',
              color: linkMode ? '#fff' : T.textSub,
              border: '1.5px solid ' + (linkMode ? T.purple : T.border),
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
            title="Clicca prima barra poi seconda per collegare"
          >
            ⛓ Collega
          </button>
          {tasks.length > 0 && (
            <>
              <button
                onClick={exportPDF}
                style={{
                  padding: '8px 13px',
                  background: '#fef2f2',
                  color: T.red,
                  border: '1.5px solid #fecaca',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ⬇ PDF
              </button>
              <button
                onClick={exportExcel}
                style={{
                  padding: '8px 13px',
                  background: '#f0fdf4',
                  color: T.green,
                  border: '1.5px solid #bbf7d0',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ⬇ Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Link mode banner */}
      {linkMode && (
        <div
          style={{
            marginBottom: 12,
            padding: '10px 16px',
            background: T.purple + '15',
            border: '1.5px solid ' + T.purple + '40',
            borderRadius: 10,
            fontSize: 13,
            color: T.purple,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          ⛓{' '}
          {linkFrom
            ? `Collegato da #${
                tasks.findIndex((x) => x.id === linkFrom) + 1
              } → ora clicca il SUCCESSORE (o ri-clicca per deselezionare)`
            : 'Clicca il PREDECESSORE — poi clicca il successore. Continua a catena senza uscire.'}
          <button
            onClick={() => {
              setLinkMode(false);
              setLinkFrom(null);
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.purple,
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Panel: Progetto ── */}
      {panel === 'info' && (
        <div style={pc}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: T.text,
              marginBottom: 14,
            }}
          >
            Informazioni progetto
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mob ? '1fr' : '1fr 1fr 1fr',
              gap: 12,
            }}
          >
            <div>
              <label style={iL}>Nome progetto</label>
              <input
                style={inp}
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="es. Condominio Portland"
              />
            </div>
            <div>
              <label style={iL}>Committente</label>
              <input
                style={inp}
                value={pClient}
                onChange={(e) => setPClient(e.target.value)}
                placeholder="es. Mario Rossi SA"
              />
            </div>
            <div>
              <label style={iL}>Località</label>
              <input
                style={inp}
                value={pLoc}
                onChange={(e) => setPLoc(e.target.value)}
                placeholder="es. Locarno, CH-6600"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Panel: Festivi ── */}
      {panel === 'festivi' && (
        <div style={pc}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: T.text,
              marginBottom: 4,
            }}
          >
            Giorni festivi
          </div>
          <div style={{ fontSize: 12, color: T.textSub, marginBottom: 12 }}>
            Sabati e domeniche esclusi automaticamente.
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 14,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Aggiungi festivo</label>
              <input
                style={inp}
                type="date"
                value={newFest}
                onChange={(e) => setNewFest(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (!newFest || festivi.includes(newFest)) return;
                setFestivi((f) => [...f, newFest].sort());
                setNewFest('');
              }}
              style={{
                padding: '11px 16px',
                background: T.gradBlue,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              + Aggiungi
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {festivi.map((f) => (
              <div
                key={f}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  background: '#fff',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                <span style={{ color: T.amber, fontWeight: 600 }}>
                  {fmtD(f)}
                </span>
                <div
                  onClick={() => setFestivi((fv) => fv.filter((x) => x !== f))}
                  style={{ cursor: 'pointer', color: T.red, fontWeight: 800 }}
                >
                  ×
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel: Genera AI ── */}
      {/* ── Panel: Dipendenze ── */}

      {/* ── Panel: Dipendenze ── */}
      {panel === 'deps' && tasks.length > 0 && (
        <div
          style={{
            background: '#dce1ea',
            border: '1.5px solid ' + T.purple + '40',
            borderRadius: 14,
            padding: 20,
            marginBottom: 14,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: T.gradPurple,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 14 }}>⛓</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                Gestione dipendenze
              </div>
              <div style={{ fontSize: 11, color: T.textSub }}>
                Imposta quale attività deve finire prima che un altra inizi. Le
                date si aggiornano automaticamente.
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 1fr 36px',
              gap: 8,
              alignItems: 'center',
              marginBottom: 8,
              padding: '6px 10px',
              background: '#c8d0dc',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textSub }}>
              Questa attivita inizia dopo →
            </div>
            <div />
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textSub }}>
              ← questa finisce prima
            </div>
            <div />
          </div>
          {tasks.map((t, ti) => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 1fr 36px',
                gap: 8,
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: t.dep ? T.purple + '10' : '#d6dce6',
                  border: '1.5px solid ' + (t.dep ? T.purple + '40' : T.border),
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.dep ? T.purple : T.textSub,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: t.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ti + 1}. {t.nome}
                </span>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  color: t.dep ? T.purple : T.textMuted,
                  fontWeight: 800,
                }}
              >
                ←
              </div>
              <select
                value={t.dep || ''}
                onChange={(e) => {
                  const cfDeps = new Set(festivi);
                  setTasks((ts) =>
                    applyDepsWithFs(
                      ts.map((x) =>
                        x.id === t.id ? { ...x, dep: e.target.value } : x
                      ),
                      cfDeps
                    )
                  );
                }}
                style={{
                  padding: '8px 10px',
                  border: '1.5px solid ' + (t.dep ? T.purple + '40' : T.border),
                  borderRadius: 9,
                  fontSize: 12,
                  outline: 'none',
                  background: t.dep ? T.purple + '08' : '#dce1ea',
                  color: T.text,
                  cursor: 'pointer',
                  fontWeight: t.dep ? 600 : 400,
                }}
              >
                <option value="">— nessun predecessore —</option>
                {tasks
                  .filter((x) => x.id !== t.id)
                  .map((x, xi) => (
                    <option key={x.id} value={x.id}>
                      {xi + 1}. {x.nome.substring(0, 28)}
                    </option>
                  ))}
              </select>
              {t.dep ? (
                <button
                  onClick={() => removeLink(t.id)}
                  title="Rimuovi collegamento"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: '#fef2f2',
                    color: T.red,
                    border: '1px solid #fecaca',
                    cursor: 'pointer',
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  ×
                </button>
              ) : (
                <div style={{ width: 36 }} />
              )}
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              padding: '9px 13px',
              background: '#f5f3ff',
              borderRadius: 9,
              fontSize: 12,
              color: '#5b21b6',
              border: '1px solid #ddd6fe',
            }}
          >
            Ogni modifica aggiorna subito le date di tutte le attivita collegate
            a cascata.
          </div>
        </div>
      )}
      {panel === 'deps' && tasks.length === 0 && (
        <div
          style={{
            padding: '16px 20px',
            background: '#dce1ea',
            border: '1px solid ' + T.border,
            borderRadius: 14,
            marginBottom: 14,
            fontSize: 13,
            color: T.textSub,
          }}
        >
          Aggiungi prima delle attivita per gestire le dipendenze.
        </div>
      )}

      {panel === 'ai' && (
        <div style={{ ...pc, border: '1.5px solid ' + T.purple + '40' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: T.gradPurple,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon d={PATHS.spark} size={16} stroke="#fff" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
              Genera programma con AI
            </div>
          </div>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'template', label: '📋 Da template' },
              { id: 'prompt', label: '✍️ Da testo libero' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setAiMode(m.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: aiMode === m.id ? T.purple : '#d6dce6',
                  color: aiMode === m.id ? '#fff' : T.textSub,
                  border:
                    '1.5px solid ' + (aiMode === m.id ? T.purple : T.border),
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          {aiMode === 'template' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mob ? '1fr' : '2fr 1fr 1fr',
                gap: 12,
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label style={iL}>Tipo di lavoro</label>
                <select
                  style={{ ...inp, cursor: 'pointer' }}
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                >
                  <option value="">Seleziona tipo...</option>
                  <option value="residenziale">
                    🏗 Nuova costruzione residenziale
                  </option>
                  <option value="ristrutturazione">
                    🔨 Ristrutturazione / Risanamento
                  </option>
                  <option value="copertura">🏠 Rifacimento copertura</option>
                  <option value="impermeabilizzazione">
                    💧 Impermeabilizzazione terrazza
                  </option>
                  <option value="facciata">🧱 Risanamento facciata</option>
                  <option value="sottosuolo">
                    ⛏ Opere sottosuolo / fondazioni
                  </option>
                  <option value="personalizzato">
                    ✏️ Personalizzato (nome libero)
                  </option>
                </select>
              </div>
              {aiType === 'personalizzato' && (
                <div>
                  <label style={iL}>Nome del tipo di lavoro</label>
                  <input
                    style={inp}
                    placeholder="es. Riqualifica energetica"
                    value={aiCustomName}
                    onChange={(e) => setAiCustomName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label style={iL}>Data inizio</label>
                <input
                  style={inp}
                  type="date"
                  value={aiStart}
                  onChange={(e) => setAiStart(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={iL}>Descrivi il lavoro con attività e durate</label>
              <textarea
                style={{
                  ...inp,
                  minHeight: 120,
                  resize: 'vertical',
                  lineHeight: 1.6,
                  marginBottom: 8,
                }}
                placeholder={
                  'Esempio:\nMontaggio ponteggi (2gg)\nOpere da pittore (6gg)\nSmontaggio ponteggi (2gg)\nCollaudo finale (1gg)'
                }
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <div
                style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}
              >
                Scrivi ogni attività su una riga o separata da virgola/punto e
                virgola. Indica la durata tra parentesi es. <code>(5gg)</code>.
              </div>
              <div>
                <label style={iL}>Data inizio</label>
                <input
                  style={{ ...inp, maxWidth: 200 }}
                  type="date"
                  value={aiStart}
                  onChange={(e) => setAiStart(e.target.value)}
                />
              </div>
            </div>
          )}
          <button
            onClick={genAI}
            disabled={
              generating || (aiMode === 'template' ? !aiType : !aiPrompt.trim())
            }
            style={{
              marginTop: 14,
              padding: '11px 24px',
              background: generating ? '#c4ccd8' : T.gradPurple,
              color: generating ? T.textMuted : '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: generating ? 'default' : 'pointer',
            }}
          >
            {generating ? 'Generazione...' : '✦ Genera programma'}
          </button>
        </div>
      )}

      {/* ── Panel: Aggiungi attività ── */}
      {panel === 'add' && (
        <div style={{ ...pc, border: '1.5px solid ' + T.green + '40' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg,#047857,#059669)',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon d={PATHS.plus} size={16} stroke="#fff" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
              Aggiungi attività
            </div>
            <div
              style={{ marginLeft: 'auto', fontSize: 11, color: T.textMuted }}
            >
              Premi Invio per aggiungere più attività in fila
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mob ? '1fr' : '2fr 1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <div>
              <label style={iL}>Nome *</label>
              <input
                style={inp}
                placeholder="es. Posa ponteggio esterno"
                value={nt.nome}
                onChange={(e) => setNt((n) => ({ ...n, nome: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                autoFocus
              />
            </div>
            <div>
              <label style={iL}>Data inizio</label>
              <input
                style={inp}
                type="date"
                value={nt.inizio}
                onChange={(e) =>
                  setNt((n) => ({ ...n, inizio: e.target.value }))
                }
              />
            </div>
            <div>
              <label style={iL}>Durata (gg lav.)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() =>
                    setNt((n) => {
                      const d = parseDurata(n.durata);
                      const nd = Math.max(
                        0.5,
                        d - (d <= 1 ? 0.5 : d <= 5 ? 1 : 5)
                      );
                      return { ...n, durata: fmtDurata(nd) };
                    })
                  }
                  style={{
                    width: 34,
                    height: 44,
                    borderRadius: 8,
                    border: '1.5px solid ' + T.border,
                    background: '#d6dce6',
                    fontSize: 18,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  −
                </button>
                <input
                  style={{ ...inp, textAlign: 'center', fontWeight: 700 }}
                  type="number"
                  min="1"
                  value={nt.durata}
                  onChange={(e) =>
                    setNt((n) => ({
                      ...n,
                      durata: parseInt(e.target.value) || 1,
                    }))
                  }
                />
                <button
                  onClick={() =>
                    setNt((n) => {
                      const d = parseDurata(n.durata);
                      const nd = d + (d < 1 ? 0.5 : d < 5 ? 1 : 5);
                      return { ...n, durata: fmtDurata(nd) };
                    })
                  }
                  style={{
                    width: 34,
                    height: 44,
                    borderRadius: 8,
                    border: '1.5px solid ' + T.border,
                    background: '#d6dce6',
                    fontSize: 18,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label style={iL}>Colore</label>
              <ColorPicker
                value={nt.color}
                onChange={(c) => setNt((n) => ({ ...n, color: c }))}
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 10,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Tipo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { v: false, l: 'Attività' },
                  { v: true, l: 'Categoria' },
                ].map((opt) => (
                  <div
                    key={String(opt.v)}
                    onClick={() =>
                      setNt((n) => ({
                        ...n,
                        isGroup: opt.v,
                        level: opt.v ? 0 : 1,
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: 9,
                      cursor: 'pointer',
                      textAlign: 'center',
                      background:
                        nt.isGroup === opt.v ? nt.color + '20' : '#d6dce6',
                      border:
                        '1.5px solid ' +
                        (nt.isGroup === opt.v ? nt.color : T.border),
                      fontSize: 12,
                      fontWeight: 600,
                      color: nt.isGroup === opt.v ? nt.color : T.textSub,
                    }}
                  >
                    {opt.l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Livello rientro</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  onClick={() =>
                    setNt((n) => ({ ...n, level: Math.max(0, n.level - 1) }))
                  }
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: '1.5px solid ' + T.border,
                    background: '#d6dce6',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  ←
                </button>
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.text,
                  }}
                >
                  Livello {nt.level}
                </div>
                <button
                  onClick={() =>
                    setNt((n) => ({ ...n, level: Math.min(3, n.level + 1) }))
                  }
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: '1.5px solid ' + T.border,
                    background: '#d6dce6',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  →
                </button>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Dipende da</label>
              <select
                style={{ ...inp, cursor: 'pointer' }}
                value={nt.dep}
                onChange={(e) => setNt((n) => ({ ...n, dep: e.target.value }))}
              >
                <option value="">Nessuna</option>
                {tasks.map((t, i) => (
                  <option key={t.id} value={t.id}>
                    {i + 1}. {t.nome.substring(0, 22)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              onClick={addTask}
              style={{
                flex: 1,
                padding: 12,
                background: T.gradBlue,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              + Aggiungi
            </button>
            <button
              onClick={() => setPanel(null)}
              style={{
                padding: '12px 18px',
                background: '#d6dce6',
                color: T.textSub,
                border: '1px solid ' + T.border,
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Chiudi
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
            💡 Usa <strong>Tab</strong> (←/→) per cambiare rientro. Usa il
            pulsante <strong>⛓ Collega</strong> per le dipendenze visive nel
            Gantt.
          </div>
        </div>
      )}

      {/* ── GANTT TABLE ── */}
      <div
        ref={ganttRef}
        style={{
          background: '#dce1ea',
          border: '1px solid ' + T.border,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: T.shadowMd,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: T.gradBlue,
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
              {pName || 'Programma Lavori'}
            </div>
            {(pClient || pLoc) && (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                {[pClient, pLoc].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {tasks.length > 0 && (
              <button
                onClick={propagate}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ↻ Aggiorna dipendenze
              </button>
            )}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              {fmtD(today)}
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: '56px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                marginBottom: 8,
              }}
            >
              Programma vuoto
            </div>
            <div
              style={{
                fontSize: 13,
                color: T.textSub,
                marginBottom: 24,
                maxWidth: 400,
                margin: '0 auto 24px',
              }}
            >
              Genera automaticamente con AI oppure aggiungi le attività
              manualmente.
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setPanel('ai')}
                style={{
                  padding: '10px 22px',
                  background: T.gradPurple,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ✦ Genera con AI
              </button>
              <button
                onClick={() => setPanel('add')}
                style={{
                  padding: '10px 22px',
                  background: T.gradBlue,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                + Aggiungi attività
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: LEFT_W + totalDays * DAY_W + 20 }}>
              {/* Intestazione mesi */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid ' + T.border,
                  background: '#c8d0dc',
                }}
              >
                <div
                  style={{
                    width: LEFT_W,
                    flexShrink: 0,
                    borderRight: '2px solid ' + T.border,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textSub,
                  }}
                >
                  Attività / {tasks.length} righe
                </div>
                <div style={{ position: 'relative', flex: 1, height: 26 }}>
                  {months.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: m.x,
                        top: 0,
                        width: m.days * DAY_W,
                        height: '100%',
                        borderRight: '1px solid ' + T.border + '60',
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.blue,
                        paddingLeft: 5,
                        display: 'flex',
                        alignItems: 'center',
                        textTransform: 'capitalize',
                        background:
                          i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)',
                      }}
                    >
                      {m.label}
                    </div>
                  ))}
                  {todayX >= 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: todayX,
                        top: 0,
                        width: 2,
                        height: '100%',
                        background: '#ef4444',
                        opacity: 0.7,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Riga giorni */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '2px solid ' + T.border,
                  background: '#cdd3dc',
                }}
              >
                <div
                  style={{
                    width: LEFT_W,
                    flexShrink: 0,
                    borderRight: '2px solid ' + T.border,
                    height: 18,
                  }}
                />
                <div style={{ display: 'flex' }}>
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const d = new Date(minDate);
                    d.setDate(d.getDate() + i);
                    const ds = d.toISOString().split('T')[0];
                    const isWE = d.getDay() === 0 || d.getDay() === 6;
                    const isFest = fs.has(ds);
                    return (
                      <div
                        key={i}
                        style={{
                          width: DAY_W,
                          flexShrink: 0,
                          fontSize: 7,
                          textAlign: 'center',
                          color: isWE || isFest ? '#dc2626' : T.textMuted,
                          background: isFest
                            ? 'rgba(220,38,38,0.15)'
                            : isWE
                            ? 'rgba(220,38,38,0.06)'
                            : 'transparent',
                          borderRight: '1px solid ' + T.border + '10',
                          paddingTop: 2,
                        }}
                      >
                        {'DLMMGVS'[d.getDay()]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Righe attività */}
              {tasks.map((task, ti) => {
                const predTask = task.dep
                  ? tasks.find((x) => x.id === parseInt(task.dep))
                  : null;
                const isEditing = editingId === task.id;
                const indentPx = task.level * 14;

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      borderBottom: '1px solid ' + T.border + '50',
                      background: task.isGroup
                        ? task.color + '08'
                        : linkFrom === task.id
                        ? T.purple + '10'
                        : 'transparent',
                      minHeight: isEditing ? 'auto' : ROW_H,
                      outline:
                        linkFrom === task.id ? '2px solid ' + T.purple : 'none',
                    }}
                  >
                    {/* ── Left column ── */}
                    <div
                      style={{
                        width: LEFT_W,
                        flexShrink: 0,
                        borderRight: '2px solid ' + T.border,
                      }}
                    >
                      {isEditing ? (
                        <div style={{ padding: '8px 8px 10px' }}>
                          <div
                            style={{ display: 'flex', gap: 6, marginBottom: 6 }}
                          >
                            <input
                              autoFocus
                              style={{
                                ...inp,
                                fontSize: 12,
                                padding: '5px 8px',
                                flex: 1,
                              }}
                              value={task.nome}
                              onChange={(e) =>
                                updTask(task.id, 'nome', e.target.value)
                              }
                            />
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                padding: '5px 12px',
                                background: T.gradBlue,
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              ✓
                            </button>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                flex: 1,
                                minWidth: 80,
                              }}
                            >
                              <span style={{ fontSize: 9, color: T.textMuted }}>
                                Inizio
                              </span>
                              <input
                                type="date"
                                style={{
                                  ...inp,
                                  fontSize: 11,
                                  padding: '4px 6px',
                                }}
                                value={task.inizio}
                                onChange={(e) =>
                                  updTask(task.id, 'inizio', e.target.value)
                                }
                              />
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                flex: 1,
                                minWidth: 80,
                              }}
                            >
                              <span style={{ fontSize: 9, color: T.textMuted }}>
                                Fine
                              </span>
                              <input
                                type="date"
                                style={{
                                  ...inp,
                                  fontSize: 11,
                                  padding: '4px 6px',
                                }}
                                value={task.fine}
                                onChange={(e) =>
                                  updTask(task.id, 'fine', e.target.value)
                                }
                              />
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                width: 56,
                              }}
                            >
                              <span style={{ fontSize: 9, color: T.textMuted }}>
                                GG
                              </span>
                              <input
                                type="text"
                                placeholder="es. 1, 4h, 2w"
                                style={{
                                  ...inp,
                                  fontSize: 12,
                                  padding: '4px 6px',
                                  textAlign: 'center',
                                }}
                                value={task.durata}
                                onChange={(e) =>
                                  updTask(task.id, 'durata', e.target.value)
                                }
                                title="4h=4 ore, 0.5=mezza giornata, 3=3 giorni, 2w=2 settimane, 1m=1 mese"
                              />
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                              }}
                            >
                              <span style={{ fontSize: 9, color: T.textMuted }}>
                                Colore
                              </span>
                              <ColorPicker
                                value={task.color}
                                onChange={(c) => updTask(task.id, 'color', c)}
                                size="sm"
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              marginTop: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 100 }}>
                              <span
                                style={{
                                  fontSize: 9,
                                  color: T.textMuted,
                                  display: 'block',
                                  marginBottom: 2,
                                }}
                              >
                                Dipende da
                              </span>
                              <div
                                style={{
                                  padding: '5px 8px',
                                  background: '#d6dce6',
                                  borderRadius: 8,
                                  fontSize: 11,
                                  color: task.dep ? T.purple : T.textMuted,
                                  border: '1px solid ' + T.border,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 6,
                                }}
                              >
                                {task.dep ? (
                                  <>
                                    <span style={{ fontWeight: 600 }}>
                                      #
                                      {tasks.findIndex(
                                        (x) => x.id === parseInt(task.dep)
                                      ) + 1}{' '}
                                      {(
                                        tasks.find(
                                          (x) => x.id === parseInt(task.dep)
                                        )?.nome || ''
                                      ).substring(0, 16)}
                                    </span>
                                    <div
                                      onClick={() => removeLink(task.id)}
                                      style={{
                                        cursor: 'pointer',
                                        color: T.red,
                                        fontWeight: 800,
                                        fontSize: 13,
                                      }}
                                    >
                                      ×
                                    </div>
                                  </>
                                ) : (
                                  <span style={{ color: T.textMuted }}>
                                    Usa ⛓ Collega
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 4,
                                alignItems: 'flex-end',
                              }}
                            >
                              <button
                                onClick={() => outdentTask(task.id)}
                                title="Riduce rientro"
                                style={{
                                  padding: '5px 8px',
                                  background: '#d6dce6',
                                  border: '1px solid ' + T.border,
                                  borderRadius: 7,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                ←
                              </button>
                              <button
                                onClick={() => indentTask(task.id)}
                                title="Aumenta rientro"
                                style={{
                                  padding: '5px 8px',
                                  background: '#d6dce6',
                                  border: '1px solid ' + T.border,
                                  borderRadius: 7,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                →
                              </button>
                              <button
                                onClick={() => duplicateTask(task.id)}
                                title="Duplica"
                                style={{
                                  padding: '5px 8px',
                                  background: '#d6dce6',
                                  border: '1px solid ' + T.border,
                                  borderRadius: 7,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                ⎘
                              </button>
                              <button
                                onClick={() => {
                                  delTask(task.id);
                                  setEditingId(null);
                                }}
                                title="Elimina"
                                style={{
                                  padding: '5px 8px',
                                  background: '#fef2f2',
                                  color: T.red,
                                  border: '1px solid #fecaca',
                                  borderRadius: 7,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: ROW_H,
                            padding: '0 4px',
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              flexShrink: 0,
                              textAlign: 'center',
                              fontSize: 10,
                              color: T.textMuted,
                            }}
                          >
                            {ti + 1}
                          </div>
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: task.color,
                              flexShrink: 0,
                              margin: '0 5px',
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              fontSize: task.isGroup ? 12 : 11,
                              fontWeight: task.isGroup ? 800 : 400,
                              color: task.isGroup ? task.color : T.text,
                              paddingLeft: indentPx,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.isGroup && (
                              <span style={{ marginRight: 3, fontSize: 9 }}>
                                ▶
                              </span>
                            )}
                            {task.nome}
                          </div>
                          {!mob && (
                            <div
                              style={{
                                fontSize: 10,
                                color: T.textMuted,
                                flexShrink: 0,
                                textAlign: 'right',
                                marginRight: 2,
                              }}
                            >
                              <div>{fmtD(task.inizio)}</div>
                              <div
                                style={{ color: task.color, fontWeight: 600 }}
                              >
                                {fmtDurata(parseDurata(task.durata))}
                              </div>
                            </div>
                          )}
                          <div
                            style={{ display: 'flex', gap: 1, flexShrink: 0 }}
                          >
                            <div
                              onClick={() => setEditingId(task.id)}
                              title="Modifica"
                              style={{
                                cursor: 'pointer',
                                color: T.textMuted,
                                padding: '3px',
                              }}
                            >
                              <Icon d={PATHS.edit} size={12} />
                            </div>
                            <div
                              onClick={() => moveUp(task.id)}
                              style={{
                                cursor: 'pointer',
                                color: T.textMuted,
                                padding: '3px',
                              }}
                            >
                              <Icon d={PATHS.arrowUp} size={11} />
                            </div>
                            <div
                              onClick={() => moveDown(task.id)}
                              style={{
                                cursor: 'pointer',
                                color: T.textMuted,
                                padding: '3px',
                              }}
                            >
                              <Icon d={PATHS.arrowDown} size={11} />
                            </div>
                            <div
                              onClick={() => delTask(task.id)}
                              style={{
                                cursor: 'pointer',
                                color: T.red,
                                padding: '3px',
                              }}
                            >
                              <Icon d={PATHS.trash} size={12} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Right: Gantt bars ── */}
                    <div
                      style={{
                        flex: 1,
                        position: 'relative',
                        minHeight: ROW_H,
                        cursor: linkMode ? 'crosshair' : 'default',
                      }}
                    >
                      {/* weekend/festivi stripes */}
                      {Array.from({ length: totalDays }).map((_, i) => {
                        const d = new Date(minDate);
                        d.setDate(d.getDate() + i);
                        const ds = d.toISOString().split('T')[0];
                        const isWE = d.getDay() === 0 || d.getDay() === 6;
                        const isFest = fs.has(ds);
                        if (!isWE && !isFest) return null;
                        return (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              left: i * DAY_W,
                              top: 0,
                              width: DAY_W,
                              height: '100%',
                              background: isFest
                                ? 'rgba(220,38,38,0.09)'
                                : 'rgba(220,38,38,0.04)',
                            }}
                          />
                        );
                      })}
                      {/* Today line */}
                      {todayX >= 0 && todayX <= totalDays * DAY_W && (
                        <div
                          style={{
                            position: 'absolute',
                            left: todayX,
                            top: 0,
                            width: 2,
                            height: '100%',
                            background: '#ef4444',
                            zIndex: 3,
                            opacity: 0.7,
                          }}
                        />
                      )}
                      {/* Dependency arrow */}
                      {predTask &&
                        (() => {
                          const pe = getX(predTask.fine) + DAY_W;
                          const cs = getX(task.inizio);
                          const my = ROW_H / 2;
                          return (
                            <svg
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: ROW_H,
                                overflow: 'visible',
                                zIndex: 1,
                                pointerEvents: 'none',
                              }}
                            >
                              <line
                                x1={pe}
                                y1={my}
                                x2={cs}
                                y2={my}
                                stroke={task.color}
                                strokeWidth="1.5"
                                strokeDasharray="4 2"
                                opacity="0.7"
                              />
                              <polygon
                                points={`${cs},${my} ${cs - 5},${my - 3} ${
                                  cs - 5
                                },${my + 3}`}
                                fill={task.color}
                                opacity="0.7"
                              />
                            </svg>
                          );
                        })()}
                      {/* Gantt bar */}
                      <div
                        style={{
                          position: 'absolute',
                          left: getX(task.inizio),
                          top: task.isGroup ? 9 : 11,
                          width: getW(task.inizio, task.fine),
                          height: task.isGroup ? 20 : 16,
                          background: task.isGroup
                            ? task.color
                            : task.color + 'dd',
                          borderRadius: task.isGroup ? 4 : 8,
                          zIndex: 2,
                          cursor: linkMode
                            ? 'crosshair'
                            : dragging
                            ? 'grabbing'
                            : 'grab',
                          boxShadow: '0 1px 4px ' + task.color + '50',
                          border:
                            linkFrom === task.id
                              ? '2px solid ' + T.purple
                              : 'none',
                        }}
                        onMouseDown={(e) => onBarMouseDown(e, task)}
                        onClick={() => linkMode && handleBarClick(task.id)}
                        title={`${task.nome} · ${fmtDurata(
                          parseDurata(task.durata)
                        )} · ${fmtD(task.inizio)} → ${fmtD(task.fine)}`}
                      >
                        {task.isGroup && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.15) 4px,rgba(255,255,255,0.15) 8px)',
                              borderRadius: 4,
                            }}
                          />
                        )}
                        {getW(task.inizio, task.fine) > 44 && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 6,
                              fontSize: 9,
                              color: 'rgba(255,255,255,0.95)',
                              fontWeight: 600,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.nome}
                          </div>
                        )}
                      </div>
                      {/* End date label */}
                      <div
                        style={{
                          position: 'absolute',
                          left:
                            getX(task.inizio) +
                            getW(task.inizio, task.fine) +
                            3,
                          top: task.isGroup ? 13 : 14,
                          fontSize: 8,
                          color: task.color,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}
                      >
                        {fmtD(task.fine)}
                      </div>
                      {/* Remove link button */}
                      {task.dep && !linkMode && (
                        <div
                          onClick={() => removeLink(task.id)}
                          title="Rimuovi dipendenza"
                          style={{
                            position: 'absolute',
                            left: getX(task.inizio) - 14,
                            top: ROW_H / 2 - 7,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: T.red,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 800,
                            cursor: 'pointer',
                            zIndex: 4,
                            opacity: 0.7,
                          }}
                        >
                          ×
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div
                style={{
                  padding: '8px 18px',
                  background: '#cdd3dc',
                  borderTop: '1px solid ' + T.border,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  Trascina le barre · Clicca ✎ per modificare · ⛓ per collegare
                  · Edilslab {fmtD(today)}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                      color: T.textMuted,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 7,
                        background: T.red,
                        borderRadius: 2,
                        opacity: 0.25,
                      }}
                    />{' '}
                    festivi
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                      color: T.textMuted,
                    }}
                  >
                    <div style={{ width: 2, height: 12, background: T.red }} />{' '}
                    oggi
                  </div>
                  {tasks.some((t) => t.dep) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        color: T.textMuted,
                      }}
                    >
                      <svg width="22" height="10">
                        <line
                          x1="0"
                          y1="5"
                          x2="16"
                          y2="5"
                          stroke={T.purple}
                          strokeWidth="1.5"
                          strokeDasharray="3 2"
                        />
                        <polygon points="16,5 11,2 11,8" fill={T.purple} />
                      </svg>{' '}
                      dipendenza
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
// ─── CARTELLE PROGETTO ────────────────────────────────────────────────────────
function Progetti({ user, users, gare, reports, tasks }) {
  const mob = useIsMobile();
  const [progetti, setProjetti] = useState(() => {
    try {
      const s = localStorage.getItem('es_progetti');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });
  const [view, setView] = useState('list'); // list | detail | new
  const [sel, setSel] = useState(null);
  const [newNome, setNewNome] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriv, setNewPriv] = useState(true);
  const [condivisoCon, setCondivisoCon] = useState([]);
  const [addingItem, setAddingItem] = useState(false);
  const [itemType, setItemType] = useState('nota');
  const [itemTesto, setItemTesto] = useState('');
  const [editNota, setEditNota] = useState(null);

  const save = (list) => {
    setProjetti(list);
    try {
      localStorage.setItem('es_progetti', JSON.stringify(list));
    } catch (e) {}
  };

  const canSee = (p) =>
    p.owner === user.email ||
    !p.privato ||
    (p.condivisiCon || []).includes(user.email) ||
    user.role === 'admin';

  const visibili = progetti.filter(canSee);

  const creaProgetto = () => {
    if (!newNome.trim()) return;
    const p = {
      id: Date.now(),
      nome: newNome.trim(),
      desc: newDesc.trim(),
      owner: user.email,
      ownerName: user.name,
      privato: newPriv,
      condivisiCon: condivisoCon,
      creato: new Date().toLocaleDateString('it-CH'),
      items: [],
    };
    save([...progetti, p]);
    setNewNome('');
    setNewDesc('');
    setNewPriv(true);
    setCondivisoCon([]);
    setView('list');
  };

  const delProgetto = (id) => save(progetti.filter((p) => p.id !== id));

  const addItem = (proj) => {
    if (!itemTesto.trim()) return;
    const item = {
      id: Date.now(),
      tipo: itemType,
      testo: itemTesto.trim(),
      data: new Date().toLocaleDateString('it-CH'),
      autore: user.name,
    };
    const updated = progetti.map((p) =>
      p.id === proj.id ? { ...p, items: [...p.items, item] } : p
    );
    save(updated);
    setSel(updated.find((p) => p.id === proj.id));
    setItemTesto('');
    setAddingItem(false);
  };

  const delItem = (proj, itemId) => {
    const updated = progetti.map((p) =>
      p.id === proj.id
        ? { ...p, items: p.items.filter((x) => x.id !== itemId) }
        : p
    );
    save(updated);
    setSel(updated.find((p) => p.id === proj.id));
  };

  const saveNota = (proj, itemId, newText) => {
    const updated = progetti.map((p) =>
      p.id === proj.id
        ? {
            ...p,
            items: p.items.map((x) =>
              x.id === itemId ? { ...x, testo: newText } : x
            ),
          }
        : p
    );
    save(updated);
    setSel(updated.find((p) => p.id === proj.id));
    setEditNota(null);
  };

  const toggleCondiviso = (email) =>
    setCondivisoCon((c) =>
      c.includes(email) ? c.filter((x) => x !== email) : [...c, email]
    );

  const tipoColor = {
    nota: '#64748b',
    graduatoria: T.green,
    rapporto: T.blue,
    gantt: '#0891b2',
    chat: T.purple,
    documento: T.amber,
  };
  const tipoLabel = {
    nota: '📝 Nota',
    graduatoria: '📊 Graduatoria',
    rapporto: '📄 Rapporto',
    gantt: '📅 Programma',
    chat: '💬 Chat',
    documento: '📁 Documento',
  };
  const pc = {
    background: '#dce1ea',
    border: '1px solid ' + T.border,
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    boxShadow: T.shadow,
  };
  const otherUsers = users.filter(
    (u) => u.email !== user.email && u.status === 'approved'
  );

  if (view === 'new')
    return (
      <div style={{ maxWidth: 560 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setView('list')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.blue,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            Annulla
          </button>
          <span style={{ color: '#b0b8c4' }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
            Nuovo progetto
          </span>
        </div>
        <div style={pc}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Nome progetto *
            </label>
            <input
              style={inp}
              placeholder="es. Villa Rossi — Ristrutturazione"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && creaProgetto()}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 5,
              }}
            >
              Descrizione
            </label>
            <input
              style={inp}
              placeholder="opzionale"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 8,
              }}
            >
              Visibilità
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { v: true, l: '🔒 Privato', sub: 'Solo tu' },
                { v: false, l: '👥 Condiviso', sub: 'Con utenti selezionati' },
              ].map((opt) => (
                <div
                  key={String(opt.v)}
                  onClick={() => setNewPriv(opt.v)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border:
                      '1.5px solid ' + (newPriv === opt.v ? T.blue : T.border),
                    background: newPriv === opt.v ? '#eff6ff' : '#d6dce6',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: newPriv === opt.v ? T.blue : T.text,
                    }}
                  >
                    {opt.l}
                  </div>
                  <div style={{ fontSize: 11, color: T.textSub }}>
                    {opt.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!newPriv && otherUsers.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 8,
                }}
              >
                Condividi con
              </label>
              {otherUsers.map((u) => (
                <div
                  key={u.email}
                  onClick={() => toggleCondiviso(u.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    marginBottom: 6,
                    border:
                      '1.5px solid ' +
                      (condivisoCon.includes(u.email) ? T.blue : T.border),
                    background: condivisoCon.includes(u.email)
                      ? '#eff6ff'
                      : '#d6dce6',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: T.gradBlue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {u.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: T.text }}
                    >
                      {u.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>
                      {u.email}
                    </div>
                  </div>
                  {condivisoCon.includes(u.email) && (
                    <span
                      style={{ color: T.blue, fontWeight: 700, fontSize: 13 }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <button onClick={creaProgetto} style={btnP}>
            Crea progetto
          </button>
        </div>
      </div>
    );

  if (view === 'detail' && sel) {
    const myProject = sel.owner === user.email;
    return (
      <div style={{ maxWidth: 720 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setView('list')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.blue,
              fontSize: 13,
              fontWeight: 700,
              padding: 0,
            }}
          >
            Indietro
          </button>
          <span style={{ color: '#b0b8c4' }}>|</span>
          <span
            style={{ fontSize: 15, fontWeight: 800, color: T.text, flex: 1 }}
          >
            {sel.nome}
          </span>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              background: sel.privato ? '#f1f5f9' : '#eff6ff',
              color: sel.privato ? T.textSub : T.blue,
            }}
          >
            {sel.privato ? '🔒 Privato' : '👥 Condiviso'}
          </span>
          {myProject && (
            <button
              onClick={() => {
                setAddingItem((v) => !v);
              }}
              style={{
                padding: '7px 14px',
                background: T.gradBlue,
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              + Aggiungi
            </button>
          )}
        </div>

        {sel.desc && (
          <div
            style={{
              fontSize: 13,
              color: T.textSub,
              marginBottom: 16,
              padding: '10px 14px',
              background: '#d6dce6',
              borderRadius: 10,
            }}
          >
            {sel.desc}
          </div>
        )}

        {addingItem && (
          <div
            style={{
              ...pc,
              border: '1.5px solid ' + T.blue + '40',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: T.text,
                marginBottom: 12,
              }}
            >
              Aggiungi elemento al progetto
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              {Object.entries(tipoLabel).map(([k, v]) => (
                <div
                  key={k}
                  onClick={() => setItemType(k)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    border:
                      '1.5px solid ' +
                      (itemType === k ? tipoColor[k] : T.border),
                    background:
                      itemType === k ? tipoColor[k] + '15' : '#d6dce6',
                    color: itemType === k ? tipoColor[k] : T.textSub,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <textarea
              style={{
                ...inp,
                minHeight: 100,
                resize: 'vertical',
                marginBottom: 10,
              }}
              placeholder={
                itemType === 'nota'
                  ? 'Scrivi una nota...'
                  : itemType === 'graduatoria'
                  ? 'Incolla o descrivi la graduatoria...'
                  : itemType === 'gantt'
                  ? 'Descrivi il programma lavori...'
                  : 'Inserisci il contenuto...'
              }
              value={itemTesto}
              onChange={(e) => setItemTesto(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => addItem(sel)}
                style={{
                  flex: 1,
                  padding: 10,
                  background: T.gradBlue,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Aggiungi
              </button>
              <button
                onClick={() => {
                  setAddingItem(false);
                  setItemTesto('');
                }}
                style={{
                  padding: '10px 16px',
                  background: '#d6dce6',
                  color: T.textSub,
                  border: '1px solid ' + T.border,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {sel.items.length === 0 && !addingItem && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: T.textMuted,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
              Progetto vuoto
            </div>
            <div style={{ fontSize: 13 }}>
              Aggiungi graduatorie, rapporti, programmi lavori, note e molto
              altro.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sel.items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#dce1ea',
                border: '1px solid ' + T.border,
                borderRadius: 12,
                padding: 16,
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: (tipoColor[item.tipo] || T.blue) + '15',
                    color: tipoColor[item.tipo] || T.blue,
                    border:
                      '1px solid ' + (tipoColor[item.tipo] || T.blue) + '30',
                  }}
                >
                  {tipoLabel[item.tipo] || item.tipo}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: T.textMuted,
                    marginLeft: 'auto',
                  }}
                >
                  {item.autore} · {item.data}
                </span>
                {myProject && (
                  <>
                    <button
                      onClick={() =>
                        setEditNota(editNota === item.id ? null : item.id)
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: T.textMuted,
                        padding: 3,
                        fontSize: 13,
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => delItem(sel, item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: T.red,
                        padding: 3,
                        fontSize: 13,
                      }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
              {editNota === item.id ? (
                <div>
                  <textarea
                    defaultValue={item.testo}
                    id={'nota-' + item.id}
                    style={{
                      ...inp,
                      minHeight: 80,
                      resize: 'vertical',
                      marginBottom: 8,
                      fontSize: 13,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() =>
                        saveNota(
                          sel,
                          item.id,
                          document.getElementById('nota-' + item.id).value
                        )
                      }
                      style={{
                        padding: '6px 14px',
                        background: T.green,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Salva
                    </button>
                    <button
                      onClick={() => setEditNota(null)}
                      style={{
                        padding: '6px 12px',
                        background: '#d6dce6',
                        color: T.textSub,
                        border: '1px solid ' + T.border,
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: T.text,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {item.testo}
                </div>
              )}
            </div>
          ))}
        </div>

        {myProject && sel.items.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#d6dce6',
              borderRadius: 10,
              fontSize: 11,
              color: T.textMuted,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {sel.items.length} elementi · Creato il {sel.creato}
            </span>
            {(sel.condivisiCon || []).length > 0 && (
              <span>Condiviso con {sel.condivisiCon.length} utenti</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
            Cartelle Progetto
          </div>
          <div style={{ fontSize: 13, color: T.textSub }}>
            Organizza tutto il materiale per progetto
          </div>
        </div>
        <button
          onClick={() => setView('new')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            background: T.gradBlue,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <Icon d={PATHS.plus} size={15} /> Nuovo
        </button>
      </div>

      {visibili.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#dce1ea',
            borderRadius: 16,
            border: '1px solid ' + T.border,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>📁</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: T.text,
              marginBottom: 8,
            }}
          >
            Nessun progetto
          </div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 20 }}>
            Crea una cartella per ogni cantiere o progetto e salvaci
            graduatorie, rapporti, programmi e note.
          </div>
          <button
            onClick={() => setView('new')}
            style={{
              padding: '10px 24px',
              background: T.gradBlue,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Crea il primo progetto
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mob
            ? '1fr'
            : 'repeat(auto-fill,minmax(280px,1fr))',
          gap: 14,
        }}
      >
        {visibili.map((p) => (
          <div
            key={p.id}
            style={{
              background: '#dce1ea',
              border: '1px solid ' + T.border,
              borderRadius: 14,
              padding: 20,
              boxShadow: T.shadow,
              cursor: 'pointer',
            }}
            onClick={() => {
              setSel(p);
              setView('detail');
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: 'linear-gradient(135deg,#1e40af,#2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                📁
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    background: p.privato ? '#f1f5f9' : '#eff6ff',
                    color: p.privato ? T.textSub : T.blue,
                  }}
                >
                  {p.privato ? '🔒' : '👥'}
                </span>
                {p.owner === user.email && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Eliminare il progetto?'))
                        delProgetto(p.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#b0b8c4',
                      padding: 3,
                    }}
                  >
                    <Icon d={PATHS.trash} size={14} />
                  </button>
                )}
              </div>
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: T.text,
                marginBottom: 4,
              }}
            >
              {p.nome}
            </div>
            {p.desc && (
              <div style={{ fontSize: 12, color: T.textSub, marginBottom: 10 }}>
                {p.desc}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                marginBottom: 10,
              }}
            >
              {Object.entries(tipoLabel).map(([k, v]) => {
                const count = p.items.filter((x) => x.tipo === k).length;
                if (!count) return null;
                return (
                  <span
                    key={k}
                    style={{
                      padding: '1px 8px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 600,
                      background: (tipoColor[k] || T.blue) + '15',
                      color: tipoColor[k] || T.blue,
                    }}
                  >
                    {v.split(' ')[0]} {count}
                  </span>
                );
              })}
              {p.items.length === 0 && (
                <span style={{ fontSize: 11, color: T.textMuted }}>Vuoto</span>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: T.textMuted,
              }}
            >
              <span>{p.ownerName}</span>
              <span>
                {p.creato} · {p.items.length} elementi
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Inject global CSS animations once
  useEffect(() => {
    if (document.getElementById('es-global-style')) return;
    const s = document.createElement('style');
    s.id = 'es-global-style';
    s.innerHTML = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;
    document.head.appendChild(s);
  }, []);
  const [screen, setScreen] = useState('home');
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('es_u');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });
  const [page, setPage] = useState('dashboard');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mob = useIsMobile();

  const [sharedHistory, setSharedHistory] = useState([]);

  const handleDeleteAccount = (email) => {
    // Remove from users list
    setUsers((us) => us.filter((u) => u.email !== email));
    // Log out
    logout();
  };

  // Carica cronologia condivisa da storage
  useEffect(() => {
    if (user) setScreen('dashboard');
    try {
      const saved = localStorage.getItem('es_shared_history');
      if (saved) setSharedHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const addToHistory = (title, mode, userName) => {
    setSharedHistory((prev) => {
      const entry = {
        id: Date.now(),
        title,
        mode,
        user: userName,
        date: new Date().toLocaleDateString('it-CH'),
      };
      const updated = [entry, ...prev.filter((h) => h.title !== title)].slice(
        0,
        30
      );
      try {
        localStorage.setItem('es_shared_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };
  const login = (u) => {
    setUser(u);
    setScreen('dashboard');
  };
  const logout = () => {
    setUser(null);
    setScreen('home');
    setPage('dashboard');
    try {
      sessionStorage.removeItem('es_u');
    } catch (e) {}
  };
  const addPending = (u) => setPending((p) => [...p, u]);
  const approve = (email) => {
    const u = pending.find((p) => p.email === email);
    if (u) {
      setUsers((us) => [...us, { ...u, role: 'user', status: 'approved' }]);
      setPending((p) => p.filter((p) => p.email !== email));
    }
  };
  const reject = (email) =>
    setPending((p) => p.filter((p) => p.email !== email));

  if (screen === 'home')
    return (
      <Homepage
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
      />
    );
  if (screen === 'login')
    return (
      <Login
        users={users}
        onLogin={login}
        onRegister={() => setScreen('register')}
      />
    );
  if (screen === 'register')
    return (
      <Register
        users={users}
        pending={pending}
        onBack={() => setScreen('login')}
        onSuccess={(u) => {
          addPending(u);
          setScreen('pending');
        }}
      />
    );
  if (screen === 'pending')
    return <PendingScreen onBack={() => setScreen('login')} />;
  if (!user) return <Homepage onLogin={() => setScreen('login')} />;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'chat_docs', label: 'Chat Documenti', icon: 'docs' },
    { id: 'chat_ai', label: 'Chat Edilizia', icon: 'chat' },
    { id: 'ranking', label: 'Graduatorie', icon: 'podio' },
    { id: 'gantt', label: 'Programma Lavori', icon: 'gantt' },
    { id: 'reports', label: 'Rapporti Tecnici', icon: 'file' },
    ...(user.role === 'admin'
      ? [{ id: 'docs', label: 'Gestione Documenti', icon: 'folder' }]
      : []),
    { id: 'progetti', label: 'Cartelle Progetto', icon: 'folder' },
    { id: 'profile', label: 'Profilo', icon: 'user' },
    ...(user.role === 'admin'
      ? [{ id: 'admin', label: 'Gestione utenti', icon: 'users' }]
      : []),
  ];
  const titles = {
    dashboard: 'Dashboard',
    chat_docs: 'Chat Documenti',
    chat_ai: 'Chat Edilizia',
    ranking: 'Graduatorie',
    gantt: 'Programma Lavori',
    reports: 'Rapporti Tecnici',
    docs: 'Documenti',
    profile: 'Profilo',
    admin: 'Gestione utenti',
    progetti: 'Cartelle Progetto',
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '22px 18px 16px',
          borderBottom: '1px solid ' + T.sidebarBorder,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: T.gradBlue,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d={PATHS.building} size={18} stroke="#fff" />
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 17 }}>
              Edilslab
            </div>
            <div style={{ color: '#475569', fontSize: 10 }}>
              Svizzera Italiana
            </div>
          </div>
          {mob && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                marginLeft: 'auto',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Icon d={PATHS.close} size={18} />
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '14px 10px', flex: 1, overflow: 'auto' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#334155',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '0 8px',
            marginBottom: 8,
          }}
        >
          Menu
        </div>
        {navItems.map(n=>(
  <div
    key={n.id}
    onClick={()=>{setPage(n.id);setSidebarOpen(false);}}
    title={
      n.id==="chat_docs" ? "Carica i tuoi PDF con normative SIA, SUVA o capitolati e fai domande specifiche: l'AI risponde basandosi sui documenti che hai caricato." :
      n.id==="chat_ai" ? "Assistente generale per normative edilizie svizzere" :
      n.id==="ranking" ? "Confronta offerte di più imprese automaticamente" :
      n.id==="gantt" ? "Pianifica il programma lavori con Gantt interattivo" :
      n.id==="reports" ? "Genera perizie, ispezioni e verbali di collaudo" :
      ""
    }
    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",marginBottom:2,background:page===n.id?"rgba(59,130,246,0.15)":"transparent",color:page===n.id?"#60a5fa":"#64748b",fontSize:13,fontWeight:page===n.id?700:400}}
  >
    <Icon d={PATHS[n.icon]} size={16}/>{n.label}
    {n.id==="admin"&&pending.length>0&&<span style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",background:T.amber,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{pending.length}</span>}
  </div>
))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 9,
              cursor: 'pointer',
              marginBottom: 2,
              background:
                page === n.id ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: page === n.id ? '#60a5fa' : '#64748b',
              fontSize: 13,
              fontWeight: page === n.id ? 700 : 400,
            }}
          >
            <Icon d={PATHS[n.icon]} size={16} />
            {n.label}
            {n.id === 'admin' && pending.length > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: T.amber,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {pending.length}
              </span>
            )}
          </div>
        ))}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#334155',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '12px 8px 8px',
            marginTop: 4,
          }}
        >
          Recenti
        </div>
        {sharedHistory.length === 0 && (
          <div
            style={{
              fontSize: 11,
              color: '#334155',
              padding: '4px 12px',
              fontStyle: 'italic',
            }}
          >
            Nessuna conversazione
          </div>
        )}
        {sharedHistory.slice(0, 8).map((h) => (
          <div
            key={h.id}
            onClick={() => {
              setPage(h.mode === 'docs' ? 'chat_docs' : 'chat_ai');
              setSidebarOpen(false);
            }}
            style={{
              padding: '7px 12px',
              borderRadius: 7,
              cursor: 'pointer',
              marginBottom: 2,
              color: '#475569',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Icon d={PATHS.clock} size={12} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#94a3b8',
                  fontSize: 10,
                }}
              >
                {h.user}
              </div>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {h.title}
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                color: '#334155',
                flexShrink: 0,
                marginLeft: 4,
              }}
            >
              {h.date}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: '14px 10px',
          borderTop: '1px solid ' + T.sidebarBorder,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: T.gradBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>{user.role}</div>
          </div>
          <div
            onClick={logout}
            style={{ cursor: 'pointer', color: '#475569', padding: 4 }}
          >
            <Icon d={PATHS.logout} size={15} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "'Inter',-apple-system,sans-serif",
        minHeight: '100vh',
        background: T.surfaceAlt,
        color: T.text,
        display: 'flex',
      }}
    >
      {!mob && (
        <div
          style={{
            width: 236,
            background: T.sidebar,
            minHeight: '100vh',
            flexShrink: 0,
            borderRight: '1px solid ' + T.sidebarBorder,
          }}
        >
          <SidebarContent />
        </div>
      )}
      {mob && sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
        >
          <div
            style={{
              width: 236,
              background: T.sidebar,
              height: '100vh',
              borderRight: '1px solid ' + T.sidebarBorder,
            }}
          >
            <SidebarContent />
          </div>
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <div
          style={{
            background: T.surface,
            borderBottom: '1px solid ' + T.border,
            padding: '0 20px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mob && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textSub,
                  padding: 6,
                }}
              >
                <Icon d={PATHS.menu} size={22} />
              </button>
            )}
            {page !== 'dashboard' && (
              <button
                onClick={() => setPage('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: T.textSub,
                  padding: '4px 6px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {!mob && 'Dashboard'}
              </button>
            )}
            {page !== 'dashboard' && (
              <span style={{ color: T.border, fontSize: 16 }}>/</span>
            )}
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>
              {titles[page]}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 11px',
                background: '#fefce8',
                border: '1px solid #fde68a',
                borderRadius: 8,
                fontSize: 11,
                color: '#92400e',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: T.amber,
                  display: 'inline-block',
                }}
              />
              Mock
            </div>
            {user.role === 'admin' && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: '#eff6ff',
                  color: T.blue,
                }}
              >
                Admin
              </span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, padding: mob ? 14 : 26, overflow: 'auto' }}>
          {page === 'dashboard' && (
            <DashHome user={user} setPage={setPage} users={users} />
          )}
          {page === 'chat_docs' && (
            <Chat user={user} mode="docs" onAddHistory={addToHistory} />
          )}
          {page === 'chat_ai' && (
            <Chat user={user} mode="general" onAddHistory={addToHistory} />
          )}
          {page === 'ranking' && <Ranking />}
          {page === 'gantt' && <GanttPlanner user={user} />}
          {page === 'reports' && <Reports user={user} />}
          {page === 'docs' &&
            (user.role === 'admin' ? <Documents /> : <AccessDenied />)}
          {page === 'profile' && (
            <Profile user={user} onDeleteAccount={handleDeleteAccount} />
          )}
          {page === 'progetti' && <Progetti user={user} users={users} />}
          {page === 'admin' &&
            (user.role === 'admin' ? (
              <AdminUsers
                users={users}
                pending={pending}
                onApprove={approve}
                onReject={reject}
              />
            ) : (
              <AccessDenied />
            ))}
        </div>
      </div>
    </div>
  );
}
