import React, { useState, useMemo } from 'react';
import TaskCard from '../TaskCard';
import { PRIORITY_CONFIG } from '../../utils/constants';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['S','M','T','W','T','F','S'];

export default function CalendarView({ tasks, incompleteTasks, onToggle, onEdit, onDelete, onFocus, activeTaskId, onToggleSubtask }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(null);
  const [viewMode, setViewMode] = useState('month');

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const prevDays = new Date(year, month, 0).getDate();

  const calDays = useMemo(() => {
    const d = [];
    for (let i = startDay - 1; i >= 0; i--) d.push({ day: prevDays - i, other: true });
    for (let i = 1; i <= daysInMonth; i++) d.push({ day: i, other: false });
    while (d.length < 42) d.push({ day: d.length - daysInMonth - startDay + 1, other: true });
    return d;
  }, [startDay, daysInMonth, prevDays]);

  const getTasks = (day, other) => other ? [] : incompleteTasks.slice(0, 3);
  const selTasks = selDay ? incompleteTasks.slice(0, 5) : [];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 max-md:gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-themed bg-transparent text-themed-secondary text-sm cursor-pointer transition-all duration-150 hover:bg-themed-surface hover:text-themed max-md:px-2 max-md:py-1 max-md:text-xs"
            onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>←</button>
          <span className="text-base font-bold tracking-tight text-themed max-md:text-sm max-md:min-w-[120px] max-md:text-center">{MONTHS[month]} {year}</span>
          <button className="px-3 py-1.5 rounded-lg border border-themed bg-transparent text-themed-secondary text-sm cursor-pointer transition-all duration-150 hover:bg-themed-surface hover:text-themed max-md:px-2 max-md:py-1 max-md:text-xs"
            onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>→</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] px-3 py-1 rounded-full border border-themed bg-transparent text-themed-secondary cursor-pointer transition-all duration-150 hover:border-accent-blue hover:text-accent-blue max-md:text-[10px]"
            onClick={() => setViewMode(v => v === 'month' ? 'week' : 'month')}>{viewMode === 'month' ? 'Week' : 'Month'}</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-themed-muted uppercase tracking-wide py-1.5">{d}</div>)}
        {calDays.map((d, i) => {
          const isToday = !d.other && d.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={i}
              className={`min-h-[80px] rounded-lg border p-1.5 cursor-pointer flex flex-col gap-0.5 transition-all duration-150 max-md:min-h-[55px] max-md:p-1 ${
                d.other ? 'opacity-20' : 'bg-themed-surface/20 hover:bg-themed-surface hover:border-themed-med'
              } ${
                isToday ? '!border-accent-blue !shadow-[0_0_0_1px_#818cf8] !bg-accent-blue/8' : 'border-themed'
              } ${
                selDay === d.day && !d.other ? '!border-accent-purple/60' : ''
              }`}
              onClick={() => !d.other && setSelDay(d.day === selDay ? null : d.day)}>
              <span className="text-xs font-semibold text-themed-secondary">{d.day}</span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {getTasks(d.day, d.other).map(t => (
                  <span key={t.id} className="text-[9px] px-1 py-[1px] rounded truncate"
                    style={{ background: PRIORITY_CONFIG[t.priority]?.color + '25', color: PRIORITY_CONFIG[t.priority]?.color }}>
                    {t.title}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selDay && (
        <div className="glass-card mt-2 p-4 flex flex-col gap-2.5 animate-slide-up">
          <div className="text-sm font-bold text-themed">{MONTHS[month]} {selDay}, {year}</div>
          {selTasks.length === 0 ? (
            <div className="text-xs text-themed-muted">No tasks for this day</div>
          ) : (
            <div className="flex flex-col gap-1.5 stagger-1">
              {selTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete}
                  onFocus={onFocus} isFocused={activeTaskId === task.id} compact={true} onToggleSubtask={onToggleSubtask} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
