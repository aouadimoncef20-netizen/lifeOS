import React from 'react';
import TaskCard from '../TaskCard';
import { PRIORITY_CONFIG } from '../../utils/constants';

export default function FocusFlow({ filteredTasks, tasksByPriority, pomodoroActive, activeTask, onToggle, onEdit, onDelete, onFocus, activeTaskId, onToggleSubtask, completedTasks }) {
  if (pomodoroActive && activeTask) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2.5 px-6 py-3 rounded-[28px] bg-accent-blue/10 border border-accent-blue/20 text-sm font-semibold text-accent-blue tracking-wide animate-scale-in">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-blue animate-pulse-glow" />
          Deep Work Mode — Single Task Focus
        </div>
        <TaskCard task={activeTask} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onFocus={onFocus} isFocused={true} compact={false} onToggleSubtask={onToggleSubtask} />
      </div>
    );
  }

  const hasTasks = Object.values(tasksByPriority).some(t => t.length > 0);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1">
      {!hasTasks && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
          <span className="text-5xl opacity-40">🎉</span>
          <span className="text-sm text-themed-muted">All caught up!</span>
        </div>
      )}

      {Object.entries(tasksByPriority).map(([priority, tasksList]) =>
        tasksList.length > 0 && (
          <div key={priority} className="flex flex-col gap-2 animate-slide-up">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-0.5 py-1" style={{color: PRIORITY_CONFIG[priority].color}}>
              <span className="w-2 h-2 rounded-full inline-block" style={{background: PRIORITY_CONFIG[priority].color}} />
              {PRIORITY_CONFIG[priority].label}
              <span className="ml-auto text-[11px] bg-themed-surface/50 px-2 py-0.5 rounded-full text-themed-muted font-normal normal-case">{tasksList.length}</span>
            </h3>
            <div className="flex flex-col gap-1.5 stagger-1">
              {tasksList.map((task, i) => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                  onFocus={onFocus} isFocused={activeTaskId === task.id} compact={false} onToggleSubtask={onToggleSubtask} index={i} />
              ))}
            </div>
          </div>
        )
      )}

      {completedTasks.length > 0 && (
        <details className="mt-2 group">
          <summary className="text-xs font-semibold text-themed-muted cursor-pointer py-2 px-0.5 tracking-wider hover:text-themed-secondary transition-colors list-none flex items-center gap-2">
            <span className="transition-transform duration-200 group-open:rotate-90 text-[10px]">▶</span>
            ✓ Completed ({completedTasks.length})
          </summary>
          <div className="flex flex-col gap-1.5 mt-2 stagger-1">
            {completedTasks.slice(0, 10).map(task => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                onFocus={onFocus} isFocused={false} compact={true} onToggleSubtask={onToggleSubtask} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
