import React, { useMemo } from 'react';

const COLORS = ['#818cf8', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#fb7185'];

export default function PomodoroView({
  todaySessions, todayMinutes, weekSessions, weekMinutes,
  sessions, focusMinutes, breakMinutes,
}) {
  // simulate last 7 days of session data
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        sessions: i === 6 ? todaySessions : Math.round(weekSessions / 7 * (0.6 + Math.random() * 0.8)),
        minutes: i === 6 ? todayMinutes : Math.round(weekMinutes / 7 * (0.6 + Math.random() * 0.8)),
      };
    });
  }, [todaySessions, todayMinutes, weekSessions, weekMinutes]);

  const maxSessions = Math.max(...weekData.map(d => d.sessions), 1);
  const sessionHistory = (sessions || []).slice(-20).reverse();

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-themed">Pomodoro Tracker</h2>
        <span className="flex items-center gap-2 text-sm text-themed-secondary">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-blue" />
          {focusMinutes}m focus · {breakMinutes}m break
        </span>
      </div>

      {/* kpi cards */}
      <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-md:grid-cols-2">
        {[
          { icon: '🍅', value: todaySessions, label: 'Today\'s Sessions', accent: '#818cf8' },
          { icon: '⏱', value: `${todayMinutes}m`, label: 'Focus Time Today', accent: '#a78bfa' },
          { icon: '📅', value: weekSessions, label: 'This Week', accent: '#34d399' },
          { icon: '🎯', value: `${weekMinutes}m`, label: 'Week Total', accent: '#f472b6' },
        ].map(c => (
          <div key={c.label} className="glass-card p-5 flex gap-3 items-start">
            <span className="text-2xl shrink-0">{c.icon}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-extrabold tracking-tight" style={{ color: c.accent }}>
                {c.value}
              </span>
              <span className="text-[10px] font-medium text-themed-muted uppercase tracking-wider">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* week chart */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">📊 This Week</h4>
        <div className="flex items-end gap-3 h-32">
          {weekData.map((d, i) => {
            const h = Math.max(8, (d.sessions / maxSessions) * 100);
            const isToday = i === 6;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] text-themed-muted tabular-nums">{d.sessions}</span>
                <div className="w-full rounded-md transition-all duration-500 relative group cursor-pointer"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}80)`,
                    opacity: isToday ? 1 : 0.6,
                    minHeight: '8px',
                  }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-themed-elevated border border-themed-med px-2 py-1 rounded text-[10px] text-themed whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                    {d.minutes}m · {d.sessions} sessions
                  </div>
                </div>
                <span className={`text-[10px] font-semibold ${isToday ? 'text-accent-blue' : 'text-themed-muted'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* session log */}
      {sessionHistory.length > 0 && (
        <div className="glass-card p-5 flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">📋 Recent Sessions</h4>
          <div className="flex flex-col gap-1">
            {sessionHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-themed-surface/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-accent-blue">🍅</span>
                  <span className="text-themed-secondary">{s.task || `Focus session`}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-themed-muted tabular-nums">{s.duration || focusMinutes}m</span>
                  <span className="text-themed-muted/50 text-[10px]">{s.time || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* timer tips */}
      <div className="glass-card p-5 flex flex-col gap-3">
        <h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">💡 Pomodoro Tips</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { icon: '🎯', title: 'Pick one task', desc: 'Focus on a single task per session. No multitasking.' },
            { icon: '🔇', title: 'Eliminate distractions', desc: 'Silence notifications during focus time.' },
            { icon: '💧', title: 'Stay hydrated', desc: 'Drink water during every break.' },
            { icon: '📝', title: 'Log distractions', desc: 'Write down stray thoughts to process later.' },
          ].map(t => (
            <div key={t.title} className="flex gap-2 p-2.5 rounded-lg bg-themed-surface/30">
              <span className="text-lg">{t.icon}</span>
              <div>
                <span className="font-semibold text-themed block">{t.title}</span>
                <span className="text-themed-muted">{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
