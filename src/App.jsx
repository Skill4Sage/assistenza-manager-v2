/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Flame, Book, CheckCircle2, Circle, X, BrainCircuit, Play, 
  Pause, RotateCw, LayoutGrid, Upload, Clock, Download, UploadCloud, 
  ClipboardList, Copy, Lightbulb, Trash2, KeyRound, Save, Loader2, 
  HelpCircle, Printer, ListTodo, Settings, ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  format, differenceInCalendarDays, parseISO, isToday, isTomorrow, 
  setHours, setMinutes, isAfter, isBefore, isEqual, addMinutes, 
  startOfDay, getDay, subDays, endOfDay, isSameDay 
} from 'date-fns';
import it from 'date-fns/locale/it';

// --- DATI TRIZ INTEGRATI ---
const parameters = [
    { id: 1, name: "1. Peso di un oggetto mobile" }, { id: 2, name: "2. Peso di un oggetto stazionario" }, { id: 3, name: "3. Lunghezza di un oggetto mobile" }, { id: 4, name: "4. Lunghezza di un oggetto stazionario" }, { id: 5, name: "5. Area di un oggetto mobile" }, { id: 6, name: "6. Area di un oggetto stazionario" }, { id: 7, name: "7. Volume di un oggetto mobile" }, { id: 8, name: "8. Volume di un oggetto stazionario" }, { id: 9, name: "9. Velocità" }, { id: 10, name: "10. Forza" }, { id: 11, name: "11. Tensione, Pressione" }, { id: 12, name: "12. Forma" }, { id: 13, name: "13. Stabilità della composizione" }, { id: 14, name: "14. Robustezza" }, { id: 15, name: "15. Durata di un oggetto mobile" }, { id: 16, name: "16. Durata di un oggetto stazionario" }, { id: 17, name: "17. Temperatura" }, { id: 18, name: "18. Luminosità" }, { id: 19, name: "19. Energia spesa da un oggetto mobile" }, { id: 20, name: "20. Energia spesa da un oggetto stazionario" }, { id: 21, name: "21. Potenza" }, { id: 22, name: "22. Perdita di energia" }, { id: 23, name: "23. Perdita di sostanza" }, { id: 24, name: "24. Perdita di informazione" }, { id: 25, name: "25. Perdita di tempo" }, { id: 26, name: "26. Quantità di sostanza" }, { id: 27, name: "27. Affidabilità" }, { id: 28, name: "28. Precisione della misurazione" }, { id: 29, name: "29. Precisione della produzione" }, { id: 30, name: "30. Fattori dannosi esterni" }, { id: 31, name: "31. Fattori dannosi generati dall'oggetto" }, { id: 32, name: "32. Facilità di produzione" }, { id: 33, name: "33. Facilità d'uso" }, { id: 34, name: "34. Facilità di riparazione" }, { id: 35, name: "35. Adattabilità o versatilità" }, { id: 36, name: "36. Complessità del dispositivo" }, { id: 37, name: "37. Complessità del controllo" }, { id: 38, name: "38. Livello di automazione" }, { id: 39, name: "39. Produttività" }
];

