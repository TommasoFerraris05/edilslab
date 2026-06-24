import { useState, useRef, useEffect } from "react";

// ─── DATI BASE ────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { email: "admin@edilslab.ch", password: "admin123", role: "admin", name: "Tommaso Ferraris", status: "approved" },
  { email: "user@edilslab.ch", password: "user123", role: "user", name: "Sara Fontana", status: "approved" },
];
const INITIAL_PENDING = [
  { email: "luca.ferrari@gmail.com", name: "Luca Ferrari", password: "test123", requestedAt: "18.05.2024" },
];
const CATEGORIES = ["Strutturale", "Impianti", "Normativa", "Sicurezza", "Contratti", "Cantiere"];
const SAMPLE_DOCS = [
  { id: 1, name: "Capitolato_Appalto_2024.pdf", category: "Contratti", tag: "PDF", size: "2.4 MB", date: "12.03.2024", color: "#ef4444", readable: true },
  { id: 2, name: "Piano_Sicurezza.pdf", category: "Sicurezza", tag: "PDF", size: "1.1 MB", date: "05.04.2024", color: "#ef4444", readable: true },
  { id: 3, name: "Relazione_Strutturale.pdf", category: "Strutturale", tag: "PDF", size: "4.7 MB", date: "20.04.2024", color: "#ef4444", readable: true },
  { id: 4, name: "Computo_Metrico.xlsx", category: "Cantiere", tag: "XLSX", size: "890 KB", date: "01.05.2024", color: "#059669", readable: true },
];
const HISTORY = [
  { id: 1, title: "Normativa SIA 118", date: "ieri" },
  { id: 2, title: "Checklist collaudo", date: "2 giorni fa" },
];
const ENTI = [
  { nome: "SIA", url: "https://www.sia.ch", desc: "Norme tecniche", color: "#3b82f6" },
  { nome: "SUVA", url: "https://www.suva.ch", desc: "Sicurezza lavoro", color: "#ef4444" },
  { nome: "UPI", url: "https://www.upi.ch", desc: "Prevenzione", color: "#f59e0b" },
  { nome: "SSIC", url: "https://www.ssic.ch", desc: "Costruttori", color: "#10b981" },
  { nome: "simap", url: "https://www.simap.ch", desc: "Appalti pubblici", color: "#8b5cf6" },
  { nome: "admin.ch", url: "https://www.admin.ch", desc: "Leggi federali", color: "#06b6d4" },
  { nome: "Canton TI", url: "https://www.ti.ch", desc: "Normativa cantonale", color: "#64748b" },
];
const getEnti = (t) => {
  const tx = t.toLowerCase(); const m = [];
  if (tx.includes("sia") || tx.includes("struttur") || tx.includes("calcestruzzo")) m.push("SIA");
  if (tx.includes("suva") || tx.includes("sicurezza") || tx.includes("dpi") || tx.includes("quota")) m.push("SUVA");
  if (tx.includes("upi") || tx.includes("prevenzione")) m.push("UPI");
  if (tx.includes("appalto") || tx.includes("lcpubb") || tx.includes("bando")) m.push("simap");
  if (tx.includes("ssic") || tx.includes("impresa")) m.push("SSIC");
  if (tx.includes("legge") || tx.includes("federale")) m.push("admin.ch");
  if (tx.includes("ticino") || tx.includes("canton")) m.push("Canton TI");
  return [...new Set(m.length ? m : ["SIA", "SUVA"])];
};

const FONTI_DEFAULT = [
  { id:1, nome:"LCPubb", desc:"Legge sulle commesse pubbliche", url:"https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/410", cat:"Canton TI", attiva:true },
  { id:2, nome:"RLCPubb", desc:"Regolamento LCPubb", url:"https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/411", cat:"Canton TI", attiva:true },
  { id:3, nome:"LE", desc:"Legge edilizia cantonale", url:"https://m3.ti.ch/CAN/RLeggi/public/raccolta-leggi/legge/num/406", cat:"Canton TI", attiva:true },
  { id:4, nome:"RLE", desc:"Regolamento legge edilizia", url:"https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/407", cat:"Canton TI", attiva:true },
  { id:5, nome:"SUVA Sicurezza", desc:"Direttive sicurezza cantieri SUVA", url:"https://www.suva.ch/it-ch/prevenzione/temi/edilizia-e-guaste", cat:"SUVA", attiva:true },
  { id:6, nome:"SUVA Sostanze nocive", desc:"Sostanze nocive sul lavoro", url:"https://www.suva.ch/it-ch/prevenzione/temi/sostanze-nocive", cat:"SUVA", attiva:true },
  { id:7, nome:"UPI Prevenzione", desc:"Prevenzione infortuni UPI", url:"https://www.upi.ch/it/", cat:"UPI", attiva:true },
  { id:8, nome:"SIA Norme", desc:"Norme tecniche SIA", url:"https://www.sia.ch/it/norme/norme-sia/", cat:"SIA", attiva:true },
  { id:9, nome:"admin.ch Leggi", desc:"Leggi federali svizzere", url:"https://www.admin.ch/gov/it/pagina-iniziale/diritto-federale/raccolta-sistematica.html", cat:"Confederazione", attiva:true },
  { id:10, nome:"simap.ch", desc:"Appalti pubblici Svizzera", url:"https://www.simap.ch", cat:"Appalti", attiva:true },
];

const NOTE = " Le informazioni hanno carattere orientativo. Consultare sempre le norme ufficiali SIA su sia.ch e un professionista abilitato.";
const RDOCS = [
  "Dai documenti caricati emerge che la responsabilita dell appaltatore e disciplinata dalla normativa applicabile. Per i dettagli consultare il testo integrale della norma ufficiale." + NOTE,
  "Il documento contiene indicazioni sulle misure di protezione per lavori in quota. Per i requisiti tecnici fare riferimento alle direttive SUVA su suva.ch." + NOTE,
  "La documentazione fa riferimento alle norme SIA per il calcolo delle azioni. Per valori specifici consultare le norme SIA ufficiali." + NOTE,
  "Il computo riporta le lavorazioni con i relativi importi. Per la verifica dei prezzi consultare il listino NPK ufficiale aggiornato." + NOTE,
];
const RGEN = [
  "La norma SIA 261 tratta le azioni sulle strutture portanti ed e il riferimento per la progettazione strutturale in Svizzera. Per i valori tecnici specifici consultare la norma ufficiale su sia.ch." + NOTE,
  "La LCPubb regola le procedure di appalto pubblico in Ticino. Per le soglie aggiornate fare riferimento alla versione vigente su ti.ch e al portale simap.ch." + NOTE,
  "La norma SIA 262 e il riferimento per la progettazione di strutture in calcestruzzo armato. Per i requisiti tecnici consultare la norma ufficiale SIA 262 su sia.ch." + NOTE,
  "La SUVA pubblica direttive per la sicurezza sui cantieri. Per i requisiti tecnici fare riferimento alle direttive SUVA aggiornate su suva.ch." + NOTE,
];
const RPHOTO = [
  "Dall immagine rilevo una possibile fessurazione. Ti consiglio di documentarla e consultare un tecnico abilitato." + NOTE,
  "L immagine mostra una zona con copriferro potenzialmente insufficiente. Per i requisiti fare riferimento alla norma SIA 262 su sia.ch." + NOTE,
  "Dalla foto si nota presenza di umidita. Per i criteri di impermeabilizzazione fare riferimento alla norma SIA 272 su sia.ch." + NOTE,
];
const REMAILS = [
  { ogg: "Richiesta offerta opere murarie", corpo: "Gentile Sig./Sig.ra,\n\nLa contatto per richiedere un offerta per le seguenti opere murarie:\n\n- Muratura perimetrale\n- Intonaci interni ed esterni\n- Pavimentazioni\n\nLe chiedo di inviarci la Sua migliore offerta entro il [DATA].\n\nCordiali saluti,\n[NOME]\n[AZIENDA]" },
  { ogg: "Convocazione riunione di cantiere", corpo: "Gentili colleghi,\n\nVi convoco alla riunione di cantiere del [DATA] alle [ORA] presso [LUOGO].\n\nOrdine del giorno:\n1. Avanzamento lavori\n2. Problematiche\n3. Prossime fasi\n\nConfermare partecipazione entro [DATA].\n\nCordiali saluti,\n[NOME]\nDirettore Lavori" },
  { ogg: "Segnalazione non conformita", corpo: "Gentile [DESTINATARIO],\n\nIn seguito all ispezione del [DATA] presso [LUOGO], si segnalano le seguenti non conformita:\n\n1. [NON CONFORMITA 1]\n2. [NON CONFORMITA 2]\n\nSi richiede di provvedere entro il [TERMINE].\n\nCordiali saluti,\n[NOME]" },
];
function useFonti() {
  const [fonti, setFonti] = useState(() => {
    try { const s = localStorage.getItem("es_fonti"); return s ? JSON.parse(s) : FONTI_DEFAULT; } catch(e) { return FONTI_DEFAULT; }
  });
  const save = (list) => { setFonti(list); try { localStorage.setItem("es_fonti", JSON.stringify(list)); } catch(e) {} };
  const add = (f) => save([...fonti, { ...f, id: Date.now(), attiva: true }]);
  const toggle = (id) => save(fonti.map(f => f.id === id ? { ...f, attiva: !f.attiva } : f));
  const remove = (id) => save(fonti.filter(f => f.id !== id));
  return { fonti, add, toggle, remove };
}

const EXT_COLOR = { PDF:"#ef4444",DOCX:"#2563eb",DOC:"#2563eb",XLSX:"#059669",XLS:"#059669",PPTX:"#d97706",PPT:"#d97706",CSV:"#0891b2",TXT:"#64748b",JPG:"#7c3aed",JPEG:"#7c3aed",PNG:"#7c3aed",DWG:"#94a3b8",DXF:"#94a3b8" };
const EXT_READ = { PDF:true,DOCX:true,DOC:true,XLSX:true,XLS:true,PPTX:true,PPT:true,CSV:true,TXT:true,JPG:true,JPEG:true,PNG:true,DWG:false,DXF:false };

// ─── REPORT TEMPLATES ────────────────────────────────────────────────────────
const TMPLS = [
  { id:"amianto", label:"Perizia Amianto", icon:"shield", color:"#dc2626", desc:"Rapporto ispezione sostanze nocive – ASCA v1.5" },
  { id:"perizia", label:"Perizia Strutturale", icon:"building", color:"#2563eb", desc:"Valutazione stato di conservazione strutturale",
    fields:[{k:"oggetto",l:"Oggetto",ph:"es. Edificio via Lugano 12"},{k:"committente",l:"Committente",ph:"Nome"},{k:"data",l:"Data sopralluogo",ph:"gg.mm.aaaa"},{k:"elementi",l:"Elementi esaminati",ph:"Pilastri, soletta...",ta:true},{k:"anomalie",l:"Anomalie riscontrate",ph:"Fessurazioni...",ta:true},{k:"causa",l:"Causa presunta",ph:"Ritiro plastico...",ta:true},{k:"interventi",l:"Interventi consigliati",ph:"Risanamento copriferro...",ta:true},{k:"urgenza",l:"Urgenza",ph:"Immediata / 3 mesi / Monitoraggio"},{k:"perito",l:"Perito",ph:"Nome e qualifica"}]
  },
  { id:"ispezione", label:"Rapporto di Ispezione", icon:"search", color:"#7c3aed", desc:"Verbale ispezione cantiere",
    fields:[{k:"cantiere",l:"Cantiere",ph:"Nuova costruzione, Locarno"},{k:"committente",l:"Committente",ph:"Nome"},{k:"appaltatore",l:"Appaltatore",ph:"Impresa esecutrice"},{k:"data",l:"Data",ph:"gg.mm.aaaa"},{k:"presenti",l:"Presenti",ph:"DL Ing. Rossi..."},{k:"avanzamento",l:"Avanzamento lavori",ph:"Stato attuale",ta:true},{k:"conformita",l:"Conformita",ph:"Elementi conformi",ta:true},{k:"nc",l:"Non conformita",ph:"Anomalie riscontrate",ta:true},{k:"prescrizioni",l:"Prescrizioni",ph:"Azioni richieste",ta:true},{k:"prossima",l:"Prossima ispezione",ph:"Data o evento"}]
  },
  { id:"collaudo", label:"Rapporto di Collaudo", icon:"check", color:"#059669", desc:"Verbale collaudo finale con esito",
    fields:[{k:"opera",l:"Opera",ph:"Solaio piano primo"},{k:"committente",l:"Committente",ph:"Nome"},{k:"esecutore",l:"Esecutore",ph:"Ragione sociale"},{k:"data",l:"Data",ph:"gg.mm.aaaa"},{k:"normativa",l:"Normativa",ph:"SIA 260, SIA 262"},{k:"prove",l:"Prove eseguite",ph:"Carotaggio, prova di carico",ta:true},{k:"risultati",l:"Risultati",ph:"Esiti delle prove",ta:true},{k:"difetti",l:"Difetti residui",ph:"Nessuno o elenco",ta:true},{k:"esito",l:"Esito",ph:"Positivo / Con riserve / Negativo"},{k:"collaudatore",l:"Collaudatore",ph:"Nome e qualifica"}]
  },
  { id:"libero", label:"Rapporto Libero AI", icon:"spark", color:"#d97706", desc:"Descrivi, l AI genera il rapporto completo",
    fields:[{k:"desc",l:"Descrivi la situazione",ph:"Ho effettuato un sopralluogo...",ta:true,rows:6},{k:"tipo",l:"Tipo di rapporto",ph:"Perizia strutturale"},{k:"dest",l:"Destinatario",ph:"Committente, Comune"}]
  },
];
const genReport = (tmpl, f) => {
  const d = new Date().toLocaleDateString("it-CH");
  const disc = "\n\n---\nNOTA: Informazioni orientative. Consultare norme SIA ufficiali su sia.ch e un professionista abilitato.";
  if (tmpl.id==="libero") return "RELAZIONE TECNICA\nData: "+d+"\nDestinatario: "+(f.dest||"---")+"\n\nOGGETTO: "+(f.tipo||"Rapporto tecnico")+"\n\nSITUAZIONE\n"+(f.desc||"---")+"\n\nVALUTAZIONE\nLe anomalie descritte richiedono analisi approfondita da un professionista qualificato.\n\nRACCOMANDAZIONI\n- Indagine diagnostica\n- Monitoraggio continuo\n- Coinvolgimento tecnico abilitato"+disc;
  if (tmpl.id==="perizia") return "PERIZIA STRUTTURALE\nData: "+d+"\nPerito: "+(f.perito||"---")+"\n\nOGGETTO: "+(f.oggetto||"---")+"\nCOMMITTENTE: "+(f.committente||"---")+"\nDATA SOPRALLUOGO: "+(f.data||"---")+"\n\nELEMENTI ESAMINATI\n"+(f.elementi||"---")+"\n\nANOMALIE RISCONTRATE\n"+(f.anomalie||"---")+"\n\nCAUSA PRESUNTA\n"+(f.causa||"---")+"\n\nINTERVENTI CONSIGLIATI\n"+(f.interventi||"---")+"\n\nURGENZA: "+(f.urgenza||"---")+"\n\nFirma: ___________________"+disc;
  if (tmpl.id==="ispezione") return "RAPPORTO DI ISPEZIONE\nData: "+(f.data||d)+"\n\nCANTIERE: "+(f.cantiere||"---")+"\nCOMMITTENTE: "+(f.committente||"---")+"\nAPPALTATORE: "+(f.appaltatore||"---")+"\nPRESENTI: "+(f.presenti||"---")+"\n\nAVANZAMENTO\n"+(f.avanzamento||"---")+"\n\nCONFORMITA\n"+(f.conformita||"---")+"\n\nNON CONFORMITA\n"+(f.nc||"Nessuna.")+"\n\nPRESCRIZIONI\n"+(f.prescrizioni||"---")+"\n\nPROSSIMA ISPEZIONE: "+(f.prossima||"---")+"\n\nFirma DL: ___________________"+disc;
  return "RAPPORTO DI COLLAUDO\nData: "+(f.data||d)+"\n\nOPERA: "+(f.opera||"---")+"\nCOMMITTENTE: "+(f.committente||"---")+"\nESECUTORE: "+(f.esecutore||"---")+"\nNORMATIVA: "+(f.normativa||"---")+"\n\nPROVE\n"+(f.prove||"---")+"\n\nRISULTATI\n"+(f.risultati||"---")+"\n\nDIFETTI\n"+(f.difetti||"Nessuno.")+"\n\nESITO: "+(f.esito||"---")+"\nCOLLAUDATORE: "+(f.collaudatore||"---")+"\n\nFirma: ___________________"+disc;
};

// ─── GARE ─────────────────────────────────────────────────────────────────────
const GARE_INIT = [
  { id:1,nome:"Opere murarie Cantiere A",desc:"Muratura, intonaci, pavimenti",data:"12.05.2024",stato:"chiusa",offerte:[{id:1,ditta:"Costruzioni Rossi SA",importo:"48500",note:"90gg"},{id:2,ditta:"Impresa Bianchi Sagl",importo:"52300",note:"75gg"},{id:3,ditta:"Edil Ferrari",importo:"45900",note:"100gg"},{id:4,ditta:"Costruzioni Verdi SA",importo:"51200",note:""}] },
  { id:2,nome:"Impianto idraulico Edificio B",desc:"Sanitario e riscaldamento",data:"20.05.2024",stato:"aperta",offerte:[{id:1,ditta:"Termosanitaria Luini",importo:"31800",note:""},{id:2,ditta:"Impianti Generosi SA",importo:"29400",note:"Mat. esclusi"}] },
];

// ─── GANTT ────────────────────────────────────────────────────────────────────
const DEFAULT_FESTIVI = [
  "2026-01-01","2026-01-06","2026-04-03","2026-04-06",
  "2026-05-01","2026-05-14","2026-05-25","2026-06-11",
  "2026-08-01","2026-08-15","2026-11-01","2026-12-08",
  "2026-12-25","2026-12-26",
];

// Palette colori per il Gantt con nome, valore hex e colore chiaro per testo
const GANTT_COLORS = [
  { hex: "#2563eb", label: "Blu" },
  { hex: "#7c3aed", label: "Viola" },
  { hex: "#059669", label: "Verde" },
  { hex: "#d97706", label: "Arancio" },
  { hex: "#0891b2", label: "Ciano" },
  { hex: "#dc2626", label: "Rosso" },
  { hex: "#475569", label: "Grigio" },
  { hex: "#db2777", label: "Rosa" },
  { hex: "#ea580c", label: "Arancio scuro" },
  { hex: "#65a30d", label: "Verde lime" },
  { hex: "#0284c7", label: "Azzurro" },
  { hex: "#7e22ce", label: "Indaco" },
];

function addDays(ds,n){const d=new Date(ds);d.setDate(d.getDate()+n);return d.toISOString().split("T")[0];}
function fmtD(ds){return new Date(ds).toLocaleDateString("it-CH",{day:"2-digit",month:"2-digit",year:"2-digit"});}
function fmtDLong(ds){return new Date(ds).toLocaleDateString("it-CH",{day:"2-digit",month:"short",year:"numeric"});}
function diffD(a,b){return Math.round((new Date(b)-new Date(a))/86400000);}
// Durata flessibile: 2h=2 ore, 0.5=mezza giornata, 3=3 giorni, 2w=2 settimane, 1m=1 mese
// Internamente tutto in giorni (float). 1 giorno = esattamente quel giorno (fine=inizio).
// Sabato (6) e domenica (0) sempre esclusi.
function parseDurata(val){
  if(val===null||val===undefined)return 1;
  const s=String(val).trim().toLowerCase();
  if(s.endsWith("h")){const h=parseFloat(s);return h/8;} // 8h = 1 giorno
  if(s.endsWith("w")){const w=parseFloat(s);return w*5;} // 1 settimana = 5 gg lav.
  if(s.endsWith("m")){const m=parseFloat(s);return m*22;} // 1 mese ≈ 22 gg lav.
  return parseFloat(s)||1;
}
function fmtDurata(gg){
  if(gg<1){const h=Math.round(gg*8*10)/10;return h+"h";}
  if(gg>=22&&gg%22===0){return(gg/22)+"m";}
  if(gg>=5&&gg%5===0){return(gg/5)+"w";}
  return gg%1===0?String(gg):gg.toFixed(1)+"gg";
}
function isWorkDay(ds,fs){const d=new Date(ds);const w=d.getDay();return w!==0&&w!==6&&!fs.has(ds);}
function nextWorkDay(ds,fs){let d=new Date(ds);while(true){const s=d.toISOString().split("T")[0];if(isWorkDay(s,fs))return s;d.setDate(d.getDate()+1);}}
function addWorkDays(ds,n,fs){
  // n può essere float (es. 0.5 = mezza giornata = stesso giorno)
  const days=parseDurata(n);
  if(days<=1)return ds; // 1 giorno o meno = stessa data (lavori in quel giorno)
  let d=new Date(ds);let added=0;
  while(added<days-1){d.setDate(d.getDate()+1);const s=d.toISOString().split("T")[0];if(isWorkDay(s,fs))added++;}
  return d.toISOString().split("T")[0];
}
function countWorkDays(a,b,fs){
  if(a===b)return 1; // stesso giorno = 1 giorno
  let d=new Date(a);const e=new Date(b);let c=0;
  while(d<=e){const s=d.toISOString().split("T")[0];if(isWorkDay(s,fs))c++;d.setDate(d.getDate()+1);}
  return Math.max(1,c);
}

const AI_TEMPLATES = {
  residenziale:[{nome:"PROGETTAZIONE E PERMESSI",durata:30,color:"#2563eb",subs:["Progetto esecutivo","Richiesta permessi","Approvazione"]},{nome:"PREPARAZIONE CANTIERE",durata:5,color:"#7c3aed",subs:["Installazione cantiere","Recinzioni e ponteggi"]},{nome:"OPERE DI SCAVO",durata:10,color:"#059669",subs:["Scavi fondazioni","Smaltimento terra"]},{nome:"FONDAZIONI",durata:12,color:"#d97706",subs:["Armatura fondazioni","Getto calcestruzzo","Stagionatura"]},{nome:"STRUTTURA",durata:40,color:"#0891b2",subs:["Pilastri piano 1","Solaio piano 1","Pilastri piano 2","Solaio piano 2"]},{nome:"TAMPONAMENTI",durata:20,color:"#dc2626",subs:["Muratura esterna","Muratura interna"]},{nome:"IMPIANTI",durata:25,color:"#475569",subs:["Impianto elettrico","Impianto idraulico","Riscaldamento"]},{nome:"FINITURE",durata:30,color:"#2563eb",subs:["Intonaci","Pavimenti","Tinteggiature","Infissi"]}],
  ristrutturazione:[{nome:"PONTEGGI",durata:5,color:"#2563eb",subs:["Installazione ponteggio","Smontaggio ponteggio"]},{nome:"DEMOLIZIONI",durata:10,color:"#dc2626",subs:["Rimozione finiture","Demolizioni murarie","Smaltimento macerie"]},{nome:"OPERE STRUTTURALI",durata:15,color:"#7c3aed",subs:["Consolidamenti","Nuove aperture","Solai"]},{nome:"IMPIANTI",durata:20,color:"#059669",subs:["Impianto elettrico","Impianto idraulico"]},{nome:"FINITURE",durata:25,color:"#d97706",subs:["Intonaci","Pavimenti","Tinteggiature"]}],
  copertura:[{nome:"PONTEGGI",durata:5,color:"#2563eb",subs:["Installazione ponteggio","Smontaggio ponteggio"]},{nome:"RIMOZIONE MANTO",durata:8,color:"#dc2626",subs:["Rimozione tegole","Rimozione listelli","Smaltimento"]},{nome:"STRUTTURA TETTO",durata:10,color:"#7c3aed",subs:["Ispezione struttura","Riparazione travatura"]},{nome:"IMPERMEABILIZZAZIONE",durata:6,color:"#059669",subs:["Posa barriera vapore","Posa isolamento","Posa guaina"]},{nome:"NUOVO MANTO",durata:10,color:"#d97706",subs:["Posa listelli","Posa tegole","Colmo e gronde"]},{nome:"LATTONERIE",durata:5,color:"#0891b2",subs:["Gronde","Pluviali","Raccordi"]}],
  impermeabilizzazione:[{nome:"PONTEGGI",durata:5,color:"#2563eb",subs:["Installazione ponteggio","Smontaggio ponteggio"]},{nome:"DEMOLIZIONI",durata:6,color:"#dc2626",subs:["Rimozione strati esistenti","Smaltimento"]},{nome:"PREPARAZIONE SUPPORTO",durata:4,color:"#7c3aed",subs:["Rilievo altimetrico","Trattamento supporto"]},{nome:"IMPERMEABILIZZAZIONE",durata:12,color:"#059669",subs:["Posa barriera vapore","Posa isolamento pendenziato","Impermeabilizzazione a due strati","Posa strati protezione"]},{nome:"LATTONERIE",durata:5,color:"#0891b2",subs:["Scossaline","Raccordi","Griglie"]},{nome:"RIPRISTINO FINITURE",durata:5,color:"#d97706",subs:["Posa ghiaia/protezione","Riposizionamento elementi"]}],
  facciata:[{nome:"PONTEGGI",durata:6,color:"#2563eb",subs:["Installazione ponteggio","Smontaggio ponteggio"]},{nome:"DIAGNOSI E PREPARAZIONE",durata:5,color:"#7c3aed",subs:["Ispezione facciate","Rimozione parti distaccate"]},{nome:"RISANAMENTO",durata:15,color:"#dc2626",subs:["Riparazione crepe","Trattamento superfici","Applicazione rasante"]},{nome:"ISOLAMENTO",durata:12,color:"#059669",subs:["Posa pannelli isolanti","Rete di armatura","Intonaco di finitura"]},{nome:"TINTEGGIATURA",durata:8,color:"#d97706",subs:["Mano a fondo","Mano finale","Ritocchi"]}],
  sottosuolo:[{nome:"SCAVI E SBANCAMENTI",durata:15,color:"#dc2626",subs:["Scavo a cielo aperto","Smaltimento terra"]},{nome:"STRUTTURE INTERRATE",durata:20,color:"#2563eb",subs:["Armatura pareti","Getto pareti","Solaio interrato"]},{nome:"IMPERMEABILIZZAZIONE",durata:8,color:"#059669",subs:["Guaina esterna","Drenaggio perimetrale"]},{nome:"IMPIANTI INTERRATI",durata:10,color:"#7c3aed",subs:["Fognature","Condotte tecniche"]},{nome:"RINTERRI",durata:5,color:"#d97706",subs:["Rinterro a strati","Compattazione"]}],
  personalizzato:[{nome:"FASE 1",durata:10,color:"#2563eb",subs:["Attivita 1.1","Attivita 1.2"]},{nome:"FASE 2",durata:15,color:"#7c3aed",subs:["Attivita 2.1","Attivita 2.2","Attivita 2.3"]},{nome:"FASE 3",durata:10,color:"#059669",subs:["Attivita 3.1","Attivita 3.2"]}],
};

// ─── TEMA ─────────────────────────────────────────────────────────────────────
const T = {
  sidebar:"#0d1117",sidebarBorder:"rgba(255,255,255,0.06)",
  surface:"#e2e7ef",surfaceAlt:"#d6dce6",border:"#c4ccd8",
  blue:"#2563eb",purple:"#7c3aed",green:"#059669",amber:"#d97706",red:"#dc2626",
  text:"#0f172a",textSub:"#64748b",textMuted:"#94a3b8",
  gradBlue:"linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
  gradDark:"linear-gradient(135deg,#0d1117,#1e293b,#0f172a)",
  gradPurple:"linear-gradient(135deg,#4c1d95,#7c3aed)",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
  shadowMd:"0 4px 16px rgba(0,0,0,0.10)",
  shadowLg:"0 20px 60px rgba(0,0,0,0.25)",
};

// ─── ICONE ────────────────────────────────────────────────────────────────────
const PATHS = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  chat:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  docs:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  upload:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  send:"M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  search:"M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35",
  file:"M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7",
  check:"M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  clock:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  building:["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  users:["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 11a4 4 0 100-8 4 4 0 000 8z"],
  folder:"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  camera:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  menu:"M3 12h18 M3 6h18 M3 18h18",
  close:"M18 6L6 18 M6 6l12 12",
  trash:"M3 6h18 M19 6l-1 14H6L5 6 M8 6V4h8v2",
  plus:"M12 5v14 M5 12h14",
  podio:"M8 21V11H3v10h5z M13 21V3h-2v18h2z M21 21V8h-5v13h5z",
  gantt:"M3 5h18v3H3z M3 10h13v3H3z M3 15h16v3H3z",
  link:"M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeoff:["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94","M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24","M1 1l22 22"],
  spark:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  palette:"M12 2a10 10 0 100 20 10 10 0 000-20z M8 12a1 1 0 100-2 1 1 0 000 2z M12 8a1 1 0 100-2 1 1 0 000 2z M16 12a1 1 0 100-2 1 1 0 000 2z M12 16a1 1 0 100-2 1 1 0 000 2z",
  drag:"M8 6h2 M8 10h2 M8 14h2 M14 6h2 M14 10h2 M14 14h2",
  copy:"M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2 M8 4a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2z",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  arrowUp:"M18 15l-6-6-6 6",
  arrowDown:"M6 9l6 6 6-6",
  info:"M12 2a10 10 0 100 20 10 10 0 000-20z M12 16v-4 M12 8h.01",
};

