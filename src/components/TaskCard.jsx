import React, { useState } from 'react';
import { PRIORITY_CONFIG, ENERGY_ICON } from '../utils/constants';

export default function TaskCard({
  task, onToggle, onEdit, onDelete, onFocus,
  isFocused, compact, onToggleSubtask,
  index, onDragStart, onDragOver, onDrop,
}) {
  const cfg = PRIORITY_CONFIG[task.priority];
  const [showDelete, setShowDelete] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  let classes = 'glass-card flex items-center justify-between px-4 py-3.5 transition-all duration-200 animate-slide-up';
  if (task.completed) classes += ' opacity-45';
  if (isFocused) classes += ' !bg-accent-blue/5';

  const borderStyle = {
    borderLeft: `3px solid ${isFocused ? '#818cf8' : cfg.color}40`,
    boxShadow: isFocused ? '0 0 24px rgba(129,140,248,0.20), inset 0 0 30px rgba(129,140,248,0.03)' : undefined,
  };

  return (
    <div className={classes} style={borderStyle}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => { e.dataTransfer.setData('text/plain', task.id); onDragStart(e, task.id); } : undefined}
      onDragOver={onDragOver ? (e) => { e.preventDefault(); onDragOver(e, task.id); } : undefined}
      onDrop={onDrop ? (e) => { e.preventDefault(); onDrop(e, task.id); } : undefined}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {onDragStart && <span className="text-themed-muted cursor-grab select-none shrink-0 opacity-30 text-base hover:opacity-70 transition-opacity">⠿</span>}

        <button className="w-[22px] h-[22px] rounded-md border-2 bg-transparent cursor-pointer flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 hover:scale-110"
          style={{ borderColor: cfg.color }} onClick={(e) => onToggle(task.id, e)}>
          {task.completed && <span className="text-sm font-bold" style={{ color: cfg.color }}>✓</span>}
        </button>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className={`text-sm font-semibold text-themed tracking-tight ${task.completed ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </span>

          {!compact && task.description && (
            <span className="text-xs text-themed-muted line-clamp-2">{task.description}</span>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: cfg.color }}>● {cfg.label}</span>
            <span className="text-xs text-themed-muted">{ENERGY_ICON[task.energy]} {task.energy === 'high' ? 'High Focus' : 'Low Energy'}</span>
            {task.tags?.map(t => (
              <span key={t} className="text-[10px] font-medium text-accent-blue bg-accent-blue/10 px-1.5 py-[2px] rounded">#{t}</span>
            ))}
            {task.pomodoroSessions > 0 && <span className="text-xs text-accent-red/80">🍅 ×{task.pomodoroSessions}</span>}
            {task.recurring && <span className="text-[10px] font-semibold text-accent-mint bg-accent-mint/10 px-1.5 py-[2px] rounded capitalize">↻ {task.recurring}</span>}
            {task.subtasks?.length > 0 && (
              <button className="text-[10px] px-1.5 py-[2px] rounded border border-themed bg-transparent text-themed-secondary cursor-pointer hover:bg-themed-surface hover:text-themed transition-all"
                onClick={() => setShowSubtasks(s => !s)}>
                📋 {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
              </button>
            )}
          </div>

          {showSubtasks && task.subtasks?.length > 0 && (
            <div className="mt-1.5 pt-1.5 pb-0.5 pl-5 flex flex-col gap-1 border-t border-themed">
              {task.subtasks.map((sub, si) => (
                <label key={sub.id || si} className="flex items-center gap-1.5 text-xs text-themed-secondary cursor-pointer">
                  <input type="checkbox" checked={sub.done}
                    onChange={() => onToggleSubtask?.(task.id, sub.id || si)} className="checkbox-dot" />
                  <span className={sub.done ? 'line-through opacity-50' : ''}>{sub.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 relative">
        <button className="w-7 h-7 rounded-md border-none bg-transparent text-themed-muted text-sm cursor-pointer flex items-center justify-center hover:bg-themed-surface hover:text-themed transition-all"
          onClick={() => onFocus(task.id)} title="Focus">{isFocused ? '🎯' : '⊙'}</button>
        <button className="w-7 h-7 rounded-md border-none bg-transparent text-themed-muted text-sm cursor-pointer flex items-center justify-center hover:bg-themed-surface hover:text-themed transition-all"
          onClick={() => onEdit(task)} title="Edit">✎</button>
        <button className="w-7 h-7 rounded-md border-none bg-transparent text-themed-muted text-sm cursor-pointer flex items-center justify-center hover:!text-accent-red hover:!bg-accent-red/10 transition-all"
          onClick={() => setShowDelete(s => !s)} title="Delete">🗑</button>

        {showDelete && (
          <div className="absolute right-0 top-full bg-themed-elevated border border-accent-red/30 rounded-lg p-2 flex items-center gap-1.5 z-10 text-xs whitespace-nowrap shadow-lg"
            style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
            <span className="text-themed-secondary">Delete?</span>
            <button className="px-2 py-0.5 rounded border border-accent-red/40 bg-transparent text-accent-red text-[10px] cursor-pointer hover:bg-accent-red/10 transition-all"
              onClick={() => { onDelete(task.id); setShowDelete(false); }}>Yes</button>
            <button className="px-2 py-0.5 rounded border border-themed bg-transparent text-themed-secondary text-[10px] cursor-pointer hover:bg-themed-surface transition-all"
              onClick={() => setShowDelete(false)}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}