const principles = {
    1: { id: 1, name: "Segmentazione", description: "Dividi un oggetto in parti indipendenti. Rendi un oggetto facile da smontare. Aumenta il grado di frammentazione." }, 
    2: { id: 2, name: "Estrazione", description: "Separa una parte interferente o una proprietà da un oggetto. Estrai solo la parte o la proprietà necessaria." }, 
    3: { id: 3, name: "Qualità Locale", description: "Fai in modo che ogni parte di un oggetto funzioni in condizioni diverse e più adatte. Fai in modo che ogni parte svolga una funzione diversa." }, 
    4: { id: 4, name: "Asimmetria", description: "Cambia la forma di un oggetto da simmetrica ad asimmetrica. Se un oggetto è già asimmetrico, aumenta il grado di asimmetria." }, 
    5: { id: 5, name: "Unione", description: "Unisci oggetti o operazioni identiche o simili. Raggruppa oggetti per farli operare in parallelo." }, 
    6: { id: 6, name: "Universalità", description: "Fai in modo che un oggetto o una parte possa svolgere più funzioni, eliminando la necessità di altri oggetti." }, 
    7: { id: 7, name: "Matrioska (Nesting)", description: "Inserisci un oggetto dentro un altro. Fai passare un oggetto attraverso una cavità di un altro." }, 
    8: { id: 8, name: "Contrappeso", description: "Compensa il peso di un oggetto unendolo ad un altro che fornisce una forza di sollevamento. Sfrutta forze aerodinamiche o idrodinamiche." }, 
    9: { id: 9, name: "Azione preventiva contraria", description: "Se è necessario eseguire un'azione con effetti sia utili che dannosi, esegui prima un'azione contraria per controllare gli effetti dannosi." }, 
    10: { id: 10, name: "Azione preventiva", description: "Esegui un'azione richiesta in anticipo, completamente o parzialmente. Disponi gli oggetti in modo che possano entrare in azione dalla posizione più conveniente." }, 
    11: { id: 11, name: "Cuscino preventivo", description: "Prepara contromisure di emergenza in anticipo per compensare la bassa affidabilità di un oggetto." }, 
    12: { id: 12, name: "Equipotenzialità", description: "In un campo potenziale, limita i cambi di posizione (es. evita di sollevare e abbassare)." }, 
    13: { id: 13, name: "Inversione", description: "Inverti l'azione usata per risolvere il problema. Rendi le parti mobili fisse e le parti fisse mobili. Capovolgi l'oggetto." }, 
    14: { id: 14, name: "Sferoidale, Curvatura", description: "Sostituisci parti lineari con parti curve, superfici piane con sferiche. Usa rulli, sfere, spirali." }, 
    15: { id: 15, name: "Dinamicità", description: "Permetti alle caratteristiche di un oggetto o dell'ambiente esterno di cambiare per essere ottimali in ogni fase. Dividi un oggetto in parti che possono muoversi l'una rispetto all'altra." }, 
    16: { id: 16, name: "Azioni parziali o eccessive", description: "Se è difficile ottenere il 100% di un effetto, ottieni un po' meno o un po' più per semplificare il problema." }, 
    17: { id: 17, name: "Transizione a una nuova dimensione", description: "Sposta un oggetto in due o tre dimensioni. Usa un layout a più piani. Inclina l'oggetto." }, 
    18: { id: 18, name: "Vibrazione meccanica", description: "Fai vibrare un oggetto. Se c'è già vibrazione, aumentane la frequenza (anche ultrasonica)." }, 
    19: { id: 19, name: "Azione periodica", description: "Sostituisci un'azione continua con una periodica (impulsi). Se l'azione è già periodica, cambia la frequenza." }, 
    20: { id: 20, name: "Continuità di un'azione utile", description: "Esegui un'azione senza interruzioni; fai in modo che tutte le parti di un oggetto lavorino costantemente a pieno carico." }, 
    21: { id: 21, name: "Scorrimento veloce (Rushing through)", description: "Esegui un processo o le sue fasi dannose ad alta velocità." }, 
    22: { id: 22, name: "Convertire il danno in beneficio (Blessing in disguise)", description: "Usa effetti o fattori dannosi per ottenere un effetto positivo. Elimina un fattore dannoso aggiungendolo a un altro." }, 
    23: { id: 23, name: "Feedback", description: "Introduci un feedback per migliorare un processo. Se il feedback esiste già, cambialo." }, 
    24: { id: 24, name: "Intermediario", description: "Usa un oggetto o un processo intermedio. Unisci temporaneamente un oggetto a un altro che è facile da rimuovere." }, 
    25: { id: 25, name: "Auto-servizio (Self-service)", description: "Fai in modo che un oggetto si serva da solo eseguendo funzioni ausiliarie. Usa scarti di risorse, sostanze o energia." }, 
    26: { id: 26, name: "Copia", description: "Usa una copia semplice ed economica al posto di un oggetto complesso, fragile o scomodo. Sostituisci un oggetto con una sua copia ottica." }, 
    27: { id: 27, name: "Oggetti economici e a vita breve", description: "Sostituisci un oggetto costoso con una collezione di oggetti economici, sacrificando alcune qualità (es. durata)." }, 
    28: { id: 28, name: "Sostituzione di un sistema meccanico", description: "Sostituisci un sistema meccanico con uno ottico, acustico o olfattivo. Usa campi elettrici, magnetici o elettromagnetici." }, 
    29: { id: 29, name: "Pneumatici e idraulici", description: "Usa parti gassose o liquide di un oggetto al posto di quelle solide (es. gonfiabili, idrauliche)." }, 
    30: { id: 30, name: "Membrane flessibili o film sottili", description: "Usa membrane flessibili o film sottili al posto di strutture tridimensionali. Isola un oggetto dall'ambiente esterno." }, 
    31: { id: 31, name: "Materiali porosi", description: "Rendi un oggetto poroso o aggiungi elementi porosi. Se un oggetto è già poroso, riempi i pori con una sostanza." }, 
    32: { id: 32, name: "Cambio di colore", description: "Cambia il colore di un oggetto o del suo ambiente. Cambia il grado di trasparenza." }, 
    33: { id: 33, name: "Omogeneità", description: "Fai interagire un oggetto con oggetti composti dallo stesso materiale (o con materiale dal comportamento simile)." }, 
    34: { id: 34, name: "Scarto e rigenerazione", description: "Scarta le parti di un oggetto che hanno esaurito la loro funzione o rigenerale durante l'operazione." }, 
    35: { id: 35, name: "Trasformazione delle proprietà", description: "Cambia lo stato fisico di un oggetto (es. da solido a liquido). Cambia la concentrazione, la densità, la flessibilità, la temperatura." }, 
    36: { id: 36, name: "Transizione di fase", description: "Usa fenomeni che si verificano durante le transizioni di fase (es. cambiamento di volume, calore latente)." }, 
    37: { id: 37, name: "Espansione termica", description: "Usa l'espansione (o la contrazione) termica dei materiali. Usa materiali diversi con coefficienti di espansione termica diversi." }, 
    38: { id: 38, name: "Ossidanti forti", description: "Sostituisci l'aria normale con aria arricchita di ossigeno. Sostituisci l'aria arricchita con ossigeno puro. Usa radiazioni ionizzanti." }, 
    39: { id: 39, name: "Atmosfera inerte", description: "Sostituisci l'ambiente normale con uno inerte. Esegui il processo sotto vuoto." }, 
    40: { id: 40, name: "Materiali compositi", description: "Cambia un materiale uniforme in uno composito (multi-materiale)." },
};

