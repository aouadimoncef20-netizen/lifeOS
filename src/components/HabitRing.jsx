import React from 'react';

export default function HabitRing({ habit, onToggle }) {
  const todayIdx = new Date().getDay();
  const adj = todayIdx === 0 ? 6 : todayIdx - 1;
  const done = habit.streak.filter(Boolean).length;
  const circumference = 2 * Math.PI * 28;
  const progress = (done / habit.streak.length) * 100;
  const offset = circumference - (progress / 100) * circumference;
  const todayDone = habit.streak[adj] === 1;

  return (
    <div className={`flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl cursor-pointer transition-all duration-200 relative bg-themed-surface/30 border border-transparent hover:border-themed hover:bg-themed-surface ${
      todayDone ? '!border-accent-mint/25 !bg-accent-mint/8' : ''
    }`}
      onClick={() => onToggle(habit.id)}>
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 70 70">
        <circle fill="none" stroke="var(--border-light)" cx="35" cy="35" r="28" strokeWidth="3" />
        <circle fill="none" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ stroke: habit.color, filter: 'drop-shadow(0 0 4px currentColor)', transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
      </svg>
      <span className="text-sm absolute top-[18px]">{habit.icon}</span>
      <span className="text-[10px] text-themed-secondary text-center leading-tight max-w-[70px] truncate">{habit.name}</span>
      <span className="text-[9px] font-bold text-themed-muted">{done}/{habit.streak.length}</span>
    </div>
  );
}
