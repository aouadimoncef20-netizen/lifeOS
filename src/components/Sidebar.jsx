import React from 'react';
import HabitRing from './HabitRing';
import ThemeSettings from './ThemeSettings';

export default function Sidebar({ incompleteCount, todayCompletion, completionRate, habits, onToggleHabit, energySpent, activeSection, currentView, onNavigate, theme, onThemeChange }) {
  const nav = [
    { section: 'tasks', view: 'focus',     icon: '☰',  label: 'Focus Flow' },
    { section: 'tasks', view: 'timeblock', icon: '◷',  label: 'Time-Block' },
    { section: 'tasks', view: 'matrix',    icon: '⊞',  label: 'Matrix' },
    { section: 'tasks', view: 'calendar',  icon: '📅', label: 'Calendar' },
    { section: 'tasks', view: 'pomodoro',  icon: '🍅', label: 'Pomodoro' },
    { section: 'analytics', view: null,    icon: '📊', label: 'Analytics' },
  ];

  const isActive = (n) =>
    n.section === 'analytics'
      ? activeSection === 'analytics'
      : activeSection === 'tasks' && currentView === n.view;

  const wrapClass = 'w-[300px] shrink-0 flex flex-col gap-4 px-4 py-5 border-r border-themed overflow-y-auto bg-[rgba(0,0,0,0.08)] max-lg:w-[260px] max-md:w-full max-md:border-r-0';

  return (
    <aside className={wrapClass}>
      {/* Brand */}
      <div className="flex items-center justify-between px-1 pb-4 border-b border-themed">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl text-accent-purple drop-shadow-[0_0_10px_rgba(167,139,250,0.5)] animate-float">⬡</span>
          <span className="text-xl font-extrabold tracking-tight text-themed">Life<span className="text-grad-accent">OS</span></span>
        </div>
        <span className="text-[10px] font-semibold text-themed-muted bg-themed-surface px-2 py-[3px] rounded-full tracking-wider">v3.0</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[3px]">
        {nav.map(n => (
          <button key={n.label}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-none text-sm font-medium cursor-pointer text-left tracking-wide transition-all duration-150 ${
              isActive(n)
                ? 'bg-accent-blue/10 text-accent-blue shadow-[inset_3px_0_0_#818cf8]'
                : 'bg-transparent text-themed-secondary hover:bg-themed-surface hover:text-themed'
            }`}
            onClick={() => onNavigate(n.section, n.view)}>
            <span className="text-base w-[22px] text-center shrink-0">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3.5 flex flex-col items-center gap-1 text-center">
          <span className="text-[22px] font-extrabold tracking-tight text-grad-accent">{incompleteCount}</span>
          <span className="text-[10px] font-medium text-themed-muted uppercase tracking-widest">Active</span>
        </div>
        <div className="glass-card p-3.5 flex flex-col items-center gap-1 text-center">
          <span className="text-[22px] font-extrabold tracking-tight text-grad-accent">{todayCompletion}</span>
          <span className="text-[10px] font-medium text-themed-muted uppercase tracking-widest">Today</span>
        </div>
        <div className="glass-card col-span-2 p-3.5 flex flex-col items-center gap-1 text-center">
          <span className="text-[22px] font-extrabold tracking-tight text-grad-accent">{completionRate}%</span>
          <span className="text-[10px] font-medium text-themed-muted uppercase tracking-widest">Completion</span>
        </div>
      </div>

      {/* Habits */}
      <div className="flex flex-col gap-2">
        <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest px-0.5">Daily Habits</h4>
        <div className="grid grid-cols-3 gap-2">
          {habits.map(h => <HabitRing key={h.id} habit={h} onToggle={onToggleHabit} />)}
        </div>
      </div>

      {/* Energy bar */}
      <div className="glass-card p-3.5 flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">Energy Spent</span>
        <div className="flex h-2 rounded-full overflow-hidden bg-themed-surface">
          <div className="bg-grad-high-focus" style={{ flex: Math.max(energySpent.high, 0.1) }} />
          <div className="bg-grad-low-energy" style={{ flex: Math.max(energySpent.low, 0.1) }} />
        </div>
        <div className="flex justify-between text-[9px] text-themed-muted">
          <span>⚡ {energySpent.high}</span>
          <span>🧘 {energySpent.low}</span>
        </div>
      </div>

      {/* Theme settings */}
      <ThemeSettings theme={theme} onThemeChange={onThemeChange} />
    </aside>
  );
}