const contradictionMatrix = {
    1:{2:[29,35,8,40],3:[17,4,7,1],4:[17,29,30,14],25:[10,15,21],39:[38,35]},
    2:{3:[17,7,1,4],4:[17,29,14,30],25:[10,15,21],39:[38,35]},
    25:{39:[35,21,10],28:[10,19,32]}
};

const PRIORITIES = {
  1: { name: "Critica", color: "#32cd32", bgColor: "#dcfce7", border: "#16a34a" },
  2: { name: "Urgente", color: "#3b82f6", bgColor: "#eff6ff", border: "#2563eb" },
  3: { name: "Pianificabile", color: "#64748b", bgColor: "#f8fafc", border: "#475569" },
  4: { name: "Bassa", color: "#06b6d4", bgColor: "#ecfeff", border: "#0891b2" },
};

const SLOT_DURATION = 15;
const MAX_TODAY_TASKS = 3;
const STORAGE_KEY = 'assistenza-manager-v2-final-stable-complete';
const DEFAULT_WORK_HOURS = {
    mornStart: '08:30',
    mornEnd: '12:30',
    aftnStart: '14:00',
    aftnEnd: '18:00',
};

// --- COMPONENTI UI (DEFINITI PRIMA DI APP PER EVITARE REFERENCE ERROR) ---

