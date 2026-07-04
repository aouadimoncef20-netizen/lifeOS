import React from 'react';
import TaskCard from '../TaskCard';
import { QUADRANTS } from '../../utils/constants';

const BORDERS = { q1: '!border-t-accent-red', q2: '!border-t-accent-blue', q3: '!border-t-accent-amber', q4: '!border-t-themed-med' };

export default function MatrixView({ tasksByQuadrant, incompleteTasks, onToggle, onEdit, onDelete, onFocus, activeTaskId, onToggleSubtask }) {
  const uncategorized = incompleteTasks.filter(t => !t.quadrant);
  return (
    <div className="flex-1 overflow-y-auto flex flex-col pr-1">
      <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-3.5 flex-1 min-h-[500px] max-md:grid-cols-1 max-md:grid-rows-[1fr_1fr_1fr_1fr] max-md:min-h-0">
        {Object.entries(QUADRANTS).map(([key, cfg]) => (
          <div key={key} className={`glass-card flex flex-col gap-1.5 p-[18px] overflow-y-auto !border-t-2 ${BORDERS[key]}`}>
            <div className="flex justify-between items-start mb-1">
              <div><h4 className="text-sm font-bold text-themed">{cfg.label}</h4><span className="text-[10px] text-themed-muted">{cfg.subtitle}</span></div>
              <span className="text-[11px] font-bold text-themed-muted">{tasksByQuadrant[key]?.length || 0}</span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 stagger-1">
              {tasksByQuadrant[key]?.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                  onFocus={onFocus} isFocused={activeTaskId===task.id} compact={true} onToggleSubtask={onToggleSubtask} />
              ))}
              {(!tasksByQuadrant[key] || tasksByQuadrant[key].length === 0) && (
                <div className="text-xs text-themed-muted text-center py-5 opacity-40">No tasks here</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {uncategorized.length > 0 && (
        <div className="glass-card mt-6 p-4 flex flex-col gap-2 animate-slide-up">
          <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">Uncategorized Tasks</h4>
          <div className="flex flex-col gap-1.5 mt-1 stagger-1">
            {uncategorized.map(task => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                onFocus={onFocus} isFocused={activeTaskId===task.id} compact={true} onToggleSubtask={onToggleSubtask} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
