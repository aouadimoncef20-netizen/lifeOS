import React, { useState, useEffect, useMemo, useRef } from 'react';

const ACTIONS = [
  { icon: '✨', name: 'New Task', shortcut: 'N' },          { icon: '☰', name: 'Focus Flow', shortcut: '1' },
  { icon: '◷', name: 'Time-Block', shortcut: '2' },         { icon: '⊞', name: 'Matrix', shortcut: '3' },
  { icon: '📅', name: 'Calendar', shortcut: '4' },          { icon: '🍅', name: 'Pomodoro', shortcut: '6' },
  { icon: '📊', name: 'Analytics', shortcut: '5' },
  { icon: '↩', name: 'Undo', shortcut: 'Ctrl+Z' },          { icon: '↪', name: 'Redo', shortcut: 'Ctrl+Shift+Z' },
  { icon: '💾', name: 'Export Tasks', shortcut: '' },       { icon: '📝', name: 'Export Report', shortcut: '' },
];

export default function CommandPalette({ tasks, isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (isOpen) { setQuery(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const actions = !q || ACTIONS.some(a => a.name.toLowerCase().includes(q))
      ? ACTIONS.filter(a => !q || a.name.toLowerCase().includes(q)).map(a => ({ type: 'action', ...a })) : [];
    const found = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.tags?.some(tg => tg.toLowerCase().includes(q)))
      .slice(0, 5).map(t => ({ type: 'task', icon: '📌', name: t.title, payload: t })) : [];
    return [...actions, ...found];
  }, [query, tasks]);

  useEffect(() => {
    const h = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[idx]) onAction({ type: results[idx].type === 'task' ? 'task' : 'action', payload: results[idx].type === 'task' ? results[idx].payload : results[idx].name });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, results, idx, onAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center pt-[15vh] animate-fade-in"
      style={{backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}} onClick={onClose}>
      <div className="w-[580px] max-w-[92vw] max-h-[60vh] bg-themed-elevated border border-themed-med rounded-xl flex flex-col overflow-hidden shadow-2xl animate-scale-in"
        onClick={e=>e.stopPropagation()}>
        <input ref={inputRef}
          className="px-5 py-4 border-none border-b border-themed bg-transparent text-themed text-sm outline-none placeholder:text-themed-muted w-full"
          placeholder="Search tasks or type a command..." value={query}
          onChange={e => { setQuery(e.target.value); setIdx(0); }} />
        <div className="flex-1 overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-themed-muted">No results found</div>
          ) : (
            results.map((r, i) => (
              <button key={r.name + i}
                className={`flex items-center gap-3 px-5 py-2.5 w-full text-left cursor-pointer border-none transition-all duration-100 ${
                  i === idx ? 'bg-accent-blue/10 text-themed' : 'bg-transparent text-themed-secondary'
                }`}
                onClick={() => onAction({ type: r.type === 'task' ? 'task' : 'action', payload: r.type === 'task' ? r.payload : r.name })}
                onMouseEnter={() => setIdx(i)}>
                <span className="text-base w-6 text-center shrink-0">{r.icon}</span>
                <span className="flex-1 text-sm">{r.name}</span>
                {r.shortcut && <span className="text-[10px] px-1.5 py-0.5 rounded bg-themed-surface text-themed-muted font-mono">{r.shortcut}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
