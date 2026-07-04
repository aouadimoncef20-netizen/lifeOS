import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { api } from './hooks/useApi';
import { useAuth } from './context/AuthContext';
import { useStoredState } from './hooks/useStoredState';
import { uid, PRIORITY_CONFIG, HOURS, DEFAULT_HABITS } from './utils/constants';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useNotification } from './hooks/useNotification';

import PomodoroTimer from './components/PomodoroTimer';
import Sidebar from './components/Sidebar';
import ParticleBurst from './components/ParticleBurst';
import TaskForm from './components/TaskForm';
import CommandPalette from './components/CommandPalette';

import FocusFlow from './components/Views/FocusFlow';
import TimeBlock from './components/Views/TimeBlock';
import MatrixView from './components/Views/MatrixView';
import CalendarView from './components/Views/CalendarView';
import Analytics from './components/Views/Analytics';
import PomodoroView from './components/Views/PomodoroView';

const VIEWS = [
  { key: 'focus', icon: '☰', label: 'Focus Flow' },
  { key: 'timeblock', icon: '◷', label: 'Time-Block' },
  { key: 'matrix', icon: '⊞', label: 'Matrix' },
  { key: 'calendar', icon: '📅', label: 'Calendar' },
  { key: 'pomodoro', icon: '🍅', label: 'Pomodoro' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  const loaded = useRef(false);

  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [theme, setTheme] = useState({ mode: 'dark', accent: '#818cf8', fontSize: 14 });

  // History for undo/redo
  const [history, setHistory] = useState({ past: [], future: [] });
  const [currentView, setCurrentView] = useState('focus');
  const [activeSection, setActiveSection] = useState('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterEnergy, setFilterEnergy] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [particle, setParticle] = useState(null);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pomodoroSessions, setPomodoroSessions] = useStoredState('lifeos-pomo-sessions', []);
  const [pomodoroSettings, setPomodoroSettings] = useState({ focusMinutes: 25, breakMinutes: 5 });

  // Load data from API
  const loadData = useCallback(async () => {
    try {
      const [t, h, s] = await Promise.all([
        api.getTasks(),
        api.getHabits(),
        api.getSettings(),
      ]);
      setTasks(t);
      setHabits(h.length ? h : DEFAULT_HABITS);
      setTheme({ mode: s.mode, accent: s.accent, fontSize: s.fontSize });
      setPomodoroSettings({ focusMinutes: s.focusMinutes || 25, breakMinutes: s.breakMinutes || 5 });
      document.documentElement.style.fontSize = s.fontSize + 'px';
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }, []);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      loadData();
    }
  }, [loadData]);

  // ── Undo/Redo ────────────────────────────────────────────────
  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.past.length) return h;
      const prev = h.past[h.past.length - 1];
      setTasks(current => {
        api.updateTask(current.id || '', current); // noop placeholder
        return prev;
      });
      return { past: h.past.slice(0, -1), future: [...h.future, tasks] };
    });
  }, [tasks]);

  const redo = useCallback(() => {
    setHistory(h => {
      if (!h.future.length) return h;
      const next = h.future[0];
      setTasks(next);
      return { past: [...h.past, tasks], future: h.future.slice(1) };
    });
  }, [tasks]);

  // ── Derived ──────────────────────────────────────────────────
  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId]);
  const incompleteTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  const filteredTasks = useMemo(() => {
    let r = incompleteTasks;
    if (filterPriority !== 'all') r = r.filter(t => t.priority === filterPriority);
    if (filterEnergy !== 'all') r = r.filter(t => t.energy === filterEnergy);
    const s = {
      created: (a, b) => b.createdAt - a.createdAt,
      priority: (a, b) => PRIORITY_CONFIG[b.priority].order - PRIORITY_CONFIG[a.priority].order,
      energy: (a, b) => (a.energy === 'high' ? -1 : 1),
      title: (a, b) => a.title.localeCompare(b.title),
      pomodoro: (a, b) => b.pomodoroSessions - a.pomodoroSessions,
    };
    return [...r].sort(s[sortBy] || s.created);
  }, [incompleteTasks, filterPriority, filterEnergy, sortBy]);

  const tasksByPriority = useMemo(() => {
    const g = { critical: [], high: [], medium: [], low: [] };
    filteredTasks.forEach(t => g[t.priority]?.push(t));
    return g;
  }, [filteredTasks]);

  const tasksByHour = useMemo(() => {
    const m = {};
    incompleteTasks.filter(t => t.timeBlock != null).forEach(t => {
      if (!m[t.timeBlock]) m[t.timeBlock] = [];
      m[t.timeBlock].push(t);
    });
    return m;
  }, [incompleteTasks]);

  const tasksByQuadrant = useMemo(() => {
    const g = { q1: [], q2: [], q3: [], q4: [] };
    incompleteTasks.filter(t => t.quadrant).forEach(t => g[t.quadrant]?.push(t));
    return g;
  }, [incompleteTasks]);

  const completionRate = useMemo(
    () => tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    [tasks, completedTasks]
  );

  const todayCompletion = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return completedTasks.filter(t => t.completedAt && new Date(t.completedAt).getTime() >= d.getTime()).length;
  }, [completedTasks]);

  const energySpent = useMemo(() => {
    const hi = completedTasks.filter(t => t.energy === 'high').length;
    const lo = completedTasks.filter(t => t.energy === 'low').length;
    return { high: hi, low: lo, total: hi + lo };
  }, [completedTasks]);

  const pomodoroTotal = useMemo(
    () => incompleteTasks.filter(t => t.pomodoroSessions > 0).reduce((s, t) => s + t.pomodoroSessions, 0),
    [incompleteTasks]
  );

  const todaySessions = useMemo(
    () => pomodoroSessions.filter(s => {
      const sd = new Date(s.time);
      const td = new Date();
      return sd.toDateString() === td.toDateString();
    }).length,
    [pomodoroSessions]
  );

  const todayMinutes = useMemo(
    () => pomodoroSessions
      .filter(s => new Date(s.time).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + (s.duration || pomodoroSettings.focusMinutes), 0),
    [pomodoroSessions, pomodoroSettings.focusMinutes]
  );

  const weekSessions = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return pomodoroSessions.filter(s => new Date(s.time).getTime() > weekAgo).length;
  }, [pomodoroSessions]);

  const weekMinutes = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return pomodoroSessions
      .filter(s => new Date(s.time).getTime() > weekAgo)
      .reduce((sum, s) => sum + (s.duration || pomodoroSettings.focusMinutes), 0);
  }, [pomodoroSessions, pomodoroSettings.focusMinutes]);

  const habitsDoneToday = useMemo(() => {
    const idx = new Date().getDay();
    const adj = idx === 0 ? 6 : idx - 1;
    return habits.filter(h => h.streak[adj] === 1).length;
  }, [habits]);

  // ── Handlers ────────────────────────────────────────────────
  const addTask = useCallback(async (data) => {
    const task = {
      ...data,
      id: uid(),
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
      pomodoroSessions: 0,
      subtasks: data.subtasks || [],
      recurring: data.recurring || null,
    };
    setTasks(prev => [task, ...prev]);
    try { await api.createTask(data); } catch (e) { console.error(e); }
  }, []);

  const updateTask = useCallback(async (data) => {
    setTasks(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t));
    try { await api.updateTask(data.id, data); } catch (e) { console.error(e); }
  }, []);

  const toggleTask = useCallback(async (id, e) => {
    if (e) {
      const r = e.currentTarget.getBoundingClientRect();
      setParticle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    try { await api.updateTask(id, { completed: updated.completed, completedAt: updated.completedAt }); } catch (e) { console.error(e); }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) { setActiveTaskId(null); setPomodoroActive(false); }
    try { await api.deleteTask(id); } catch (e) { console.error(e); }
  }, [activeTaskId]);

  const toggleHabit = useCallback(async (habitId) => {
    const idx = new Date().getDay();
    const adj = idx === 0 ? 6 : idx - 1;
    setHabits(prev => {
      const updated = prev.map(h =>
        h.id === habitId
          ? { ...h, streak: h.streak.map((v, i) => (i === adj ? (v ? 0 : 1) : v)) }
          : h
      );
      const changed = updated.find(h => h.id === habitId);
      if (changed) api.updateHabit(habitId, { streak: changed.streak }).catch(e => console.error(e));
      return updated;
    });
  }, []);

  const handlePomodoroComplete = useCallback(async (duration) => {
    const session = {
      time: new Date().toISOString(),
      task: activeTask?.title || 'Focus',
      duration: duration || pomodoroSettings.focusMinutes,
    };
    setPomodoroSessions(prev => [...prev, session]);

    if (activeTaskId) {
      setTasks(prev => prev.map(t =>
        t.id === activeTaskId ? { ...t, pomodoroSessions: t.pomodoroSessions + 1 } : t
      ));
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        try { await api.updateTask(activeTaskId, { pomodoroSessions: task.pomodoroSessions + 1 }); } catch (e) { console.error(e); }
      }
    }
  }, [activeTaskId, tasks, activeTask, pomodoroSettings.focusMinutes, setPomodoroSessions]);

  const handlePomodoroSettings = useCallback(({ focusMinutes, breakMinutes }) => {
    setPomodoroSettings({ focusMinutes, breakMinutes });
    api.updateSettings({ focusMinutes, breakMinutes, mode: theme.mode, accent: theme.accent, fontSize: theme.fontSize }).catch(() => {});
  }, [theme]);

  const setFocusTask = useCallback(id => {
    setActiveTaskId(prev => (prev === id ? null : id));
  }, []);

  const timeBlockTask = useCallback((taskId, hour) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeBlock: hour } : t));
    api.updateTask(taskId, { timeBlock: hour }).catch(e => console.error(e));
  }, []);

  const toggleSubtask = useCallback((taskId, subId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => (s.id === subId || !s.id) ? { ...s, done: !s.done } : s) }
        : t
    ));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.map(s => (s.id === subId || !s.id) ? { ...s, done: !s.done } : s);
      api.updateTask(taskId, { subtasks: updatedSubtasks }).catch(e => console.error(e));
    }
  }, [tasks]);

  const autoSchedule = useCallback(() => {
    setTasks(prev => {
      const morning = [6, 7, 8, 9, 10, 11, 12];
      const afternoon = [13, 14, 15, 16, 17];
      const evening = [18, 19, 20, 21, 22];
      let mi = 0, ai = 0, ei = 0;
      return prev.map(t => {
        if (t.completed || t.timeBlock != null) return t;
        if (t.energy === 'high' && mi < morning.length) return { ...t, timeBlock: morning[mi++] };
        if (t.energy === 'low' && ai < afternoon.length) return { ...t, timeBlock: afternoon[ai++] };
        if (ei < evening.length) return { ...t, timeBlock: evening[ei++] };
        return t;
      });
    });
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify({ tasks, habits, theme, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifeos-backup-${Date.now()}.json`;
    a.click();
  }, [tasks, habits, theme]);

  const exportMarkdown = useCallback(() => {
    const lines = ['# Life OS - Task Report\n', '## Active Tasks\n'];
    incompleteTasks.forEach(t => {
      lines.push(`- [ ] **${t.title}** (${t.priority}, ${t.energy})`);
      if (t.description) lines.push(`  ${t.description}`);
      if (t.tags?.length) lines.push(`  Tags: ${t.tags.join(', ')}`);
    });
    lines.push('\n## Completed Tasks\n');
    completedTasks.forEach(t => lines.push(`- [x] **${t.title}**`));
    lines.push(`\n---\nGenerated: ${new Date().toLocaleDateString()}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifeos-report-${Date.now()}.md`;
    a.click();
  }, [incompleteTasks, completedTasks]);

  const handleCommand = useCallback(cmd => {
    if (cmd.type !== 'action') return;
    switch (cmd.payload) {
      case 'New Task': setEditingTask(null); setShowTaskForm(true); break;
      case 'Undo': undo(); break;
      case 'Redo': redo(); break;
      case 'Export Tasks': exportJSON(); break;
      case 'Export Report': exportMarkdown(); break;
      default:
        if (['Focus Flow', 'Time-Block', 'Matrix', 'Calendar', 'Pomodoro'].includes(cmd.payload)) {
          setCurrentView({ 'Focus Flow': 'focus', 'Time-Block': 'timeblock', 'Matrix': 'matrix', 'Calendar': 'calendar', 'Pomodoro': 'pomodoro' }[cmd.payload]);
          setActiveSection('tasks');
        } else if (cmd.payload === 'Analytics') setActiveSection('analytics');
    }
    setShowCmdPalette(false);
  }, [undo, redo, exportJSON, exportMarkdown]);

  const handleThemeChange = useCallback(async (t) => {
    setTheme(t);
    document.documentElement.style.fontSize = `${t.fontSize}px`;
    try { await api.updateSettings({ mode: t.mode, accent: t.accent, fontSize: t.fontSize }); } catch (e) { console.error(e); }
  }, []);

  const navigate = useCallback((section, view) => {
    setActiveSection(section);
    if (view) setCurrentView(view);
  }, []);

  const kbHandlers = useMemo(() => ({
    n: () => { setEditingTask(null); setShowTaskForm(true); },
    escape: () => { setShowTaskForm(false); setEditingTask(null); setShowCmdPalette(false); setShowShortcuts(false); },
    1: () => { setActiveSection('tasks'); setCurrentView('focus'); },
    2: () => { setActiveSection('tasks'); setCurrentView('timeblock'); },
    3: () => { setActiveSection('tasks'); setCurrentView('matrix'); },
    4: () => { setActiveSection('tasks'); setCurrentView('calendar'); },
    5: () => setActiveSection('analytics'),
    6: () => { setActiveSection('tasks'); setCurrentView('pomodoro'); },
    ' ': () => { if (!activeTask) { const f = incompleteTasks[0]; if (f) setActiveTaskId(f.id); } setPomodoroActive(p => !p); },
    f: () => { if (activeTaskId) setPomodoroActive(p => !p); },
    '?': () => setShowShortcuts(s => !s),
    k: () => setShowCmdPalette(s => !s),
    z: () => undo(),
    'shift+z': () => redo(),
  }), [activeTask, incompleteTasks, activeTaskId, undo, redo]);

  useKeyboardShortcuts(kbHandlers, !showTaskForm && !showCmdPalette);

  return (
    <div className={`h-screen flex flex-col theme-${theme.mode} ${theme.mode}`}
      style={{ '--accent-blue': theme.accent, background: `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(129,140,248,0.04), transparent), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(167,139,250,0.04), transparent), var(--bg-deep)` }}>

      {particle && <ParticleBurst x={particle.x} y={particle.y} onDone={() => setParticle(null)} />}

      {showCmdPalette && (
        <CommandPalette tasks={incompleteTasks} isOpen={showCmdPalette}
          onClose={() => setShowCmdPalette(false)} onAction={handleCommand} />
      )}

      {showShortcuts && (
        <div className="fixed bottom-16 right-5 w-72 max-h-80 overflow-y-auto p-4 bg-themed-elevated border border-themed-med rounded-xl z-50 shadow-2xl animate-scale-in">
          <h4 className="text-xs font-bold text-themed mb-3 tracking-tight">Keyboard Shortcuts</h4>
          {Object.entries(SHORTCUTS).map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-1.5 text-[11px]">
              <span className="text-themed-secondary">{v.desc}</span>
              <kbd className="flex gap-1">
                {v.ctrl && <span className="px-1.5 py-0.5 rounded bg-themed-surface border border-themed-med text-[10px] font-mono text-themed-muted">{navigator.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'}</span>}
                <span className="px-1.5 py-0.5 rounded bg-themed-surface border border-themed-med text-[10px] font-mono text-themed-muted">{v.key === ' ' ? 'Space' : v.key}</span>
              </kbd>
            </div>
          ))}
        </div>
      )}

      <PomodoroTimer activeTask={activeTask} onComplete={handlePomodoroComplete}
        isActive={pomodoroActive} setIsActive={setPomodoroActive}
        activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} onNotify={notify}
        focusMinutes={pomodoroSettings.focusMinutes} breakMinutes={pomodoroSettings.breakMinutes}
        onSettingsChange={handlePomodoroSettings}
        todaySessions={todaySessions} todayMinutes={todayMinutes} />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar incompleteCount={incompleteTasks.length} todayCompletion={todayCompletion}
          completionRate={completionRate} habits={habits} onToggleHabit={toggleHabit}
          energySpent={energySpent} activeSection={activeSection} currentView={currentView}
          onNavigate={navigate} theme={theme} onThemeChange={handleThemeChange} />

        <main className="flex-1 flex flex-col overflow-hidden p-6 pr-7 min-w-0 max-md:p-4">
          {activeSection === 'tasks' ? (
            <>
              <div className="flex items-center justify-between mb-6 shrink-0 gap-4 flex-wrap">
                <div className="flex border-themed rounded-lg p-0.5 gap-0.5 bg-themed-surface/50">
                  {VIEWS.map(v => (
                    <button key={v.key}
                      className={`px-4 py-2 border-none bg-transparent text-sm font-medium rounded-md cursor-pointer whitespace-nowrap transition-all duration-150 ${
                        currentView === v.key ? 'bg-accent-blue/15 text-accent-blue shadow-[0_1px_8px_rgba(129,140,248,0.15)]' : 'text-themed-secondary hover:text-themed hover:bg-white/5'
                      }`}
                      onClick={() => setCurrentView(v.key)}>{v.icon} {v.label}</button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-themed-muted hidden md:block">{user?.name}</span>
                  <button className="text-xs text-themed-muted bg-transparent border-none cursor-pointer hover:text-accent-blue transition-colors font-inherit"
                    onClick={logout}>Logout</button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 shrink-0 gap-4 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <select className="px-3 py-2 rounded-lg border border-themed bg-themed-input text-themed-secondary text-xs font-medium cursor-pointer outline-none transition-all font-inherit hover:border-themed-med hover:text-themed"
                    value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select className="px-3 py-2 rounded-lg border border-themed bg-themed-input text-themed-secondary text-xs font-medium cursor-pointer outline-none transition-all font-inherit hover:border-themed-med hover:text-themed"
                    value={filterEnergy} onChange={e => setFilterEnergy(e.target.value)}>
                    <option value="all">All Energy</option>
                    <option value="high">High Focus</option>
                    <option value="low">Low Energy</option>
                  </select>

                  <select className="px-2 py-1.5 rounded-lg border border-themed bg-themed-input text-themed-secondary text-[11px] cursor-pointer outline-none font-inherit"
                    value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="created">Newest</option>
                    <option value="priority">Priority</option>
                    <option value="energy">Energy</option>
                    <option value="title">A-Z</option>
                    <option value="pomodoro">Pomodoro</option>
                  </select>

                  <div className="flex gap-0.5">
                    <button className="px-2.5 py-1.5 rounded-lg border border-themed bg-transparent text-themed-muted text-[11px] cursor-pointer transition-all font-inherit hover:bg-themed-surface hover:text-themed disabled:opacity-25"
                      onClick={undo} disabled={history.past.length === 0}>Undo</button>
                    <button className="px-2.5 py-1.5 rounded-lg border border-themed bg-transparent text-themed-muted text-[11px] cursor-pointer transition-all font-inherit hover:bg-themed-surface hover:text-themed disabled:opacity-25"
                      onClick={redo} disabled={history.future.length === 0}>Redo</button>
                    <button className="px-2.5 py-1.5 rounded-lg border border-themed bg-transparent text-accent-blue text-[11px] cursor-pointer transition-all font-inherit hover:bg-accent-blue/10"
                      onClick={exportJSON}>Export</button>
                  </div>

                  <button className="px-5 py-2 rounded-lg border-none bg-grad-accent text-white text-sm font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap hover:shadow-[0_4px_20px_rgba(129,140,248,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                    onClick={() => { setEditingTask(null); setShowTaskForm(true); }}>
                    + New Task
                  </button>
                </div>
              </div>

              {currentView === 'focus' && (
                <FocusFlow tasks={tasks} incompleteTasks={incompleteTasks} completedTasks={completedTasks}
                  filteredTasks={filteredTasks} tasksByPriority={tasksByPriority}
                  pomodoroActive={pomodoroActive} activeTask={activeTask}
                  onToggle={toggleTask} onEdit={t => { setEditingTask(t); setShowTaskForm(true); }}
                  onDelete={deleteTask} onFocus={setFocusTask}
                  activeTaskId={activeTaskId} onToggleSubtask={toggleSubtask} />
              )}
              {currentView === 'timeblock' && (
                <TimeBlock HOURS={HOURS} tasksByHour={tasksByHour} incompleteTasks={incompleteTasks}
                  onToggle={toggleTask} onEdit={t => { setEditingTask(t); setShowTaskForm(true); }}
                  onDelete={deleteTask} onFocus={setFocusTask}
                  activeTaskId={activeTaskId} onToggleSubtask={toggleSubtask}
                  timeBlockTask={timeBlockTask} onAutoSchedule={autoSchedule} />
              )}
              {currentView === 'matrix' && (
                <MatrixView tasksByQuadrant={tasksByQuadrant} incompleteTasks={incompleteTasks}
                  onToggle={toggleTask} onEdit={t => { setEditingTask(t); setShowTaskForm(true); }}
                  onDelete={deleteTask} onFocus={setFocusTask}
                  activeTaskId={activeTaskId} onToggleSubtask={toggleSubtask} />
              )}
              {currentView === 'calendar' && (
                <CalendarView tasks={tasks} incompleteTasks={incompleteTasks}
                  onToggle={toggleTask} onEdit={t => { setEditingTask(t); setShowTaskForm(true); }}
                  onDelete={deleteTask} onFocus={setFocusTask}
                  activeTaskId={activeTaskId} onToggleSubtask={toggleSubtask} />
              )}
              {currentView === 'pomodoro' && (
                <PomodoroView todaySessions={todaySessions} todayMinutes={todayMinutes}
                  weekSessions={weekSessions} weekMinutes={weekMinutes}
                  sessions={pomodoroSessions}
                  focusMinutes={pomodoroSettings.focusMinutes} breakMinutes={pomodoroSettings.breakMinutes} />
              )}
            </>
          ) : (
            <Analytics completionRate={completionRate} todayCompletion={todayCompletion}
              pomodoroTotal={pomodoroTotal} habitsDoneToday={habitsDoneToday} habitsTotal={habits.length}
              habits={habits} energySpent={energySpent}
              incompleteTasks={incompleteTasks} completedTasks={completedTasks} />
          )}
        </main>
      </div>

      {(showTaskForm || editingTask) && (
        <TaskForm task={editingTask}
          onSave={data => editingTask ? updateTask({ ...data, id: editingTask.id }) : addTask(data)}
          onClose={() => { setShowTaskForm(false); setEditingTask(null); }} />
      )}
    </div>
  );
}
