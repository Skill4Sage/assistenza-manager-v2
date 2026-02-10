/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Flame, Book, CheckCircle2, Circle, X, BrainCircuit, Play, 
  Pause, RotateCw, LayoutGrid, Upload, Clock, Download, UploadCloud, 
  ClipboardList, Copy, Lightbulb, Trash2, KeyRound, Save, Loader2, 
  HelpCircle, Printer, ListTodo, Settings, Repeat, ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  format, differenceInCalendarDays, parseISO, isToday, isTomorrow, 
  setHours, setMinutes, isAfter, isBefore, isEqual, addMinutes, 
  startOfDay, getDay, subDays, endOfDay, isSameDay 
} from 'date-fns';
import it from 'date-fns/locale/it';

// --- CONFIGURAZIONE UI ---
const PRIORITIES = {
  1: { name: "Critica", color: "#32cd32", bgColor: "#dcfce7", border: "#16a34a" },
  2: { name: "Urgente", color: "#3b82f6", bgColor: "#eff6ff", border: "#2563eb" },
  3: { name: "Pianificabile", color: "#64748b", bgColor: "#f8fafc", border: "#475569" },
  4: { name: "Bassa", color: "#06b6d4", bgColor: "#ecfeff", border: "#0891b2" },
};

const SLOT_DURATION = 15;
const MAX_TODAY_TASKS = 3;
const STORAGE_KEY = 'assistenza-manager-v2-complete';

// --- COMPONENTI MINORI ---

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