const Icon = ({d,size=18,stroke="currentColor",fill="none"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);

function useIsMobile(){const [v,setV]=useState(window.innerWidth<768);useEffect(()=>{const fn=()=>setV(window.innerWidth<768);window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);return v;}

const inp={width:"100%",padding:"11px 14px",border:"1.5px solid #c4ccd8",borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",color:T.text,background:"#dce1ea"};
const btnP={width:"100%",padding:12,background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"};

// ─── COLOR PICKER DROPDOWN ────────────────────────────────────────────────────
function ColorPicker({ value, onChange, size = "md" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const isSmall = size === "sm";

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = GANTT_COLORS.find(c => c.hex === value) || GANTT_COLORS[0];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          padding: isSmall ? "4px 8px" : "9px 12px",
          border: "1.5px solid " + T.border, borderRadius: 10,
          background: "#dce1ea", userSelect: "none",
          minWidth: isSmall ? 80 : 130,
        }}
        title="Scegli colore"
      >
        <div style={{
          width: isSmall ? 14 : 18, height: isSmall ? 14 : 18,
          borderRadius: 4, background: current.hex, flexShrink: 0,
          border: "1px solid rgba(0,0,0,0.15)"
        }} />
        {!isSmall && <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{current.label}</span>}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
          <path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
        </svg>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
          background: "#fff", border: "1.5px solid " + T.border, borderRadius: 12,
          padding: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6,
          minWidth: 180,
        }}>
          {GANTT_COLORS.map(c => (
            <div
              key={c.hex}
              onClick={() => { onChange(c.hex); setOpen(false); }}
              title={c.label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, padding: "6px 4px", borderRadius: 8, cursor: "pointer",
                background: value === c.hex ? c.hex + "20" : "transparent",
                border: value === c.hex ? "2px solid " + c.hex : "2px solid transparent",
                transition: "all 0.1s",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, background: c.hex,
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: value === c.hex ? "0 0 0 2px " + c.hex + "40" : "none",
              }} />
              <span style={{ fontSize: 9, color: T.textSub, textAlign: "center", lineHeight: 1.2 }}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function Homepage({onLogin,onRegister}){
  const mob=useIsMobile();
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener('scroll',fn);
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  const features=[
    {icon:PATHS.docs,title:'Chat Documenti',desc:'Carica PDF tecnici — SIA, SUVA, capitolati — e interrogali con linguaggio naturale. Risposte precise con riferimento alla fonte.',color:'#2563eb',num:'01'},
    {icon:PATHS.chat,title:'Chat Edilizia',desc:'Assistente specializzato in normative svizzere, tecniche costruttive e sicurezza cantieri. Genera anche bozze di email professionali.',color:'#7c3aed',num:'02'},
    {icon:PATHS.camera,title:'Analisi Foto',desc:'Fotografa dal cantiere e ricevi un\'analisi tecnica immediata: fessurazioni, umidità, anomalie strutturali.',color:'#0891b2',num:'03'},
    {icon:PATHS.podio,title:'Graduatorie Offerte',desc:'Confronto automatico tra offerte con IVA, sconti e ribassi. Analisi AI per identificare costi nascosti e varianti.',color:'#059669',num:'04'},
    {icon:PATHS.gantt,title:'Programma Lavori',desc:'Gantt interattivo con giorni lavorativi, festivi ticinesi, dipendenze tra fasi e export PDF/Excel.',color:'#d97706',num:'05'},
    {icon:PATHS.file,title:'Rapporti Tecnici',desc:'Genera perizie strutturali, verbali di ispezione e rapporti di collaudo in formato professionale pronto alla firma.',color:'#dc2626',num:'06'},
  ];

  const stats=[
    {val:'6',label:'Strumenti integrati'},
    {val:'100%',label:'Normative svizzere'},
    {val:'AI',label:'Motore Claude'},
    {val:'TI',label:'Focalizzato sul Ticino'},
  ];

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:'#f0f4f8',minHeight:'100vh',color:'#0f172a'}}>

      {/* ── NAVBAR ── */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 clamp(20px,5vw,60px)',background:scrolled?'rgba(255,255,255,0.95)':'transparent',backdropFilter:scrolled?'blur(12px)':'none',borderBottom:scrolled?'1px solid #e2e8f0':'none',transition:'all 0.3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#1e40af,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(59,130,246,0.35)'}}>
            <Icon d={PATHS.building} size={18} stroke="#fff"/>
          </div>
          <span style={{fontWeight:800,fontSize:20,color:'#0f172a',letterSpacing:'-0.5px'}}>Edilslab</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {!mob&&<button onClick={onRegister} style={{padding:'8px 18px',background:'transparent',border:'1.5px solid #cbd5e1',borderRadius:8,fontWeight:600,fontSize:13,color:'#475569',cursor:'pointer'}}>Richiedi accesso</button>}
          <button onClick={onLogin} style={{padding:'9px 22px',background:'linear-gradient(135deg,#1e40af,#3b82f6)',border:'none',borderRadius:9,fontWeight:700,fontSize:13,color:'#fff',cursor:'pointer',boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>Accedi</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{background:'linear-gradient(160deg,#0f172a 0%,#1e293b 50%,#1e3a5f 100%)',padding:mob?'72px 24px 80px':'100px clamp(40px,8vw,120px) 110px',position:'relative',overflow:'hidden'}}>
        {/* decorative circles */}
        <div style={{position:'absolute',top:-120,right:-80,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.12),transparent 65%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-100,left:-60,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.08),transparent 65%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:900,margin:'0 auto',position:'relative'}}>
          {/* badge */}
          <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 16px',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:24,fontSize:12,fontWeight:600,color:'#93c5fd',marginBottom:28,letterSpacing:'0.3px'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#3b82f6',boxShadow:'0 0 6px #3b82f6'}}/>
            Piattaforma AI per l'edilizia svizzera · Canton Ticino
          </div>

          <h1 style={{fontSize:mob?'clamp(36px,9vw,48px)':'clamp(48px,5vw,72px)',fontWeight:800,color:'#fff',margin:'0 0 20px',lineHeight:1.1,letterSpacing:'-2px'}}>
            Lo strumento AI<br/>
            <span style={{background:'linear-gradient(135deg,#60a5fa,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>per i professionisti</span><br/>
            dell'edilizia
          </h1>

          <p style={{fontSize:mob?16:19,color:'#94a3b8',maxWidth:580,lineHeight:1.75,margin:'0 0 40px',fontWeight:400}}>
            Consulta normative, analizza documenti e cantieri, genera report tecnici, confronta offerte e pianifica i lavori. Tutto in un'unica piattaforma.
          </p>

          <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:mob?48:56}}>
            <button onClick={onLogin} style={{padding:'14px 32px',background:'linear-gradient(135deg,#1e40af,#3b82f6)',border:'none',borderRadius:11,fontWeight:700,fontSize:15,color:'#fff',cursor:'pointer',boxShadow:'0 8px 24px rgba(59,130,246,0.35)',letterSpacing:'-0.2px'}}>
              Accedi alla piattaforma
            </button>
            <button onClick={onRegister} style={{padding:'14px 26px',background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:11,fontWeight:600,fontSize:15,color:'#e2e8f0',cursor:'pointer',backdropFilter:'blur(4px)'}}>
              Richiedi accesso →
            </button>
          </div>

          {/* stats */}
          <div style={{display:'grid',gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(4,1fr)',gap:mob?12:20}}>
            {stats.map((s,i)=>(
              <div key={i} style={{padding:'16px 20px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,backdropFilter:'blur(8px)'}}>
                <div style={{fontSize:mob?22:28,fontWeight:800,color:'#fff',letterSpacing:'-1px'}}>{s.val}</div>
                <div style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROFESSIONISTI ── */}
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'0 clamp(20px,5vw,60px)'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'20px 0',display:'flex',alignItems:'center',gap:mob?16:32,flexWrap:'wrap',justifyContent:mob?'center':'flex-start'}}>
          <span style={{fontSize:12,fontWeight:600,color:'#94a3b8',letterSpacing:'0.5px',textTransform:'uppercase'}}>Per</span>
          {['Architetti','Ingegneri','Geometri','Direttori Lavori','Impresari','Tecnici'].map(p=>(
            <div key={p} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#475569',fontWeight:500}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:'#3b82f6'}}/>
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{padding:mob?'56px 24px':'80px clamp(40px,6vw,80px)',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:mob?40:56}}>
          <div style={{fontSize:11,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:'2px',marginBottom:12}}>Funzionalità</div>
          <h2 style={{fontSize:mob?28:40,fontWeight:800,color:'#0f172a',margin:0,letterSpacing:'-1px',lineHeight:1.2}}>Tutto quello che serve,<br/>in un posto solo</h2>
          <p style={{fontSize:15,color:'#64748b',marginTop:14,maxWidth:500,margin:'14px auto 0',lineHeight:1.7}}>Strumenti professionali costruiti per il settore edile svizzero, con focus sul Canton Ticino.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':window.innerWidth<900?'1fr 1fr':'repeat(3,1fr)',gap:mob?16:24}}>
          {features.map((f,i)=>(
            <div key={i} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:20,padding:mob?24:32,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'transform 0.2s,box-shadow 0.2s',cursor:'default',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${f.color},${f.color}88)`}}/>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                <div style={{width:48,height:48,borderRadius:14,background:f.color+'12',display:'flex',alignItems:'center',justifyContent:'center',color:f.color}}>
                  <Icon d={f.icon} size={22}/>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:'#cbd5e1',letterSpacing:'1px'}}>{f.num}</span>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:10,letterSpacing:'-0.3px'}}>{f.title}</div>
              <div style={{fontSize:13,color:'#64748b',lineHeight:1.7}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{background:'linear-gradient(135deg,#1e293b,#1e3a5f)',margin:mob?'0 16px 48px':'0 clamp(40px,6vw,80px) 64px',borderRadius:24,padding:mob?'48px 28px':'64px clamp(40px,6vw,80px)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-60,right:-60,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%)',pointerEvents:'none'}}/>
        <h2 style={{fontSize:mob?26:38,fontWeight:800,color:'#fff',margin:'0 0 14px',letterSpacing:'-1px'}}>Pronto a lavorare meglio?</h2>
        <p style={{fontSize:15,color:'#94a3b8',margin:'0 0 32px',lineHeight:1.7}}>Piattaforma ad accesso controllato — richiedi l'accesso o accedi con le tue credenziali.</p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={onLogin} style={{padding:'13px 32px',background:'linear-gradient(135deg,#1e40af,#3b82f6)',border:'none',borderRadius:10,fontWeight:700,fontSize:14,color:'#fff',cursor:'pointer',boxShadow:'0 6px 20px rgba(59,130,246,0.35)'}}>Accedi</button>
          <button onClick={onRegister} style={{padding:'13px 26px',background:'rgba(255,255,255,0.08)',border:'1.5px solid rgba(255,255,255,0.15)',borderRadius:10,fontWeight:600,fontSize:14,color:'#e2e8f0',cursor:'pointer'}}>Richiedi accesso</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{borderTop:'1px solid #e2e8f0',padding:'20px clamp(20px,5vw,60px)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,background:'#fff'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,background:'linear-gradient(135deg,#1e40af,#3b82f6)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icon d={PATHS.building} size={14} stroke="#fff"/>
          </div>
          <span style={{fontWeight:700,fontSize:14,color:'#0f172a'}}>Edilslab</span>
        </div>
        <div style={{fontSize:12,color:'#94a3b8'}}>Piattaforma privata · Svizzera Italiana · Canton Ticino</div>
      </div>
    </div>
  );
}


// ─── LOGIN / REGISTER ─────────────────────────────────────────────────────────
function Login({users,onLogin,onRegister}){
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [remember,setRemember]=useState(false);const [showPw,setShowPw]=useState(false);const [err,setErr]=useState("");
  const go=()=>{const u=users.find(u=>u.email===email&&u.password===pw);if(!u){setErr("Credenziali non valide.");return;}if(u.status!=="approved"){setErr("Account in attesa di approvazione.");return;}if(remember){try{sessionStorage.setItem("es_u",JSON.stringify(u));}catch(e){}}onLogin(u);};
  return(
    <div style={{minHeight:"100vh",background:T.gradDark,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <div style={{background:"#dce1ea",borderRadius:20,padding:"44px 36px",width:"100%",maxWidth:400,boxShadow:T.shadowLg}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:54,height:54,background:T.gradBlue,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Icon d={PATHS.building} size={26} stroke="#fff"/></div>
          <div style={{fontSize:26,fontWeight:800,color:T.text}}>Edilslab</div>
          <div style={{fontSize:13,color:T.textSub,marginTop:4}}>Bentornato</div>
        </div>
        <div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Email</label><input style={inp} type="email" placeholder="nome@azienda.ch" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:8}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Password</label>
          <div style={{position:"relative"}}>
            <input style={{...inp,paddingRight:44}} type={showPw?"text":"password"} placeholder="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/>
            <div onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",color:T.textMuted}}><Icon d={showPw?PATHS.eyeoff:PATHS.eye} size={17}/></div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,marginTop:10}}>
          <div onClick={()=>setRemember(v=>!v)} style={{width:18,height:18,borderRadius:5,border:"2px solid",borderColor:remember?T.blue:"#b0b8c4",background:remember?T.blue:"#dce1ea",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {remember&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
          </div>
          <span style={{fontSize:13,color:T.textSub,cursor:"pointer"}} onClick={()=>setRemember(v=>!v)}>Ricordami su questo dispositivo</span>
        </div>
        {err&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"9px 12px",fontSize:13,color:T.red,marginBottom:14}}>{err}</div>}
        <button onClick={go} style={btnP}>Accedi</button>
        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.textSub}}>Prima volta? <span onClick={onRegister} style={{color:T.blue,fontWeight:700,cursor:"pointer"}}>Richiedi accesso</span></div>
        <div style={{marginTop:18,padding:"10px 14px",background:"#c8d0dc",borderRadius:8,fontSize:12,color:T.textMuted,textAlign:"center",border:"1px solid #b8c2d0"}}>Admin: admin@edilslab.ch / admin123<br/>User: user@edilslab.ch / user123</div>
      </div>
    </div>
  );
}
function PendingScreen({onBack}){return(<div style={{minHeight:"100vh",background:T.gradDark,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Inter',-apple-system,sans-serif"}}><div style={{background:"#dce1ea",borderRadius:20,padding:"44px 36px",width:"100%",maxWidth:400,textAlign:"center",boxShadow:T.shadowLg}}><div style={{width:60,height:60,background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",color:T.amber}}><Icon d={PATHS.clock} size={26}/></div><div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:10}}>Richiesta inviata</div><p style={{color:T.textSub,fontSize:14,lineHeight:1.7,marginBottom:24}}>La tua richiesta e stata ricevuta. L amministratore la verifichera e ti dara accesso a breve.</p><button onClick={onBack} style={btnP}>Torna al login</button></div></div>);}
function Register({users,pending,onBack,onSuccess}){
  const [name,setName]=useState("");const [surn,setSurn]=useState("");const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [pw2,setPw2]=useState("");const [prof,setProf]=useState("");const [err,setErr]=useState("");
  const go=()=>{if(!name.trim()||!surn.trim()){setErr("Inserisci nome e cognome.");return;}if(!email.includes("@")){setErr("Email non valida.");return;}if(users.find(u=>u.email===email)||pending.find(p=>p.email===email)){setErr("Email gia registrata o in attesa.");return;}if(pw.length<6){setErr("Password min. 6 caratteri.");return;}if(pw!==pw2){setErr("Le password non coincidono.");return;}onSuccess({email,password:pw,name:name.trim()+" "+surn.trim(),professione:prof.trim(),requestedAt:new Date().toLocaleDateString("it-CH")});};
  return(<div style={{minHeight:"100vh",background:T.gradDark,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Inter',-apple-system,sans-serif"}}><div style={{background:"#dce1ea",borderRadius:20,padding:"44px 36px",width:"100%",maxWidth:420,boxShadow:T.shadowLg}}><div style={{textAlign:"center",marginBottom:28}}><div style={{width:54,height:54,background:T.gradBlue,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Icon d={PATHS.building} size={26} stroke="#fff"/></div><div style={{fontSize:22,fontWeight:800,color:T.text}}>Richiedi accesso</div></div><div style={{display:"flex",gap:10,marginBottom:14}}><div style={{flex:1}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Nome</label><input style={inp} placeholder="Mario" value={name} onChange={e=>{setName(e.target.value);setErr("");}}/></div><div style={{flex:1}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Cognome</label><input style={inp} placeholder="Rossi" value={surn} onChange={e=>{setSurn(e.target.value);setErr("");}}/></div></div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Professione</label><input style={inp} placeholder="es. Architetto, Ingegnere, Geometra..." value={prof} onChange={e=>{setProf(e.target.value);setErr("");}}/></div>{[["Email","mario.rossi@azienda.ch","email",email,setEmail],["Password","Min. 6 caratteri","password",pw,setPw],["Conferma password","Ripeti","password",pw2,setPw2]].map(([l,ph,tp,val,set])=>(<div key={l} style={{marginBottom:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>{l}</label><input style={inp} type={tp} placeholder={ph} value={val} onChange={e=>{set(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>))}{err&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"9px 12px",fontSize:13,color:T.red,marginBottom:12}}>{err}</div>}<div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>Accesso soggetto ad approvazione — riceverai conferma a breve.</div><button onClick={go} style={btnP}>Invia richiesta</button><div style={{textAlign:"center",marginTop:14,fontSize:13,color:T.textSub}}>Hai gia un account? <span onClick={onBack} style={{color:T.blue,fontWeight:700,cursor:"pointer"}}>Accedi</span></div></div></div>);
}

// ─── EMAIL BLOCK ──────────────────────────────────────────────────────────────
function EmailBlock({data}){
  const [ogg,setOgg]=useState(data.ogg);const [corpo,setCorpo]=useState(data.corpo);const [editing,setEditing]=useState(false);const [copied,setCopied]=useState(false);
  return(<div style={{marginTop:10,border:"1.5px solid #c4ccd8",borderRadius:14,overflow:"hidden",background:"#dce1ea"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"linear-gradient(135deg,#c8d0dc,#ccd3dd)",borderBottom:"1px solid #c4ccd8"}}><div style={{display:"flex",alignItems:"center",gap:7}}><Icon d={PATHS.mail} size={15} stroke={T.blue}/><span style={{fontSize:12,fontWeight:700,color:T.blue}}>Bozza email</span></div><div style={{display:"flex",gap:6}}><button onClick={()=>setEditing(v=>!v)} style={{padding:"4px 12px",background:editing?T.blue:"#d6dce6",color:editing?"#fff":T.textSub,border:"1px solid #c4ccd8",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>{editing?"Fine":"Modifica"}</button><button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{padding:"4px 12px",background:copied?T.green:"#d6dce6",color:copied?"#fff":T.textSub,border:"1px solid #c4ccd8",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer"}}>{copied?"Copiato!":"Copia"}</button></div></div><div style={{padding:"8px 14px",borderBottom:"1px solid #c4ccd8",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",flexShrink:0}}>Oggetto</span>{editing?<input value={ogg} onChange={e=>setOgg(e.target.value)} style={{flex:1,border:"1px solid #c4ccd8",borderRadius:6,padding:"4px 8px",fontSize:13,outline:"none",color:T.text,background:"#dce1ea"}}/>:<span style={{fontSize:13,fontWeight:600,color:T.text}}>{ogg}</span>}</div><div style={{padding:"12px 14px"}}>{editing?<textarea value={corpo} onChange={e=>setCorpo(e.target.value)} style={{width:"100%",minHeight:200,border:"1px solid #c4ccd8",borderRadius:8,padding:"10px 12px",fontSize:13,lineHeight:1.7,outline:"none",resize:"vertical",fontFamily:"inherit",color:T.text,boxSizing:"border-box",background:"#dce1ea"}}/>:<pre style={{fontFamily:"inherit",fontSize:13,lineHeight:1.7,color:T.text,whiteSpace:"pre-wrap",margin:0}}>{corpo}</pre>}</div><div style={{padding:"7px 14px",background:"#d6dce6",borderTop:"1px solid #c4ccd8",fontSize:11,color:T.textMuted}}>I campi [TRA PARENTESI] sono da personalizzare</div></div>);
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
// ─── HOOK: Salva in progetto ─────────────────────────────────────────────────
function useSalvaInProgetto(userEmail){
  const [progetti,setProjetti]=useState(()=>{try{const s=localStorage.getItem("es_progetti");return s?JSON.parse(s):[];}catch(e){return[];}});
  const [modal,setModal]=useState(false);
  const [pendingItem,setPendingItem]=useState(null);
  const [selProg,setSelProg]=useState("");
  const [saved,setSaved]=useState(false);

  const miei=progetti.filter(p=>p.owner===userEmail||(p.condivisiCon||[]).includes(userEmail));

  const salva=(tipo,testo)=>{
    setPendingItem({tipo,testo});
    setSelProg(miei[0]?.id||"");
    setModal(true);
    setSaved(false);
  };

  const conferma=()=>{
    if(!selProg||!pendingItem)return;
    const item={id:Date.now(),tipo:pendingItem.tipo,testo:pendingItem.testo,data:new Date().toLocaleDateString("it-CH"),autore:"me"};
    const updated=progetti.map(p=>String(p.id)===String(selProg)?{...p,items:[...p.items,item]}:p);
    setProjetti(updated);
    try{localStorage.setItem("es_progetti",JSON.stringify(updated));}catch(e){}
    setModal(false);setPendingItem(null);setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  };

  const modalJSX = modal ? (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
      <div style={{background:"#dce1ea",borderRadius:16,padding:28,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:6}}>Salva in progetto</div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>Scegli in quale cartella salvare questo elemento.</div>
        {miei.length===0
          ?<div style={{padding:"12px 16px",background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:10,fontSize:13,color:"#92400e",marginBottom:16}}>Nessun progetto disponibile. Creane uno dalla sezione Cartelle Progetto.</div>
          :<select value={selProg} onChange={e=>setSelProg(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1.5px solid #c4ccd8",borderRadius:10,fontSize:14,outline:"none",background:"#fff",color:"#0f172a",marginBottom:16,cursor:"pointer"}}>
            {miei.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        }
        <div style={{display:"flex",gap:10}}>
          <button onClick={conferma} disabled={!selProg||miei.length===0} style={{flex:1,padding:11,background:"linear-gradient(135deg,#1e40af,#2563eb)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",opacity:(!selProg||miei.length===0)?0.5:1}}>Salva</button>
          <button onClick={()=>{setModal(false);setPendingItem(null);}} style={{padding:"11px 18px",background:"#d6dce6",color:"#64748b",border:"1px solid #c4ccd8",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer"}}>Annulla</button>
        </div>
      </div>
    </div>
  ) : null;

  return {salva,saved,modalJSX,hasProjetti:miei.length>0};
}

// ─── HOOK: Cronologia chat per utente ────────────────────────────────────────
function useChatHistory(userEmail, mode){
  const key="es_chat_"+userEmail+"_"+mode;
  const [convs,setConvs]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):[];}catch(e){return[];}});
  const [activeCid,setActiveCid]=useState(null);

  const saveConv=(msgs)=>{
    if(msgs.length<=1)return; // solo welcome, non salvare
    const firstUser=msgs.find(m=>m.role==="user");
    if(!firstUser)return;
    const title=firstUser.text.substring(0,50)+(firstUser.text.length>50?"...":"");
    const cid=activeCid||Date.now();
    if(!activeCid)setActiveCid(cid);
    const entry={id:cid,title,date:new Date().toLocaleDateString("it-CH"),msgs:msgs.map(m=>({role:m.role,text:m.text}))};
    setConvs(prev=>{
      const updated=[entry,...prev.filter(c=>c.id!==cid)].slice(0,20);
      try{localStorage.setItem(key,JSON.stringify(updated));}catch(e){}
      return updated;
    });
  };

  const loadConv=(cid)=>{
    setActiveCid(cid);
    return convs.find(c=>c.id===cid);
  };

  const newConv=()=>{setActiveCid(null);};
  const delConv=(cid)=>{
    setConvs(prev=>{const u=prev.filter(c=>c.id!==cid);try{localStorage.setItem(key,JSON.stringify(u));}catch(e){}return u;});
    if(activeCid===cid)setActiveCid(null);
  };

  return {convs,activeCid,saveConv,loadConv,newConv,delConv};
}

function Chat({user,mode,onAddHistory}){
  const mob=useIsMobile();
  const isDoc=mode==="docs";
  const acc=isDoc?T.purple:T.blue;
  const grad=isDoc?T.gradPurple:T.gradBlue;
  const welcome=isDoc
    ?"Ciao "+user.name.split(" ")[0]+"! Sono la Chat Documenti.\n\nRispondo dai tuoi documenti e cerco in tempo reale su SUVA, SIA e altri enti ufficiali quando serve."
    :"Ciao "+user.name.split(" ")[0]+"! Sono la Chat Edilizia.\n\nSono il tuo assistente tecnico per l edilizia svizzera. Posso aiutarti con normative e scrivere email professionali.";

  const [msgs,setMsgs]=useState([{role:"assistant",text:welcome,enti:[],webResults:[]}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [photo,setPhoto]=useState(null);
  const [webSearch,setWebSearch]=useState(true);
  const [showHistory,setShowHistory]=useState(false);
  const endRef=useRef();
  const fileRef=useRef();
  const {salva,saved,modalJSX}=useSalvaInProgetto(user.email);
  const {convs,activeCid,saveConv,loadConv,newConv,delConv}=useChatHistory(user.email,mode);

  const isEmailReq=t=>{const tx=t.toLowerCase();return tx.includes("mail")||tx.includes("email")||(tx.includes("scrivi")&&(tx.includes("offerta")||tx.includes("convoca")||tx.includes("segnala")))||tx.includes("redigi")||tx.includes("bozza");};

  useEffect(()=>{setMsgs([{role:"assistant",text:welcome,enti:[],webResults:[]}]);setPhoto(null);setInput("");setWebSearch(true);},[mode]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);

  const handlePhoto=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhoto({url:ev.target.result,name:f.name});r.readAsDataURL(f);};

  const {fonti} = useFonti();
  const fontiAttive = fonti.filter(f=>f.attiva);
  const fontiList = fontiAttive.map(f=>`- ${f.nome}: ${f.url}`).join("\n");

  const callAPI = async (question, imageUrl) => {
    const systemPrompt = isDoc
      ? `Sei un assistente tecnico specializzato in edilizia svizzera. Hai accesso a documenti tecnici caricati dall'utente e puoi cercare sul web in tempo reale.\n\nFONTI UFFICIALI DA CONSULTARE PRIORITARIAMENTE:\n${fontiList}\n\nCerca sempre su questi siti prima di rispondere. Cita sempre la fonte. Rispondi in italiano. Aggiungi alla fine: "Le informazioni hanno carattere orientativo. Consultare sempre le norme ufficiali e un professionista abilitato."`
      : `Sei un assistente tecnico per l'edilizia svizzera. Rispondi in italiano su normative SIA, SUVA, sicurezza cantieri, tecniche costruttive. Fonti prioritarie:\n${fontiList}\nPuoi generare bozze di email professionali se richiesto.`;

    const tools = webSearch ? [{
      type: "web_search_20250305",
      name: "web_search"
    }] : undefined;

    const messages = [];
    if (imageUrl) {
      messages.push({ role:"user", content:[
        { type:"image", source:{ type:"base64", media_type:"image/jpeg", data: imageUrl.split(",")[1] || imageUrl } },
        { type:"text", text: question || "Analizza questa immagine dal punto di vista tecnico edilizio." }
      ]});
    } else {
      messages.push({ role:"user", content: question });
    }

    const body = { model:"claude-sonnet-4-20250514", max_tokens:1000, system: systemPrompt, messages };
    if (tools) body.tools = tools;

    const storedKey = (() => { try { return localStorage.getItem("es_anthropic_key")||""; } catch(e) { return ""; } })();
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":storedKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body: JSON.stringify(body)
    });
    const data = await resp.json();

    // Extract text and web results
    let text = "";
    const webResults = [];
    if (data.content) {
      data.content.forEach(block => {
        if (block.type === "text") text += block.text;
        if (block.type === "tool_result" || (block.type === "mcp_tool_result")) {
          try { const r = JSON.parse(block.content?.[0]?.text || "{}"); if (r.results) webResults.push(...r.results.slice(0,3)); } catch(e){}
        }
      });
    }
    if (!text && data.error) text = "Errore API: " + (data.error.message || JSON.stringify(data.error));
    if (!text) text = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "Nessuna risposta ricevuta.";
    return { text, webResults };
  };

  const send = async (txt) => {
    const q = txt || input.trim();
    if (!q && !photo) return;
    // If user pasted a URL, fetch it and send as context
    const urlMatch = q.match(/https?:\/\/[^\s]+/);
    if (urlMatch && !photo) {
      const url = urlMatch[0];
      const umsg = { role:"user", text:q, enti:[], webResults:[] };
      setInput(""); setMsgs(m=>[...m,umsg]); setTyping(true);
      try {
        const storedKey = (() => { try { return localStorage.getItem("es_anthropic_key")||""; } catch(e) { return ""; } })();
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":storedKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            tools:[{type:"web_search_20250305",name:"web_search"}],
            system:"Sei un assistente tecnico edile svizzero. L utente ha incollato un URL. Accedi alla pagina, leggila e rispondi in italiano sul contenuto. Se e un documento normativo riassumi i punti chiave.",
            messages:[{role:"user",content:"Leggi questa pagina e dimmi i punti principali: "+url+(q!==url?" Domanda: "+q.replace(url,"").trim():"")}]
          })
        });
        const data = await resp.json();
        const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("") || "Non riesco ad accedere alla pagina.";
        setMsgs(m=>[...m,{role:"assistant",text,enti:getEnti(text),webResults:[]}]);
      } catch(e) {
        setMsgs(m=>[...m,{role:"assistant",text:"Errore: "+e.message,enti:[],webResults:[]}]);
      }
      setTyping(false);
      return;
    }
    const umsg = { role:"user", text: q || "Ho inviato una foto.", image: photo ? photo.url : null };
    setInput(""); setPhoto(null);
    setMsgs(m => [...m, umsg]);
    setTyping(true);

    try {
      // Try real API first
      const { text, webResults } = await callAPI(q, photo?.url);
      const enti = getEnti(text + " " + q);
      setMsgs(m => [...m, { role:"assistant", text, enti, webResults,
        emailData: (!isDoc && isEmailReq(q)) ? REMAILS[Math.floor(Math.random()*3)] : null
      }]);
      if(onAddHistory && q) onAddHistory(q.substring(0,60)+(q.length>60?"...":""), mode, user.name);
      setMsgs(m=>{const updated=[...m];saveConv(updated);return updated;});
    } catch(e) {
      // Fallback to mock if API not available
      let resp; let emailData = null;
      if (photo) { resp = RPHOTO[Math.floor(Math.random()*3)]; }
      else if (!isDoc && isEmailReq(q)) { emailData = REMAILS[Math.floor(Math.random()*3)]; resp = "Ho preparato una bozza email."; }
      else { resp = (isDoc ? RDOCS : RGEN)[Math.floor(Math.random()*4)]; }
      setMsgs(m => [...m, { role:"assistant", text: resp, enti: getEnti(resp+" "+q), webResults:[], emailData }]);
      if(onAddHistory && q) onAddHistory(q.substring(0,60)+(q.length>60?"...":""), mode, user.name);
      setMsgs(m=>{saveConv(m);return m;});
    }
    setTyping(false);
  };

  const quickDoc=["SIA 118","Sicurezza in quota","Calcolo carichi","Normativa SUVA cantieri"];
  const quickGen=["Normativa LCPubb","Norme SIA strutturali","Sicurezza SUVA","Scrivi mail richiesta offerta"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:mob?"calc(100vh - 116px)":"calc(100vh - 108px)"}}>
      {/* Header bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",background:acc+"08",border:"1px solid "+acc+"20",borderRadius:12,marginBottom:12}}>
        <div style={{width:28,height:28,borderRadius:8,background:grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={isDoc?PATHS.docs:PATHS.chat} size={13} stroke="#fff"/></div>
        <span style={{fontSize:13,fontWeight:700,color:acc}}>{isDoc?"Chat Documenti":"Chat Edilizia"}</span>
        {!mob&&<span style={{fontSize:12,color:T.textMuted}}>{isDoc?"Documenti + ricerca web in tempo reale":"Assistente edilizia svizzera"}</span>}
        {/* Web search toggle - solo in Chat Documenti */}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
          {isDoc && (
            <div onClick={()=>setWebSearch(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,border:"1.5px solid "+(webSearch?acc:T.border),background:webSearch?acc+"12":"transparent",cursor:"pointer"}}>
              <Icon d={PATHS.search} size={12} stroke={webSearch?acc:T.textMuted}/>
              <span style={{fontSize:11,fontWeight:600,color:webSearch?acc:T.textMuted}}>Web</span>
              <div style={{width:28,height:14,borderRadius:7,background:webSearch?acc:"#c4ccd8",position:"relative",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:2,left:webSearch?14:2,width:10,height:10,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          )}
          <button onClick={()=>setShowHistory(v=>!v)} title="Cronologia conversazioni" style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,border:"1.5px solid "+(showHistory?acc:T.border),background:showHistory?acc+"12":"transparent",cursor:"pointer",color:showHistory?acc:T.textMuted,fontSize:11,fontWeight:600}}>
            <Icon d={PATHS.clock} size={12}/>{!mob&&"Cronologia"}
          </button>
          {msgs.length>1&&<button onClick={()=>salva("chat",msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>(m.role==="user"?"Tu: ":"AI: ")+m.text).join("\n\n").substring(0,2000))} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,border:"1.5px solid "+(saved?T.green:T.border),background:saved?T.green+"12":"transparent",cursor:"pointer",color:saved?T.green:T.textMuted,fontSize:11,fontWeight:600}}>
            {saved?"✓ Salvato":"💾 Salva"}
          </button>}
          <button onClick={()=>{newConv();setMsgs([{role:"assistant",text:welcome,enti:[],webResults:[]}]);}} title="Nuova conversazione" style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,border:"1.5px solid "+T.border,background:"transparent",cursor:"pointer",color:T.textMuted,fontSize:11,fontWeight:600}}>
            <Icon d={PATHS.plus} size={12}/>{!mob&&"Nuova"}
          </button>
        </div>
      </div>

      {/* Pannello cronologia */}
      {showHistory&&(
        <div style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:12,padding:14,marginBottom:10,maxHeight:220,overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>Cronologia conversazioni</div>
            <button onClick={()=>setShowHistory(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:16}}>×</button>
          </div>
          {convs.length===0&&<div style={{fontSize:12,color:T.textMuted,textAlign:"center",padding:"10px 0"}}>Nessuna conversazione salvata</div>}
          {convs.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,marginBottom:4,background:activeCid===c.id?acc+"12":"#d6dce6",border:"1px solid "+(activeCid===c.id?acc+"30":T.border)}}>
              <div onClick={()=>{const cv=loadConv(c.id);if(cv)setMsgs(cv.msgs.map(m=>({...m,enti:[],webResults:[]})));setShowHistory(false);}} style={{flex:1,cursor:"pointer"}}>
                <div style={{fontSize:12,fontWeight:activeCid===c.id?700:500,color:activeCid===c.id?acc:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{c.date}</div>
              </div>
              <button onClick={()=>delConv(c.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",padding:2,fontSize:13}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflow:"auto",paddingBottom:4}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:16,gap:10,alignItems:"flex-end"}}>
            {m.role==="assistant"&&<div style={{width:30,height:30,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={isDoc?PATHS.docs:PATHS.chat} size={13} stroke="#fff"/></div>}
            <div style={{maxWidth:mob?"85%":"72%"}}>
              {m.image&&<img src={m.image} alt="foto" style={{maxWidth:"100%",borderRadius:12,marginBottom:6,display:"block",maxHeight:200,objectFit:"cover"}}/>}
              <div style={{padding:"11px 16px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?grad:"#dce1ea",color:T.text,fontSize:13,lineHeight:1.65,boxShadow:T.shadow,border:m.role==="user"?"none":"1px solid "+T.border}}>
                {m.text.split("\n").map((l,li)=><span key={li}>{l}{li<m.text.split("\n").length-1&&<br/>}</span>)}
              </div>
              {/* Web results */}
              {m.role==="assistant"&&m.webResults&&m.webResults.length>0&&(
                <div style={{marginTop:6,padding:"8px 12px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.blue,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>🔍 Fonti trovate sul web</div>
                  {m.webResults.map((r,ri)=>(
                    <div key={ri} style={{marginBottom:4}}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:T.blue,textDecoration:"none"}}>{r.title||r.url}</a>
                      {r.snippet&&<div style={{fontSize:10,color:T.textSub,marginTop:1}}>{r.snippet.substring(0,120)}...</div>}
                    </div>
                  ))}
                </div>
              )}
              {m.role==="assistant"&&m.emailData&&<EmailBlock data={m.emailData}/>}
              {m.role==="assistant"&&m.enti&&m.enti.length>0&&(
                <div style={{marginTop:8,padding:"10px 12px",background:"#d6dce6",border:"1px solid "+T.border,borderRadius:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.5px"}}>Fonti ufficiali</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {m.enti.map(nm=>{const e=ENTI.find(x=>x.nome===nm);if(!e)return null;return(<a key={e.nome} href={e.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#dce1ea",border:"1px solid "+e.color+"30",borderRadius:20,fontSize:11,fontWeight:600,color:e.color,textDecoration:"none"}}><Icon d={PATHS.link} size={10} stroke={e.color}/>{e.nome}</a>);})}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing&&<div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:16}}><div style={{width:30,height:30,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={isDoc?PATHS.docs:PATHS.chat} size={13} stroke="#fff"/></div><div style={{padding:"11px 16px",borderRadius:"16px 16px 16px 4px",background:"#dce1ea",border:"1px solid "+T.border,fontSize:13,color:T.textMuted,display:"flex",gap:4,alignItems:"center"}}><span style={{animation:"pulse 1s infinite"}}>●</span><span style={{animation:"pulse 1s 0.2s infinite",opacity:0.6}}>●</span><span style={{animation:"pulse 1s 0.4s infinite",opacity:0.3}}>●</span></div></div>}
        <div ref={endRef}/>
      </div>
      {modalJSX}

      {/* Quick actions */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"8px 0 6px"}}>
        {(isDoc?quickDoc:quickGen).map(q=>(<div key={q} onClick={()=>send(q)} style={{padding:"5px 11px",background:"#d6dce6",border:"1px solid "+acc+"30",borderRadius:16,fontSize:12,cursor:"pointer",color:acc,fontWeight:500,boxShadow:T.shadow}}>{q}</div>))}
      </div>

      {/* Photo preview */}
      {photo&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#d6dce6",border:"1px solid "+T.border,borderRadius:10,marginBottom:8}}><img src={photo.url} alt="" style={{width:40,height:40,borderRadius:8,objectFit:"cover"}}/><span style={{fontSize:12,color:T.textSub,flex:1}}>{photo.name}</span><div onClick={()=>setPhoto(null)} style={{cursor:"pointer",color:T.textMuted}}><Icon d={PATHS.close} size={16}/></div></div>}

      {/* Input bar */}
      <div style={{display:"flex",gap:8,paddingTop:8,borderTop:"1px solid "+T.border}}>
        <button onClick={()=>fileRef.current.click()} style={{width:44,height:44,borderRadius:10,background:"#d6dce6",border:"1px solid "+T.border,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,flexShrink:0}}><Icon d={PATHS.camera} size={18}/></button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto}/>
        <textarea style={{flex:1,padding:"11px 14px",border:"1.5px solid "+T.border,borderRadius:10,fontSize:14,outline:"none",resize:"none",fontFamily:"inherit",color:T.text,lineHeight:"20px",background:"#dce1ea"}} placeholder={isDoc?"Cerca nei documenti o chiedi info aggiornate...":"Domanda tecnica o richiedi una email..."} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={1}/>
        <button onClick={()=>send()} style={{width:44,height:44,borderRadius:10,background:(input.trim()||photo)?grad:"#c8d0dc",border:"none",cursor:(input.trim()||photo)?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",color:(input.trim()||photo)?"#fff":T.textMuted,flexShrink:0}}><Icon d={PATHS.send} size={16}/></button>
      </div>
    </div>
  );
}
// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
function Documents(){
  const mob=useIsMobile();
  const [docs,setDocs]=useState(SAMPLE_DOCS);
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("Tutti");
  const [drag,setDrag]=useState(false);
  const [driveOpen,setDriveOpen]=useState(false);
  const [driveFiles,setDriveFiles]=useState([]);
  const [driveLoading,setDriveLoading]=useState(false);
  const [driveError,setDriveError]=useState("");
  const fileRef=useRef();
  const catC={Strutturale:T.blue,Impianti:T.purple,Normativa:T.red,Sicurezza:T.amber,Contratti:T.green,Cantiere:"#0891b2"};
  const add=name=>{const ext=name.split(".").pop().toUpperCase();setDocs(d=>[...d,{id:Date.now(),name,category:"Normativa",tag:ext,size:"---",date:new Date().toLocaleDateString("it-CH"),color:EXT_COLOR[ext]||"#64748b",readable:EXT_READ[ext]!==false}]);};
  const del=id=>setDocs(d=>d.filter(x=>x.id!==id));
  const filtered=docs.filter(d=>(d.name.toLowerCase().includes(search.toLowerCase())||d.tag.toLowerCase().includes(search.toLowerCase()))&&(cat==="Tutti"||d.category===cat));

  const openDrive = async () => {
    setDriveOpen(true); setDriveLoading(true); setDriveError(""); setDriveFiles([]);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Elenca i file dell utente da Google Drive. Rispondi SOLO con un array JSON: [{id, name, mimeType, modifiedTime, size}]. Nessun testo aggiuntivo.",
          messages:[{role:"user",content:"Lista i file del mio Google Drive, massimo 20 file recenti."}],
          mcp_servers:[{type:"url",url:"https://drivemcp.googleapis.com/mcp/v1",name:"gdrive"}]
        })
      });
      const data = await resp.json();
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();
      let files = [];
      try { files = JSON.parse(text); } catch(e) { const m=text.match(/\[[\s\S]*\]/); if(m) files=JSON.parse(m[0]); }
      if (!Array.isArray(files)||files.length===0) {
        setDriveError("Nessun file trovato o Drive non connesso. Collega Google Drive dal menu strumenti.");
      } else {
        setDriveFiles(files);
      }
    } catch(e) {
      setDriveError("Errore connessione Drive: "+e.message);
    }
    setDriveLoading(false);
  };

  const importFromDrive = (file) => {
    const ext = (file.name||"").split(".").pop().toUpperCase()||"PDF";
    setDocs(d=>[...d,{id:Date.now(),name:file.name,category:"Normativa",tag:ext,size:file.size||"---",date:new Date().toLocaleDateString("it-CH"),color:EXT_COLOR[ext]||"#64748b",readable:EXT_READ[ext]!==false,driveId:file.id}]);
  };

  const getMimeLabel = (mt="") => {
    if(mt.includes("pdf")) return {label:"PDF",color:"#ef4444"};
    if(mt.includes("spreadsheet")||mt.includes("excel")) return {label:"XLSX",color:"#059669"};
    if(mt.includes("document")||mt.includes("word")) return {label:"DOCX",color:"#2563eb"};
    if(mt.includes("presentation")) return {label:"PPTX",color:"#d97706"};
    if(mt.includes("folder")) return {label:"📁",color:"#64748b"};
    return {label:"FILE",color:"#94a3b8"};
  };

  return(
    <div>
      <div style={{background:"#dce1ea",border:"1px solid #c4a800",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:10}}>Formati supportati</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {[{ext:"PDF",c:"#ef4444",ai:true},{ext:"DOCX",c:"#2563eb",ai:true},{ext:"XLSX",c:"#059669",ai:true},{ext:"PPTX",c:"#d97706",ai:true},{ext:"CSV",c:"#0891b2",ai:true},{ext:"TXT",c:"#64748b",ai:true},{ext:"JPG/PNG",c:"#7c3aed",ai:true},{ext:"DWG/DXF",c:"#94a3b8",ai:false}].map(f=>(<span key={f.ext} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:8,fontSize:11,fontWeight:700,background:f.c+"12",color:f.ai?f.c:"#94a3b8",border:"1px solid "+f.c+"25"}}>{f.ext}<span style={{fontSize:9,opacity:0.7}}>{f.ai?"AI":"archiviazione"}</span></span>))}
        </div>
      </div>
      {/* Google Drive import */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={openDrive} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",background:"#fff",border:"1.5px solid #c4ccd8",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",color:T.text,boxShadow:T.shadow}}>
          <svg width="18" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/><path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>
          Importa da Google Drive
        </button>
      </div>

      {/* Drive modal */}
      {driveOpen && (
        <div style={{background:"#dce1ea",border:"1.5px solid #4285f440",borderRadius:14,padding:20,marginBottom:16,boxShadow:T.shadowMd}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:800,color:T.text}}>📁 Google Drive</div>
            <button onClick={()=>setDriveOpen(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.textMuted}}>×</button>
          </div>
          {driveLoading && (
            <div style={{display:"flex",alignItems:"center",gap:10,color:"#4285f4",fontWeight:600,padding:"20px 0"}}>
              <div style={{width:18,height:18,border:"2px solid #4285f4",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              Connessione a Google Drive...
            </div>
          )}
          {driveError && (
            <div style={{padding:"12px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,fontSize:13,color:T.red,marginBottom:10}}>
              {driveError}
            </div>
          )}
          {driveFiles.length>0 && (
            <>
              <div style={{fontSize:11,color:T.textSub,marginBottom:10}}>{driveFiles.length} file trovati — clicca per importare</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:320,overflowY:"auto"}}>
                {driveFiles.map(f=>{
                  const {label,color}=getMimeLabel(f.mimeType);
                  const alreadyImported=docs.some(d=>d.driveId===f.id);
                  return(
                    <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:alreadyImported?"#f0fdf4":"#d6dce6",border:"1px solid "+(alreadyImported?"#bbf7d0":T.border),borderRadius:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:10,flexShrink:0}}>{label}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                        <div style={{fontSize:10,color:T.textMuted}}>{f.modifiedTime?.substring(0,10)||""} {f.size?"· "+f.size:""}</div>
                      </div>
                      {alreadyImported
                        ? <span style={{fontSize:11,color:T.green,fontWeight:700}}>✓ Importato</span>
                        : <button onClick={()=>importFromDrive(f)} style={{padding:"6px 14px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>Importa</button>
                      }
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{border:"2px dashed",borderColor:drag?T.blue:"#b0b8c4",borderRadius:14,padding:mob?20:28,textAlign:"center",cursor:"pointer",marginBottom:20,background:drag?"#eff6ff":"#d6dce6"}} onDrop={e=>{e.preventDefault();setDrag(false);[...e.dataTransfer.files].forEach(f=>add(f.name));}} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onClick={()=>fileRef.current.click()}>
        <div style={{width:44,height:44,background:T.blue+"12",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:T.blue}}><Icon d={PATHS.upload} size={22}/></div>
        <p style={{margin:"0 0 4px",fontWeight:700,color:T.text,fontSize:14}}>{mob?"Tocca per caricare":"Trascina qui o clicca per caricare"}</p>
        <p style={{margin:0,fontSize:12,color:T.textMuted}}>PDF · Word · Excel · PowerPoint · CSV · TXT · JPG/PNG · DWG</p>
        <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>[...e.target.files].forEach(f=>add(f.name))} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.jpg,.jpeg,.png,.dwg,.dxf"/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}><span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:T.textMuted}}><Icon d={PATHS.search} size={15}/></span><input style={{...inp,paddingLeft:36,fontSize:13}} placeholder="Cerca..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Tutti",...CATEGORIES].map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"7px 13px",borderRadius:8,border:"1.5px solid",borderColor:cat===c?T.blue:T.border,background:cat===c?T.blue:"#d6dce6",color:cat===c?"#fff":T.textSub,fontSize:12,fontWeight:600,cursor:"pointer"}}>{c}</button>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
        {filtered.map(d=>(<div key={d.id} style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:16,boxShadow:T.shadow}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><div style={{width:38,height:38,borderRadius:10,background:(d.color||T.blue)+"18",display:"flex",alignItems:"center",justifyContent:"center",color:d.color||T.blue,fontWeight:800,fontSize:11}}>{d.tag}</div><div style={{display:"flex",alignItems:"center",gap:6}}>{d.readable===false&&<span style={{fontSize:10,color:T.amber,fontWeight:600,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"2px 6px"}}>Solo archivio</span>}<div onClick={()=>del(d.id)} style={{cursor:"pointer",color:"#b0b8c4",padding:4}}><Icon d={PATHS.trash} size={15}/></div></div></div><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:8,wordBreak:"break-all"}}>{d.name}</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}><span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600,background:(catC[d.category]||T.blue)+"15",color:catC[d.category]||T.blue}}>{d.category}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted}}><span>{d.size}</span><span>{d.date}</span></div></div>))}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:T.textMuted,padding:32}}>Nessun documento trovato</div>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashHome({user,setPage,users}){
  const mob=useIsMobile();
  const stats=[{label:"Documenti",val:"4",icon:PATHS.docs,color:T.blue,bg:"#c8d0dc"},{label:"Conversazioni",val:"12",icon:PATHS.chat,color:T.purple,bg:"#ccd3dd"},{label:"Report",val:"3",icon:PATHS.file,color:T.green,bg:"#c8d0dc"},{label:"Utenti attivi",val:user.role==="admin"?String(users.length):"---",icon:PATHS.users,color:T.amber,bg:"#ccd3dd"}];
  const recents=[{text:"Checklist collaudo strutturale",time:"10 min fa",icon:PATHS.chat,color:T.blue},{text:"SIA_261.pdf caricato",time:"1 ora fa",icon:PATHS.upload,color:T.green},{text:"Foto cantiere analizzata",time:"2 ore fa",icon:PATHS.camera,color:T.purple}];
  return(
    <div>
      <div style={{marginBottom:20}}><div style={{fontSize:22,fontWeight:800,color:T.text}}>Buongiorno, {user.name.split(" ")[0]}</div><div style={{fontSize:14,color:T.textSub,marginTop:3}}>Ecco un riepilogo della tua attivita</div></div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {stats.map((st,i)=>(<div key={i} style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:18,boxShadow:T.shadow}}><div style={{width:38,height:38,borderRadius:10,background:st.bg,display:"flex",alignItems:"center",justifyContent:"center",color:st.color,marginBottom:12}}><Icon d={st.icon} size={18}/></div><div style={{fontSize:26,fontWeight:800,color:T.text}}>{st.val}</div><div style={{fontSize:12,color:T.textMuted,marginTop:3}}>{st.label}</div></div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16}}>
        <div style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:20,boxShadow:T.shadow}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Attivita recenti</div>
          {recents.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<recents.length-1?"1px solid #c4ccd8":"none"}}><div style={{width:32,height:32,borderRadius:9,background:r.color+"12",display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><Icon d={r.icon} size={15}/></div><div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{r.text}</div><div style={{fontSize:11,color:T.textMuted}}>{r.time}</div></div></div>))}
        </div>
        <div style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:20,boxShadow:T.shadow}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Azioni rapide</div>
          {[{label:"Chat Documenti",icon:PATHS.docs,color:T.purple,grad:T.gradPurple,page:"chat_docs"},{label:"Chat Edilizia",icon:PATHS.chat,color:T.blue,grad:T.gradBlue,page:"chat_ai"},{label:"Programma Lavori",icon:PATHS.gantt,color:"#0891b2",grad:"linear-gradient(135deg,#0e7490,#0891b2)",page:"gantt"}].map((a,i)=>(<div key={i} onClick={()=>setPage(a.page)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"#d6dce6",borderRadius:10,marginBottom:8,cursor:"pointer",border:"1px solid "+T.border}}><div style={{width:32,height:32,borderRadius:9,background:a.grad,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={a.icon} size={15} stroke="#fff"/></div><span style={{fontSize:13,fontWeight:600,color:T.text}}>{a.label}</span></div>))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCESS DENIED ────────────────────────────────────────────────────────────
function AccessDenied(){return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"50vh",gap:16}}><div style={{width:64,height:64,borderRadius:"50%",background:"#fef2f2",border:"2px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",color:T.red}}><Icon d={PATHS.shield} size={28}/></div><div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:6}}>Accesso non autorizzato</div><div style={{fontSize:14,color:T.textSub}}>Sezione riservata all amministratore.</div></div></div>);}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
function AdminUsers({users,pending,onApprove,onReject}){
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:22,marginBottom:16,boxShadow:T.shadow};
  return(<div style={{maxWidth:600}}><div style={pc}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><div style={{fontSize:15,fontWeight:800,color:T.text}}>Richieste in attesa</div>{pending.length>0&&<span style={{padding:"2px 10px",borderRadius:10,fontSize:12,fontWeight:700,background:"#fef3c7",color:T.amber}}>{pending.length}</span>}</div>{pending.length===0&&<div style={{textAlign:"center",color:T.textMuted,fontSize:13,padding:"12px 0"}}>Nessuna richiesta in attesa</div>}{pending.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<pending.length-1?"1px solid #c4ccd8":"none",flexWrap:"wrap"}}><div style={{width:38,height:38,borderRadius:"50%",background:T.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{p.name.split(" ").map(n=>n[0]).join("")}</div><div style={{flex:1,minWidth:140}}><div style={{fontSize:13,fontWeight:700,color:T.text}}>{p.name}</div><div style={{fontSize:12,color:T.textMuted}}>{p.email} · {p.requestedAt}{p.professione?" · "+p.professione:""}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>onApprove(p.email)} style={{padding:"7px 14px",background:T.green,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Approva</button><button onClick={()=>onReject(p.email)} style={{padding:"7px 14px",background:"#d6dce6",color:T.red,border:"1.5px solid #fecaca",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Rifiuta</button></div></div>))}</div><div style={pc}><div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:16}}>Utenti attivi ({users.length})</div>{users.map((u,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<users.length-1?"1px solid #c4ccd8":"none"}}><div style={{width:36,height:36,borderRadius:"50%",background:T.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{u.name.split(" ").map(n=>n[0]).join("")}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text}}>{u.name}</div><div style={{fontSize:12,color:T.textMuted}}>{u.email}</div></div><span style={{display:"inline-block",padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:u.role==="admin"?"#eff6ff":"#f0fdf4",color:u.role==="admin"?T.blue:T.green}}>{u.role==="admin"?"Admin":"User"}</span></div>))}</div></div>);
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
// ─── API KEY PANEL ───────────────────────────────────────────────────────────
function ApiKeyPanel(){
  const [key,setKey]=useState(()=>{try{return localStorage.getItem("es_anthropic_key")||"";}catch(e){return "";}});
  const [show,setShow]=useState(false);
  const [saved,setSaved]=useState(false);
  const [editing,setEditing]=useState(false);

  const save=()=>{
    try{localStorage.setItem("es_anthropic_key",key.trim());}catch(e){}
    setSaved(true);setEditing(false);
    setTimeout(()=>setSaved(false),3000);
  };

  const hasKey=key.trim().length>0;

  return(
    <div style={{background:"#dce1ea",border:"1.5px solid "+(hasKey?"#bbf7d0":T.amber+"60"),borderRadius:14,padding:22,marginBottom:16,boxShadow:T.shadow}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:34,height:34,borderRadius:9,background:hasKey?"linear-gradient(135deg,#047857,#059669)":"linear-gradient(135deg,#b45309,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔑</div>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:T.text}}>API Key Anthropic</div>
          <div style={{fontSize:11,color:T.textSub}}>Necessaria per le funzioni AI del sito</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          {hasKey&&!editing&&(
            <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:"#f0fdf4",color:T.green,border:"1px solid #bbf7d0"}}>✓ Configurata</span>
          )}
          {!hasKey&&(
            <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:"#fffbeb",color:T.amber,border:"1px solid #fde68a"}}>⚠ Mancante</span>
          )}
        </div>
      </div>

      {!editing&&hasKey&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#d6dce6",borderRadius:10,marginBottom:10}}>
          <span style={{fontSize:13,color:T.textSub,flex:1,fontFamily:"monospace"}}>
            {key.substring(0,8)}••••••••••••••••••••{key.slice(-4)}
          </span>
          <button onClick={()=>setEditing(true)} style={{padding:"4px 12px",background:"#eff6ff",color:T.blue,border:"1px solid #bfdbfe",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>Modifica</button>
          <button onClick={()=>{setKey("");try{localStorage.removeItem("es_anthropic_key");}catch(e){}}} style={{padding:"4px 12px",background:"#fef2f2",color:T.red,border:"1px solid #fecaca",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer"}}>Rimuovi</button>
        </div>
      )}

      {(!hasKey||editing)&&(
        <div>
          {!hasKey&&<div style={{fontSize:12,color:T.textSub,marginBottom:10,lineHeight:1.6}}>
            Inserisci la tua API key di Anthropic. La puoi trovare su <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" style={{color:T.blue}}>console.anthropic.com/keys</a>. Viene salvata solo su questo browser.
          </div>}
          <div style={{display:"flex",gap:8}}>
            <input
              type="password"
              style={{...inp,flex:1,fontFamily:"monospace",fontSize:13}}
              placeholder="sk-ant-..."
              value={key}
              onChange={e=>setKey(e.target.value)}
              onKeyDown={e=>{e.stopPropagation();if(e.key==="Enter")save();}}
            />
            <button onClick={save} disabled={!key.trim()} style={{padding:"0 18px",background:key.trim()?T.gradBlue:"#d6dce6",color:key.trim()?"#fff":T.textMuted,border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:key.trim()?"pointer":"default"}}>
              {saved?"✓ Salvata":"Salva"}
            </button>
            {editing&&<button onClick={()=>setEditing(false)} style={{padding:"0 14px",background:"#d6dce6",color:T.textSub,border:"1px solid "+T.border,borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer"}}>Annulla</button>}
          </div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:8}}>
            ⚠ Salvata solo in questo browser (localStorage). Non condividerla mai con altri.
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({user, onDeleteAccount}){
  const ini=user.name.split(" ").map(n=>n[0]).join("");
  const [showDelete,setShowDelete]=useState(false);
  const [confirmText,setConfirmText]=useState("");
  const [deleting,setDeleting]=useState(false);
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:22,marginBottom:16,boxShadow:T.shadow};

  const handleDelete=()=>{
    if(confirmText!==user.email)return;
    setDeleting(true);
    // Clear all local data for this user
    try{
      localStorage.removeItem("es_shared_history");
      localStorage.removeItem("es_chat_"+user.email+"_docs");
      localStorage.removeItem("es_chat_"+user.email+"_general");
      // Remove user projects
      const projs=JSON.parse(localStorage.getItem("es_progetti")||"[]");
      localStorage.setItem("es_progetti",JSON.stringify(projs.filter(p=>p.owner!==user.email)));
    }catch(e){}
    setTimeout(()=>onDeleteAccount(user.email),800);
  };

  return(
    <div style={{maxWidth:480}}>
      <div style={pc}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:T.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:20}}>{ini}</div>
          <div>
            <div style={{fontSize:19,fontWeight:800,color:T.text}}>{user.name}</div>
            <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{user.email}</div>
            <div style={{marginTop:8}}>
              <span style={{display:"inline-block",padding:"3px 10px",borderRadius:10,fontSize:12,fontWeight:700,background:user.role==="admin"?"#eff6ff":"#f0fdf4",color:user.role==="admin"?T.blue:T.green}}>{user.role==="admin"?"Amministratore":"Utente"}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={pc}>
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:16}}>Informazioni account</div>
        {[{l:"Nome",v:user.name},{l:"Email",v:user.email},{l:"Ruolo",v:user.role==="admin"?"Amministratore":"Utente standard"},{l:"Accesso documenti",v:user.role==="admin"?"Completo":"Solo tramite Chat"},{l:"Sessione",v:"Attiva"}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #c4ccd8",fontSize:13}}>
            <span style={{color:T.textSub}}>{r.l}</span>
            <span style={{fontWeight:600,color:T.text}}>{r.v}</span>
          </div>
        ))}
      </div>

      {user.role==="admin"&&<ApiKeyPanel/>}

      {/* Zona pericolosa */}
      <div style={{background:"#dce1ea",border:"1.5px solid #fecaca",borderRadius:14,padding:22,boxShadow:T.shadow}}>
        <div style={{fontSize:14,fontWeight:800,color:T.red,marginBottom:6}}>Elimina account</div>
        <div style={{fontSize:13,color:T.textSub,marginBottom:16,lineHeight:1.6}}>
          L eliminazione è permanente. Verranno cancellati tutti i tuoi dati: cronologia chat, progetti, preferenze. Questa azione non può essere annullata.
        </div>
        {!showDelete?(
          <button onClick={()=>setShowDelete(true)} style={{padding:"9px 20px",background:"#fef2f2",color:T.red,border:"1.5px solid #fecaca",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>
            Elimina il mio account
          </button>
        ):(
          <div>
            <div style={{fontSize:13,color:T.text,marginBottom:10}}>
              Per confermare scrivi il tuo indirizzo email: <strong>{user.email}</strong>
            </div>
            <input
              style={{...inp,marginBottom:12,border:"1.5px solid #fecaca"}}
              placeholder={user.email}
              value={confirmText}
              onChange={e=>setConfirmText(e.target.value)}
              onKeyDown={e=>e.stopPropagation()}
            />
            <div style={{display:"flex",gap:10}}>
              <button
                onClick={handleDelete}
                disabled={confirmText!==user.email||deleting}
                style={{flex:1,padding:11,background:confirmText===user.email?"#dc2626":"#e2e7ef",color:confirmText===user.email?"#fff":T.textMuted,border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:confirmText===user.email?"pointer":"default",transition:"all 0.2s"}}
              >
                {deleting?"Eliminazione in corso...":"Conferma eliminazione"}
              </button>
              <button onClick={()=>{setShowDelete(false);setConfirmText("");}} style={{padding:"11px 18px",background:"#d6dce6",color:T.textSub,border:"1px solid "+T.border,borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer"}}>
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
function Ranking(){
  const mob=useIsMobile();
  const [gare,setGare]=useState(GARE_INIT);
  const [view,setView]=useState("list");
  const [sel,setSel]=useState(null);

  // Offerta: {id, ditta, importoNetto, iva, sconto, importoLordo, note}
  const emptyO=(id)=>({id,ditta:"",importoNetto:"",iva:"8.1",sconto:"0",ribasso:"0",importoLordo:"",note:""});
  const [ng,setNg]=useState({nome:"",desc:"",contesto:"",offerte:[emptyO(1),emptyO(2),emptyO(3)]});
  const [pdfLoading,setPdfLoading]=useState(false);
  const [pdfError,setPdfError]=useState("");
  const [pdfResults,setPdfResults]=useState([]);
  const [analysis,setAnalysis]=useState(null);
  const [analysisLoading,setAnalysisLoading]=useState(false);
  const [situazione,setSituazione]=useState(null);
  const [situazioneLoading,setSituazioneLoading]=useState(false);
  const [editMode,setEditMode]=useState(false);
  const [editText,setEditText]=useState("");
  const [editOfferta,setEditOfferta]=useState(null); // id offerta in modifica nel dettaglio
  const pdfRef=useRef();
  const printRef=useRef();

  // ── Calcoli importi ──
  // Sconto = riduzione commerciale (su listino), Ribasso = ribasso d asta (su importo base)
  // Formula: (Netto × (1-Sconto%) × (1-Ribasso%)) × (1+IVA%)
  const calcLordo=(netto,iva,sconto,ribasso)=>{
    const n=parseFloat(netto)||0;
    const sc=parseFloat(sconto)||0;
    const rb=parseFloat(ribasso)||0;
    const iv=parseFloat(iva)||0;
    return n*(1-sc/100)*(1-rb/100)*(1+iv/100);
  };
  const updO=(id,field,val)=>setNg(g=>({...g,offerte:g.offerte.map(o=>{
    if(o.id!==id)return o;
    const u={...o,[field]:val};
    // Ricalcola lordo automaticamente
    const netto=field==="importoNetto"?val:u.importoNetto;
    const iva=field==="iva"?val:u.iva;
    const sconto=field==="sconto"?val:u.sconto;
    const ribasso=field==="ribasso"?val:u.ribasso;
    u.importoLordo=calcLordo(netto,iva,sconto,ribasso).toFixed(2);
    return u;
  })}));

  const {salva,modalJSX:rankingModalJSX}=useSalvaInProgetto(sel?.owner||"guest");
  const fmt=v=>parseFloat(v||0).toLocaleString("it-CH",{minimumFractionDigits:2});
  const posC=[T.green,T.blue,T.amber,T.textMuted];
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:22,marginBottom:16,boxShadow:T.shadow};

  // ranked usa importoLordo se disponibile, altrimenti importoNetto o importo (legacy)
  const getImporto=o=>parseFloat(o.importoLordo||o.importo||0);
  const ranked=offerte=>[...offerte].filter(o=>getImporto(o)>0).sort((a,b)=>getImporto(a)-getImporto(b));
  const diff=(v,mn)=>(((v-mn)/mn)*100).toFixed(1);

  // ── Estrai da PDF ──
  const handlePdf=async(file)=>{
    if(!file)return;
    setPdfLoading(true);setPdfError("");
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Errore lettura"));r.readAsDataURL(file);});
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1500,
          system:'Estrai TUTTE le offerte da questo PDF di offerta edile svizzera. Per ogni offerta restituisci: ditta (nome impresa), importoNetto (CHF numerico senza simboli), iva (aliquota %, default 8.1), sconto (% sconto commerciale, default 0), ribasso (% ribasso asta, default 0), importoLordo (CHF finale numerico), note (max 80 caratteri). Rispondi SOLO con array JSON valido senza testo e senza backtick. Se non trovi offerte: []',
          messages:[{role:"user",content:[
            {type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
            {type:"text",text:"Estrai tutte le offerte con importo netto, IVA, sconti/ribassi e importo lordo finale."}
          ]}]
        })
      });
      const data=await resp.json();
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();
      let parsed=[];
      try{parsed=JSON.parse(text);}catch(e){const m=text.match(/\[[\s\S]*\]/);if(m)parsed=JSON.parse(m[0]);}
      if(!Array.isArray(parsed)||!parsed.length){setPdfError("Nessuna offerta trovata nel PDF.");return;}
      const newO=parsed.map((o,i)=>({
        id:Date.now()+i,
        ditta:o.ditta||"",
        importoNetto:String(o.importoNetto||""),
        iva:String(o.iva||"8.1"),
        sconto:String(o.sconto||"0"),
        ribasso:String(o.ribasso||"0"),
        importoLordo:String(o.importoLordo||calcLordo(o.importoNetto,o.iva||8.1,o.sconto||0,o.ribasso||0).toFixed(2)),
        note:o.note||""
      }));
      setNg(g=>{const ex=g.offerte.filter(x=>x.ditta.trim()||x.importoNetto);return{...g,offerte:[...ex,...newO]};});
      setPdfResults(p=>[...p,...parsed]);
    }catch(e){setPdfError("Errore: "+e.message);}
    setPdfLoading(false);
  };

  // ── Analisi offerte ──
  const analyzeOfferte=async(gara)=>{
    setAnalysis(null);setAnalysisLoading(true);
    const r=ranked(gara.offerte);
    const offerteText=r.map((o,i)=>{
      const lordo=getImporto(o);
      const netto=parseFloat(o.importoNetto||o.importo||0);
      const sconto=parseFloat(o.sconto||0);
      const iva=parseFloat(o.iva||0);
      const ribasso=parseFloat(o.ribasso||0);
      return `Offerta ${i+1} - ${o.ditta}:\n  IVA escl.: CHF ${fmt(netto)}\n  Sconto comm.: ${sconto}%  Ribasso: ${ribasso}%\n  IVA: ${iva}%\n  IVA incl.: CHF ${fmt(lordo)}${o.note?'\n  Note: '+o.note:''}`;
    }).join('\n\n');
    try{
      const rKey=(() => { try { return localStorage.getItem("es_anthropic_key")||""; } catch(e) { return ""; } })();
      const resp=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json','x-api-key':rKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',max_tokens:2000,
          system:'Sei un esperto di appalti edili svizzeri. Analizza le offerte e rispondi SOLO con JSON valido: {sintesi, raccomandazione:{ditta,motivo}, analisi_per_offerta:[{ditta, punti_attenzione:[], costi_nascosti:[], valutazione:"positiva|neutra|negativa", commento}], elementi_da_verificare:[], avvertenze:[]}. Rispondi SOLO con JSON valido.',
          messages:[{role:'user',content:`Lavoro: ${gara.nome}\n${gara.desc?'Desc: '+gara.desc+'\n':''}\n${offerteText}\n\nAnalizza tenendo conto di: varianti in offerta, elementi esclusi, costi aggiuntivi, IVA, sconti, condizioni particolari.`}]
        })
      });
      const data=await resp.json();
      const text=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
      let parsed;try{parsed=JSON.parse(text);}catch(e){const m=text.match(/\{[\s\S]*\}/);if(m)parsed=JSON.parse(m[0]);}
      setAnalysis(parsed||{sintesi:text,analisi_per_offerta:[],elementi_da_verificare:[],avvertenze:[]});
    }catch(e){setAnalysis({sintesi:'Errore: '+e.message,analisi_per_offerta:[],elementi_da_verificare:[],avvertenze:[]});}
    setAnalysisLoading(false);
  };

  // ── Analisi situazione cantiere ──
  const analyzeSituazione=async(gara,contestoExtra)=>{
    setSituazione(null);setSituazioneLoading(true);
    const r=ranked(gara.offerte);
    const offerteText=r.map((o,i)=>`${i+1}. ${o.ditta}: CHF ${fmt(getImporto(o))} lordo${o.note?', '+o.note:''}`).join('\n');
    try{
      const rKey=(() => { try { return localStorage.getItem("es_anthropic_key")||""; } catch(e) { return ""; } })();
      const resp=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json','x-api-key':rKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',max_tokens:2500,
          system:'Sei un esperto direttore lavori svizzero. Genera un report professionale sulla situazione del cantiere/appalto. Rispondi SOLO con JSON con questi campi: titolo, situazione_generale (paragrafo), punti_critici (array di {titolo, descrizione, priorita: alta|media|bassa}), varianti_offerta (array stringhe), raccomandazioni_operative (array), rischi (array), prossimi_passi (array). SOLO JSON valido.',
          messages:[{role:'user',content:`Lavoro: ${gara.nome}\n${gara.desc?'Descrizione: '+gara.desc+'\n':''}\n${contestoExtra?'Informazioni aggiuntive:\n'+contestoExtra+'\n':''}\nOfferte ricevute:\n${offerteText}\n\nGenera un report dettagliato sulla situazione, con particolare attenzione a varianti in offerta, rischi, e raccomandazioni operative.`}]
        })
      });
      const data=await resp.json();
      const text=(data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
      let parsed;try{parsed=JSON.parse(text);}catch(e){const m=text.match(/\{[\s\S]*\}/);if(m)parsed=JSON.parse(m[0]);}
      const result=parsed||{titolo:"Report situazione",situazione_generale:text,punti_critici:[],varianti_offerta:[],raccomandazioni_operative:[],rischi:[],prossimi_passi:[]};
      setSituazione(result);
      setEditText(JSON.stringify(result,null,2));
    }catch(e){setSituazione({titolo:"Errore",situazione_generale:'Errore: '+e.message,punti_critici:[],varianti_offerta:[],raccomandazioni_operative:[],rischi:[],prossimi_passi:[]});}
    setSituazioneLoading(false);
  };

  // ── Export PDF ──
  const exportPDF=(gara,anal,sit)=>{
    const r=ranked(gara.offerte);
    const mn=getImporto(r[0])||0;
    const priC=["#059669","#2563eb","#d97706","#94a3b8"];
    const style=document.createElement("style");
    style.id="rank-print";
    style.innerHTML=`@media print{body>*{display:none!important}#rank-print-area{display:block!important}@page{size:A4;margin:12mm}}#rank-print-area{display:none;font-family:Arial,sans-serif;font-size:11px;color:#0f172a}`;
    document.head.appendChild(style);
    const area=document.createElement("div");
    area.id="rank-print-area";
    area.innerHTML=`
<div style="padding:16px">
  <div style="display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:10px;margin-bottom:16px">
    <div><div style="font-size:18px;font-weight:800">${gara.nome}</div><div style="font-size:11px;color:#64748b">${gara.desc||""}</div></div>
    <div style="text-align:right;font-size:10px;color:#64748b">Edilslab · ${new Date().toLocaleDateString("it-CH")}</div>
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
    <tbody>${r.map((o,i)=>{const lordo=getImporto(o);return`<tr style="background:${i===0?"#dcfce7":"#fff"}">
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center;font-weight:700;color:${priC[i]||"#94a3b8"}">${i+1}</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;font-weight:${i===0?700:400}">${o.ditta}</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right">${fmt(o.importoNetto||o.importo||0)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center">${o.sconto||0}%</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:center">${o.iva||"—"}%</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right;font-weight:700">${fmt(lordo)}</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;text-align:right;color:${i===0?"#059669":"#dc2626"}">${i===0?"—":"+"+diff(lordo,mn)+"%"}</td>
      <td style="padding:5px 8px;border:1px solid #e2e7ef;color:#64748b;font-size:9px">${o.note||"—"}</td>
    </tr>`;}).join("")}</tbody>
  </table>
  ${anal?`<div style="margin-bottom:14px;padding:10px;background:#f5f3ff;border-left:3px solid #7c3aed">
    <div style="font-weight:700;margin-bottom:4px">Analisi AI — Sintesi</div>
    <div>${anal.sintesi||""}</div>
    ${anal.raccomandazione?`<div style="margin-top:6px;color:#059669;font-weight:700">Offerta consigliata: ${anal.raccomandazione.ditta} — ${anal.raccomandazione.motivo}</div>`:""}
  </div>`:""}
  ${sit?`<div style="margin-bottom:14px">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">Situazione cantiere</div>
    <div style="margin-bottom:8px">${sit.situazione_generale||""}</div>
    ${sit.punti_critici&&sit.punti_critici.length?`<div style="font-weight:700;margin-bottom:4px">Punti critici</div>${sit.punti_critici.map(p=>`<div style="margin-bottom:4px;padding:4px 8px;background:#fef3c7;border-left:3px solid #d97706"><strong>${p.titolo}</strong> [${p.priorita}]: ${p.descrizione}</div>`).join("")}`:""}
    ${sit.varianti_offerta&&sit.varianti_offerta.length?`<div style="font-weight:700;margin:8px 0 4px">Varianti in offerta</div>${sit.varianti_offerta.map(v=>`<div>• ${v}</div>`).join("")}`:""}
    ${sit.raccomandazioni_operative&&sit.raccomandazioni_operative.length?`<div style="font-weight:700;margin:8px 0 4px">Raccomandazioni</div>${sit.raccomandazioni_operative.map(r=>`<div>• ${r}</div>`).join("")}`:""}
  </div>`:""}
  <div style="font-size:9px;color:#94a3b8;border-top:1px solid #e2e7ef;padding-top:8px;margin-top:8px">Generato da Edilslab · ${new Date().toLocaleDateString("it-CH")} · Documento indicativo</div>
</div>`;
    document.body.appendChild(area);
    window.print();
    setTimeout(()=>{document.body.removeChild(area);document.head.removeChild(style);},1000);
  };

  // ── VIEWS ──
  if(view==="list") return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:18,fontWeight:800,color:T.text}}>Confronto offerte</div><div style={{fontSize:13,color:T.textSub}}>Graduatoria automatica con IVA e sconti</div></div>
        <button onClick={()=>{setView("new");setAnalysis(null);setSituazione(null);}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}><Icon d={PATHS.plus} size={15}/> Nuova</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
        {gare.map(g=>{const r=ranked(g.offerte);const best=r[0];return(
          <div key={g.id} style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:20,boxShadow:T.shadow}}>
            <div onClick={()=>{setSel(g);setView("detail");setAnalysis(null);setSituazione(null);}} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div><div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:3}}>{g.nome}</div>{g.desc&&<div style={{fontSize:12,color:T.textSub}}>{g.desc}</div>}</div>
                <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:g.stato==="chiusa"?"#c4ccd8":"#eff6ff",color:g.stato==="chiusa"?T.textSub:T.blue,flexShrink:0,marginLeft:8}}>{g.stato==="chiusa"?"Chiusa":"Aperta"}</span>
              </div>
              <div style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",background:"#c8d8c8",borderRadius:10,marginBottom:10}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>1</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{best?best.ditta:"---"}</div>
                  <div style={{fontSize:13,color:T.green,fontWeight:800}}>CHF {best?fmt(getImporto(best)):"---"} lordo</div>
                </div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:T.textMuted}}>
              <span>{g.offerte.length} offerte · {g.data}</span>
              <button onClick={e=>{e.stopPropagation();setSel(g);setView("detail");analyzeOfferte(g);}} style={{padding:"4px 12px",background:T.purple+"15",color:T.purple,border:"1px solid "+T.purple+"30",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>✦ Analizza</button>
            </div>
          </div>
        );})}
      </div>
    </div>
  );

  if(view==="detail"&&sel){
    const r=ranked(sel.offerte);
    const mn=getImporto(r[0])||0;
    return(
      <div style={{maxWidth:760}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Indietro</button>
          <span style={{color:"#b0b8c4"}}>|</span>
          <span style={{fontSize:15,fontWeight:800,color:T.text,flex:1}}>{sel.nome}</span>
          <button onClick={()=>setEditOfferta(null)} style={{display:editOfferta?"flex":"none",alignItems:"center",gap:6,padding:"7px 14px",background:"#eff6ff",color:T.blue,border:"1px solid #bfdbfe",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Fine modifica</button>
          <button onClick={()=>salva("graduatoria","Graduatoria: "+sel.nome+"\n\n"+ranked(sel.offerte).map((o,i)=>`${i+1}. ${o.ditta} — IVA incl. CHF ${fmt(getImporto(o))}`).join("\n"))} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#f0fdf4",color:T.green,border:"1px solid #bbf7d0",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>💾 Progetto</button>
          <button onClick={()=>exportPDF(sel,analysis,situazione)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#fef2f2",color:T.red,border:"1px solid #fecaca",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>⬇ PDF</button>
        </div>

        {/* Graduatoria */}
        <div style={pc}>
          <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:16}}>Graduatoria</div>
          {r.map((o,i)=>{
            const lordo=getImporto(o);
            const netto=parseFloat(o.importoNetto||o.importo||0);
            const isEditing=editOfferta===o.id;
            const updSel=(field,val)=>{
              const updList=sel.offerte.map(x=>{
                if(x.id!==o.id)return x;
                const u={...x,[field]:val};
                u.importoLordo=calcLordo(
                  field==="importoNetto"?val:u.importoNetto,
                  field==="iva"?val:u.iva,
                  field==="sconto"?val:u.sconto,
                  field==="ribasso"?val:u.ribasso
                ).toFixed(2);
                return u;
              });
              setSel(s=>({...s,offerte:updList}));
              setGare(gs=>gs.map(g=>g.id===sel.id?{...g,offerte:updList}:g));
            };
            return(
              <div key={o.id} style={{padding:"13px 0",borderBottom:i<r.length-1?"1px solid #c4ccd8":"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:(posC[i]||T.textMuted)+"15",border:"2px solid "+(posC[i]||T.textMuted),display:"flex",alignItems:"center",justifyContent:"center",color:posC[i]||T.textMuted,fontWeight:800,fontSize:14,flexShrink:0,marginTop:2}}>{i+1}</div>
                  <div style={{flex:1}}>
                    {isEditing
                      ?<div style={{display:"flex",gap:8,marginBottom:8}}>
                        <input style={{...inp,fontWeight:700,fontSize:14,flex:1}} value={o.ditta} onChange={e=>updSel("ditta",e.target.value)} onKeyDown={e=>e.stopPropagation()} placeholder="Nome ditta"/>
                        <button onClick={()=>{const updList=sel.offerte.filter(x=>x.id!==o.id);setSel(s=>({...s,offerte:updList}));setGare(gs=>gs.map(g=>g.id===sel.id?{...g,offerte:updList}:g));setEditOfferta(null);}} style={{padding:"6px 10px",background:"#fef2f2",color:T.red,border:"1px solid #fecaca",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>✕ Elimina</button>
                      </div>
                      :<div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>{o.ditta}</div>
                    }
                    {isEditing?(
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:6}}>
                        {[["IVA escl.","importoNetto","number"],["Sconto%","sconto","number"],["Ribasso%","ribasso","number"],["IVA%","iva","number"]].map(([lbl,field,tp])=>(
                          <div key={field}>
                            <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>{lbl}</div>
                            <input style={{...inp,padding:"6px 8px",fontSize:12,textAlign:"right"}} type={tp} step="0.01" value={o[field]||""} onChange={e=>updSel(field,e.target.value)} onKeyDown={e=>e.stopPropagation()}/>
                          </div>
                        ))}
                      </div>
                    ):(
                      <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:12}}>
                        <span style={{color:T.textSub}}>IVA escl.: <strong style={{color:T.text}}>CHF {fmt(netto)}</strong></span>
                        {parseFloat(o.sconto||0)>0&&<span style={{color:T.green}}>Sconto: <strong>{o.sconto}%</strong></span>}
                        {parseFloat(o.ribasso||0)>0&&<span style={{color:"#0891b2"}}>Ribasso: <strong>{o.ribasso}%</strong></span>}
                        {o.iva&&<span style={{color:T.textSub}}>IVA: {o.iva}%</span>}
                      </div>
                    )}
                    {isEditing
                      ?<input style={{...inp,padding:"6px 8px",fontSize:11,marginTop:4}} value={o.note||""} onChange={e=>updSel("note",e.target.value)} onKeyDown={e=>e.stopPropagation()} placeholder="Note..."/>
                      :o.note&&<div style={{fontSize:11,color:T.textSub,marginTop:3,fontStyle:"italic"}}>{o.note}</div>
                    }
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:17,fontWeight:800,color:posC[i]||T.textMuted}}>CHF {fmt(lordo)}</div>
                    <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>IVA incl.</div>
                    {i===0?<div style={{fontSize:11,color:T.green,fontWeight:700}}>Offerta piu bassa</div>:<div style={{fontSize:11,color:T.red}}>+{diff(lordo,mn)}%</div>}
                    <button onClick={()=>setEditOfferta(isEditing?null:o.id)} style={{marginTop:4,padding:"3px 10px",background:isEditing?T.green:"#d6dce6",color:isEditing?"#fff":T.textSub,border:"none",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer"}}>{isEditing?"✓ Ok":"✎ Modifica"}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabella dettagliata */}
        <div style={pc}>
          <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>Tabella dettagliata</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#d6dce6"}}>
                {["#","Ditta","IVA escl. CHF","Sconto%","Ribasso%","IVA%","IVA incl. CHF","Scarto","Note"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:["Netto CHF","Lordo CHF","Scarto"].includes(h)?"right":"left",color:T.textSub,fontWeight:700,borderBottom:"1px solid "+T.border,fontSize:11,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{r.map((o,i)=>{
                const lordo=getImporto(o);
                const netto=parseFloat(o.importoNetto||o.importo||0);
                return(
                  <tr key={o.id} style={{background:i===0?"#dcfce7":"transparent"}}>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8"}}><span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:posC[i]||T.textMuted,color:"#fff",fontSize:10,fontWeight:800}}>{i+1}</span></td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",fontWeight:i===0?700:400,color:T.text}}>{o.ditta}</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"right",color:T.textSub}}>{fmt(netto)}</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"center",color:parseFloat(o.sconto||0)>0?T.green:T.textMuted,fontWeight:parseFloat(o.sconto||0)>0?700:400}}>{o.sconto||0}%</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"center",color:parseFloat(o.ribasso||0)>0?"#0891b2":T.textMuted,fontWeight:parseFloat(o.ribasso||0)>0?700:400}}>{o.ribasso||0}%</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"center",color:T.textSub}}>{o.iva||"—"}%</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"right",fontWeight:800,color:posC[i]||T.textMuted}}>{fmt(lordo)}</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",textAlign:"right",color:i===0?T.green:T.red,fontWeight:700}}>{i===0?"—":"+"+diff(lordo,mn)+"%"}</td>
                    <td style={{padding:"8px 10px",borderBottom:"1px solid #c4ccd8",color:T.textSub,fontSize:10,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.note||"—"}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
          <div style={{marginTop:12,padding:"9px 14px",background:"#d6dce6",borderRadius:10,fontSize:12,color:T.textSub,border:"1px solid "+T.border,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span>Risparmio massimo lordo: <strong style={{color:T.green}}>CHF {fmt(getImporto(r[r.length-1])-mn)}</strong></span>
            <span style={{color:T.textMuted}}>rispetto all offerta piu alta</span>
          </div>
        </div>

        {/* Analisi AI offerte */}
        <div style={{...pc,border:"1.5px solid "+T.purple+"40"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,background:T.gradPurple,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={PATHS.spark} size={15} stroke="#fff"/></div>
              <div><div style={{fontSize:14,fontWeight:800,color:T.text}}>Analisi AI offerte</div><div style={{fontSize:11,color:T.textSub}}>Elementi esclusi, costi nascosti, varianti, raccomandazione</div></div>
            </div>
            {!analysisLoading&&<button onClick={()=>analyzeOfferte(sel)} style={{padding:"7px 14px",background:T.gradPurple,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>{analysis?"↻ Rianalizza":"✦ Analizza"}</button>}
          </div>
          {analysisLoading&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:T.purple,fontWeight:600}}><div style={{width:16,height:16,border:"2px solid "+T.purple,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Analisi in corso...</div>}
          {analysis&&!analysisLoading&&(
            <div>
              <div style={{padding:"10px 14px",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:10,marginBottom:12,fontSize:13,color:"#4c1d95",lineHeight:1.6}}>{analysis.sintesi}</div>
              {analysis.raccomandazione&&<div style={{padding:"10px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,marginBottom:12,display:"flex",gap:8}}><span style={{fontSize:16}}>🏆</span><div><div style={{fontSize:13,fontWeight:700,color:T.green}}>Offerta consigliata: {analysis.raccomandazione.ditta}</div><div style={{fontSize:12,color:"#166534"}}>{analysis.raccomandazione.motivo}</div></div></div>}
              {analysis.analisi_per_offerta&&analysis.analisi_per_offerta.map((a,i)=>{
                const vC=a.valutazione==="positiva"?T.green:a.valutazione==="negativa"?T.red:T.amber;
                return(<div key={i} style={{background:"#d6dce6",border:"1px solid "+T.border,borderRadius:10,padding:12,marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:(posC[i]||T.textMuted)+"20",border:"2px solid "+(posC[i]||T.textMuted),display:"flex",alignItems:"center",justifyContent:"center",color:posC[i]||T.textMuted,fontWeight:800,fontSize:10}}>{i+1}</div>
                    <span style={{fontWeight:700,fontSize:13,flex:1}}>{a.ditta}</span>
                    <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:vC+"15",color:vC,border:"1px solid "+vC+"40"}}>{a.valutazione}</span>
                  </div>
                  {a.commento&&<div style={{fontSize:12,color:T.textSub,marginBottom:6,fontStyle:"italic"}}>{a.commento}</div>}
                  {a.punti_attenzione&&a.punti_attenzione.length>0&&<div style={{marginBottom:6}}><div style={{fontSize:10,fontWeight:700,color:T.amber,marginBottom:3}}>⚠ Attenzione</div>{a.punti_attenzione.map((p,pi)=><div key={pi} style={{fontSize:11,padding:"2px 0 2px 10px",borderLeft:"2px solid "+T.amber+"60",marginBottom:2}}>{p}</div>)}</div>}
                  {a.costi_nascosti&&a.costi_nascosti.length>0&&<div><div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:3}}>💶 Costi extra potenziali</div>{a.costi_nascosti.map((c,ci)=><div key={ci} style={{fontSize:11,padding:"2px 0 2px 10px",borderLeft:"2px solid "+T.red+"60",marginBottom:2}}>{c}</div>)}</div>}
                </div>);
              })}
              {analysis.elementi_da_verificare&&analysis.elementi_da_verificare.length>0&&<div style={{padding:"10px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:6}}>❓ Domande da fare agli offerenti</div>{analysis.elementi_da_verificare.map((d,i)=><div key={i} style={{fontSize:12,color:"#1e40af",padding:"2px 0",display:"flex",gap:6}}><span>{i+1}.</span>{d}</div>)}</div>}
              {analysis.avvertenze&&analysis.avvertenze.length>0&&<div style={{padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10}}><div style={{fontSize:11,fontWeight:700,color:T.red,marginBottom:5}}>⚠ Avvertenze</div>{analysis.avvertenze.map((a,i)=><div key={i} style={{fontSize:12,color:"#991b1b",padding:"2px 0"}}>{a}</div>)}</div>}
            </div>
          )}
          {!analysis&&!analysisLoading&&<div style={{textAlign:"center",padding:"16px 0",color:T.textMuted,fontSize:13}}>Clicca <strong style={{color:T.purple}}>✦ Analizza</strong> per l analisi dettagliata</div>}
        </div>

        {/* Situazione cantiere */}
        <div style={{...pc,border:"1.5px solid #0891b2"+"40"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,background:"linear-gradient(135deg,#0e7490,#0891b2)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon d={PATHS.info} size={15} stroke="#fff"/></div>
              <div><div style={{fontSize:14,fontWeight:800,color:T.text}}>Situazione cantiere</div><div style={{fontSize:11,color:T.textSub}}>Report AI: varianti, rischi, raccomandazioni operative</div></div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {situazione&&!situazioneLoading&&(<>
                <button onClick={()=>{setEditMode(v=>!v);setEditText(JSON.stringify(situazione,null,2));}} style={{padding:"6px 12px",background:editMode?"#d6dce6":"#eff6ff",color:editMode?T.textSub:T.blue,border:"1px solid "+(editMode?T.border:"#bfdbfe"),borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>{editMode?"Annulla":"✎ Modifica"}</button>
                {editMode&&<button onClick={()=>{try{setSituazione(JSON.parse(editText));setEditMode(false);}catch(e){alert("JSON non valido");}}} style={{padding:"6px 12px",background:T.green,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>✓ Salva</button>}
              </>)}
              {!situazioneLoading&&<button onClick={()=>analyzeSituazione(sel,sel.contesto||"")} style={{padding:"6px 12px",background:"linear-gradient(135deg,#0e7490,#0891b2)",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer"}}>{situazione?"↻ Rigenera":"✦ Genera"}</button>}
            </div>
          </div>

          {/* Campo contesto libero */}
          <div style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:5}}>Informazioni aggiuntive sul cantiere (opzionale)</label>
            <textarea
              style={{...inp,minHeight:72,resize:"vertical",fontSize:13,lineHeight:1.6}}
              placeholder="Es: il cantiere è in zona montana, accesso difficile, ci sono vincoli storici, il committente vuole completare entro marzo, la variante A proposta dalla ditta X riguarda..."
              value={sel.contesto||""}
              onChange={e=>setSel(s=>({...s,contesto:e.target.value}))}
            />
          </div>

          {situazioneLoading&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:"#0891b2",fontWeight:600}}><div style={{width:16,height:16,border:"2px solid #0891b2",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generazione report situazione...</div>}

          {situazione&&!situazioneLoading&&!editMode&&(
            <div>
              <div style={{padding:"10px 14px",background:"#ecfeff",border:"1px solid #a5f3fc",borderRadius:10,marginBottom:12,fontSize:13,color:"#164e63",lineHeight:1.7}}>{situazione.situazione_generale}</div>
              {situazione.punti_critici&&situazione.punti_critici.length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>Punti critici</div>
                  {situazione.punti_critici.map((p,i)=>{
                    const pC=p.priorita==="alta"?T.red:p.priorita==="media"?T.amber:T.green;
                    return(<div key={i} style={{padding:"9px 12px",background:"#d6dce6",border:"1px solid "+pC+"30",borderLeft:"3px solid "+pC,borderRadius:"0 8px 8px 0",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:700,color:T.text}}>{p.titolo}</span>
                        <span style={{padding:"1px 8px",background:pC+"15",color:pC,border:"1px solid "+pC+"30",borderRadius:20,fontSize:10,fontWeight:700}}>{p.priorita}</span>
                      </div>
                      <div style={{fontSize:12,color:T.textSub}}>{p.descrizione}</div>
                    </div>);
                  })}
                </div>
              )}
              {situazione.varianti_offerta&&situazione.varianti_offerta.length>0&&(
                <div style={{marginBottom:12,padding:"10px 14px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:6}}>📋 Varianti in offerta</div>
                  {situazione.varianti_offerta.map((v,i)=><div key={i} style={{fontSize:12,color:"#92400e",padding:"2px 0",display:"flex",gap:6}}><span>•</span>{v}</div>)}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
                {situazione.raccomandazioni_operative&&situazione.raccomandazioni_operative.length>0&&(
                  <div style={{padding:"10px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.green,marginBottom:6}}>✓ Raccomandazioni</div>
                    {situazione.raccomandazioni_operative.map((r,i)=><div key={i} style={{fontSize:12,color:"#166534",padding:"2px 0"}}>• {r}</div>)}
                  </div>
                )}
                {situazione.prossimi_passi&&situazione.prossimi_passi.length>0&&(
                  <div style={{padding:"10px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:6}}>→ Prossimi passi</div>
                    {situazione.prossimi_passi.map((p,i)=><div key={i} style={{fontSize:12,color:"#1e40af",padding:"2px 0"}}>{i+1}. {p}</div>)}
                  </div>
                )}
              </div>
              {situazione.rischi&&situazione.rischi.length>0&&(
                <div style={{marginTop:10,padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.red,marginBottom:5}}>⚠ Rischi identificati</div>
                  {situazione.rischi.map((r,i)=><div key={i} style={{fontSize:12,color:"#991b1b",padding:"2px 0"}}>• {r}</div>)}
                </div>
              )}
            </div>
          )}

          {editMode&&(
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Modifica il JSON del report — usa la struttura esistente</div>
              <textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{...inp,minHeight:300,resize:"vertical",fontFamily:"monospace",fontSize:12,lineHeight:1.5}}/>
            </div>
          )}

          {!situazione&&!situazioneLoading&&<div style={{textAlign:"center",padding:"16px 0",color:T.textMuted,fontSize:13}}>Aggiungi informazioni sul cantiere e clicca <strong style={{color:"#0891b2"}}>✦ Genera</strong> per il report situazione</div>}
        </div>
      {rankingModalJSX}
      </div>
    );
  }

  if(view==="new") return(
    <div style={{maxWidth:640}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={()=>{setView("list");setPdfResults([]);setPdfError("");}} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Annulla</button>
        <span style={{color:"#b0b8c4"}}>|</span>
        <span style={{fontSize:15,fontWeight:800,color:T.text}}>Nuova gara</span>
      </div>

      <div style={pc}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Dati gara</div>
        <div style={{marginBottom:12}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Nome lavoro *</label><input style={inp} placeholder="es. Opere murarie Cantiere B" value={ng.nome} onChange={e=>setNg(g=>({...g,nome:e.target.value}))}/></div>
        <div><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Descrizione</label><input style={inp} placeholder="opzionale" value={ng.desc} onChange={e=>setNg(g=>({...g,desc:e.target.value}))}/></div>
      </div>

      <div style={pc}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:T.text}}>Offerte</div>
            <div style={{fontSize:11,color:T.textSub,marginTop:2}}>Carica PDF o aggiungi manualmente — le offerte si sommano</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>!pdfLoading&&pdfRef.current.click()} disabled={pdfLoading} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",background:T.gradPurple,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:pdfLoading?"default":"pointer",opacity:pdfLoading?0.7:1}}>
              {pdfLoading?<><div style={{width:12,height:12,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Lettura...</>:<><Icon d={PATHS.upload} size={13}/>Carica PDF</>}
            </button>
            <button onClick={()=>setNg(g=>({...g,offerte:[...g.offerte,emptyO(Date.now())]}))} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",background:"#eff6ff",color:T.blue,border:"1px solid #bfdbfe",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}><Icon d={PATHS.plus} size={13}/>Manuale</button>
          </div>
        </div>
        <input ref={pdfRef} type="file" accept=".pdf" multiple style={{display:"none"}} onChange={e=>{[...e.target.files].forEach(f=>handlePdf(f));e.target.value="";}}/>
        {pdfError&&<div style={{padding:"9px 12px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,fontSize:12,color:T.red,marginBottom:10}}>{pdfError}</div>}
        {pdfResults.length>0&&<div style={{padding:"8px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,fontSize:12,color:T.green,fontWeight:600,marginBottom:12}}>✓ {pdfResults.length} offerte estratte — puoi aggiungerne altre</div>}

        {/* Intestazione colonne */}
        {ng.offerte.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"24px 2fr 1fr 72px 72px 80px 1fr 32px",gap:6,marginBottom:4,padding:"0 4px"}}>
            {["","Ditta","IVA escl. CHF","Sconto%","Ribasso%","IVA%","IVA incl. CHF","Note",""].map((h,i)=>(
              <div key={i} style={{fontSize:10,fontWeight:700,color:T.textMuted}}>{h}</div>
            ))}
          </div>
        )}

        {ng.offerte.map((o,i)=>(
          <div key={o.id} style={{display:"grid",gridTemplateColumns:"24px 2fr 1fr 72px 72px 80px 1fr 32px",gap:6,marginBottom:8,alignItems:"center"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"#d6dce6",display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,fontSize:11,fontWeight:700}}>{i+1}</div>
            <input style={{...inp,padding:"8px 10px",fontSize:12}} placeholder="Nome ditta" value={o.ditta} onChange={e=>updO(o.id,"ditta",e.target.value)}/>
            <input style={{...inp,padding:"8px 10px",fontSize:12}} placeholder="es. 44000" type="number" value={o.importoNetto} onChange={e=>updO(o.id,"importoNetto",e.target.value)}/>
            <input style={{...inp,padding:"8px 10px",fontSize:12,textAlign:"center"}} placeholder="0" type="number" step="0.1" value={o.sconto} onChange={e=>updO(o.id,"sconto",e.target.value)}/>
            <input style={{...inp,padding:"8px 10px",fontSize:12,textAlign:"center"}} placeholder="0" type="number" step="0.1" value={o.ribasso} onChange={e=>updO(o.id,"ribasso",e.target.value)}/>
            <input style={{...inp,padding:"8px 10px",fontSize:12,textAlign:"center"}} placeholder="8.1" type="number" step="0.1" value={o.iva} onChange={e=>updO(o.id,"iva",e.target.value)}/>
            <div style={{padding:"8px 10px",background:"#c8d8c8",borderRadius:10,fontSize:12,fontWeight:700,color:T.green,textAlign:"right",border:"1px solid #bbf7d0"}}>{o.importoLordo?fmt(o.importoLordo):"—"}</div>
            <input style={{...inp,padding:"8px 10px",fontSize:11}} placeholder="Note..." value={o.note} onChange={e=>updO(o.id,"note",e.target.value)}/>
            {ng.offerte.length>1?<button onClick={()=>setNg(g=>({...g,offerte:g.offerte.filter(x=>x.id!==o.id)}))} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",padding:4}}><Icon d={PATHS.trash} size={14}/></button>:<div/>}
          </div>
        ))}
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>IVA incl. = IVA escl. × (1−Sconto%) × (1−Ribasso%) × (1+IVA%)</div>
      </div>

      <button onClick={()=>{
        if(!ng.nome.trim())return;
        const v=ng.offerte.filter(o=>o.ditta&&(o.importoNetto||o.importo));
        if(!v.length)return;
        setGare(gs=>[...gs,{...ng,id:Date.now(),data:new Date().toLocaleDateString("it-CH"),stato:"aperta",offerte:v}]);
        setNg({nome:"",desc:"",contesto:"",offerte:[emptyO(1),emptyO(2),emptyO(3)]});
        setPdfResults([]);setPdfError("");setView("list");
      }} style={{...btnP,marginTop:0}}>Genera graduatoria</button>
    </div>
  );
  return null;
}

// ─── PERIZIA AMIANTO ─────────────────────────────────────────────────────────
const TIPO_ISPEZIONE_OPTIONS = [
  { val:"prima_lavori_demolizione", label:"Prima dei lavori di demolizione" },
  { val:"prima_lavori_ristrutturazione", label:"Prima dei lavori di ristrutturazione" },
  { val:"normale", label:"Utilizzazione normale dello stabile" },
  { val:"altro", label:"Altro" },
];
const TIPO_ISPEZIONE_LABEL = {
  prima_lavori_demolizione:"Prima dei lavori di demolizione",
  prima_lavori_ristrutturazione:"Prima dei lavori di ristrutturazione",
  normale:"Utilizzazione normale dello stabile",
  altro:"Altro",
};
const EMPTY_ROW_AM = { id:0,piano:"",locale:"",nElem:"",descrizione:"",quantita:"",tipo:"FA",prelievo:"SI",nAnalogia:"",presenza:"NO",valutazione:"L",schedaId:"",urgenza:"",note:"" };
const EMPTY_ROW_NOC = { id:0,piano:"",locale:"",nElem:"",descrizione:"",quantita:"",prelievo:"SI",nAnalogia:"",sostanza:"",concentrazione:"",valutazione:"L",schedaId:"",urgenza:"",note:"" };
let _amRid=1; const amNewId=()=>++_amRid;

function buildAmiantoReport(f,rowsAm,rowsNoc){
  const today=new Date().toLocaleDateString("it-CH");
  const sep="\n"+"─".repeat(72)+"\n";
  const fmtAm=rows=>{
    if(!rows.length)return"  Nessun materiale inserito.";
    return rows.map((r,i)=>`  [${i+1}] Piano: ${r.piano||"-"} | Locale: ${r.locale||"-"} | N°: ${r.nElem||"-"}\n       Materiale: ${r.descrizione||"-"} | Quantità: ${r.quantita||"-"} | Tipo: ${r.tipo}\n       Prelievo: ${r.prelievo} | Amianto: ${r.presenza} | Valut.: ${r.valutazione}${r.schedaId?" | Scheda: "+r.schedaId:""}${r.urgenza?" | Urgenza: "+r.urgenza:""}${r.note?"\n       Note: "+r.note:""}`).join("\n\n");
  };
  const fmtNoc=rows=>{
    if(!rows.length)return"  Nessun materiale inserito.";
    return rows.map((r,i)=>`  [${i+1}] Piano: ${r.piano||"-"} | Locale: ${r.locale||"-"} | N°: ${r.nElem||"-"}\n       Materiale: ${r.descrizione||"-"} | Quantità: ${r.quantita||"-"}\n       Prelievo: ${r.prelievo} | Sostanza: ${r.sostanza||"-"} | Conc.: ${r.concentrazione||"-"} mg/kg | Valut.: ${r.valutazione}${r.schedaId?" | Scheda: "+r.schedaId:""}${r.urgenza?" | Urgenza: "+r.urgenza:""}${r.note?"\n       Note: "+r.note:""}`).join("\n\n");
  };
  const mca=rowsAm.filter(r=>r.presenza==="SI"||r.presenza==="SI*");
  const mn=rowsNoc.filter(r=>r.sostanza&&r.sostanza!=="NO"&&r.sostanza!=="");
  const tipoLabel=TIPO_ISPEZIONE_LABEL[f.tipoIspezione]||f.tipoIspezione||"Prima dei lavori di ristrutturazione";
  return `RAPPORTO DI ISPEZIONE SOSTANZE NOCIVE\n${"═".repeat(72)}\n\n${f.indirizzo||"[Indirizzo da completare]"} | Mappale ${f.mappale||"XXX"} RFD\n\nOGGETTO         ${f.oggetto||"Casa d'abitazione"} – Edificato ${f.annoCost&&parseInt(f.annoCost)<1991?"prima del 1991":"anno "+f.annoCost}\nCOMMITTENTE     ${f.committente||"---"} | ${f.indirizzoCommittente||"---"}\nRAPPORTO        ${f.nRapporto||"XXX-XXX-XX"} | ${tipoLabel}${f.ispezioneP?" | Ispezione parziale":""}\nESPERTO         ${f.esperto||"---"} | IPRAC Consulenze | Via Muraccio 6, CH-6612 Ascona | info@iprac.ch | +41 91 780 5152\nDATA E VERSIONE ${f.dataRapporto||today}, versione ${f.versione||"1.0"}${sep}02. MANDATO\n\nIl committente ha incaricato lo studio IPRAC Consulenze di effettuare un ispezione per verificare la possibilita di trovare materiali contenenti amianto ed altre sostanze nocive ${tipoLabel.toLowerCase()} sul mappale ${f.mappale||"XXX"} RFD situato nel comune di ${f.comune||"XXX"} in ${f.indirizzo||"via XXX"}.\n\nTipo di ispezione: ${tipoLabel}\n\nElenco dei lavori previsti:\n${f.lavori?f.lavori.split("\n").map(l=>"- "+l).join("\n"):"- [Da completare]"}${sep}07. RAPPORTO D'ISPEZIONE\n\nTipo d ispezione         : ${tipoLabel}\nDocumentazione           : ${f.documentazione||"Sono stati forniti i piani dell immobile."}\nVisita preliminare       : ${f.visitaP||"Nessuna."}\nIspezione sostanze nocive: L ispezione e stata eseguita in data ${f.dataIspezione||"XXX"}\nLimiti dell ispezione    : ${f.limiti||"L ispezione ha interessato tutti i locali dell immobile."}\nRiserve                  : ${f.riserve||"Nessuna."}\n\nAnalisi di laboratorio   : Le analisi di laboratorio sui campioni prelevati sono state eseguite dal laboratorio ${f.laboratorio||"ANALYSIS Lab SA/AG"}, classificato dal FACH come laboratorio di classe 1.\n\nPrelievo/analisi MSCA    : ${mca.length>0?`Le analisi di laboratorio hanno riscontrato la presenza di ${mca.length} materiale/i contenente/i amianto (MCA).`:"Le analisi di laboratorio NON hanno riscontrato la presenza di materiali contenenti amianto."}\n\n${mn.length>0?"Prelievo/analisi MSCSN   : Le analisi di laboratorio hanno riscontrato la presenza di materiali contenenti sostanze nocive.":"Prelievo/analisi MSCSN   : Nessun materiale contenente sostanze nocive rilevato."}${sep}08. TABELLA MATERIALI SUSCETTIBILI DI CONTENERE AMIANTO\n\n${fmtAm(rowsAm)}\n\nLegenda: FA=Fortemente agglomerato | DA=Debolmente agglomerato | F=Floccato\n         L=Laboratorio | E=Esperto | D=Per difetto | SI*=Suscettibile per difetto${sep}08b. TABELLA MATERIALI SUSCETTIBILI DI CONTENERE ALTRE SOSTANZE NOCIVE\n\n${fmtNoc(rowsNoc)}\n\nLQ = Limite di quantificazione. LQ PCB: 1.3 ppm – LQ CP: 1%${sep}10. CONCLUSIONI\n\nAmianto:\n${mca.length>0?`Nell immobile sono stati rilevati ${mca.length} materiale/i contenente/i amianto (MCA).\n${mca.map((r,i)=>`  [${i+1}] ${r.descrizione||"-"} – Piano ${r.piano||"-"}, Locale ${r.locale||"-"}${r.urgenza?" – Urgenza "+r.urgenza:""}`).join("\n")}`:"L ispezione NON ha riscontrato materiali contenenti amianto."}\n\n${f.conclAmianto||""}\n\nAltre sostanze nocive (PCB, Pb, IPA, CFC/HFC):\n${mn.length>0?mn.map((r,i)=>`  [${i+1}] ${r.sostanza} – ${r.descrizione||"-"} – Piano ${r.piano||"-"}, Locale ${r.locale||"-"} – Conc.: ${r.concentrazione||"-"} mg/kg`).join("\n"):"L ispezione NON ha riscontrato materiali contenenti le sostanze nocive analizzate."}\n\n${f.conclNocive||""}\n\nGestione dei rifiuti:\n${f.rifiuti||"I materiali contenenti sostanze nocive dovranno essere smaltiti conformemente alle normative vigenti (OPSR – Modulo Rifiuti edili)."}\n\nRiserve:\n${f.riserveConc||"Nessuna riserva particolare. Prima di iniziare lavori su materiali non analizzati e necessario procedere a campionamento e analisi presso laboratorio accreditato."}\n\nObbligo di aggiornamento:\nIl presente rapporto dovra essere aggiornato al termine dei lavori di bonifica, conformemente a quanto previsto dalla normativa applicabile.${sep}Firma esperto: _________________________   Data: ${f.dataRapporto||today}\n\n${f.esperto||"---"}\nIPRAC Consulenze – Via Muraccio 6, CH-6612 Ascona\ninfo@iprac.ch | +41 91 780 5152\n\n---\nRapporto generato da Edilslab · ${today}\nDocumento con valore orientativo. L originale firmato dall esperto ha valore legale.`;
}

function TabellaAmianto({rows,onChange}){
  const update=(id,field,val)=>onChange(rows.map(r=>r.id===id?{...r,[field]:val}:r));
  const add=()=>onChange([...rows,{...EMPTY_ROW_AM,id:amNewId()}]);
  const del=(id)=>onChange(rows.filter(r=>r.id!==id));
  const th={fontSize:10,fontWeight:700,color:T.textSub,padding:"6px 7px",background:"#c8d0dc",border:"1px solid "+T.border,whiteSpace:"nowrap"};
  const td={padding:"4px 5px",border:"1px solid "+T.border,verticalAlign:"top"};
  const si={...inp,padding:"5px 7px",fontSize:12,minWidth:0};
  return(<div style={{overflowX:"auto",marginBottom:12}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{["Piano","Locale","N°Elem","Materiale","Quantità","Tipo","Prelievo","N°Anal.","Amianto","Valut.","Scheda","Urgenza","Note",""].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(r=>(
        <tr key={r.id}>
          <td style={td}><input style={{...si,width:60}} value={r.piano} onChange={e=>update(r.id,"piano",e.target.value)} placeholder="es. PT"/></td>
          <td style={td}><input style={{...si,width:80}} value={r.locale} onChange={e=>update(r.id,"locale",e.target.value)} placeholder="es. Cucina"/></td>
          <td style={td}><input style={{...si,width:50}} value={r.nElem} onChange={e=>update(r.id,"nElem",e.target.value)}/></td>
          <td style={td}><input style={{...si,width:120}} value={r.descrizione} onChange={e=>update(r.id,"descrizione",e.target.value)} placeholder="es. Colla piastrelle"/></td>
          <td style={td}><input style={{...si,width:70}} value={r.quantita} onChange={e=>update(r.id,"quantita",e.target.value)} placeholder="m²"/></td>
          <td style={td}><select style={{...si,width:60}} value={r.tipo} onChange={e=>update(r.id,"tipo",e.target.value)}><option value="FA">FA</option><option value="DA">DA</option><option value="F">F</option></select></td>
          <td style={td}><select style={{...si,width:60}} value={r.prelievo} onChange={e=>update(r.id,"prelievo",e.target.value)}><option value="SI">SI</option><option value="NO">NO</option></select></td>
          <td style={td}><input style={{...si,width:55}} value={r.nAnalogia} onChange={e=>update(r.id,"nAnalogia",e.target.value)}/></td>
          <td style={td}><select style={{...si,width:70}} value={r.presenza} onChange={e=>update(r.id,"presenza",e.target.value)}><option value="SI">SI</option><option value="NO">NO</option><option value="SI*">SI*</option></select></td>
          <td style={td}><select style={{...si,width:55}} value={r.valutazione} onChange={e=>update(r.id,"valutazione",e.target.value)}><option value="L">L</option><option value="E">E</option><option value="D">D</option></select></td>
          <td style={td}><input style={{...si,width:55}} value={r.schedaId} onChange={e=>update(r.id,"schedaId",e.target.value)}/></td>
          <td style={td}><select style={{...si,width:60}} value={r.urgenza} onChange={e=>update(r.id,"urgenza",e.target.value)}><option value="">-</option><option value="I">I</option><option value="II">II</option><option value="III">III</option></select></td>
          <td style={td}><input style={{...si,width:110}} value={r.note} onChange={e=>update(r.id,"note",e.target.value)}/></td>
          <td style={{...td,textAlign:"center"}}><button onClick={()=>del(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",fontSize:16,fontWeight:800,padding:"0 4px"}}>×</button></td>
        </tr>
      ))}</tbody>
    </table>
    <button onClick={add} style={{marginTop:8,padding:"6px 16px",background:"#eff6ff",color:T.blue,border:"1.5px solid #bfdbfe",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Aggiungi riga</button>
    <div style={{marginTop:6,fontSize:11,color:T.textSub}}><strong>Tipo:</strong> FA=Fortemente agglomerato · DA=Debolmente agglomerato · F=Floccato &nbsp;|&nbsp; <strong>Valut.:</strong> L=Laboratorio · E=Esperto · D=Per difetto &nbsp;|&nbsp; <strong>SI*</strong>=Suscettibile/Per difetto</div>
  </div>);
}

function TabellaNocive({rows,onChange}){
  const update=(id,field,val)=>onChange(rows.map(r=>r.id===id?{...r,[field]:val}:r));
  const add=()=>onChange([...rows,{...EMPTY_ROW_NOC,id:amNewId()}]);
  const del=(id)=>onChange(rows.filter(r=>r.id!==id));
  const th={fontSize:10,fontWeight:700,color:T.textSub,padding:"6px 7px",background:"#c8d0dc",border:"1px solid "+T.border,whiteSpace:"nowrap"};
  const td={padding:"4px 5px",border:"1px solid "+T.border,verticalAlign:"top"};
  const si={...inp,padding:"5px 7px",fontSize:12,minWidth:0};
  return(<div style={{overflowX:"auto",marginBottom:12}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{["Piano","Locale","N°Elem","Materiale","Quantità","Prelievo","N°Anal.","Sostanza","Conc. (mg/kg)","Valut.","Scheda","Urgenza","Note",""].map((h,i)=><th key={i} style={th}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(r=>(
        <tr key={r.id}>
          <td style={td}><input style={{...si,width:60}} value={r.piano} onChange={e=>update(r.id,"piano",e.target.value)} placeholder="es. PT"/></td>
          <td style={td}><input style={{...si,width:80}} value={r.locale} onChange={e=>update(r.id,"locale",e.target.value)}/></td>
          <td style={td}><input style={{...si,width:50}} value={r.nElem} onChange={e=>update(r.id,"nElem",e.target.value)}/></td>
          <td style={td}><input style={{...si,width:110}} value={r.descrizione} onChange={e=>update(r.id,"descrizione",e.target.value)}/></td>
          <td style={td}><input style={{...si,width:65}} value={r.quantita} onChange={e=>update(r.id,"quantita",e.target.value)} placeholder="m²"/></td>
          <td style={td}><select style={{...si,width:60}} value={r.prelievo} onChange={e=>update(r.id,"prelievo",e.target.value)}><option value="SI">SI</option><option value="NO">NO</option></select></td>
          <td style={td}><input style={{...si,width:55}} value={r.nAnalogia} onChange={e=>update(r.id,"nAnalogia",e.target.value)}/></td>
          <td style={td}><select style={{...si,width:80}} value={r.sostanza} onChange={e=>update(r.id,"sostanza",e.target.value)}><option value="">-</option><option value="PCB">PCB</option><option value="CP">CP</option><option value="Pb">Pb</option><option value="IPA">IPA</option><option value="CFC/HFC">CFC/HFC</option><option value="IC">IC (C10-C40)</option><option value="NO">NO</option></select></td>
          <td style={td}><input style={{...si,width:80}} value={r.concentrazione} onChange={e=>update(r.id,"concentrazione",e.target.value)} placeholder="es. 12.5"/></td>
          <td style={td}><select style={{...si,width:55}} value={r.valutazione} onChange={e=>update(r.id,"valutazione",e.target.value)}><option value="L">L</option><option value="E">E</option><option value="D">D</option></select></td>
          <td style={td}><input style={{...si,width:55}} value={r.schedaId} onChange={e=>update(r.id,"schedaId",e.target.value)}/></td>
          <td style={td}><select style={{...si,width:60}} value={r.urgenza} onChange={e=>update(r.id,"urgenza",e.target.value)}><option value="">-</option><option value="I">I</option><option value="II">II</option><option value="III">III</option></select></td>
          <td style={td}><input style={{...si,width:110}} value={r.note} onChange={e=>update(r.id,"note",e.target.value)}/></td>
          <td style={{...td,textAlign:"center"}}><button onClick={()=>del(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",fontSize:16,fontWeight:800,padding:"0 4px"}}>×</button></td>
        </tr>
      ))}</tbody>
    </table>
    <button onClick={add} style={{marginTop:8,padding:"6px 16px",background:"#fff7ed",color:T.amber,border:"1.5px solid #fed7aa",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Aggiungi riga</button>
  </div>);
}

function PeriziaAmiantoForm({user,onBack}){
  const mob=useIsMobile();
  const [amView,setAmView]=useState("form");
  const [amTab,setAmTab]=useState("general");
  const [amBusy,setAmBusy]=useState(false);
  const [amCopied,setAmCopied]=useState(false);
  const [amGen,setAmGen]=useState("");
  const [amF,setAmF]=useState({
    indirizzo:"",mappale:"",oggetto:"Casa d'abitazione",annoCost:"",committente:"",indirizzoCommittente:"",
    nRapporto:"",esperto:"",dataRapporto:"",versione:"1.0",
    tipoIspezione:"prima_lavori_ristrutturazione",comune:"",lavori:"",ispezioneP:false,
    documentazione:"Sono stati forniti i piani dell immobile.",visitaP:"Nessuna.",
    dataIspezione:"",limiti:"L ispezione ha interessato tutti i locali dell immobile.",
    riserve:"Nessuna.",laboratorio:"ANALYSIS Lab SA/AG",
    conclAmianto:"",conclNocive:"",
    rifiuti:"I materiali contenenti sostanze nocive dovranno essere smaltiti conformemente alle normative vigenti (OPSR – Modulo Rifiuti edili).",
    riserveConc:"Nessuna riserva particolare.",
  });
  const [rowsAm,setRowsAm]=useState([
    {...EMPTY_ROW_AM,id:amNewId(),descrizione:"Colla piastrelle",tipo:"FA",prelievo:"SI",presenza:"NO",valutazione:"L"},
    {...EMPTY_ROW_AM,id:amNewId(),descrizione:"Intonaco interno",tipo:"FA",prelievo:"SI",presenza:"NO",valutazione:"L",note:"Prelievo composito"},
  ]);
  const [rowsNoc,setRowsNoc]=useState([{...EMPTY_ROW_NOC,id:amNewId()}]);
  const upd=(k,v)=>setAmF(prev=>({...prev,[k]:v}));
  const doGen=()=>{setAmBusy(true);setTimeout(()=>{setAmGen(buildAmiantoReport(amF,rowsAm,rowsNoc));setAmBusy(false);setAmView("preview");},800);};
  const doCopy=()=>{try{navigator.clipboard.writeText(amGen);setAmCopied(true);setTimeout(()=>setAmCopied(false),2000);}catch(e){}};
  const gradRed="linear-gradient(135deg,#991b1b,#dc2626,#ef4444)";
  const TABS=[{id:"general",label:"Intestazione"},{id:"ispezione",label:"Ispezione"},{id:"amianto",label:"Tabella Amianto"},{id:"nocive",label:"Altre Sostanze"},{id:"conclusioni",label:"Conclusioni"}];
  const pc2={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:13,padding:20,marginBottom:16};
  const iL2={display:"block",fontSize:12,fontWeight:600,color:T.text,marginBottom:5};
  const Row2=({label,children,req})=>(<div style={{marginBottom:14}}><label style={{...iL2,color:req?T.red:T.text}}>{label}{req?" *":""}</label>{children}</div>);
  const Sec=({title,color,children})=>(<div style={{marginBottom:20}}><div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:color||T.blue,borderBottom:"2px solid "+(color||T.blue)+"30",paddingBottom:6,marginBottom:14}}>{title}</div>{children}</div>);

  if(amView==="preview") return(
    <div style={{maxWidth:800}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setAmView("form")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>← Modifica</button>
        <span style={{color:"#b0b8c4"}}>|</span>
        <span style={{fontSize:15,fontWeight:800,color:T.text}}>Anteprima Rapporto Amianto</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={doCopy} style={{padding:"7px 14px",background:amCopied?T.green:"#d6dce6",color:amCopied?"#fff":T.textSub,border:"1px solid "+T.border,borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>{amCopied?"✓ Copiato!":"Copia testo"}</button>
          <button onClick={()=>setAmView("form")} style={{padding:"7px 14px",background:"#eff6ff",color:T.blue,border:"1px solid #bfdbfe",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>← Indietro</button>
          <button onClick={onBack} style={{padding:"7px 14px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Lista rapporti</button>
        </div>
      </div>
      <div style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:16,overflow:"hidden",boxShadow:T.shadowMd}}>
        <div style={{background:gradRed,padding:"18px 26px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,background:"rgba(255,255,255,0.15)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚠️</div>
            <div><div style={{color:"#fff",fontWeight:800,fontSize:15}}>Ispezione Sostanze Nocive</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>IPRAC Consulenze · ASCA v1.5</div></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{new Date().toLocaleDateString("it-CH")}</div><div style={{color:"#fff",fontSize:12,fontWeight:700}}>{amF.nRapporto||"Bozza"}</div></div>
        </div>
        <div style={{padding:"24px 28px"}}><pre style={{fontFamily:"'Courier New',monospace",fontSize:12,lineHeight:1.8,color:T.text,whiteSpace:"pre-wrap",margin:0}}>{amGen}</pre></div>
        <div style={{padding:"10px 26px",background:"#d6dce6",borderTop:"1px solid "+T.border,fontSize:11,color:T.textMuted}}>Generato da Edilslab · {new Date().toLocaleDateString("it-CH")} · Documento con valore orientativo. L originale firmato dall esperto ha valore legale.</div>
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:900}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>← Rapporti</button>
        <span style={{color:"#b0b8c4"}}>|</span>
        <span style={{fontSize:15,fontWeight:800,color:T.text}}>Perizia Amianto – ASCA v1.5</span>
        <span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,background:T.red+"15",color:T.red,fontSize:11,fontWeight:700}}>ASCA</span>
      </div>
      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:12,color:"#7f1d1d",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
        <span>Compila i campi variabili del rapporto. Le sezioni fisse (basi legali, definizioni, metodi) vengono incluse automaticamente nel documento finale secondo il capitolato ASCA.</span>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(t=>(<button key={t.id} onClick={()=>setAmTab(t.id)} style={{padding:"8px 16px",borderRadius:9,border:"1.5px solid "+(amTab===t.id?T.red:T.border),background:amTab===t.id?T.red+"15":"#dce1ea",color:amTab===t.id?T.red:T.textSub,fontSize:12,fontWeight:amTab===t.id?700:500,cursor:"pointer"}}>{t.label}</button>))}
      </div>

      {amTab==="general"&&(<div style={pc2}>
        <Sec title="Oggetto dell ispezione" color={T.red}>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
            <Row2 label="Indirizzo immobile" req><input style={inp} placeholder="via dei Matti 0 – 6612 Ascona" value={amF.indirizzo} onChange={e=>upd("indirizzo",e.target.value)}/></Row2>
            <Row2 label="Mappale RFD" req><input style={inp} placeholder="es. 1234" value={amF.mappale} onChange={e=>upd("mappale",e.target.value)}/></Row2>
            <Row2 label="Oggetto"><input style={inp} placeholder="Casa d abitazione" value={amF.oggetto} onChange={e=>upd("oggetto",e.target.value)}/></Row2>
            <Row2 label="Anno di costruzione"><input style={inp} placeholder="es. 1975 (rilevante se prima del 1991)" value={amF.annoCost} onChange={e=>upd("annoCost",e.target.value)}/></Row2>
            <Row2 label="Comune" req><input style={inp} placeholder="es. Ascona" value={amF.comune} onChange={e=>upd("comune",e.target.value)}/></Row2>
          </div>
        </Sec>
        <Sec title="Committente" color={T.blue}>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
            <Row2 label="Nome committente" req><input style={inp} placeholder="Sig. Mario Rossi" value={amF.committente} onChange={e=>upd("committente",e.target.value)}/></Row2>
            <Row2 label="Indirizzo committente"><input style={inp} placeholder="via XXX | CH-XXXX Citta" value={amF.indirizzoCommittente} onChange={e=>upd("indirizzoCommittente",e.target.value)}/></Row2>
          </div>
        </Sec>
        <Sec title="Rapporto" color={T.purple}>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr 1fr",gap:14}}>
            <Row2 label="N° Rapporto" req><input style={inp} placeholder="es. AS-2026-01" value={amF.nRapporto} onChange={e=>upd("nRapporto",e.target.value)}/></Row2>
            <Row2 label="Data rapporto"><input style={inp} type="date" value={amF.dataRapporto} onChange={e=>upd("dataRapporto",e.target.value)}/></Row2>
            <Row2 label="Versione"><input style={inp} placeholder="1.0" value={amF.versione} onChange={e=>upd("versione",e.target.value)}/></Row2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
            <Row2 label="Esperto responsabile"><input style={inp} placeholder="Nome Cognome" value={amF.esperto} onChange={e=>upd("esperto",e.target.value)}/></Row2>
            <Row2 label="Tipo ispezione" req><select style={inp} value={amF.tipoIspezione} onChange={e=>upd("tipoIspezione",e.target.value)}>{TIPO_ISPEZIONE_OPTIONS.map(t=><option key={t.val} value={t.val}>{t.label}</option>)}</select></Row2>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
            <input type="checkbox" id="amIspezioneP" checked={amF.ispezioneP} onChange={e=>upd("ispezioneP",e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
            <label htmlFor="amIspezioneP" style={{fontSize:13,color:T.text,cursor:"pointer"}}>Ispezione parziale (non tutto l immobile)</label>
          </div>
        </Sec>
      </div>)}

      {amTab==="ispezione"&&(<div style={pc2}>
        <Sec title="Dettagli dell ispezione" color={T.purple}>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
            <div style={{marginBottom:14}}><label style={iL2}>Data ispezione sul posto *</label><input style={inp} type="date" value={amF.dataIspezione} onChange={e=>upd("dataIspezione",e.target.value)}/></div>
            <div style={{marginBottom:14}}><label style={iL2}>Laboratorio analisi</label><input style={inp} placeholder="es. ANALYSIS Lab SA/AG" value={amF.laboratorio} onChange={e=>upd("laboratorio",e.target.value)}/></div>
          </div>
          <div style={{marginBottom:14}}><label style={iL2}>Lavori previsti (uno per riga) *</label><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6}} placeholder={"es. Demolizione tramezzi interni\nSostituzione pavimentazioni\nRifacimento intonaci"} value={amF.lavori} onChange={e=>upd("lavori",e.target.value)}/></div>
          <div style={{marginBottom:14}}><label style={iL2}>Documentazione a disposizione</label><input style={inp} value={amF.documentazione} onChange={e=>upd("documentazione",e.target.value)}/></div>
          <div style={{marginBottom:14}}><label style={iL2}>Visita preliminare</label><input style={inp} placeholder="Nessuna. / Data e note..." value={amF.visitaP} onChange={e=>upd("visitaP",e.target.value)}/></div>
          <div style={{marginBottom:14}}><label style={iL2}>Limiti dell ispezione</label><textarea style={{...inp,minHeight:60,resize:"vertical",lineHeight:1.6}} value={amF.limiti} onChange={e=>upd("limiti",e.target.value)}/></div>
          <div style={{marginBottom:14}}><label style={iL2}>Riserve</label><textarea style={{...inp,minHeight:60,resize:"vertical",lineHeight:1.6}} placeholder="Nessuna. / Locali non accessibili: ..." value={amF.riserve} onChange={e=>upd("riserve",e.target.value)}/></div>
        </Sec>
      </div>)}

      {amTab==="amianto"&&(<div style={pc2}>
        <div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:T.red,borderBottom:"2px solid "+T.red+"30",paddingBottom:6,marginBottom:14}}>Materiali suscettibili di contenere amianto (MSCA)</div>
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 13px",marginBottom:14,fontSize:12,color:"#7f1d1d"}}>Inserisci tutti i materiali analizzati. Per i materiali con <strong>SI*</strong> (amianto per difetto), specificare nelle note.</div>
        <TabellaAmianto rows={rowsAm} onChange={setRowsAm}/>
      </div>)}

      {amTab==="nocive"&&(<div style={pc2}>
        <div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:T.amber,borderBottom:"2px solid "+T.amber+"30",paddingBottom:6,marginBottom:14}}>Materiali suscettibili di contenere altre sostanze nocive (MSCSN)</div>
        <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"8px 13px",marginBottom:14,fontSize:12,color:"#78350f"}}>Inserisci i materiali analizzati per PCB, Piombo (Pb), IPA, CFC/HFC e idrocarburi (C10-C40).</div>
        <TabellaNocive rows={rowsNoc} onChange={setRowsNoc}/>
      </div>)}

      {amTab==="conclusioni"&&(<div style={pc2}>
        <div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:T.red,borderBottom:"2px solid "+T.red+"30",paddingBottom:6,marginBottom:14}}>Conclusioni amianto</div>
        <div style={{marginBottom:14}}><label style={iL2}>Note conclusive amianto (facoltativo)</label><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6}} placeholder="es. I materiali con grado d urgenza III dovranno essere bonificati prima dell inizio dei lavori..." value={amF.conclAmianto} onChange={e=>upd("conclAmianto",e.target.value)}/></div>
        <div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:T.amber,borderBottom:"2px solid "+T.amber+"30",paddingBottom:6,marginBottom:14,marginTop:8}}>Conclusioni altre sostanze nocive</div>
        <div style={{marginBottom:14}}><label style={iL2}>Note conclusive sostanze nocive (facoltativo)</label><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6}} value={amF.conclNocive} onChange={e=>upd("conclNocive",e.target.value)}/></div>
        <div style={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:T.purple,borderBottom:"2px solid "+T.purple+"30",paddingBottom:6,marginBottom:14,marginTop:8}}>Gestione rifiuti e riserve</div>
        <div style={{marginBottom:14}}><label style={iL2}>Gestione dei rifiuti</label><textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.6}} value={amF.rifiuti} onChange={e=>upd("rifiuti",e.target.value)}/></div>
        <div style={{marginBottom:14}}><label style={iL2}>Riserve finali</label><textarea style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.6}} value={amF.riserveConc} onChange={e=>upd("riserveConc",e.target.value)}/></div>
      </div>)}

      <div style={{display:"flex",gap:12,alignItems:"center",marginTop:4}}>
        <button onClick={doGen} disabled={amBusy} style={{padding:"12px 28px",background:amBusy?"#c4ccd8":"linear-gradient(135deg,#991b1b,#dc2626,#ef4444)",color:amBusy?T.textMuted:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:700,cursor:amBusy?"default":"pointer",boxShadow:amBusy?"none":"0 4px 14px rgba(220,38,38,0.3)"}}>
          {amBusy?"Generazione...":"⚠️ Genera rapporto amianto"}
        </button>
        <span style={{fontSize:12,color:T.textMuted}}>Le sezioni fisse (basi legali, definizioni, ecc.) vengono incluse automaticamente.</span>
      </div>
    </div>
  );
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({user}){
  const mob=useIsMobile();const [view,setView]=useState("list");
  const {salva,saved:projSaved,modalJSX}=useSalvaInProgetto(user?.email||"guest");const [tmpl,setTmpl]=useState(null);const [fields,setFields]=useState({});const [gen,setGen]=useState("");const [busy,setBusy]=useState(false);const [copied,setCopied]=useState(false);
  const [showAmianto,setShowAmianto]=useState(false);
  const [saved,setSaved]=useState([{id:1,nome:"Perizia strutturale via Lugano 12",tipo:"Perizia Strutturale",data:"12.05.2024",color:T.blue,createdAt:Date.now()-25*86400000},{id:2,nome:"Ispezione Cantiere B",tipo:"Rapporto di Ispezione",data:"20.05.2024",color:T.purple,createdAt:Date.now()-5*86400000}]);
  const daysLeft=ca=>Math.max(0,30-Math.floor((Date.now()-ca)/86400000));
  const doGen=()=>{setBusy(true);setTimeout(()=>{setGen(genReport(tmpl,fields));setBusy(false);setView("preview");},1400);};
  const doSave=()=>{setSaved(sv=>[...sv,{id:Date.now(),nome:fields.oggetto||fields.cantiere||fields.opera||fields.tipo||"Rapporto",tipo:tmpl.label,data:new Date().toLocaleDateString("it-CH"),color:tmpl.color,createdAt:Date.now()}]);setView("list");};
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:22,boxShadow:T.shadow};

  if(showAmianto) return <PeriziaAmiantoForm user={user} onBack={()=>setShowAmianto(false)}/>;

  if(view==="list")return(<div><div style={{fontSize:11,fontWeight:700,color:T.textSub,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.8px"}}>Nuovo rapporto</div><div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:14,marginBottom:28}}>{TMPLS.map(t=>(<div key={t.id} onClick={()=>{if(t.id==="amianto"){setShowAmianto(true);return;}setTmpl(t);setFields({});setGen("");setView("form");}} style={{background:"#dce1ea",border:"1.5px solid "+t.color+"25",borderRadius:14,padding:18,cursor:"pointer",boxShadow:T.shadow}}><div style={{width:40,height:40,borderRadius:11,background:t.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:t.color,marginBottom:12}}><Icon d={PATHS[t.icon]||PATHS.file} size={19}/></div><div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:5}}>{t.label}</div><div style={{fontSize:12,color:T.textSub,lineHeight:1.5}}>{t.desc}</div></div>))}</div>{saved.length>0&&(<div><div style={{fontSize:11,fontWeight:700,color:T.textSub,marginBottom:14,textTransform:"uppercase",letterSpacing:"0.8px"}}>Rapporti salvati</div><div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>{saved.map(r=>{const left=daysLeft(r.createdAt);const urg=left<=7;return(<div key={r.id} style={{background:"#dce1ea",border:"1px solid "+(urg?"#fecaca":T.border),borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:14,boxShadow:T.shadow}}><div style={{width:38,height:38,borderRadius:10,background:r.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:r.color,flexShrink:0}}><Icon d={PATHS.file} size={17}/></div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nome}</div><div style={{fontSize:11,color:T.textMuted}}>{r.tipo} · {r.data}</div><div style={{fontSize:11,marginTop:2,color:urg?T.red:T.textMuted,fontWeight:urg?700:400}}>{left===0?"Scade oggi":left<=7?"Scade tra "+left+"gg":"Eliminazione tra "+left+" giorni"}</div></div><button onClick={()=>setSaved(sv=>sv.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",padding:6}}><Icon d={PATHS.trash} size={16}/></button></div>);})}</div></div>)}</div>);
  if(view==="form"&&tmpl)return(<div style={{maxWidth:620}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Indietro</button><span style={{color:"#b0b8c4"}}>|</span><span style={{fontSize:15,fontWeight:800,color:T.text}}>{tmpl.label}</span></div><div style={pc}><div style={{background:tmpl.color+"0c",border:"1px solid "+tmpl.color+"25",borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:12,color:tmpl.color,fontWeight:600}}>{tmpl.id==="libero"?"Descrivi liberamente, l AI generera un rapporto professionale":"Compila i campi, l AI formattera il rapporto"}</div>{tmpl.fields.map(f=>(<div key={f.k} style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>{f.l}</label>{f.ta?<textarea style={{...inp,resize:"vertical",minHeight:f.rows?f.rows*24:80,lineHeight:1.6}} placeholder={f.ph} value={fields[f.k]||""} onChange={e=>setFields(fv=>({...fv,[f.k]:e.target.value}))}/>:<input style={inp} placeholder={f.ph} value={fields[f.k]||""} onChange={e=>setFields(fv=>({...fv,[f.k]:e.target.value}))}/>}</div>))}<button onClick={doGen} disabled={busy} style={{...btnP,background:busy?"#c4ccd8":T.gradBlue,color:busy?T.textMuted:"#fff"}}>{busy?"Generazione in corso...":"Genera rapporto"}</button></div></div>);
  if(view==="preview")return(<><div style={{maxWidth:700}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}><button onClick={()=>setView("form")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Modifica</button><span style={{color:"#b0b8c4"}}>|</span><span style={{fontSize:15,fontWeight:800,color:T.text}}>Anteprima</span><div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{padding:"7px 14px",background:copied?T.green:"#d6dce6",color:copied?"#fff":T.textSub,border:"1px solid "+T.border,borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>{copied?"Copiato!":"Copia testo"}</button><button style={{padding:"7px 14px",background:"#eff6ff",color:T.blue,border:"1px solid #bfdbfe",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Word</button><button style={{padding:"7px 14px",background:"#fef2f2",color:"#ef4444",border:"1px solid #fecaca",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>PDF</button><button style={{padding:"7px 14px",background:"#f0fdf4",color:T.green,border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Excel</button><button onClick={doSave} style={{padding:"7px 16px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>Salva</button><button onClick={()=>salva("rapporto",gen)} style={{padding:"7px 14px",background:projSaved?"#f0fdf4":"#d6dce6",color:projSaved?T.green:T.textSub,border:"1px solid "+(projSaved?"#bbf7d0":T.border),borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>{projSaved?"✓ Salvato":"💾 Progetto"}</button></div></div><div style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:16,overflow:"hidden",boxShadow:T.shadowMd}}><div style={{background:T.gradBlue,padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:38,height:38,background:"rgba(255,255,255,0.15)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={PATHS.building} size={20} stroke="#fff"/></div><div><div style={{color:"#fff",fontWeight:800,fontSize:16}}>Edilslab</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>Svizzera Italiana</div></div></div><div style={{textAlign:"right"}}><div style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{new Date().toLocaleDateString("it-CH")}</div><div style={{color:"#fff",fontSize:12,fontWeight:700}}>{tmpl.label}</div></div></div><div style={{padding:mob?20:32}}><pre style={{fontFamily:"inherit",fontSize:13,lineHeight:1.85,color:T.text,whiteSpace:"pre-wrap",margin:0}}>{gen}</pre></div><div style={{padding:"12px 28px",background:"#d6dce6",borderTop:"1px solid "+T.border,fontSize:11,color:T.textMuted}}>Generato da Edilslab · {new Date().toLocaleDateString("it-CH")} · Verificare con professionista abilitato</div></div></div>{modalJSX}</>);
  return null;
}

// ─── VERBALI DI CANTIERE ─────────────────────────────────────────────────────
// Compila il template xlsx esatto e lo scarica via SheetJS (CDN)
// Il file scaricato è identico al Verbale_tipo.xlsx originale, solo compilato.

const VERBALE_XLSX_B64 = "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AAAAAAAAIQBuVGi35GAAAORgAAATAAAAeGwvbWVkaWEvaW1hZ2UxLnBuZ4lQTkcNChoKAAAADUlIRFIAAAJkAAABVAgCAAAABeG32wAAAAlwSFlzAAAuIwAALiMBeKU/dgAABchpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAzIDc5LjE2NDUyNywgMjAyMC8xMC8xNS0xNzo0ODozMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMy0wNVQxNzo0MTozOSswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wMy0wNVQxNzo0MTozOSswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDMtMDVUMTc6NDE6MzkrMDE6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzU0NDlkOTUtM2MzNC1kNzQyLWI0MDEtYjc3NzUzZTAwMDdjIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MDBhNjUzOGQtMDM1Ni01ZDQwLTg5NTAtOTRmOWFlMTY4YzQwIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZjVjMmNjY2QtNjRhMC03YzQ5LTgyMDgtN2JlYzUxZjk3NjY5IiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjVjMmNjY2QtNjRhMC03YzQ5LTgyMDgtN2JlYzUxZjk3NjY5IiBzdEV2dDp3aGVuPSIyMDI0LTAzLTA1VDE3OjQxOjM5KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjc1NDQ5ZDk1LTNjMzQtZDc0Mi1iNDAxLWI3Nzc1M2UwMDA3YyIgc3RFdnQ6d2hlbj0iMjAyNC0wMy0wNVQxNzo0MTozOSswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PubXYyEAAFrCSURBVHic7d1nQBPbtgDgSUIgoYtUAVGxYEME7L1RLMeCiv0oYK/03ntTxIa9iwqKXUEQCyCCDUVFpYgUQXondd4P3vN5kgkJEEKA9f26d9ZkZokeVmb23mvjUBRFAAAAAMAZvqsTAAAAAIQdFEsAAACACyiWAAAAABdQLAEAAAAuoFgCAAAAXECxBAAAALiAYgkAAABwAcUSAAAA4AKKJQAAAMAFFEsAAACACyiWAAAAABdQLAEAAAAuoFgCAAAAXECxBAAAALiAYgkAAABw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";

// Mappa ESATTA delle celle da compilare nel template
const VERBALE_PROG_ROWS = [
  {label:"Committente",          row:14},
  {label:"Architetto progettista",row:17},
  {label:"Direzione lavori",     row:21},
  {label:"Ingegnere Civile",     row:26},
  {label:"Ingegnere RVCS",       row:28},
  {label:"Fisico della costruzione",row:31},
  {label:"Disegnatore",          row:34},
];
const VERBALE_ART_ROWS = [
  {label:"Capomastro",           row:40},
  {label:"Capo Cantiere",        row:42, noditta:true},
  {label:"Elettricista",         row:45},
  {label:"Capo Elettricista",    row:47, noditta:true},
  {label:"Sanitario/riscald.",   row:50},
  {label:"Gessatura/pittura",    row:53},
  {label:"Serramenti",           row:56},
  {label:"Impermeabilizzazione", row:59},
  {label:"Ascensore",            row:62},
  {label:"Massetti",             row:67},
  {label:"Metalcostruzioni",     row:70},
  {label:"Lattoniere",           row:73},
  {label:"Protezioni solari",    row:76},
  {label:"Fotovoltaico",         row:79},
  {label:"Piastrellista",        row:82},
  {label:"Cucine",               row:85},
  {label:"Clima",                row:88},
  {label:"Palchettista",         row:91},
  {label:"Giardiniere",          row:94},
  {label:"Falegname",            row:97},
];
const VERBALE_TRAT_ROWS = [
  {label:"Direzione Lavori – IPRAC", pos:"0", row:118, chi:"IP"},
  {label:"Committente",             pos:"1", row:122, chi:"XX"},
  {label:"Ingegnere Civile",        pos:"2", row:125, chi:"XX"},
  {label:"Architetto",              pos:"3", row:129, chi:"XX"},
  {label:"Disegnatore",             pos:"4", row:133, chi:"XX"},
  {label:"Capomastro",              pos:"5", row:135, chi:"XX"},
  {label:"Elettricista",            pos:"6", row:139, chi:"XX"},
  {label:"Idraulico",               pos:"7", row:143, chi:"XX"},
  {label:"Ascensore",               pos:"9", row:147, chi:"XX"},
  {label:"Lattoniere",              pos:"10",row:149, chi:"XX"},
];

function emptyVerbPart(label){return{label,ditta:"",responsabile:"",sigla:"",contatto:"",presente:false};}
function emptyVerbTrat(t){return{pos:t.pos,label:t.label,chi:t.chi||"",entro:"",desc:t.label.toUpperCase()};}
function initVerbale(){
  const today=new Date().toISOString().split("T")[0];
  return{
    progetto:"",nVerbale:"",luogo:"",verbaleV:"V.0",
    data:today,redattoDa:"",speditoIl:"",prossima:"",mappaCartella:"",
    prog:VERBALE_PROG_ROWS.map(r=>emptyVerbPart(r.label)),
    art: VERBALE_ART_ROWS.map(r=>emptyVerbPart(r.label)),
    trattande:VERBALE_TRAT_ROWS.map(emptyVerbTrat),
  };
}

async function loadXLSX(){
  if(window.XLSX) return window.XLSX;
  return new Promise((res,rej)=>{
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload=()=>res(window.XLSX);
    s.onerror=()=>rej(new Error("Impossibile caricare SheetJS"));
    document.head.appendChild(s);
  });
}

async function generateVerbaleXlsx(vb){
  const XLSX = await loadXLSX();
  // Decode the template from base64
  const wb = XLSX.read(VERBALE_XLSX_B64, {type:"base64"});
  const ws = wb.Sheets[wb.SheetNames[0]];

  function setCell(coord, value){
    if(!value && value!==0) return; // skip empty
    const cell = ws[coord];
    if(cell){
      cell.v = value;
      cell.w = String(value);
    } else {
      ws[coord] = {t:"s", v:String(value), w:String(value)};
    }
  }

  // ── Header ──
  setCell("C3", vb.progetto);
  setCell("I3", vb.nVerbale);
  setCell("C5", vb.luogo);
  // E5 is top-left of E5:H10 merged
  const e5 = ws["E5"];
  if(e5){ e5.v=vb.verbaleV; e5.w=vb.verbaleV; } else { ws["E5"]={t:"s",v:vb.verbaleV,w:vb.verbaleV}; }
  setCell("C6", vb.data);
  setCell("C7", vb.redattoDa);
  setCell("C8", vb.speditoIl);
  setCell("C9", vb.prossima);
  setCell("C10", vb.mappaCartella);

  // ── Progettisti ──
  VERBALE_PROG_ROWS.forEach((r,i)=>{
    const p = vb.prog[i];
    if(!p) return;
    setCell(`C${r.row}`, p.ditta);
    setCell(`D${r.row}`, p.responsabile);
    setCell(`E${r.row}`, p.sigla);
    setCell(`F${r.row}`, p.contatto);
    if(p.presente) setCell(`H${r.row}`, "X");
  });

  // ── Artigiani ──
  VERBALE_ART_ROWS.forEach((r,i)=>{
    const a = vb.art[i];
    if(!a) return;
    if(!r.noditta) setCell(`C${r.row}`, a.ditta);
    setCell(`D${r.row}`, a.responsabile);
    setCell(`E${r.row}`, a.sigla);
    setCell(`F${r.row}`, a.contatto);
    if(a.presente) setCell(`H${r.row}`, "X");
  });

  // ── Trattande ──
  VERBALE_TRAT_ROWS.forEach((r,i)=>{
    const t = vb.trattande[i];
    if(!t) return;
    // B col (merged B:E) = desc - write to B (top-left of merge)
    setCell(`B${r.row}`, t.desc);
    setCell(`F${r.row}`, t.chi);
    setCell(`G${r.row}`, t.entro);
  });

  // Update sheet range
  const range = XLSX.utils.decode_range(ws["!ref"]||"A1:R159");
  ws["!ref"] = XLSX.utils.encode_range(range);

  const filename = `Verbale_${vb.nVerbale||"bozza"}_${vb.data||"cantiere"}.xlsx`;
  XLSX.writeFile(wb, filename);
}

function Verbali({user}){
  const mob=useIsMobile();
  const [view,setView]=useState("list");
  const [verbali,setVerbali]=useState([]);
  const [vb,setVb]=useState(initVerbale());
  const [tab,setTab]=useState("info");
  const [generating,setGenerating]=useState(false);
  const [genErr,setGenErr]=useState("");
  const [listening,setListening]=useState(false);
  const [voceTarget,setVoceTarget]=useState(null);
  const recognRef=useRef(null);

  const startVoice=(target)=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Riconoscimento vocale non supportato. Usa Chrome o Edge.");return;}
    if(recognRef.current)recognRef.current.stop();
    const r=new SR();
    r.lang="it-IT";r.continuous=false;r.interimResults=false;
    r.onstart=()=>{setListening(true);setVoceTarget(target);};
    r.onresult=(e)=>{
      const txt=e.results[0][0].transcript.trim();
      setVb(prev=>{
        const next={...prev};
        if(target.section==="info") next[target.field]=txt;
        else if(target.section==="prog"){const a=[...next.prog];a[target.idx]={...a[target.idx],[target.field]:txt};next.prog=a;}
        else if(target.section==="art"){const a=[...next.art];a[target.idx]={...a[target.idx],[target.field]:txt};next.art=a;}
        else if(target.section==="trat"){const a=[...next.trattande];a[target.idx]={...a[target.idx],[target.field]:txt};next.trattande=a;}
        return next;
      });
      setListening(false);setVoceTarget(null);
    };
    r.onerror=r.onend=()=>{setListening(false);setVoceTarget(null);};
    recognRef.current=r;r.start();
  };
  const stopVoice=()=>recognRef.current?.stop();
  const isActive=(t)=>listening&&voceTarget&&JSON.stringify(voceTarget)===JSON.stringify(t);

  const updInfo=(k,v)=>setVb(p=>({...p,[k]:v}));
  const updProg=(i,k,v)=>setVb(p=>{const a=[...p.prog];a[i]={...a[i],[k]:v};return{...p,prog:a};});
  const updArt=(i,k,v)=>setVb(p=>{const a=[...p.art];a[i]={...a[i],[k]:v};return{...p,art:a};});
  const updTrat=(i,k,v)=>setVb(p=>{const a=[...p.trattande];a[i]={...a[i],[k]:v};return{...p,trattande:a};});

  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:13,padding:20,marginBottom:16};
  const iL2={display:"block",fontSize:12,fontWeight:600,color:T.text,marginBottom:5};
  const TABS=[{id:"info",label:"📋 Info"},{id:"prog",label:"👷 Progettisti"},{id:"art",label:"🏗 Artigiani"},{id:"trat",label:"📌 Trattande"}];

  function MicBtn({target}){
    const active=isActive(target);
    return(<button type="button" onClick={()=>active?stopVoice():startVoice(target)} title={active?"Ferma":"Dettatura vocale"} style={{flexShrink:0,width:30,height:30,borderRadius:7,border:"none",cursor:"pointer",background:active?"#dc2626":"#c8d0dc",color:active?"#fff":T.textSub,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{active?"⏹":"🎤"}</button>);
  }

  function VI({value,onChange,ph,target,type="text"}){
    return(<div style={{display:"flex",gap:5,alignItems:"center"}}><input type={type} style={{...inp,flex:1}} placeholder={ph||""} value={value} onChange={e=>onChange(e.target.value)}/><MicBtn target={target}/></div>);
  }

  const doGenerate=async()=>{
    setGenerating(true);setGenErr("");
    try{
      await generateVerbaleXlsx(vb);
      setVerbali(p=>[{id:Date.now(),nVerbale:vb.nVerbale||"Bozza",progetto:vb.progetto||"---",data:vb.data,createdAt:Date.now()},...p]);
    }catch(e){setGenErr("Errore: "+e.message);}
    setGenerating(false);
  };

  if(view==="list") return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:18,fontWeight:800,color:T.text}}>Verbali di Cantiere</div><div style={{fontSize:13,color:T.textSub,marginTop:3}}>Compila il modulo, scarica il file Excel identico all originale ma compilato</div></div>
        <button onClick={()=>{setVb(initVerbale());setTab("info");setView("form");}} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}><Icon d={PATHS.plus} size={15}/> Nuovo verbale</button>
      </div>
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:12,color:"#1e40af",display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:16}}>🎤</span>
        <span>Ogni campo ha il pulsante 🎤 per la <strong>dettatura vocale</strong> in italiano. Il file scaricato è identico al Verbale_tipo.xlsx, con i dati compilati nelle celle esatte.</span>
      </div>
      {verbali.length===0?(
        <div style={{textAlign:"center",padding:"56px 20px",background:"#dce1ea",borderRadius:16,border:"1px solid "+T.border}}>
          <div style={{fontSize:40,marginBottom:14}}>📋</div>
          <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>Nessun verbale ancora</div>
          <div style={{fontSize:13,color:T.textSub,marginBottom:20}}>Compila il form e scarica il verbale Excel in un click.</div>
          <button onClick={()=>{setVb(initVerbale());setTab("info");setView("form");}} style={{padding:"10px 24px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Crea il primo verbale</button>
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
          {verbali.map(v=>(<div key={v.id} style={{...pc,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:40,height:40,borderRadius:11,background:T.green+"15",display:"flex",alignItems:"center",justifyContent:"center",color:T.green,fontSize:20,flexShrink:0}}>📋</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:T.text}}>Verbale {v.nVerbale}</div><div style={{fontSize:12,color:T.textSub}}>{v.progetto} · {v.data}</div></div>
          </div>))}
        </div>
      )}
    </div>
  );

  return(
    <div style={{maxWidth:1000}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>← Lista verbali</button>
        <span style={{color:"#b0b8c4"}}>|</span>
        <span style={{fontSize:15,fontWeight:800,color:T.text}}>Nuovo verbale di cantiere</span>
        {listening&&<span style={{marginLeft:8,padding:"3px 10px",borderRadius:20,background:"#dc2626",color:"#fff",fontSize:11,fontWeight:700}}>🎤 Registrazione in corso...</span>}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",borderRadius:9,border:"1.5px solid "+(tab===t.id?T.blue:T.border),background:tab===t.id?"#eff6ff":"#dce1ea",color:tab===t.id?T.blue:T.textSub,fontSize:12,fontWeight:tab===t.id?700:500,cursor:"pointer"}}>{t.label}</button>))}
      </div>

      {tab==="info"&&(
        <div style={pc}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.8px"}}>Informazioni generali</div>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
            {[
              {label:"Progetto / Concerne",field:"progetto",ph:"Nome del progetto"},
              {label:"Nr. Verbale",field:"nVerbale",ph:"es. 2026-05"},
              {label:"Luogo",field:"luogo",ph:"es. Via Lugano 12, Locarno"},
              {label:"Versione",field:"verbaleV",ph:"V.0"},
              {label:"Data verbale",field:"data",type:"date"},
              {label:"Redatto da",field:"redattoDa",ph:"Nome tecnico"},
              {label:"Spedito il",field:"speditoIl",type:"date"},
              {label:"Prossima riunione",field:"prossima",ph:"es. 02.07.2026 ore 09:00 in cantiere"},
              {label:"Mapp / N° cartella",field:"mappaCartella",ph:"es. 1234/2026"},
            ].map(({label,field,ph,type="text"})=>(
              <div key={field}>
                <label style={iL2}>{label}</label>
                <VI value={vb[field]} onChange={v=>updInfo(field,v)} ph={ph} target={{section:"info",field}} type={type}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="prog"&&(
        <div style={pc}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.8px"}}>Progettisti / COM</div>
          <div style={{fontSize:12,color:T.textSub,marginBottom:14}}>🎤 = dettatura vocale in italiano per ogni campo.</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#c8d0dc"}}>{["Ruolo","Ditta","Responsabile","Sigla","Contatto","✓"].map(h=><th key={h} style={{padding:"8px 10px",fontWeight:700,color:T.text,fontSize:11,textAlign:"left",border:"1px solid "+T.border,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{vb.prog.map((r,i)=>(
                <tr key={i} style={{background:i%2===0?"#dce1ea":"#d6dce6"}}>
                  <td style={{padding:"6px 8px",border:"1px solid "+T.border,fontWeight:700,color:T.blue,fontSize:12,whiteSpace:"nowrap"}}>{r.label}</td>
                  {["ditta","responsabile","sigla","contatto"].map(f=>(
                    <td key={f} style={{padding:"4px 6px",border:"1px solid "+T.border}}>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <input style={{...inp,padding:"5px 8px",fontSize:12,minWidth:f==="sigla"?40:70,flex:1}} value={r[f]} onChange={e=>updProg(i,f,e.target.value)} placeholder="…"/>
                        <MicBtn target={{section:"prog",idx:i,field:f}}/>
                      </div>
                    </td>
                  ))}
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border,textAlign:"center"}}>
                    <input type="checkbox" checked={r.presente} onChange={e=>updProg(i,"presente",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="art"&&(
        <div style={pc}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.8px"}}>Artigiani</div>
          <div style={{fontSize:12,color:T.textSub,marginBottom:14}}>Compila solo le righe delle ditte presenti. Le celle vuote restano vuote nel file Excel.</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#c8d0dc"}}>{["Categoria","Ditta","Responsabile","Sigla","Contatto","✓"].map(h=><th key={h} style={{padding:"8px 10px",fontWeight:700,color:T.text,fontSize:11,textAlign:"left",border:"1px solid "+T.border,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{vb.art.map((r,i)=>{
                const nd=VERBALE_ART_ROWS[i]?.noditta;
                return(<tr key={i} style={{background:i%2===0?"#dce1ea":"#d6dce6"}}>
                  <td style={{padding:"6px 8px",border:"1px solid "+T.border,fontWeight:700,color:T.blue,fontSize:12,whiteSpace:"nowrap"}}>{r.label}</td>
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border}}>
                    {nd?<span style={{fontSize:11,color:T.textMuted,padding:"5px 8px",display:"block"}}>—</span>:(
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <input style={{...inp,padding:"5px 8px",fontSize:12,flex:1}} value={r.ditta} onChange={e=>updArt(i,"ditta",e.target.value)} placeholder="…"/>
                        <MicBtn target={{section:"art",idx:i,field:"ditta"}}/>
                      </div>
                    )}
                  </td>
                  {["responsabile","sigla","contatto"].map(f=>(
                    <td key={f} style={{padding:"4px 6px",border:"1px solid "+T.border}}>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <input style={{...inp,padding:"5px 8px",fontSize:12,minWidth:f==="sigla"?40:70,flex:1}} value={r[f]} onChange={e=>updArt(i,f,e.target.value)} placeholder="…"/>
                        <MicBtn target={{section:"art",idx:i,field:f}}/>
                      </div>
                    </td>
                  ))}
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border,textAlign:"center"}}>
                    <input type="checkbox" checked={r.presente} onChange={e=>updArt(i,"presente",e.target.checked)} style={{width:18,height:18,cursor:"pointer"}}/>
                  </td>
                </tr>);
              })}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="trat"&&(
        <div style={pc}>
          <div style={{fontSize:13,fontWeight:800,color:T.blue,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.8px"}}>Trattande</div>
          <div style={{fontSize:12,color:T.textSub,marginBottom:14}}>Compila la descrizione specifica e la scadenza. Il CHI è pre-impostato dal template.</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#c8d0dc"}}>{["Pos.","Figura","Descrizione / Trattanda","Chi","Entro il"].map(h=><th key={h} style={{padding:"8px 10px",fontWeight:700,color:T.text,fontSize:11,textAlign:"left",border:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
              <tbody>{vb.trattande.map((t,i)=>(
                <tr key={i} style={{background:i%2===0?"#dce1ea":"#d6dce6"}}>
                  <td style={{padding:"5px 8px",border:"1px solid "+T.border,fontWeight:700,color:T.blue,textAlign:"center",width:40}}>{t.pos}</td>
                  <td style={{padding:"5px 8px",border:"1px solid "+T.border,fontSize:12,color:T.textSub,whiteSpace:"nowrap"}}>{t.label}</td>
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border}}>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <input style={{...inp,padding:"5px 8px",fontSize:12,flex:1}} value={t.desc} onChange={e=>updTrat(i,"desc",e.target.value)} placeholder="Descrizione trattanda…"/>
                      <MicBtn target={{section:"trat",idx:i,field:"desc"}}/>
                    </div>
                  </td>
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border,width:70}}>
                    <input style={{...inp,padding:"5px 7px",fontSize:12,textAlign:"center"}} value={t.chi} onChange={e=>updTrat(i,"chi",e.target.value)}/>
                  </td>
                  <td style={{padding:"4px 6px",border:"1px solid "+T.border,width:130}}>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <input style={{...inp,padding:"5px 8px",fontSize:12,flex:1}} value={t.entro} onChange={e=>updTrat(i,"entro",e.target.value)} placeholder="es. 30.06.2026"/>
                      <MicBtn target={{section:"trat",idx:i,field:"entro"}}/>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {genErr&&<div style={{padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,fontSize:13,color:T.red,marginBottom:12}}>{genErr}</div>}

      <div style={{display:"flex",gap:12,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
        <button onClick={doGenerate} disabled={generating} style={{padding:"12px 28px",background:generating?"#c4ccd8":T.gradBlue,color:generating?T.textMuted:"#fff",border:"none",borderRadius:11,fontSize:14,fontWeight:700,cursor:generating?"default":"pointer",boxShadow:generating?"none":"0 4px 14px rgba(37,99,235,0.3)",display:"flex",alignItems:"center",gap:8}}>
          {generating?<><div style={{width:14,height:14,border:"2px solid #94a3b8",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Generazione...</>:"📊 Scarica Excel compilato"}
        </button>
        <span style={{fontSize:12,color:T.textMuted}}>Il file Excel scaricato è identico al Verbale_tipo.xlsx con le celle compilate.</span>
      </div>
    </div>
  );
}


// ─── GANTT PLANNER V3 ────────────────────────────────────────────────────────
function GanttPlanner({user}) {
  const mob = useIsMobile();
  const today = new Date().toISOString().split("T")[0];
  const {salva,saved:ganttSaved,modalJSX:ganttModalJSX}=useSalvaInProgetto(user?.email||"guest");

  // ── State ──
  const [tasks, setTasks] = useState([]);
  const [pName, setPName] = useState("Programma Lavori");
  const [pLoc, setPLoc] = useState("");
  const [pClient, setPClient] = useState("");
  const [festivi, setFestivi] = useState(DEFAULT_FESTIVI);
  const [newFest, setNewFest] = useState("");
  const [panel, setPanel] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // AI
  const [aiMode, setAiMode] = useState("template"); // "template" | "prompt"
  const [aiType, setAiType] = useState("");
  const [aiCustomName, setAiCustomName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStart, setAiStart] = useState(today);
  const [generating, setGenerating] = useState(false);

  // Drag
  const [dragging, setDragging] = useState(null); // {id, startX, origInizio}
  const [linkMode, setLinkMode] = useState(false);
  const [linkFrom, setLinkFrom] = useState(null);

  // New task form
  const emptyTask = { nome: "", durata: "5", inizio: today, isGroup: false, color: "#2563eb", level: 0, dep: "" };
  const [nt, setNt] = useState({ ...emptyTask });

  const ganttRef = useRef();
  const fs = new Set(festivi);

  // ── Core: applica dipendenze con ordinamento topologico ──
  // Riceve i festivi come parametro per evitare closure stale dentro setTasks
  const applyDepsWithFs = (tl, fsSet) => {
    const map = {};
    tl.forEach(t => { map[t.id] = { ...t }; });
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
    tl.forEach(t => visit(t.id));
    // Propaga date in ordine topologico
    sorted.forEach(id => {
      const t = map[id];
      if (!t || !t.dep) return;
      const p = map[parseInt(t.dep)];
      if (!p) return;
      // Il successore inizia il primo giorno lavorativo dopo la fine del predecessore
      const ni = nextWorkDay(addDays(p.fine, 1), fsSet);
      map[id] = { ...t, inizio: ni, fine: addWorkDays(ni, t.durata, fsSet) };
    });
    return tl.map(t => map[t.id] || t);
  };

  // ── updTaskFn: aggiorna un campo e poi propaga dipendenze ──
  const updTaskFn = (ts, id, field, val, fsSet) => {
    const updated = ts.map(t => {
      if (t.id !== id) return t;
      const u = { ...t, [field]: val };
      if (field === "inizio") { const s = nextWorkDay(val, fsSet); u.inizio = s; u.fine = addWorkDays(s, u.durata, fsSet); }
      if (field === "durata") { u.durata = val; u.fine = addWorkDays(u.inizio, val, fsSet); }
      if (field === "fine") { u.fine = val; u.durata = countWorkDays(u.inizio, val, fsSet); }
      return u;
    });
    return applyDepsWithFs(updated, fsSet);
  };

  // updTask: cattura i festivi correnti al momento della chiamata (no stale closure)
  const updTask = (id, field, val) => {
    const currentFs = new Set(festivi);
    setTasks(ts => updTaskFn(ts, id, field, val, currentFs));
  };

  const applyDepsFn = tl => applyDepsWithFs(tl, new Set(festivi));
  const propagate = () => { const currentFs = new Set(festivi); setTasks(ts => applyDepsWithFs(ts, currentFs)); };

  // ── Task ops ──
  const addTask = () => {
    if (!nt.nome.trim()) return;
    const ini = nextWorkDay(nt.inizio, fs);
    const fine = addWorkDays(ini, nt.durata, fs); // durata is flexible string
    const cfAdd = new Set(festivi); setTasks(t => applyDepsWithFs([...t, { ...nt, id: Date.now(), inizio: ini, fine }], cfAdd));
    setNt(n => ({ ...emptyTask, inizio: n.inizio, color: n.color }));
    // keep panel open for quick multi-add
  };
  const delTask = id => setTasks(t => t.filter(x => x.id !== id));
  const moveUp = id => setTasks(t => { const i = t.findIndex(x => x.id === id); if (i <= 0) return t; const n = [...t]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n; });
  const moveDown = id => setTasks(t => { const i = t.findIndex(x => x.id === id); if (i >= t.length-1) return t; const n = [...t]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n; });
  const duplicateTask = id => { const t = tasks.find(x => x.id === id); if (!t) return; const cfDup = new Set(festivi); setTasks(ts => applyDepsWithFs([...ts, { ...t, id: Date.now(), nome: t.nome + ' (copia)', dep: '' }], cfDup)); };
  const indentTask = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, level: Math.min(t.level + 1, 3) } : t));
  const outdentTask = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, level: Math.max(t.level - 1, 0) } : t));

  // ── Link (dependency) mode ──
  // After linking A->B, linkFrom resets to B so user can immediately
  // click C to chain A->B->C without re-pressing the button each time.
  const handleBarClick = (taskId) => {
    if (!linkMode) return;
    if (!linkFrom) { setLinkFrom(taskId); return; }
    if (linkFrom === taskId) { setLinkFrom(null); return; } // deselect
    const cfLink = new Set(festivi); setTasks(ts => applyDepsWithFs(ts.map(t => t.id === taskId ? { ...t, dep: String(linkFrom) } : t), cfLink));
    // Keep linkMode ON, set linkFrom = taskId so next click chains forward
    setLinkFrom(taskId);
  };
  const removeLink = id => { const cfRl = new Set(festivi); setTasks(ts => applyDepsWithFs(ts.map(t => t.id === id ? { ...t, dep: '' } : t), cfRl)); };

  // ── Drag ──
  const DAY_W = mob ? 10 : 18;
  const ROW_H = 40;
  const LEFT_W = mob ? 190 : 360;

  const onBarMouseDown = (e, task) => {
    if (linkMode) { handleBarClick(task.id); return; }
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
      const cfDrag = new Set(festivi); setTasks(ts => updTaskFn(ts, dragging.id, "inizio", snapped, cfDrag));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  // ── AI generation ──
  const parsePromptToTasks = (prompt, startDate) => {
    const lines = prompt.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
    const result = [];
    let id = 1;
    const colors = GANTT_COLORS.map(c => c.hex);
    let colorIdx = 0;
    let curr = nextWorkDay(startDate, fs);

    lines.forEach(line => {
      // Pattern: "nome lavoro (Ngg)" or "nome lavoro Ngg" or just "nome lavoro"
      const dMatch = line.match(/\((\d+)\s*gg?\)/i) || line.match(/(\d+)\s*gg?\b/i);
      const durata = dMatch ? parseInt(dMatch[1]) : 5;
      const nome = line.replace(/\(?\d+\s*gg?\)?/i, "").replace(/^\W+|\W+$/g, "").trim() || line;
      const isGroup = /^[A-Z\s]{4,}$/.test(nome) || nome.endsWith(":");
      const color = colors[colorIdx % colors.length];
      if (!isGroup) colorIdx++;
      const fine = addWorkDays(curr, durata, fs);
      result.push({ id: id++, nome: nome.replace(/:$/, "").trim(), durata, inizio: curr, fine, isGroup, color, level: isGroup ? 0 : 1, dep: "" });
      if (!isGroup) curr = nextWorkDay(addDays(fine, 1), fs);
    });
    return result;
  };

  const genAI = () => {
    if (aiMode === "template" && !aiType) return;
    if (aiMode === "prompt" && !aiPrompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      if (aiMode === "prompt") {
        const gen = parsePromptToTasks(aiPrompt, aiStart);
        setTasks(gen);
      } else {
        const tpl = AI_TEMPLATES[aiType] || AI_TEMPLATES["residenziale"];
        let curr = nextWorkDay(aiStart, fs);
        let id = 1;
        const gen = [];
        tpl.forEach(cat => {
          const cs = curr;
          const catName = aiCustomName && aiType === "personalizzato" ? cat.nome.replace("FASE", aiCustomName) : cat.nome;
          gen.push({ id: id++, nome: catName, durata: cat.durata, inizio: cs, fine: addWorkDays(cs, cat.durata, fs), isGroup: true, color: cat.color, level: 0, dep: "" });
          let ss = cs;
          const sd = Math.max(1, Math.floor(cat.durata / cat.subs.length));
          cat.subs.forEach((sub, si) => {
            const se = si === cat.subs.length - 1 ? addWorkDays(cs, cat.durata, fs) : addWorkDays(ss, sd, fs);
            gen.push({ id: id++, nome: sub, durata: sd, inizio: ss, fine: se, isGroup: false, color: cat.color, level: 1, dep: "" });
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
  const allDates = tasks.flatMap(t => [new Date(t.inizio), new Date(t.fine)]);
  const minDate = allDates.length ? new Date(Math.min(...allDates)) : new Date(today);
  const maxDate = allDates.length ? new Date(Math.max(...allDates)) : new Date(addDays(today, 60));
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 10);
  const totalDays = diffD(minDate.toISOString().split("T")[0], maxDate.toISOString().split("T")[0]);
  const getX = ds => diffD(minDate.toISOString().split("T")[0], ds) * DAY_W;
  const getW = (s, e) => Math.max((diffD(s, e) + 1) * DAY_W, DAY_W * 2);
  const todayX = getX(today);

  // Month headers
  const months = [];
  let mcur = new Date(minDate);
  while (mcur <= maxDate) {
    const ms = new Date(mcur); const y = mcur.getFullYear(), m = mcur.getMonth();
    const nm = new Date(y, m + 1, 1);
    const end = nm > maxDate ? new Date(maxDate) : new Date(nm.getTime() - 86400000);
    const days = diffD(ms.toISOString().split("T")[0], end.toISOString().split("T")[0]) + 1;
    months.push({ label: ms.toLocaleDateString("it-CH", { month: "long" }), days, x: getX(ms.toISOString().split("T")[0]) });
    mcur = new Date(y, m + 1, 1);
  }

  // ── Export Excel ──
  const exportExcel = () => {
    try {
      const XLSX = window.XLSX || (typeof require !== "undefined" ? require("xlsx") : null);
      if (!XLSX) { alert("Libreria XLSX non disponibile in questo ambiente. Copia i dati manualmente."); return; }
      const ws_data = [
        ["#", "Nome attività", "Tipo", "Livello", "Inizio", "Fine", "Durata (gg lav.)", "Dipende da"],
        ...tasks.map((t, i) => [
          i + 1, t.nome, t.isGroup ? "Categoria" : "Attività", t.level,
          fmtD(t.inizio), fmtD(t.fine), t.durata,
          t.dep ? (tasks.findIndex(x => x.id === parseInt(t.dep)) + 1) || "" : ""
        ])
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      ws["!cols"] = [{ wch: 4 }, { wch: 35 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Programma Lavori");
      XLSX.writeFile(wb, (pName || "programma_lavori") + ".xlsx");
    } catch (e) {
      alert("Errore esportazione Excel: " + e.message);
    }
  };

  // ── Export PDF (print) ──
  const exportPDF = () => {
    const style = document.createElement("style");
    style.id = "gantt-print-style";
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

    const area = document.createElement("div");
    area.id = "gantt-print-area";
    area.innerHTML = `
      <div style="font-family:Arial,sans-serif;padding:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:2px solid #2563eb;padding-bottom:8px">
          <div>
            <div style="font-size:18px;font-weight:800;color:#0f172a">${pName || "Programma Lavori"}</div>
            <div style="font-size:11px;color:#64748b">${[pClient, pLoc].filter(Boolean).join(" · ")}</div>
          </div>
          <div style="text-align:right;font-size:10px;color:#64748b">Edilslab · ${fmtD(today)}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:10px">
          <thead>
            <tr style="background:#e2e7ef">
              <th style="padding:5px 8px;text-align:left;border:1px solid #c4ccd8;width:30px">#</th>
              <th style="padding:5px 8px;text-align:left;border:1px solid #c4ccd8;min-width:180px">Attività</th>
              <th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:70px">Inizio</th>
              <th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:70px">Fine</th>
              <th style="padding:5px 8px;text-align:center;border:1px solid #c4ccd8;width:40px">GG</th>
              ${months.map(m => `<th style="padding:5px 4px;text-align:center;border:1px solid #c4ccd8;min-width:${m.days * 4}px;font-weight:600;color:#2563eb">${m.label}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tasks.map((t, i) => {
              const bar_left = getX(t.inizio);
              const bar_width = getW(t.inizio, t.fine);
              const total_w = totalDays * 4;
              return `<tr style="background:${i%2===0?"#f8fafc":"#fff"}">
                <td style="padding:4px 6px;border:1px solid #e2e7ef;color:#94a3b8;text-align:center">${i+1}</td>
                <td style="padding:4px 6px;border:1px solid #e2e7ef;font-weight:${t.isGroup?700:400};color:${t.isGroup?t.color:"#0f172a"};padding-left:${8+t.level*12}px">${t.isGroup?"▶ ":""}${t.nome}</td>
                <td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;color:#64748b">${fmtD(t.inizio)}</td>
                <td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;color:#64748b">${fmtD(t.fine)}</td>
                <td style="padding:4px 6px;border:1px solid #e2e7ef;text-align:center;font-weight:600;color:${t.color}">${t.durata}</td>
                <td colspan="${months.length}" style="padding:2px;border:1px solid #e2e7ef;position:relative;height:22px">
                  <div style="position:relative;width:${total_w}px;height:18px">
                    <div style="position:absolute;left:${bar_left/DAY_W*4}px;width:${bar_width/DAY_W*4}px;height:14px;top:2px;background:${t.color};border-radius:3px;opacity:0.85"></div>
                  </div>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
        <div style="margin-top:10px;font-size:9px;color:#94a3b8">Cronoprogramma indicativo · Generato da Edilslab · ${fmtD(today)}</div>
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
  const pc = { background: "#dce1ea", border: "1px solid " + T.border, borderRadius: 14, padding: 20, marginBottom: 14, boxShadow: T.shadow };
  const iL = { display: "block", fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 5 };
  const totalWorkDays = Math.round(tasks.filter(t => !t.isGroup).reduce((s, t) => s + parseDurata(t.durata), 0)*10)/10;
  const projectStart = tasks.length ? tasks.reduce((a, b) => a.inizio < b.inizio ? a : b).inizio : null;
  const projectEnd = tasks.length ? tasks.reduce((a, b) => a.fine > b.fine ? a : b).fine : null;

  return (
    <div style={{ userSelect: dragging ? "none" : "auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{pName || "Programma Lavori"}</div>
          <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
            {[pClient, pLoc].filter(Boolean).join(" · ")}
            {projectStart && projectEnd && <span> · {fmtDLong(projectStart)} → {fmtDLong(projectEnd)}</span>}
            {tasks.length > 0 && <span style={{ color: T.blue, fontWeight: 600 }}> · {tasks.filter(t=>!t.isGroup).length} attività, {totalWorkDays} gg lav.</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "info", label: "⚙ Progetto", col: T.blue },
            { id: "ai", label: "✦ Genera AI", col: T.purple },
            { id: "add", label: "+ Attività", col: T.green },
            { id: "deps", label: "⛓ Dipendenze", col: T.purple },
            { id: "festivi", label: "📅 Festivi", col: T.amber },
          ].map(b => (
            <button key={b.id} onClick={() => setPanel(panel === b.id ? null : b.id)} style={{
              padding: "8px 13px", background: panel === b.id ? b.col : "#dce1ea",
              color: panel === b.id ? "#fff" : T.textSub,
              border: "1.5px solid " + (panel === b.id ? b.col : T.border),
              borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>{b.label}</button>
          ))}
          <button onClick={() => { setLinkMode(v => !v); setLinkFrom(null); }} style={{
            padding: "8px 13px",
            background: linkMode ? T.purple : "#dce1ea",
            color: linkMode ? "#fff" : T.textSub,
            border: "1.5px solid " + (linkMode ? T.purple : T.border),
            borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer",
          }} title="Clicca prima barra poi seconda per collegare">⛓ Collega</button>
          {tasks.length > 0 && <>
            <button onClick={exportPDF} style={{ padding: "8px 13px", background: "#fef2f2", color: T.red, border: "1.5px solid #fecaca", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>⬇ PDF</button>
            <button onClick={exportExcel} style={{ padding: "8px 13px", background: "#f0fdf4", color: T.green, border: "1.5px solid #bbf7d0", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>⬇ Excel</button>
          </>}
        </div>
      </div>

      {/* Link mode banner */}
      {linkMode && (
        <div style={{ marginBottom: 12, padding: "10px 16px", background: T.purple + "15", border: "1.5px solid " + T.purple + "40", borderRadius: 10, fontSize: 13, color: T.purple, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          ⛓ {linkFrom ? `Collegato da #${tasks.findIndex(x=>x.id===linkFrom)+1} → ora clicca il SUCCESSORE (o ri-clicca per deselezionare)` : "Clicca il PREDECESSORE — poi clicca il successore. Continua a catena senza uscire."}
          <button onClick={() => { setLinkMode(false); setLinkFrom(null); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: T.purple, fontWeight: 800, fontSize: 16 }}>×</button>
        </div>
      )}

      {/* ── Panel: Progetto ── */}
      {panel === "info" && (
        <div style={pc}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 14 }}>Informazioni progetto</div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
            <div><label style={iL}>Nome progetto</label><input style={inp} value={pName} onChange={e => setPName(e.target.value)} placeholder="es. Condominio Portland" /></div>
            <div><label style={iL}>Committente</label><input style={inp} value={pClient} onChange={e => setPClient(e.target.value)} placeholder="es. Mario Rossi SA" /></div>
            <div><label style={iL}>Località</label><input style={inp} value={pLoc} onChange={e => setPLoc(e.target.value)} placeholder="es. Locarno, CH-6600" /></div>
          </div>
        </div>
      )}

      {/* ── Panel: Festivi ── */}
      {panel === "festivi" && (
        <div style={pc}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 4 }}>Giorni festivi</div>
          <div style={{ fontSize: 12, color: T.textSub, marginBottom: 12 }}>Sabati e domeniche esclusi automaticamente.</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}><label style={iL}>Aggiungi festivo</label><input style={inp} type="date" value={newFest} onChange={e => setNewFest(e.target.value)} /></div>
            <button onClick={() => { if (!newFest || festivi.includes(newFest)) return; setFestivi(f => [...f, newFest].sort()); setNewFest(""); }} style={{ padding: "11px 16px", background: T.gradBlue, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Aggiungi</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {festivi.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#fff", border: "1px solid #fde68a", borderRadius: 8, fontSize: 12 }}>
                <span style={{ color: T.amber, fontWeight: 600 }}>{fmtD(f)}</span>
                <div onClick={() => setFestivi(fv => fv.filter(x => x !== f))} style={{ cursor: "pointer", color: T.red, fontWeight: 800 }}>×</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel: Genera AI ── */}
      {/* ── Panel: Dipendenze ── */}

      {/* ── Panel: Dipendenze ── */}
      {panel === "deps" && tasks.length > 0 && (
        <div style={{ background: "#dce1ea", border: "1.5px solid " + T.purple + "40", borderRadius: 14, padding: 20, marginBottom: 14, boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, background: T.gradPurple, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>⛓</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Gestione dipendenze</div>
              <div style={{ fontSize: 11, color: T.textSub }}>Imposta quale attività deve finire prima che un altra inizi. Le date si aggiornano automaticamente.</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr 36px", gap: 8, alignItems: "center", marginBottom: 8, padding: "6px 10px", background: "#c8d0dc", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textSub }}>Questa attivita inizia dopo →</div>
            <div />
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textSub }}>← questa finisce prima</div>
            <div />
          </div>
          {tasks.map((t, ti) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr 36px", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ padding: "8px 12px", background: t.dep ? T.purple + "10" : "#d6dce6", border: "1.5px solid " + (t.dep ? T.purple + "40" : T.border), borderRadius: 9, fontSize: 12, fontWeight: 600, color: t.dep ? T.purple : T.textSub, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ti + 1}. {t.nome}</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 18, color: t.dep ? T.purple : T.textMuted, fontWeight: 800 }}>←</div>
              <select
                value={t.dep || ""}
                onChange={e => {
                  const cfDeps = new Set(festivi);
                  setTasks(ts => applyDepsWithFs(ts.map(x => x.id === t.id ? { ...x, dep: e.target.value } : x), cfDeps));
                }}
                style={{ padding: "8px 10px", border: "1.5px solid " + (t.dep ? T.purple + "40" : T.border), borderRadius: 9, fontSize: 12, outline: "none", background: t.dep ? T.purple + "08" : "#dce1ea", color: T.text, cursor: "pointer", fontWeight: t.dep ? 600 : 400 }}
              >
                <option value="">— nessun predecessore —</option>
                {tasks.filter(x => x.id !== t.id).map((x, xi) => (
                  <option key={x.id} value={x.id}>{xi + 1}. {x.nome.substring(0, 28)}</option>
                ))}
              </select>
              {t.dep
                ? <button onClick={() => removeLink(t.id)} title="Rimuovi collegamento" style={{ width: 36, height: 36, borderRadius: 9, background: "#fef2f2", color: T.red, border: "1px solid #fecaca", cursor: "pointer", fontSize: 18, fontWeight: 800 }}>×</button>
                : <div style={{ width: 36 }} />
              }
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "9px 13px", background: "#f5f3ff", borderRadius: 9, fontSize: 12, color: "#5b21b6", border: "1px solid #ddd6fe" }}>
            Ogni modifica aggiorna subito le date di tutte le attivita collegate a cascata.
          </div>
        </div>
      )}
      {panel === "deps" && tasks.length === 0 && (
        <div style={{ padding: "16px 20px", background: "#dce1ea", border: "1px solid " + T.border, borderRadius: 14, marginBottom: 14, fontSize: 13, color: T.textSub }}>
          Aggiungi prima delle attivita per gestire le dipendenze.
        </div>
      )}

      {panel === "ai" && (
        <div style={{ ...pc, border: "1.5px solid " + T.purple + "40" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, background: T.gradPurple, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={PATHS.spark} size={16} stroke="#fff" /></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Genera programma con AI</div>
          </div>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[{ id: "template", label: "📋 Da template" }, { id: "prompt", label: "✍️ Da testo libero" }].map(m => (
              <button key={m.id} onClick={() => setAiMode(m.id)} style={{
                padding: "8px 16px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: aiMode === m.id ? T.purple : "#d6dce6",
                color: aiMode === m.id ? "#fff" : T.textSub,
                border: "1.5px solid " + (aiMode === m.id ? T.purple : T.border),
              }}>{m.label}</button>
            ))}
          </div>
          {aiMode === "template" ? (
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr 1fr", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={iL}>Tipo di lavoro</label>
                <select style={{ ...inp, cursor: "pointer" }} value={aiType} onChange={e => setAiType(e.target.value)}>
                  <option value="">Seleziona tipo...</option>
                  <option value="residenziale">🏗 Nuova costruzione residenziale</option>
                  <option value="ristrutturazione">🔨 Ristrutturazione / Risanamento</option>
                  <option value="copertura">🏠 Rifacimento copertura</option>
                  <option value="impermeabilizzazione">💧 Impermeabilizzazione terrazza</option>
                  <option value="facciata">🧱 Risanamento facciata</option>
                  <option value="sottosuolo">⛏ Opere sottosuolo / fondazioni</option>
                  <option value="personalizzato">✏️ Personalizzato (nome libero)</option>
                </select>
              </div>
              {aiType === "personalizzato" && (
                <div>
                  <label style={iL}>Nome del tipo di lavoro</label>
                  <input style={inp} placeholder="es. Riqualifica energetica" value={aiCustomName} onChange={e => setAiCustomName(e.target.value)} />
                </div>
              )}
              <div>
                <label style={iL}>Data inizio</label>
                <input style={inp} type="date" value={aiStart} onChange={e => setAiStart(e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <label style={iL}>Descrivi il lavoro con attività e durate</label>
              <textarea
                style={{ ...inp, minHeight: 120, resize: "vertical", lineHeight: 1.6, marginBottom: 8 }}
                placeholder={"Esempio:\nMontaggio ponteggi (2gg)\nOpere da pittore (6gg)\nSmontaggio ponteggi (2gg)\nCollaudo finale (1gg)"}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
                Scrivi ogni attività su una riga o separata da virgola/punto e virgola. Indica la durata tra parentesi es. <code>(5gg)</code>.
              </div>
              <div>
                <label style={iL}>Data inizio</label>
                <input style={{ ...inp, maxWidth: 200 }} type="date" value={aiStart} onChange={e => setAiStart(e.target.value)} />
              </div>
            </div>
          )}
          <button onClick={genAI} disabled={generating || (aiMode === "template" ? !aiType : !aiPrompt.trim())} style={{
            marginTop: 14, padding: "11px 24px", background: generating ? "#c4ccd8" : T.gradPurple,
            color: generating ? T.textMuted : "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: generating ? "default" : "pointer",
          }}>{generating ? "Generazione..." : "✦ Genera programma"}</button>
        </div>
      )}

      {/* ── Panel: Aggiungi attività ── */}
      {panel === "add" && (
        <div style={{ ...pc, border: "1.5px solid " + T.green + "40" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#047857,#059669)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={PATHS.plus} size={16} stroke="#fff" /></div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Aggiungi attività</div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: T.textMuted }}>Premi Invio per aggiungere più attività in fila</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label style={iL}>Nome *</label>
              <input style={inp} placeholder="es. Posa ponteggio esterno" value={nt.nome} onChange={e => setNt(n => ({ ...n, nome: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTask()} autoFocus />
            </div>
            <div>
              <label style={iL}>Data inizio</label>
              <input style={inp} type="date" value={nt.inizio} onChange={e => setNt(n => ({ ...n, inizio: e.target.value }))} />
            </div>
            <div>
              <label style={iL}>Durata (gg lav.)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setNt(n => {const d=parseDurata(n.durata);const nd=Math.max(0.5,d-( d<=1?0.5:d<=5?1:5));return{...n,durata:fmtDurata(nd)};})} style={{ width: 34, height: 44, borderRadius: 8, border: "1.5px solid " + T.border, background: "#d6dce6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>−</button>
                <input style={{ ...inp, textAlign: "center", fontWeight: 700 }} type="number" min="1" value={nt.durata} onChange={e => setNt(n => ({ ...n, durata: parseInt(e.target.value) || 1 }))} />
                <button onClick={() => setNt(n => {const d=parseDurata(n.durata);const nd=d+(d<1?0.5:d<5?1:5);return{...n,durata:fmtDurata(nd)};})} style={{ width: 34, height: 44, borderRadius: 8, border: "1.5px solid " + T.border, background: "#d6dce6", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            </div>
            <div>
              <label style={iL}>Colore</label>
              <ColorPicker value={nt.color} onChange={c => setNt(n => ({ ...n, color: c }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Tipo</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ v: false, l: "Attività" }, { v: true, l: "Categoria" }].map(opt => (
                  <div key={String(opt.v)} onClick={() => setNt(n => ({ ...n, isGroup: opt.v, level: opt.v ? 0 : 1 }))} style={{
                    flex: 1, padding: "9px", borderRadius: 9, cursor: "pointer", textAlign: "center",
                    background: nt.isGroup === opt.v ? nt.color + "20" : "#d6dce6",
                    border: "1.5px solid " + (nt.isGroup === opt.v ? nt.color : T.border),
                    fontSize: 12, fontWeight: 600, color: nt.isGroup === opt.v ? nt.color : T.textSub,
                  }}>{opt.l}</div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Livello rientro</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={() => setNt(n => ({ ...n, level: Math.max(0, n.level - 1) }))} style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid " + T.border, background: "#d6dce6", cursor: "pointer", fontWeight: 700 }}>←</button>
                <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.text }}>Livello {nt.level}</div>
                <button onClick={() => setNt(n => ({ ...n, level: Math.min(3, n.level + 1) }))} style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid " + T.border, background: "#d6dce6", cursor: "pointer", fontWeight: 700 }}>→</button>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={iL}>Dipende da</label>
              <select style={{ ...inp, cursor: "pointer" }} value={nt.dep} onChange={e => setNt(n => ({ ...n, dep: e.target.value }))}>
                <option value="">Nessuna</option>
                {tasks.map((t, i) => <option key={t.id} value={t.id}>{i + 1}. {t.nome.substring(0, 22)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addTask} style={{ flex: 1, padding: 12, background: T.gradBlue, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Aggiungi</button>
            <button onClick={() => setPanel(null)} style={{ padding: "12px 18px", background: "#d6dce6", color: T.textSub, border: "1px solid " + T.border, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Chiudi</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
            💡 Usa <strong>Tab</strong> (←/→) per cambiare rientro. Usa il pulsante <strong>⛓ Collega</strong> per le dipendenze visive nel Gantt.
          </div>
        </div>
      )}

      {/* ── GANTT TABLE ── */}
      <div ref={ganttRef} style={{ background: "#dce1ea", border: "1px solid " + T.border, borderRadius: 16, overflow: "hidden", boxShadow: T.shadowMd }}>
        {/* Header */}
        <div style={{ background: T.gradBlue, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{pName || "Programma Lavori"}</div>
            {(pClient || pLoc) && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{[pClient, pLoc].filter(Boolean).join(" · ")}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {tasks.length > 0 && (
              <button onClick={propagate} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, fontWeight: 600, fontSize: 11, cursor: "pointer" }}>↻ Aggiorna dipendenze</button>
            )}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{fmtD(today)}</div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ padding: "56px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>Programma vuoto</div>
            <div style={{ fontSize: 13, color: T.textSub, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              Genera automaticamente con AI oppure aggiungi le attività manualmente.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setPanel("ai")} style={{ padding: "10px 22px", background: T.gradPurple, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>✦ Genera con AI</button>
              <button onClick={() => setPanel("add")} style={{ padding: "10px 22px", background: T.gradBlue, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Aggiungi attività</button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: LEFT_W + totalDays * DAY_W + 20 }}>

              {/* Intestazione mesi */}
              <div style={{ display: "flex", borderBottom: "1px solid " + T.border, background: "#c8d0dc" }}>
                <div style={{ width: LEFT_W, flexShrink: 0, borderRight: "2px solid " + T.border, height: 26, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, fontWeight: 700, color: T.textSub }}>
                  Attività / {tasks.length} righe
                </div>
                <div style={{ position: "relative", flex: 1, height: 26 }}>
                  {months.map((m, i) => (
                    <div key={i} style={{
                      position: "absolute", left: m.x, top: 0, width: m.days * DAY_W, height: "100%",
                      borderRight: "1px solid " + T.border + "60",
                      fontSize: 11, fontWeight: 700, color: T.blue, paddingLeft: 5,
                      display: "flex", alignItems: "center", textTransform: "capitalize",
                      background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                    }}>{m.label}</div>
                  ))}
                  {todayX >= 0 && <div style={{ position: "absolute", left: todayX, top: 0, width: 2, height: "100%", background: "#ef4444", opacity: 0.7 }} />}
                </div>
              </div>

              {/* Riga giorni */}
              <div style={{ display: "flex", borderBottom: "2px solid " + T.border, background: "#cdd3dc" }}>
                <div style={{ width: LEFT_W, flexShrink: 0, borderRight: "2px solid " + T.border, height: 18 }} />
                <div style={{ display: "flex" }}>
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const d = new Date(minDate); d.setDate(d.getDate() + i);
                    const ds = d.toISOString().split("T")[0];
                    const isWE = d.getDay() === 0 || d.getDay() === 6;
                    const isFest = fs.has(ds);
                    return <div key={i} style={{ width: DAY_W, flexShrink: 0, fontSize: 7, textAlign: "center", color: isWE || isFest ? "#dc2626" : T.textMuted, background: isFest ? "rgba(220,38,38,0.15)" : isWE ? "rgba(220,38,38,0.06)" : "transparent", borderRight: "1px solid " + T.border + "10", paddingTop: 2 }}>{"DLMMGVS"[d.getDay()]}</div>;
                  })}
                </div>
              </div>

              {/* Righe attività */}
              {tasks.map((task, ti) => {
                const predTask = task.dep ? tasks.find(x => x.id === parseInt(task.dep)) : null;
                const isEditing = editingId === task.id;
                const indentPx = task.level * 14;

                return (
                  <div key={task.id} style={{
                    display: "flex",
                    borderBottom: "1px solid " + T.border + "50",
                    background: task.isGroup ? task.color + "08" : (linkFrom === task.id ? T.purple + "10" : "transparent"),
                    minHeight: isEditing ? "auto" : ROW_H,
                    outline: linkFrom === task.id ? "2px solid " + T.purple : "none",
                  }}>
                    {/* ── Left column ── */}
                    <div style={{ width: LEFT_W, flexShrink: 0, borderRight: "2px solid " + T.border }}>
                      {isEditing ? (
                        <div style={{ padding: "8px 8px 10px" }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <input autoFocus style={{ ...inp, fontSize: 12, padding: "5px 8px", flex: 1 }} value={task.nome} onChange={e => updTask(task.id, "nome", e.target.value)} />
                            <button onClick={() => setEditingId(null)} style={{ padding: "5px 12px", background: T.gradBlue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✓</button>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 80 }}>
                              <span style={{ fontSize: 9, color: T.textMuted }}>Inizio</span>
                              <input type="date" style={{ ...inp, fontSize: 11, padding: "4px 6px" }} value={task.inizio} onChange={e => updTask(task.id, "inizio", e.target.value)} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 80 }}>
                              <span style={{ fontSize: 9, color: T.textMuted }}>Fine</span>
                              <input type="date" style={{ ...inp, fontSize: 11, padding: "4px 6px" }} value={task.fine} onChange={e => updTask(task.id, "fine", e.target.value)} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, width: 56 }}>
                              <span style={{ fontSize: 9, color: T.textMuted }}>GG</span>
                              <input type="text" placeholder="es. 1, 4h, 2w" style={{ ...inp, fontSize: 12, padding: "4px 6px", textAlign: "center" }} value={task.durata} onChange={e => updTask(task.id, "durata", e.target.value)} title="4h=4 ore, 0.5=mezza giornata, 3=3 giorni, 2w=2 settimane, 1m=1 mese" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 9, color: T.textMuted }}>Colore</span>
                              <ColorPicker value={task.color} onChange={c => updTask(task.id, "color", c)} size="sm" />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 100 }}>
                              <span style={{ fontSize: 9, color: T.textMuted, display: "block", marginBottom: 2 }}>Dipende da</span>
                              <div style={{ padding: "5px 8px", background: "#d6dce6", borderRadius: 8, fontSize: 11, color: task.dep ? T.purple : T.textMuted, border: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                                {task.dep
                                  ? <><span style={{fontWeight:600}}>#{tasks.findIndex(x=>x.id===parseInt(task.dep))+1} {(tasks.find(x=>x.id===parseInt(task.dep))?.nome||"").substring(0,16)}</span><div onClick={()=>removeLink(task.id)} style={{cursor:"pointer",color:T.red,fontWeight:800,fontSize:13}}>×</div></>
                                  : <span style={{color:T.textMuted}}>Usa ⛓ Collega</span>
                                }
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
                              <button onClick={() => outdentTask(task.id)} title="Riduce rientro" style={{ padding: "5px 8px", background: "#d6dce6", border: "1px solid " + T.border, borderRadius: 7, cursor: "pointer", fontSize: 12 }}>←</button>
                              <button onClick={() => indentTask(task.id)} title="Aumenta rientro" style={{ padding: "5px 8px", background: "#d6dce6", border: "1px solid " + T.border, borderRadius: 7, cursor: "pointer", fontSize: 12 }}>→</button>
                              <button onClick={() => duplicateTask(task.id)} title="Duplica" style={{ padding: "5px 8px", background: "#d6dce6", border: "1px solid " + T.border, borderRadius: 7, cursor: "pointer", fontSize: 12 }}>⎘</button>
                              <button onClick={() => { delTask(task.id); setEditingId(null); }} title="Elimina" style={{ padding: "5px 8px", background: "#fef2f2", color: T.red, border: "1px solid #fecaca", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>✕</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", height: ROW_H, padding: "0 4px" }}>
                          <div style={{ width: 22, flexShrink: 0, textAlign: "center", fontSize: 10, color: T.textMuted }}>{ti + 1}</div>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: task.color, flexShrink: 0, margin: "0 5px" }} />
                          <div style={{
                            flex: 1, fontSize: task.isGroup ? 12 : 11, fontWeight: task.isGroup ? 800 : 400,
                            color: task.isGroup ? task.color : T.text,
                            paddingLeft: indentPx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {task.isGroup && <span style={{ marginRight: 3, fontSize: 9 }}>▶</span>}
                            {task.nome}
                          </div>
                          {!mob && <div style={{ fontSize: 10, color: T.textMuted, flexShrink: 0, textAlign: "right", marginRight: 2 }}>
                            <div>{fmtD(task.inizio)}</div>
                            <div style={{ color: task.color, fontWeight: 600 }}>{fmtDurata(parseDurata(task.durata))}</div>
                          </div>}
                          <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
                            <div onClick={() => setEditingId(task.id)} title="Modifica" style={{ cursor: "pointer", color: T.textMuted, padding: "3px" }}><Icon d={PATHS.edit} size={12} /></div>
                            <div onClick={() => moveUp(task.id)} style={{ cursor: "pointer", color: T.textMuted, padding: "3px" }}><Icon d={PATHS.arrowUp} size={11} /></div>
                            <div onClick={() => moveDown(task.id)} style={{ cursor: "pointer", color: T.textMuted, padding: "3px" }}><Icon d={PATHS.arrowDown} size={11} /></div>
                            <div onClick={() => delTask(task.id)} style={{ cursor: "pointer", color: T.red, padding: "3px" }}><Icon d={PATHS.trash} size={12} /></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Right: Gantt bars ── */}
                    <div style={{ flex: 1, position: "relative", minHeight: ROW_H, cursor: linkMode ? "crosshair" : "default" }}>
                      {/* weekend/festivi stripes */}
                      {Array.from({ length: totalDays }).map((_, i) => {
                        const d = new Date(minDate); d.setDate(d.getDate() + i);
                        const ds = d.toISOString().split("T")[0];
                        const isWE = d.getDay() === 0 || d.getDay() === 6;
                        const isFest = fs.has(ds);
                        if (!isWE && !isFest) return null;
                        return <div key={i} style={{ position: "absolute", left: i * DAY_W, top: 0, width: DAY_W, height: "100%", background: isFest ? "rgba(220,38,38,0.09)" : "rgba(220,38,38,0.04)" }} />;
                      })}
                      {/* Today line */}
                      {todayX >= 0 && todayX <= totalDays * DAY_W && <div style={{ position: "absolute", left: todayX, top: 0, width: 2, height: "100%", background: "#ef4444", zIndex: 3, opacity: 0.7 }} />}
                      {/* Dependency arrow */}
                      {predTask && (() => {
                        const pe = getX(predTask.fine) + DAY_W;
                        const cs = getX(task.inizio);
                        const my = ROW_H / 2;
                        return (
                          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_H, overflow: "visible", zIndex: 1, pointerEvents: "none" }}>
                            <line x1={pe} y1={my} x2={cs} y2={my} stroke={task.color} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                            <polygon points={`${cs},${my} ${cs-5},${my-3} ${cs-5},${my+3}`} fill={task.color} opacity="0.7" />
                          </svg>
                        );
                      })()}
                      {/* Gantt bar */}
                      <div
                        style={{
                          position: "absolute",
                          left: getX(task.inizio),
                          top: task.isGroup ? 9 : 11,
                          width: getW(task.inizio, task.fine),
                          height: task.isGroup ? 20 : 16,
                          background: task.isGroup ? task.color : task.color + "dd",
                          borderRadius: task.isGroup ? 4 : 8,
                          zIndex: 2,
                          cursor: linkMode ? "crosshair" : (dragging ? "grabbing" : "grab"),
                          boxShadow: "0 1px 4px " + task.color + "50",
                          border: linkFrom === task.id ? "2px solid " + T.purple : "none",
                        }}
                        onMouseDown={e => onBarMouseDown(e, task)}
                        onClick={() => linkMode && handleBarClick(task.id)}
                        title={`${task.nome} · ${fmtDurata(parseDurata(task.durata))} · ${fmtD(task.inizio)} → ${fmtD(task.fine)}`}
                      >
                        {task.isGroup && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.15) 4px,rgba(255,255,255,0.15) 8px)", borderRadius: 4 }} />}
                        {getW(task.inizio, task.fine) > 44 && (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9, color: "rgba(255,255,255,0.95)", fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap" }}>
                            {task.nome}
                          </div>
                        )}
                      </div>
                      {/* End date label */}
                      <div style={{ position: "absolute", left: getX(task.inizio) + getW(task.inizio, task.fine) + 3, top: task.isGroup ? 13 : 14, fontSize: 8, color: task.color, fontWeight: 600, whiteSpace: "nowrap", zIndex: 1, pointerEvents: "none" }}>
                        {fmtD(task.fine)}
                      </div>
                      {/* Remove link button */}
                      {task.dep && !linkMode && (
                        <div onClick={() => removeLink(task.id)} title="Rimuovi dipendenza" style={{
                          position: "absolute", left: getX(task.inizio) - 14, top: ROW_H / 2 - 7,
                          width: 14, height: 14, borderRadius: "50%", background: T.red, color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800,
                          cursor: "pointer", zIndex: 4, opacity: 0.7,
                        }}>×</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div style={{ padding: "8px 18px", background: "#cdd3dc", borderTop: "1px solid " + T.border, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 10, color: T.textMuted }}>
                  Trascina le barre · Clicca ✎ per modificare · ⛓ per collegare · Edilslab {fmtD(today)}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.textMuted }}><div style={{ width: 10, height: 7, background: T.red, borderRadius: 2, opacity: 0.25 }} /> festivi</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.textMuted }}><div style={{ width: 2, height: 12, background: T.red }} /> oggi</div>
                  {tasks.some(t => t.dep) && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: T.textMuted }}><svg width="22" height="10"><line x1="0" y1="5" x2="16" y2="5" stroke={T.purple} strokeWidth="1.5" strokeDasharray="3 2" /><polygon points="16,5 11,2 11,8" fill={T.purple} /></svg> dipendenza</div>}
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
function Progetti({user,users,gare,reports,tasks}){
  const mob=useIsMobile();
  const [progetti,setProjetti]=useState(()=>{
    try{const s=localStorage.getItem("es_progetti");return s?JSON.parse(s):[];}catch(e){return[];}
  });
  const [view,setView]=useState("list"); // list | detail | new
  const [sel,setSel]=useState(null);
  const [newNome,setNewNome]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [newPriv,setNewPriv]=useState(true);
  const [condivisoCon,setCondivisoCon]=useState([]);
  const [addingItem,setAddingItem]=useState(false);
  const [itemType,setItemType]=useState("nota");
  const [itemTesto,setItemTesto]=useState("");
  const [editNota,setEditNota]=useState(null);

  const save=(list)=>{setProjetti(list);try{localStorage.setItem("es_progetti",JSON.stringify(list));}catch(e){}};

  const canSee=(p)=>p.owner===user.email||!p.privato||(p.condivisiCon||[]).includes(user.email)||user.role==="admin";

  const visibili=progetti.filter(canSee);

  const creaProgetto=()=>{
    if(!newNome.trim())return;
    const p={id:Date.now(),nome:newNome.trim(),desc:newDesc.trim(),owner:user.email,ownerName:user.name,privato:newPriv,condivisiCon:condivisoCon,creato:new Date().toLocaleDateString("it-CH"),items:[]};
    save([...progetti,p]);
    setNewNome("");setNewDesc("");setNewPriv(true);setCondivisoCon([]);setView("list");
  };

  const delProgetto=(id)=>save(progetti.filter(p=>p.id!==id));

  const addItem=(proj)=>{
    if(!itemTesto.trim())return;
    const item={id:Date.now(),tipo:itemType,testo:itemTesto.trim(),data:new Date().toLocaleDateString("it-CH"),autore:user.name};
    const updated=progetti.map(p=>p.id===proj.id?{...p,items:[...p.items,item]}:p);
    save(updated);setSel(updated.find(p=>p.id===proj.id));
    setItemTesto("");setAddingItem(false);
  };

  const delItem=(proj,itemId)=>{
    const updated=progetti.map(p=>p.id===proj.id?{...p,items:p.items.filter(x=>x.id!==itemId)}:p);
    save(updated);setSel(updated.find(p=>p.id===proj.id));
  };

  const saveNota=(proj,itemId,newText)=>{
    const updated=progetti.map(p=>p.id===proj.id?{...p,items:p.items.map(x=>x.id===itemId?{...x,testo:newText}:x)}:p);
    save(updated);setSel(updated.find(p=>p.id===proj.id));setEditNota(null);
  };

  const toggleCondiviso=(email)=>setCondivisoCon(c=>c.includes(email)?c.filter(x=>x!==email):[...c,email]);

  const tipoColor={nota:"#64748b",graduatoria:T.green,rapporto:T.blue,gantt:"#0891b2",chat:T.purple,documento:T.amber};
  const tipoLabel={nota:"📝 Nota",graduatoria:"📊 Graduatoria",rapporto:"📄 Rapporto",gantt:"📅 Programma",chat:"💬 Chat",documento:"📁 Documento"};
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:22,marginBottom:16,boxShadow:T.shadow};
  const otherUsers=users.filter(u=>u.email!==user.email&&u.status==="approved");

  if(view==="new") return(
    <div style={{maxWidth:560}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Annulla</button>
        <span style={{color:"#b0b8c4"}}>|</span>
        <span style={{fontSize:15,fontWeight:800,color:T.text}}>Nuovo progetto</span>
      </div>
      <div style={pc}>
        <div style={{marginBottom:14}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Nome progetto *</label><input style={inp} placeholder="es. Villa Rossi — Ristrutturazione" value={newNome} onChange={e=>setNewNome(e.target.value)} onKeyDown={e=>e.key==="Enter"&&creaProgetto()} autoFocus/></div>
        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:5}}>Descrizione</label><input style={inp} placeholder="opzionale" value={newDesc} onChange={e=>setNewDesc(e.target.value)}/></div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:8}}>Visibilità</label>
          <div style={{display:"flex",gap:10}}>
            {[{v:true,l:"🔒 Privato",sub:"Solo tu"},{v:false,l:"👥 Condiviso",sub:"Con utenti selezionati"}].map(opt=>(
              <div key={String(opt.v)} onClick={()=>setNewPriv(opt.v)} style={{flex:1,padding:"10px 14px",borderRadius:10,cursor:"pointer",border:"1.5px solid "+(newPriv===opt.v?T.blue:T.border),background:newPriv===opt.v?"#eff6ff":"#d6dce6"}}>
                <div style={{fontSize:13,fontWeight:700,color:newPriv===opt.v?T.blue:T.text}}>{opt.l}</div>
                <div style={{fontSize:11,color:T.textSub}}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>
        {!newPriv&&otherUsers.length>0&&(
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:T.text,marginBottom:8}}>Condividi con</label>
            {otherUsers.map(u=>(
              <div key={u.email} onClick={()=>toggleCondiviso(u.email)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",marginBottom:6,border:"1.5px solid "+(condivisoCon.includes(u.email)?T.blue:T.border),background:condivisoCon.includes(u.email)?"#eff6ff":"#d6dce6"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:T.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0}}>{u.name.split(" ").map(n=>n[0]).join("")}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{u.name}</div><div style={{fontSize:11,color:T.textMuted}}>{u.email}</div></div>
                {condivisoCon.includes(u.email)&&<span style={{color:T.blue,fontWeight:700,fontSize:13}}>✓</span>}
              </div>
            ))}
          </div>
        )}
        <button onClick={creaProgetto} style={btnP}>Crea progetto</button>
      </div>
    </div>
  );

  if(view==="detail"&&sel){
    const myProject=sel.owner===user.email;
    return(
      <div style={{maxWidth:720}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:T.blue,fontSize:13,fontWeight:700,padding:0}}>Indietro</button>
          <span style={{color:"#b0b8c4"}}>|</span>
          <span style={{fontSize:15,fontWeight:800,color:T.text,flex:1}}>{sel.nome}</span>
          <span style={{padding:"3px 10px",borderRadius:10,fontSize:11,fontWeight:700,background:sel.privato?"#f1f5f9":"#eff6ff",color:sel.privato?T.textSub:T.blue}}>{sel.privato?"🔒 Privato":"👥 Condiviso"}</span>
          {myProject&&<button onClick={()=>{setAddingItem(v=>!v);}} style={{padding:"7px 14px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Aggiungi</button>}
        </div>

        {sel.desc&&<div style={{fontSize:13,color:T.textSub,marginBottom:16,padding:"10px 14px",background:"#d6dce6",borderRadius:10}}>{sel.desc}</div>}

        {addingItem&&(
          <div style={{...pc,border:"1.5px solid "+T.blue+"40",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Aggiungi elemento al progetto</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {Object.entries(tipoLabel).map(([k,v])=>(
                <div key={k} onClick={()=>setItemType(k)} style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,border:"1.5px solid "+(itemType===k?tipoColor[k]:T.border),background:itemType===k?tipoColor[k]+"15":"#d6dce6",color:itemType===k?tipoColor[k]:T.textSub}}>{v}</div>
              ))}
            </div>
            <textarea style={{...inp,minHeight:100,resize:"vertical",marginBottom:10}} placeholder={itemType==="nota"?"Scrivi una nota...":itemType==="graduatoria"?"Incolla o descrivi la graduatoria...":itemType==="gantt"?"Descrivi il programma lavori...":"Inserisci il contenuto..."} value={itemTesto} onChange={e=>setItemTesto(e.target.value)}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>addItem(sel)} style={{flex:1,padding:10,background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Aggiungi</button>
              <button onClick={()=>{setAddingItem(false);setItemTesto("");}} style={{padding:"10px 16px",background:"#d6dce6",color:T.textSub,border:"1px solid "+T.border,borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer"}}>Annulla</button>
            </div>
          </div>
        )}

        {sel.items.length===0&&!addingItem&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted}}>
            <div style={{fontSize:32,marginBottom:12}}>📂</div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Progetto vuoto</div>
            <div style={{fontSize:13}}>Aggiungi graduatorie, rapporti, programmi lavori, note e molto altro.</div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sel.items.map(item=>(
            <div key={item.id} style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:12,padding:16,boxShadow:T.shadow}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:(tipoColor[item.tipo]||T.blue)+"15",color:tipoColor[item.tipo]||T.blue,border:"1px solid "+(tipoColor[item.tipo]||T.blue)+"30"}}>{tipoLabel[item.tipo]||item.tipo}</span>
                <span style={{fontSize:11,color:T.textMuted,marginLeft:"auto"}}>{item.autore} · {item.data}</span>
                {myProject&&<>
                  <button onClick={()=>setEditNota(editNota===item.id?null:item.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,padding:3,fontSize:13}}>✎</button>
                  <button onClick={()=>delItem(sel,item.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.red,padding:3,fontSize:13}}>✕</button>
                </>}
              </div>
              {editNota===item.id?(
                <div>
                  <textarea defaultValue={item.testo} id={"nota-"+item.id} style={{...inp,minHeight:80,resize:"vertical",marginBottom:8,fontSize:13}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>saveNota(sel,item.id,document.getElementById("nota-"+item.id).value)} style={{padding:"6px 14px",background:T.green,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Salva</button>
                    <button onClick={()=>setEditNota(null)} style={{padding:"6px 12px",background:"#d6dce6",color:T.textSub,border:"1px solid "+T.border,borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>Annulla</button>
                  </div>
                </div>
              ):(
                <div style={{fontSize:13,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{item.testo}</div>
              )}
            </div>
          ))}
        </div>

        {myProject&&sel.items.length>0&&(
          <div style={{marginTop:12,padding:"10px 14px",background:"#d6dce6",borderRadius:10,fontSize:11,color:T.textMuted,display:"flex",justifyContent:"space-between"}}>
            <span>{sel.items.length} elementi · Creato il {sel.creato}</span>
            {(sel.condivisiCon||[]).length>0&&<span>Condiviso con {sel.condivisiCon.length} utenti</span>}
          </div>
        )}
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:18,fontWeight:800,color:T.text}}>Cartelle Progetto</div><div style={{fontSize:13,color:T.textSub}}>Organizza tutto il materiale per progetto</div></div>
        <button onClick={()=>setView("new")} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}><Icon d={PATHS.plus} size={15}/> Nuovo</button>
      </div>

      {visibili.length===0&&(
        <div style={{textAlign:"center",padding:"48px 20px",background:"#dce1ea",borderRadius:16,border:"1px solid "+T.border}}>
          <div style={{fontSize:40,marginBottom:14}}>📁</div>
          <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:8}}>Nessun progetto</div>
          <div style={{fontSize:13,color:T.textSub,marginBottom:20}}>Crea una cartella per ogni cantiere o progetto e salvaci graduatorie, rapporti, programmi e note.</div>
          <button onClick={()=>setView("new")} style={{padding:"10px 24px",background:T.gradBlue,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Crea il primo progetto</button>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {visibili.map(p=>(
          <div key={p.id} style={{background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:20,boxShadow:T.shadow,cursor:"pointer"}} onClick={()=>{setSel(p);setView("detail");}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#1e40af,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📁</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{padding:"2px 8px",borderRadius:8,fontSize:10,fontWeight:700,background:p.privato?"#f1f5f9":"#eff6ff",color:p.privato?T.textSub:T.blue}}>{p.privato?"🔒":"👥"}</span>
                {p.owner===user.email&&<button onClick={e=>{e.stopPropagation();if(window.confirm("Eliminare il progetto?"))delProgetto(p.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",padding:3}}><Icon d={PATHS.trash} size={14}/></button>}
              </div>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:4}}>{p.nome}</div>
            {p.desc&&<div style={{fontSize:12,color:T.textSub,marginBottom:10}}>{p.desc}</div>}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {Object.entries(tipoLabel).map(([k,v])=>{
                const count=p.items.filter(x=>x.tipo===k).length;
                if(!count)return null;
                return<span key={k} style={{padding:"1px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:(tipoColor[k]||T.blue)+"15",color:tipoColor[k]||T.blue}}>{v.split(" ")[0]} {count}</span>;
              })}
              {p.items.length===0&&<span style={{fontSize:11,color:T.textMuted}}>Vuoto</span>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMuted}}>
              <span>{p.ownerName}</span>
              <span>{p.creato} · {p.items.length} elementi</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function FontiPage({user}){
  const {fonti,add,toggle,remove}=useFonti();
  const [newNome,setNewNome]=useState("");
  const [newUrl,setNewUrl]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [newCat,setNewCat]=useState("Altro");
  const [err,setErr]=useState("");
  const isAdmin=user.role==="admin";
  const cats=[...new Set(fonti.map(f=>f.cat))];
  const pc={background:"#dce1ea",border:"1px solid "+T.border,borderRadius:14,padding:20,marginBottom:16,boxShadow:T.shadow};
  const catColors={"Canton TI":T.blue,"SUVA":T.red,"UPI":T.amber,"SIA":T.purple,"Confederazione":"#0891b2","Appalti":T.green,"Altro":T.textSub};
  const handleAdd=()=>{
    if(!newNome.trim()||!newUrl.trim()){setErr("Nome e URL obbligatori.");return;}
    if(!newUrl.startsWith("http")){setErr("URL non valido.");return;}
    add({nome:newNome.trim(),url:newUrl.trim(),desc:newDesc.trim(),cat:newCat});
    setNewNome("");setNewUrl("");setNewDesc("");setErr("");
  };
  return(<div style={{maxWidth:800}}>
    <div style={{marginBottom:20}}>
      <div style={{fontSize:20,fontWeight:800,color:T.text}}>Fonti e Normative</div>
      <div style={{fontSize:13,color:T.textSub,marginTop:3}}>Le fonti attive vengono consultate automaticamente dalla Chat</div>
    </div>
    {cats.map(cat=>(
      <div key={cat} style={pc}>
        <div style={{fontSize:13,fontWeight:800,color:catColors[cat]||T.textSub,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:catColors[cat]||T.textSub}}/>{cat}
        </div>
        {fonti.filter(f=>f.cat===cat).map(f=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #c4ccd820"}}>
            <div onClick={()=>toggle(f.id)} style={{width:36,height:20,borderRadius:10,background:f.attiva?(catColors[f.cat]||T.blue):"#c4ccd8",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:2,left:f.attiva?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:f.attiva?T.text:T.textMuted}}>{f.nome}</div>
              {f.desc&&<div style={{fontSize:11,color:T.textMuted}}>{f.desc}</div>}
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:T.blue,wordBreak:"break-all"}}>{f.url.length>55?f.url.substring(0,55)+"...":f.url}</a>
            </div>
            {isAdmin&&<button onClick={()=>remove(f.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#b0b8c4",padding:4}}><Icon d={PATHS.trash} size={14}/></button>}
          </div>
        ))}
      </div>
    ))}
    {isAdmin&&(<div style={{...pc,border:"1.5px solid "+T.blue+"40"}}>
      <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:14}}>+ Aggiungi nuova fonte</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:4}}>Nome *</label>
        <input style={inp} placeholder="es. RLCPubb" value={newNome} onChange={e=>{setNewNome(e.target.value);setErr("");}}/></div>
        <div><label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:4}}>Categoria</label>
        <select style={{...inp,cursor:"pointer"}} value={newCat} onChange={e=>setNewCat(e.target.value)}>
          {["Canton TI","SUVA","UPI","SIA","Confederazione","Appalti","Altro"].map(c=><option key={c}>{c}</option>)}
        </select></div>
      </div>
      <div style={{marginBottom:10}}><label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:4}}>URL *</label>
      <input style={inp} placeholder="https://..." value={newUrl} onChange={e=>{setNewUrl(e.target.value);setErr("");}}/></div>
      <div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:4}}>Descrizione</label>
      <input style={inp} placeholder="opzionale" value={newDesc} onChange={e=>setNewDesc(e.target.value)}/></div>
      {err&&<div style={{padding:"8px 12px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,fontSize:12,color:T.red,marginBottom:10}}>{err}</div>}
      <button onClick={handleAdd} style={{...btnP,marginTop:0}}>Aggiungi fonte</button>
    </div>)}
    <div style={{padding:"12px 16px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,fontSize:12,color:"#1e40af"}}>
      💡 Fonti attive = risposte più precise sulle normative locali. Incolla un URL direttamente in chat per leggere una pagina specifica.
    </div>
  </div>);
}

export default function App(){
  // Inject global CSS animations once
  useEffect(()=>{
    if(document.getElementById("es-global-style")) return;
    const s=document.createElement("style");
    s.id="es-global-style";
    s.innerHTML=`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    `;
    document.head.appendChild(s);
  },[]);
  const [screen,setScreen]=useState("home");
  const [user,setUser]=useState(()=>{try{const u=sessionStorage.getItem("es_u");return u?JSON.parse(u):null;}catch(e){return null;}});
  const [page,setPage]=useState("dashboard");
  const [users,setUsers]=useState(INITIAL_USERS);
  const [pending,setPending]=useState(INITIAL_PENDING);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const mob=useIsMobile();

  const [sharedHistory, setSharedHistory] = useState([]);

  const handleDeleteAccount = (email) => {
    // Remove from users list
    setUsers(us => us.filter(u => u.email !== email));
    // Log out
    logout();
  };

  // Carica cronologia condivisa da storage
  useEffect(()=>{
    if(user) setScreen("dashboard");
    try {
      const saved = localStorage.getItem("es_shared_history");
      if(saved) setSharedHistory(JSON.parse(saved));
    } catch(e){}
  },[]);

  const addToHistory = (title, mode, userName) => {
    setSharedHistory(prev => {
      const entry = {id:Date.now(), title, mode, user:userName, date:new Date().toLocaleDateString("it-CH")};
      const updated = [entry, ...prev.filter(h=>h.title!==title)].slice(0,30);
      try { localStorage.setItem("es_shared_history", JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  };
  const login=u=>{setUser(u);setScreen("dashboard");};
  const logout=()=>{setUser(null);setScreen("home");setPage("dashboard");try{sessionStorage.removeItem("es_u");}catch(e){}};
  const addPending=u=>setPending(p=>[...p,u]);
  const approve=email=>{const u=pending.find(p=>p.email===email);if(u){setUsers(us=>[...us,{...u,role:"user",status:"approved"}]);setPending(p=>p.filter(p=>p.email!==email));}};
  const reject=email=>setPending(p=>p.filter(p=>p.email!==email));

  if(screen==="home")return <Homepage onLogin={()=>setScreen("login")} onRegister={()=>setScreen("register")}/>;
  if(screen==="login")return <Login users={users} onLogin={login} onRegister={()=>setScreen("register")}/>;
  if(screen==="register")return <Register users={users} pending={pending} onBack={()=>setScreen("login")} onSuccess={u=>{addPending(u);setScreen("pending");}}/>;
  if(screen==="pending")return <PendingScreen onBack={()=>setScreen("login")}/>;
  if(!user)return <Homepage onLogin={()=>setScreen("login")}/>;

  const navItems=[
    {id:"dashboard",label:"Dashboard",icon:"home"},
    {id:"chat_docs",label:"Chat Documenti",icon:"docs"},
    {id:"chat_ai",label:"Chat Edilizia",icon:"chat"},
    {id:"ranking",label:"Graduatorie",icon:"podio"},
    {id:"gantt",label:"Programma Lavori",icon:"gantt"},
    {id:"reports",label:"Rapporti Tecnici",icon:"file"},
    {id:"verbali",label:"Verbali di Cantiere",icon:"check"},
    ...(user.role==="admin"?[{id:"docs",label:"Gestione Documenti",icon:"folder"}]:[]),
    {id:"progetti",label:"Cartelle Progetto",icon:"folder"},
    {id:"fonti",label:"Fonti e Normative",icon:"link"},
    {id:"profile",label:"Profilo",icon:"user"},
    ...(user.role==="admin"?[{id:"admin",label:"Gestione utenti",icon:"users"}]:[]),
  ];
  const titles={dashboard:"Dashboard",chat_docs:"Chat Documenti",chat_ai:"Chat Edilizia",ranking:"Graduatorie",gantt:"Programma Lavori",reports:"Rapporti Tecnici",verbali:"Verbali di Cantiere",docs:"Documenti",profile:"Profilo",admin:"Gestione utenti",progetti:"Cartelle Progetto",fonti:"Fonti e Normative"};

  const SidebarContent=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"22px 18px 16px",borderBottom:"1px solid "+T.sidebarBorder}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:T.gradBlue,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon d={PATHS.building} size={18} stroke="#fff"/></div>
          <div><div style={{color:"#f1f5f9",fontWeight:800,fontSize:17}}>Edilslab</div><div style={{color:"#475569",fontSize:10}}>Svizzera Italiana</div></div>
          {mob&&<div onClick={()=>setSidebarOpen(false)} style={{marginLeft:"auto",color:"#475569",cursor:"pointer"}}><Icon d={PATHS.close} size={18}/></div>}
        </div>
      </div>
      <div style={{padding:"14px 10px",flex:1,overflow:"auto"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:"1px",padding:"0 8px",marginBottom:8}}>Menu</div>
        {navItems.map(n=>(<div key={n.id} onClick={()=>{setPage(n.id);setSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",marginBottom:2,background:page===n.id?"rgba(59,130,246,0.15)":"transparent",color:page===n.id?"#60a5fa":"#64748b",fontSize:13,fontWeight:page===n.id?700:400}}>
          <Icon d={PATHS[n.icon]} size={16}/>{n.label}
          {n.id==="admin"&&pending.length>0&&<span style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",background:T.amber,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{pending.length}</span>}
        </div>))}
        <div style={{fontSize:10,fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:"1px",padding:"12px 8px 8px",marginTop:4}}>Recenti</div>
        {sharedHistory.length===0&&<div style={{fontSize:11,color:"#334155",padding:"4px 12px",fontStyle:"italic"}}>Nessuna conversazione</div>}
        {sharedHistory.slice(0,8).map(h=>(<div key={h.id} onClick={()=>{setPage(h.mode==="docs"?"chat_docs":"chat_ai");setSidebarOpen(false);}} style={{padding:"7px 12px",borderRadius:7,cursor:"pointer",marginBottom:2,color:"#475569",fontSize:12,display:"flex",alignItems:"center",gap:7}}><Icon d={PATHS.clock} size={12}/><div style={{minWidth:0}}><div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#94a3b8",fontSize:10}}>{h.user}</div><div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{h.title}</div></div><span style={{fontSize:10,color:"#334155",flexShrink:0,marginLeft:4}}>{h.date}</span></div>))}
      </div>
      <div style={{padding:"14px 10px",borderTop:"1px solid "+T.sidebarBorder}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,0.04)"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:T.gradBlue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0}}>{user.name.split(" ").map(n=>n[0]).join("")}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div><div style={{fontSize:10,color:"#475569"}}>{user.role}</div></div>
          <div onClick={logout} style={{cursor:"pointer",color:"#475569",padding:4}}><Icon d={PATHS.logout} size={15}/></div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",minHeight:"100vh",background:T.surfaceAlt,color:T.text,display:"flex"}}>
      {!mob&&<div style={{width:236,background:T.sidebar,minHeight:"100vh",flexShrink:0,borderRight:"1px solid "+T.sidebarBorder}}><SidebarContent/></div>}
      {mob&&sidebarOpen&&(<div style={{position:"fixed",inset:0,zIndex:50,display:"flex"}}><div style={{width:236,background:T.sidebar,height:"100vh",borderRight:"1px solid "+T.sidebarBorder}}><SidebarContent/></div><div style={{flex:1,background:"rgba(0,0,0,0.5)"}} onClick={()=>setSidebarOpen(false)}/></div>)}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{background:T.surface,borderBottom:"1px solid "+T.border,padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {mob&&<button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:T.textSub,padding:6}}><Icon d={PATHS.menu} size={22}/></button>}
            {page!=="dashboard"&&(
              <button onClick={()=>setPage("dashboard")} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.textSub,padding:"4px 6px",borderRadius:7,fontSize:12,fontWeight:600}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                {!mob&&"Dashboard"}
              </button>
            )}
            {page!=="dashboard"&&<span style={{color:T.border,fontSize:16}}>/</span>}
            <div style={{fontSize:17,fontWeight:800,color:T.text}}>{titles[page]}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            
            {user.role==="admin"&&<span style={{display:"inline-block",padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700,background:"#eff6ff",color:T.blue}}>Admin</span>}
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:mob?14:"26px 32px"}}>
          <div style={{maxWidth:page==="gantt"?"100%":page==="dashboard"?1400:["ranking","chat_docs","chat_ai"].includes(page)?1100:900,margin:"0 auto",width:"100%"}}>
          {page==="dashboard"&&<DashHome user={user} setPage={setPage} users={users}/>}
          {page==="chat_docs"&&<Chat user={user} mode="docs" onAddHistory={addToHistory}/>}
          {page==="chat_ai"&&<Chat user={user} mode="general" onAddHistory={addToHistory}/>}
          {page==="ranking"&&<Ranking/>}
          {page==="gantt"&&<GanttPlanner user={user}/>}
          {page==="reports"&&<Reports user={user}/>}
          {page==="verbali"&&<Verbali user={user}/>}
          {page==="docs"&&(user.role==="admin"?<Documents/>:<AccessDenied/>)}
          {page==="profile"&&<Profile user={user} onDeleteAccount={handleDeleteAccount}/>}
          {page==="progetti"&&<Progetti user={user} users={users}/>}
            {page==="fonti"&&<FontiPage user={user}/>}
          {page==="admin"&&(user.role==="admin"?<AdminUsers users={users} pending={pending} onApprove={approve} onReject={reject}/>:<AccessDenied/>)}
          </div>
        </div>
      </div>
    </div>
  );
}