const TaskItem = React.memo(({ task, onToggleComplete, onSetFocus, onDragStart, onRemove, onAnalyze }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const deadlineInfo = useMemo(() => {
    if (!task.deadline) return null;
    const d = parseISO(task.deadline);
    const diff = differenceInCalendarDays(d, new Date());
    if (diff < 0) return { text: `Scaduta`, color: "text-red-600" };
    if (isToday(d)) return { text: "Oggi", color: "text-orange-600" };
    return { text: format(d, 'd MMM HH:mm', { locale: it }), color: "text-gray-500" };
  }, [task.deadline]);

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white rounded-xl shadow-sm border-l-4 flex flex-col transition-all hover:shadow-md cursor-grab active:cursor-grabbing group mb-2 no-print"
      style={{ borderLeftColor: PRIORITIES[task.priority].color }}
    >
      <div className="p-3 flex items-start gap-3">
        <button onClick={() => onToggleComplete(task.id)} className="mt-1 flex-shrink-0">
          {task.status === 'done' ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-300" />}
        </button>
        <div className="flex-grow min-w-0">
          <p className={`font-semibold text-sm truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
          <div className={`text-[11px] text-gray-500 ${isExpanded ? '' : 'truncate'}`}>
            {task.description}
          </div>
          {deadlineInfo && <span className={`text-[10px] font-bold uppercase mt-1 block ${deadlineInfo.color}`}>{deadlineInfo.text}</span>}
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-gray-400 hover:text-blue-500">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {task.status !== 'done' && (
            <button onClick={() => onSetFocus(task)} className="p-1 text-purple-400 hover:text-purple-600">
              <BrainCircuit size={14} />
            </button>
          )}
          <button onClick={() => onAnalyze(task)} className="p-1 text-yellow-500 hover:text-yellow-600">
            <Lightbulb size={14} />
          </button>
          <button onClick={() => onRemove(task.id)} className="p-1 text-gray-300 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 text-[11px] text-gray-600 border-t border-gray-50 mt-1 italic whitespace-pre-wrap leading-relaxed">
          {task.description}
        </div>
      )}
    </div>
  );
});

const FocusMode = ({ task, onClose }) => {
    const WORK_TIME = 25 * 60;
    const BREAK_TIME = 5 * 60;
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
  
    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0) {
        new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play();
        if (!isBreak) { setIsBreak(true); setTimeLeft(BREAK_TIME); } 
        else { setIsBreak(false); setTimeLeft(WORK_TIME); setIsActive(false); }
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft, isBreak]);
  
    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 m-4 text-center">
            <div className="flex justify-end"><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
            <div className={`text-7xl font-bold mb-8 ${isBreak ? 'text-green-600' : 'text-purple-600'}`}>{formatTime(timeLeft)}</div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsActive(!isActive)} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg flex items-center gap-2 shadow-lg hover:bg-purple-700">{isActive ? <Pause /> : <Play />}{isActive ? 'Pausa' : 'Avvia'}</button>
              <button onClick={() => {setIsActive(false); setTimeLeft(WORK_TIME); setIsBreak(false);}} className="px-6 py-3 bg-gray-200 rounded-lg font-semibold text-lg flex items-center gap-2 hover:bg-gray-300"><RotateCw /> Reset</button>
            </div>
        </div>
      </div>
    );
};

const AddTaskModal = ({ isOpen, onClose, onAddTask, apiKey }) => {
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState(2);
    const [deadline, setDeadline] = useState('');
    const [isParsingPdf, setIsParsingPdf] = useState(false);
    const [isAnalyzingText, setIsAnalyzingText] = useState(false);

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (typeof window.pdfjsLib === 'undefined') {
            alert("Caricamento PDF.js in corso...");
            return;
        }
        
        setIsParsingPdf(true);
        setDesc("Lettura del PDF...");

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(event.target.result) }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                setDesc(fullText.trim());
                setIsParsingPdf(false);
                if (apiKey) {
                    setIsAnalyzingText(true);
                    const prompt = `Analizza thread email ed estrai JSON: { "cliente": "", "problema": "", "note": "", "priorita": 1-4 }`;
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt + "\n\n" + fullText.trim() }] }] })
                    });
                    const result = await response.json();
                    const textResponse = result.candidates[0].content.parts[0].text;
                    const parsed = JSON.parse(textResponse.match(/\{[\s\S]*\}/)[0]);
                    if (parsed.problema) {
                        setDesc(`CLIENTE: ${parsed.cliente}\nPROBLEMA: ${parsed.problema}\nNOTE: ${parsed.note}`);
                        setPriority(parsed.priorita || 3);
                    }
                }
            } catch (err) { setIsParsingPdf(false); setIsAnalyzingText(false); }
        };
        reader.readAsArrayBuffer(file);
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 m-4">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Nuova Richiesta</h2><button onClick={onClose}><X /></button></div>
                <form onSubmit={e => { e.preventDefault(); onAddTask({desc, priority, deadline}); setDesc(''); }} className="space-y-4">
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="5" placeholder="Dettagli..." className="w-full border-gray-300 rounded-lg shadow-sm" required />
                    <div className="grid grid-cols-2 gap-4">
                        <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm"><option value="1">Critica</option><option value="2">Urgente</option><option value="3">Pianificabile</option></select>
                        <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm"/>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <label className="bg-gray-100 p-2 rounded cursor-pointer flex gap-2 text-sm font-bold"><Upload size={16}/> PDF<input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload}/></label>
                        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg">Aggiungi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DailyProgress = ({ tasksToday }) => {
    const completedCount = tasksToday.filter(t => t.status === 'done').length;
    const progress = tasksToday.length > 0 ? (completedCount / tasksToday.length) * 100 : 0;
    return (
        <div className="w-full max-w-xs"><div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1"><span>PROGRESSO</span><span>{completedCount}/{tasksToday.length}</span></div><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}/></div></div>
    );
};

const TrizAnalysis = ({ task, onClose }) => {
    const [improving, setImproving] = useState('');
    const [worsening, setWorsening] = useState('');
    const suggestions = contradictionMatrix[improving]?.[worsening] || [];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Lightbulb className="text-yellow-500"/> TRIZ</h2>
            <div className="space-y-2 mb-4">
                <select value={improving} onChange={e => setImproving(e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">{parameters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <select value={worsening} onChange={e => setWorsening(e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">{parameters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2">
                {suggestions.map(idx => (
                    <div key={idx} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <p className="font-bold text-xs text-indigo-700">{idx}. {principles[idx]?.name}</p>
                        <p className="text-[10px] text-indigo-900">{principles[idx]?.description}</p>
                    </div>
                ))}
            </div>
            <button onClick={onClose} className="mt-4 bg-gray-200 py-2 rounded-lg text-sm font-bold">Chiudi</button>
        </div>
    );
};

const DailyReport = ({ tasksCompletedToday, notes, onNotesChange, onCopyReport, isCopied }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-bold text-gray-400">REPORT</h2><button onClick={onCopyReport} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{isCopied ? 'COPIATO!' : 'COPIA'}</button></div>
            <div className="bg-green-50 p-3 rounded-lg mb-4 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-bold text-green-700 mb-1">COMPLETATI OGGI:</p>
                {tasksCompletedToday.map(t => <p key={t.id} className="text-[11px] text-green-800 truncate">- {t.title}</p>)}
            </div>
            <textarea value={notes} onChange={onNotesChange} placeholder="Note per il responsabile..." className="flex-grow bg-slate-50 p-3 rounded-xl text-xs resize-none border-none"/>
        </div>
    );
};

const ApiKeyModal = ({ isOpen, onClose, currentApiKey, onSave }) => {
    const [key, setKey] = useState(currentApiKey);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-sm"><h2 className="text-xl font-bold mb-4">Chiave Gemini</h2><input type="password" value={key} onChange={e => setKey(e.target.value)} className="w-full border-gray-300 rounded-lg mb-4" placeholder="AI Key"/><button onClick={() => {onSave(key); onClose();}} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Salva</button></div>
        </div>
    );
};

const TutorialModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4"><div className="bg-white p-8 rounded-2xl max-w-lg max-h-[80vh] overflow-y-auto"><h2 className="text-xl font-bold mb-4">Guida</h2><p className="text-sm text-gray-600 mb-4">Trascina i task tra Inbox, Fuochi e Planning. Usa il TRIZ per i problemi tecnici.</p><button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Chiudi</button></div></div>
    );
};

const SettingsModal = ({ isOpen, onClose, currentHours, onSaveHours, currentRoutines, onSaveRoutines }) => {
    const [hours, setHoursState] = useState(currentHours);
    const [newRoutine, setNewRoutine] = useState({ title: '', priority: 3, duration: 15, frequency: 1 });
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">Impostazioni</h2><button onClick={onClose}><X/></button></div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold">INIZIO</label><input type="time" value={hours.mornStart} onChange={e => setHoursState({...hours, mornStart: e.target.value})} className="w-full border-gray-300 rounded-lg"/></div>
                        <div><label className="text-xs font-bold">FINE</label><input type="time" value={hours.aftnEnd} onChange={e => setHoursState({...hours, aftnEnd: e.target.value})} className="w-full border-gray-300 rounded-lg"/></div>
                    </div>
                    <button onClick={() => {onSaveHours(hours); onClose();}} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Salva Orari</button>
                    <div className="border-t pt-4"><h3 className="font-bold mb-2">Routine</h3><input type="text" placeholder="Titolo" value={newRoutine.title} onChange={e => setNewRoutine({...newRoutine, title: e.target.value})} className="w-full border-gray-300 rounded-lg mb-2"/><button onClick={() => onSaveRoutines([...currentRoutines, {...newRoutine, id: Date.now()}])} className="w-full bg-gray-100 py-2 rounded font-bold">Aggiungi</button></div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPALE ---
export default function App() {
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState('');
    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [focusedTask, setFocusedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [analyzedTask, setAnalyzedTask] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false); 
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [workHours, setWorkHours] = useState(DEFAULT_WORK_HOURS);
    const [routines, setRoutines] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        setTasks(saved.tasks || []);
        setNotes(saved.notes || '');
        setScheduledTasks(saved.scheduledTasks || []);
        setApiKey(saved.apiKey || '');
        setWorkHours(saved.workHours || DEFAULT_WORK_HOURS);
        setRoutines(saved.routines || []);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = () => { if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; };
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, notes, scheduledTasks, apiKey, workHours, routines }));
    }, [tasks, notes, scheduledTasks, apiKey, workHours, routines]);

    const handleAddTask = ({ desc, priority, deadline }) => {
        setTasks([{ id: `task-${Date.now()}`, title: desc.substring(0, 40), description: desc, priority: parseInt(priority), status: 'inbox', createdAt: new Date().toISOString(), completedAt: null, deadline }, ...tasks]);
        setIsAddingTask(false);
    };

    const handleCopyReport = () => {
        const comp = tasks.filter(t => t.status === 'done' && t.completedAt && isToday(parseISO(t.completedAt)));
        const rep = `REPORT ${format(new Date(), 'dd/MM')}\n\nATTIVITÀ:\n${comp.map(t => `- ${t.title}`).join('\n')}\n\nNOTE:\n${notes}`;
        navigator.clipboard.writeText(rep).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); });
    };

    const timeSlots = useMemo(() => {
        const slots = [];
        const start = parseInt(workHours.mornStart.split(':')[0]);
        const end = parseInt(workHours.aftnEnd.split(':')[0]);
        for (let h = start; h < end; h++) {
            for (let m = 0; m < 60; m += SLOT_DURATION) {
                slots.push(setMinutes(setHours(new Date(), h), m));
            }
        }
        return slots;
    }, [workHours]);

    const onDrop = (e, col) => {
        const tid = e.dataTransfer.getData("taskId");
        if (tid) {
            setTasks(tasks.map(t => t.id === tid ? { ...t, status: col === 'today-tasks' ? 'today' : col === 'inbox-tasks' ? 'inbox' : t.status } : t));
            if (col.startsWith('time-block-')) {
                const time = col.replace('time-block-', '');
                setScheduledTasks([...scheduledTasks.filter(st => st.taskId !== tid), { id: Date.now(), taskId: tid, startTime: time, duration: 30 }]);
            }
        }
        setDragOverColumn(null);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-10 p-4 no-print flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-3"><LayoutGrid className="text-blue-600"/> Assistenza Manager</h1>
                <div className="flex gap-2">
                    <button onClick={() => setShowTutorialModal(true)} className="p-2 text-gray-400 hover:bg-blue-50 rounded-lg"><HelpCircle size={20}/></button>
                    <button onClick={() => setShowSettingsModal(true)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Settings size={20}/></button>
                    <button onClick={() => setShowApiKeyModal(true)} className="p-2 text-gray-400 hover:bg-yellow-50 rounded-lg"><KeyRound size={20}/></button>
                    <button onClick={() => setIsAddingTask(true)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl">+ Nuova</button>
                </div>
            </header>
            
            <main className="max-w-screen-2xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 no-print">
                <section onDragOver={e => { e.preventDefault(); setDragOverColumn('inbox-tasks'); }} onDrop={e => onDrop(e, 'inbox-tasks')} className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Book size={16}/> INBOX</h2>
                    {tasks.filter(t => t.status === 'inbox').map(t => <TaskItem key={t.id} task={t} onToggleComplete={() => setTasks(tasks.map(x => x.id === t.id ? {...x, status: 'done', completedAt: new Date().toISOString()} : x))} onDragStart={e => e.dataTransfer.setData("taskId", t.id)} onRemove={id => setTasks(tasks.filter(x => x.id !== id))} onAnalyze={setAnalyzedTask} />)}
                </section>

                <section onDragOver={e => { e.preventDefault(); setDragOverColumn('today-tasks'); }} onDrop={e => onDrop(e, 'today-tasks')} className="space-y-4">
                    <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2"><Flame size={16}/> OGGI</h2><DailyProgress tasksToday={tasks.filter(t => t.status === 'today' || (t.status === 'done' && t.prevStatus === 'today'))} /></div>
                    {tasks.filter(t => t.status === 'today').map(t => <TaskItem key={t.id} task={t} onToggleComplete={() => setTasks(tasks.map(x => x.id === t.id ? {...x, status: 'done', completedAt: new Date().toISOString(), prevStatus: 'today'} : x))} onSetFocus={setFocusedTask} onDragStart={e => e.dataTransfer.setData("taskId", t.id)} onRemove={id => setTasks(tasks.filter(x => x.id !== id))} onAnalyze={setAnalyzedTask} />)}
                </section>
                
                <section className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-bold text-indigo-800 flex items-center gap-2 uppercase tracking-widest"><Clock size={16}/> PLANNING</h2><button onClick={() => window.print()} className="p-2 text-gray-400"><Printer size={18}/></button></div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-1">
                        {timeSlots.map(slot => {
                            const timeStr = slot.toISOString();
                            const scheduled = scheduledTasks.find(st => st.startTime === timeStr);
                            const task = scheduled ? tasks.find(t => t.id === scheduled.taskId) : null;
                            const isHour = slot.getMinutes() === 0;
                            return (
                                <div key={timeStr} onDragOver={e => { e.preventDefault(); setDragOverColumn(`time-block-${timeStr}`); }} onDrop={e => onDrop(e, `time-block-${timeStr}`)} className={`flex items-center gap-3 p-2 border-t ${isHour ? 'bg-slate-50' : 'border-gray-50'} ${dragOverColumn === `time-block-${timeStr}` ? 'bg-green-50' : ''}`}>
                                    <span className="text-[10px] font-bold text-gray-400 w-10">{format(slot, 'HH:mm')}</span>
                                    <div className="flex-grow min-h-[24px]">{task && <div className="bg-white border shadow-sm p-1 rounded text-[10px] font-bold truncate" style={{ borderLeft: `3px solid ${PRIORITIES[task.priority].color}` }}>{task.title}</div>}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-[75vh]">
                    <div className="mb-4 p-4 text-center rounded-xl border-2 border-dashed border-gray-100" onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, 'triz-analysis')}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">TRASCINA PER TRIZ</p>
                    </div>
                    {analyzedTask ? <TrizAnalysis task={analyzedTask} onClose={() => setAnalyzedTask(null)}/> : <DailyReport tasksCompletedToday={tasks.filter(t => t.status === 'done' && t.completedAt && isToday(parseISO(t.completedAt)))} notes={notes} onNotesChange={e => setNotes(e.target.value)} onCopyReport={handleCopyReport} isCopied={isCopied}/>}
                </section>
            </main>

            <div className="hidden print:block text-slate-900 p-8 bg-white">
                <h1 className="text-xl font-black border-b-4 border-black pb-2 mb-6">PIANO GIORNALIERO - {format(new Date(), 'dd/MM/yyyy')}</h1>
                <div className="border-2 border-black rounded-lg overflow-hidden mb-12">
                    {timeSlots.map(slot => (
                        <div key={slot.toISOString()} className={`flex items-center gap-4 p-3 border-b border-gray-300 ${slot.getMinutes() === 0 ? 'bg-gray-100' : ''}`}>
                            <span className="text-xs font-black w-12">{format(slot, 'HH:mm')}</span>
                            <div className="w-5 h-5 border-2 border-black rounded"></div>
                            <span className="text-xs font-bold uppercase truncate">{tasks.find(t => scheduledTasks.find(st => st.startTime === slot.toISOString() && st.taskId === t.id))?.title || ''}</span>
                        </div>
                    ))}
                </div>
                <h1 className="text-xl font-black border-b-4 border-black pb-2 mb-6 uppercase">Appendice: Dettagli Task</h1>
                <div className="space-y-4">
                    {scheduledTasks.map(st => {
                        const t = tasks.find(x => x.id === st.taskId);
                        return t ? <div key={t.id} className="border-l-4 p-4 bg-gray-50 border-black"><p className="font-black text-sm">{format(parseISO(st.startTime), 'HH:mm')} - {t.title}</p><p className="text-xs mt-1 italic">{t.description}</p></div> : null;
                    })}
                </div>
            </div>

            <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />
            <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} currentApiKey={apiKey} onSave={setApiKey} />
            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} currentHours={workHours} onSaveHours={setWorkHours} currentRoutines={routines} onSaveRoutines={setRoutines} />
            <AddTaskModal isOpen={isAddingTask} onClose={() => setIsAddingTask(false)} onAddTask={handleAddTask} apiKey={apiKey} />
            {focusedTask && <FocusMode task={focusedTask} onClose={() => setFocusedTask(null)} />}
        </div>
    );
}
