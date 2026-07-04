import React from 'react';
import TaskCard from '../TaskCard';

export default function TimeBlock({ HOURS, tasksByHour, incompleteTasks, onToggle, onEdit, onDelete, onFocus, activeTaskId, onToggleSubtask, timeBlockTask, onAutoSchedule }) {
  const unassigned = incompleteTasks.filter(t => t.timeBlock == null);
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
      <div className="flex justify-between items-center mb-4">
        <div><span className="text-base font-bold tracking-tight text-themed">Your Day at a Glance</span><span className="text-xs text-themed-muted ml-2">Click slots to assign</span></div>
        {unassigned.length > 0 && (
          <button className="px-4 py-2 rounded-lg border-none bg-gradient-to-r from-accent-mint to-accent-mint/60 text-white text-xs font-semibold cursor-pointer transition-all duration-150 hover:shadow-[0_4px_16px_rgba(52,211,153,0.30)] hover:-translate-y-0.5 active:translate-y-0"
            onClick={onAutoSchedule}>⚡ Auto-Schedule</button>
        )}
      </div>
      <div className="flex flex-col gap-[2px]">
        {HOURS.map(hour => {
          const tasks = tasksByHour[hour] || [];
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const dh = hour > 12 ? hour - 12 : hour;
          return (
            <div key={hour} className="flex gap-3 min-h-[52px] group max-md:gap-2">
              <div className="w-[60px] shrink-0 flex items-start gap-1 pt-1 max-md:w-[48px]">
                <span className="text-sm font-bold text-themed-secondary tabular-nums max-md:text-xs">{dh}:00</span>
                <span className="text-[10px] font-medium text-themed-muted max-md:hidden">{ampm}</span>
              </div>
              <div className="flex-1 flex flex-col gap-[3px] py-0.5 border-l border-themed pl-4 max-md:pl-3">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                    onFocus={onFocus} isFocused={activeTaskId===task.id} compact={true} onToggleSubtask={onToggleSubtask} />
                ))}
                <div className="px-3 py-2 rounded-lg border border-dashed border-themed bg-transparent cursor-pointer transition-all duration-150 hover:border-accent-blue/30 hover:bg-accent-blue/5"
                  onClick={() => { if (unassigned.length) timeBlockTask(unassigned[0].id, hour); }}>
                  <span className="text-xs text-themed-muted opacity-0 group-hover:opacity-100 transition-opacity">+ Assign to {dh}:00</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {unassigned.length > 0 && (
        <div className="glass-card mt-5 p-4 flex flex-col gap-2 animate-slide-up">
          <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">Unscheduled Tasks</h4>
          <p className="text-xs text-themed-muted">Click a "+ Assign" slot above</p>
          <div className="flex flex-col gap-1.5 mt-1 stagger-1">
            {unassigned.map(task => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                onFocus={onFocus} isFocused={activeTaskId===task.id} compact={true} onToggleSubtask={onToggleSubtask} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