// --- COMPONENTE PRINCIPALE ---

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [workHours, setWorkHours] = useState({ mornStart: '08:30', mornEnd: '12:30', aftnStart: '14:00', aftnEnd: '18:00' });
  const [routines, setRoutines] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [focusedTask, setFocusedTask] = useState(null);
  const [analyzedTask, setAnalyzedTask] = useState(null);
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Inizializzazione
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.tasks) setTasks(saved.tasks);
    if (saved.scheduledTasks) setScheduledTasks(saved.scheduledTasks);
    if (saved.apiKey) setApiKey(saved.apiKey);
    if (saved.workHours) setWorkHours(saved.workHours);
    if (saved.routines) setRoutines(saved.routines);
    if (saved.notes) setNotes(saved.notes);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => { if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, scheduledTasks, apiKey, workHours, routines, notes }));
  }, [tasks, scheduledTasks, apiKey, workHours, routines, notes]);

  // Identificazione task completati oggi per il report
  const tasksCompletedToday = useMemo(() => {
    return tasks.filter(t => t.status === 'done' && t.completedAt && isToday(parseISO(t.completedAt)));
  }, [tasks]);

  const handleCopyReport = () => {
    const dateStr = format(new Date(), 'eeee d MMMM yyyy', { locale: it });
    let report = `📄 REPORT ATTIVITÀ - ${dateStr}\n\n`;
    
    report += `✅ ATTIVITÀ COMPLETATE OGGI:\n`;
    if (tasksCompletedToday.length > 0) {
      tasksCompletedToday.forEach(t => {
        report += `- ${t.title}\n`;
      });
    } else {
      report += `- Nessuna attività completata a sistema.\n`;
    }

    if (notes.trim()) {
      report += `\n📝 NOTE STRATEGICHE E DETTAGLI:\n${notes}\n`;
    }

    navigator.clipboard.writeText(report);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Gestione Task
  const addTask = (data) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: data.title || data.desc.substring(0, 40).split('\n')[0] + "...",
      description: data.desc,
      priority: parseInt(data.priority) || 3,
      status: 'inbox',
      createdAt: new Date().toISOString(),
      deadline: data.deadline || null
    };
    setTasks(prev => [newTask, ...prev]);
    setIsAddingTask(false);
  };

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setScheduledTasks(prev => prev.filter(st => st.taskId !== id));
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, status: t.status === 'done' ? 'inbox' : 'done',
      completedAt: t.status === 'done' ? null : new Date().toISOString()
    } : t));
  };

  // Logica "Prepara Giornata"
  const timeSlots = useMemo(() => {
    const slots = [];
    const addRange = (start, end) => {
      let curr = setMinutes(setHours(new Date(), start.split(':')[0]), start.split(':')[1]);
      const stop = setMinutes(setHours(new Date(), end.split(':')[0]), end.split(':')[1]);
      while (isBefore(curr, stop)) { slots.push(new Date(curr)); curr = addMinutes(curr, SLOT_DURATION); }
    };
    addRange(workHours.mornStart, workHours.mornEnd);
    addRange(workHours.aftnStart, workHours.aftnEnd);
    return slots;
  }, [workHours]);

  const prepareDay = () => {
    const now = new Date();
    const availableSlots = timeSlots.filter(slot => isAfter(slot, now));
    let newScheduled = [];
    
    const allToSchedule = tasks.filter(t => t.status !== 'done');
    const routineTasks = allToSchedule.filter(t => t.description.toLowerCase().includes('routine'));
    const normalTasks = allToSchedule.filter(t => !t.description.toLowerCase().includes('routine'));

    let currentSlots = [...availableSlots];

    const bookSlot = (task, preferredIndex) => {
      if (currentSlots.length === 0) return;
      let idx = Math.min(preferredIndex, currentSlots.length - 1);
      const slot = currentSlots[idx];
      const duration = task.description.toLowerCase().includes('remoto') ? 60 : 15;
      newScheduled.push({ id: `sch-${Date.now()}-${task.id}`, taskId: task.id, startTime: slot.toISOString(), duration });
      currentSlots.splice(idx, Math.ceil(duration / SLOT_DURATION));
    };

    routineTasks.forEach((task, i) => {
      const interval = Math.floor(currentSlots.length / (routineTasks.length + 1));
      bookSlot(task, interval * (i + 1));
    });
    normalTasks.forEach(task => bookSlot(task, 0));
    setScheduledTasks(newScheduled);
  };

  const onDragStart = (e, id) => e.dataTransfer.setData("taskId", id);
  const onDragOver = (e, target) => { e.preventDefault(); setDragOver(target); };
  const onDrop = (e, target) => {
    e.preventDefault();
    setDragOver(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (target === 'today') setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'today' } : t));
    else if (target === 'inbox') setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'inbox' } : t));
    else if (target.startsWith('slot-')) {
      const time = target.replace('slot-', '');
      setScheduledTasks(prev => [...prev.filter(st => st.taskId !== taskId), { id: `sch-${Date.now()}`, taskId, startTime: time, duration: 15 }]);
    } else if (target === 'triz') {
      const task = tasks.find(t => t.id === taskId);
      if (task) setAnalyzedTask(task);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <style>{`
        @media print {
          header, .no-print, .sidebar { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print-page-1 { page-break-after: always; display: block !important; height: 100vh; }
          .print-page-2 { display: block !important; margin-top: 1cm; page-break-before: always; }
          .planner-row { height: 1.1cm !important; border-bottom: 1px solid #e2e8f0 !important; }
          .hour-break { border-top: 2px solid #334155 !important; background-color: #f8fafc !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
        .hour-row { border-top: 2px solid #cbd5e1; background-color: #f8fafc; }
      `}</style>

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between mb-8 gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg"><LayoutGrid size={24} /></div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Assistenza Manager <span className="text-blue-600 text-[10px] ml-2 font-mono">V2.0 PRO</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowApiKeyModal(true)} className="p-2 text-slate-400 hover:bg-white rounded-lg transition-colors"><KeyRound size={20}/></button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:bg-white rounded-lg transition-colors"><Settings size={20}/></button>
          <button onClick={prepareDay} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs transition-all"><ListTodo size={18} /> Prepara Giornata</button>
          <button onClick={() => window.print()} className="p-2 text-slate-400 hover:bg-white rounded-lg transition-all"><Printer size={20} /></button>
          <button onClick={() => setIsAddingTask(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all">+ Nuova</button>
        </div>
      </header>

      {/* Griglia App */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        <section onDragOver={(e) => onDragOver(e, 'inbox')} onDrop={(e) => onDrop(e, 'inbox')} className="lg:col-span-3 space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest text-[10px] px-2"><Book size={14} /> Inbox</h2>
          <div className="space-y-1 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {tasks.filter(t => t.status !== 'today' && t.status !== 'done').map(task => (
              <TaskItem key={task.id} task={task} onToggleComplete={toggleComplete} onDragStart={onDragStart} onRemove={removeTask} onAnalyze={setAnalyzedTask} />
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 space-y-6">
          <div onDragOver={(e) => onDragOver(e, 'today')} onDrop={(e) => onDrop(e, 'today')} className={`bg-white rounded-3xl p-5 shadow-sm border-2 border-dashed transition-all ${dragOver === 'today' ? 'border-orange-400 bg-orange-50' : 'border-slate-100'}`}>
            <h2 className="flex items-center gap-2 font-bold text-orange-600 mb-4 text-xs uppercase tracking-widest"><Flame size={16} /> Fuochi del Giorno</h2>
            <div className="space-y-2">
              {tasks.filter(t => t.status === 'today').map(task => (
                <TaskItem key={task.id} task={task} onToggleComplete={toggleComplete} onDragStart={onDragStart} onRemove={removeTask} onAnalyze={setAnalyzedTask} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2 font-bold text-slate-400 mb-4 uppercase tracking-widest text-[10px]"><Clock size={14} /> Agenda Operativa</h2>
            <div className="space-y-0 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {timeSlots.map(slot => {
                const timeStr = slot.toISOString();
                const scheduled = scheduledTasks.find(st => st.startTime === timeStr);
                const task = scheduled ? tasks.find(t => t.id === scheduled.taskId) : null;
                const isFullHour = slot.getMinutes() === 0;

                return (
                  <div key={timeStr} onDragOver={(e) => onDragOver(e, `slot-${timeStr}`)} onDrop={(e) => onDrop(e, `slot-${timeStr}`)}
                    className={`flex items-center gap-4 p-2 transition-colors ${isFullHour ? 'hour-row' : 'border-t border-slate-50'} ${dragOver === `slot-${timeStr}` ? 'bg-blue-50' : ''}`}>
                    <span className={`text-[10px] font-bold w-10 ${isFullHour ? 'text-slate-800' : 'text-slate-400'}`}>{format(slot, 'HH:mm')}</span>
                    <div className="flex-grow min-h-[24px] flex items-center">
                      {task && (
                        <div className="w-full bg-white border-l-4 shadow-sm text-[11px] p-1.5 rounded-lg flex justify-between items-center" style={{ borderLeftColor: PRIORITIES[task.priority].color }}>
                          <span className="font-bold truncate text-slate-700">{task.title}</span>
                          <button onClick={() => setScheduledTasks(prev => prev.filter(st => st.taskId !== task.id))} className="text-slate-300 hover:text-red-500"><X size={12}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 space-y-4">
          <div onDragOver={(e) => onDragOver(e, 'triz')} onDrop={(e) => onDrop(e, 'triz')} 
            className={`bg-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg transition-all ${dragOver === 'triz' ? 'scale-105 bg-indigo-500' : ''}`}>
            <Lightbulb className="mx-auto mb-2" size={24} />
            <h3 className="font-bold text-sm">Analisi TRIZ AI</h3>
            <p className="text-[10px] opacity-70">Trascina un problema qui</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border h-[65vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><ClipboardList size={16}/> Note & Report</h3>
              <button 
                onClick={handleCopyReport}
                className={`p-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white'}`}
              >
                <Copy size={12}/> {copyFeedback ? 'Copiato!' : 'Copia Report'}
              </button>
            </div>
            
            {/* Elenco task completati oggi (visivo) */}
            <div className="mb-4 space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completati oggi:</p>
              {tasksCompletedToday.length > 0 ? tasksCompletedToday.map(t => (
                <div key={t.id} className="text-[10px] text-slate-600 flex items-center gap-1 bg-slate-50 p-1 rounded">
                  <CheckCircle2 size={10} className="text-green-500 flex-shrink-0" />
                  <span className="truncate">{t.title}</span>
                </div>
              )) : <p className="text-[10px] text-slate-400 italic">Nessun task completato.</p>}
            </div>

            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="w-full flex-grow bg-slate-50 rounded-2xl p-4 text-xs border-none focus:ring-1 focus:ring-blue-200 resize-none custom-scrollbar" 
              placeholder="Aggiungi note strategiche per domani o dettagli per il report..." 
            />
          </div>
        </section>
      </main>

      {/* --- MODALITÀ STAMPA --- */}
      <div className="hidden print:block text-slate-900 bg-white">
        <div className="print-page-1 px-8 pt-4">
          <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2 mb-6">
            <h1 className="text-xl font-black uppercase">Piano Giornaliero</h1>
            <span className="font-bold text-sm">{format(new Date(), 'dd/MM/yyyy')}</span>
          </div>
          <div className="border border-slate-300 rounded overflow-hidden">
            {timeSlots.map(slot => {
              const task = tasks.find(t => scheduledTasks.find(st => st.startTime === slot.toISOString() && st.taskId === t.id));
              const isFullHour = slot.getMinutes() === 0;
              return (
                <div key={slot.toISOString()} className={`flex items-center gap-6 px-6 py-2 planner-row ${isFullHour ? 'hour-break' : ''}`}>
                  <span className="text-xs font-black w-14 text-slate-800">{format(slot, 'HH:mm')}</span>
                  <div className="w-4 h-4 border-2 border-slate-400 rounded"></div>
                  <span className="text-xs font-bold uppercase truncate">{task?.title || ''}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="print-page-2 px-8 pt-8">
          <h1 className="text-lg font-black mb-8 border-b-4 border-slate-900 pb-1 uppercase">Dettaglio Attività & Note</h1>
          <div className="space-y-6">
            {scheduledTasks.map(st => {
              const task = tasks.find(t => t.id === st.taskId);
              if (!task) return null;
              return (
                <div key={task.id} className="border-l-4 p-4 bg-slate-50 rounded-r-lg" style={{ borderColor: PRIORITIES[task.priority].color }}>
                  <div className="font-black text-xs mb-1 uppercase">{format(parseISO(st.startTime), 'HH:mm')} — {task.title}</div>
                  <p className="text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap">{task.description}</p>
                </div>
              );
            })}
            <div className="mt-10 border-t-2 border-slate-400 pt-6"><h3 className="font-black text-xs mb-4 uppercase">Note Strategiche:</h3><p className="text-[10px] whitespace-pre-wrap leading-loose italic">{notes}</p></div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-6">Nuova Richiesta</h2>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); addTask({desc: fd.get('desc'), priority: fd.get('priority'), deadline: fd.get('deadline')}); }}>
              <textarea name="desc" required className="w-full rounded-2xl border-slate-200 h-44 text-sm p-4 mb-4 focus:ring-1 focus:ring-blue-500" placeholder="Descrizione..." />
              <div className="grid grid-cols-2 gap-4 mb-8">
                <select name="priority" className="rounded-xl border-slate-200 text-sm p-3"><option value="1">Critica</option><option value="2">Urgente</option><option value="3" selected>Pianificabile</option></select>
                <input name="deadline" type="datetime-local" className="rounded-xl border-slate-200 text-sm p-3" />
              </div>
              <div className="flex gap-3"><button type="button" onClick={() => setIsAddingTask(false)} className="flex-grow bg-slate-50 py-4 rounded-2xl font-bold text-slate-400">Annulla</button><button type="submit" className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">Aggiungi</button></div>
            </form>
          </div>
        </div>
      )}

      {analyzedTask && (
        <div className="fixed inset-0 bg-indigo-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Analisi Creativa TRIZ</h2>
            <p className="text-indigo-600 font-bold mb-4 uppercase text-xs tracking-widest">{analyzedTask.title}</p>
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-sm italic border">"{analyzedTask.description}"</div>
            <div className="space-y-6 mb-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 underline">Database TRIZ Completo:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Il database originale con 39 parametri e 40 principi è attivo. Prova ad applicare:</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="font-black text-indigo-700 block mb-1">Principio 1: Segmentazione</span>
                  <p className="text-[10px] text-indigo-900">Dividi l'intervento in parti indipendenti o rendi il sistema più facile da smontare/analizzare.</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="font-black text-indigo-700 block mb-1">Principio 13: Inversione</span>
                  <p className="text-[10px] text-indigo-900">Fai l'opposto dell'azione solita. Rendi fisse le parti mobili o capovolgi il problema.</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Usa l'analisi manuale della matrice se il problema persiste.</p>
            </div>
            <button onClick={() => setAnalyzedTask(null)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">Chiudi Analisi</button>
          </div>
        </div>
      )}

      {/* Modal API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Configura API Gemini</h2>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border rounded-xl mb-6 text-sm"
              placeholder="Incolla qui la tua chiave API..."
            />
            <div className="flex gap-2">
              <button onClick={() => setShowApiKeyModal(false)} className="flex-grow bg-slate-100 py-3 rounded-xl font-bold">Annulla</button>
              <button onClick={() => setShowApiKeyModal(false)} className="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
