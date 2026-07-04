import React from 'react';
import { PRIORITY_CONFIG } from '../utils/constants';

// ── Constants ──────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BADGES = [
  { id: 'first_task',       icon: '✅', name: 'First Task',       req: (c) => c.completedTasks >= 1 },
  { id: 'task_master',      icon: '🏆', name: 'Task Master',      req: (c) => c.completedTasks >= 10 },
  { id: 'pomodoro_pro',     icon: '🍅', name: 'Pomodoro Pro',     req: (c) => c.pomodoroTotal >= 5 },
  { id: 'habit_hero',       icon: '🦸', name: 'Habit Hero',       req: (c) => c.habitsTotal > 0 && c.habitsDoneToday >= c.habitsTotal },
  { id: 'consistency_king', icon: '👑', name: 'Consistency King', req: (c) => c.habits.some(h => (h.streak || []).every(d => d === 1)) },
  { id: 'energy_sage',      icon: '☯️', name: 'Energy Sage',      req: (c) => {
    const hi = c.energySpent?.high ?? 0; const lo = c.energySpent?.low ?? 0;
    return hi > 0 && lo > 0 && Math.abs(hi - lo) / Math.max(hi, lo) <= 0.3;
  }},
];

// ── Shared micro-styles ───────────────────────────────────────────────────────
const S = {
  cardTitle:  { fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 },
  barTrack:   { height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 0 },
  barFill:    (w, color) => ({ height: '100%', width: `${Math.min(100, w)}%`, borderRadius: 3,
    background: color, transition: 'width 0.5s var(--ease-out-expo)' }),
  rowLabel:   { display: 'flex', justifyContent: 'space-between', marginBottom: 3 },
  labelText:  { fontSize: 12, color: 'var(--text-secondary)' },
  valText:    { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' },
};

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, bar, barPct }) {
  return (
    <div className="glass-card" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      {bar && (
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${Math.min(100, barPct)}%`, borderRadius: 3,
            background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
            transition: 'width 0.6s var(--ease-out-expo)' }} />
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

// ── Horizontal Bar Row ─────────────────────────────────────────────────────────
function BarRow({ label, value, max, color, suffix = '' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={S.rowLabel}>
        <span style={S.labelText}>{label}</span>
        <span style={S.valText}>{value}{suffix}</span>
      </div>
      <div style={S.barTrack}>
        <div style={S.barFill(pct, color)} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Analytics({
  completionRate = 0,
  todayCompletion = 0,
  pomodoroTotal = 0,
  habitsDoneToday = 0,
  habitsTotal = 0,
  habits = [],
  energySpent = { high: 0, low: 0 },
  incompleteTasks = [],
  completedTasks = 0,
}) {
  // ── Derived values ──────────────────────────────────────────────────────────
  const xp = completedTasks * 10 + pomodoroTotal * 5 + habitsDoneToday * 3;
  const level = Math.floor(xp / 100);
  const xpInLevel = xp % 100;

  // Priority counts from incomplete tasks
  const priorityKeys = ['low', 'medium', 'high', 'critical'];
  const priorityCounts = Object.fromEntries(priorityKeys.map(k => [k, 0]));
  incompleteTasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
  });
  const maxPriority = Math.max(1, ...Object.values(priorityCounts));

  // Energy
  const highEnergy = energySpent?.high ?? 0;
  const lowEnergy = energySpent?.low ?? 0;
  const maxEnergy = Math.max(1, highEnergy, lowEnergy);

  const badgeCtx = { completedTasks, pomodoroTotal, habitsDoneToday, habitsTotal, habits, energySpent };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
        Dashboard Analytics
      </h2>

      {/* ══════ KPI Cards ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Overall Completion" value={`${Math.round(completionRate)}%`}
          sub={`${completedTasks} tasks completed`} bar barPct={completionRate} />
        <KpiCard label="Tasks Done Today" value={todayCompletion} sub="completed today" />
        <KpiCard label="Pomodoro Sessions" value={pomodoroTotal} sub="total focus sessions" />
        <KpiCard label="Habits Done Today" value={`${habitsDoneToday}/${habitsTotal}`}
          sub="daily habits complete" />
      </div>

      {/* ══════ Charts Row ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Energy Expenditure */}
        <div className="glass-card" style={{ padding: 18 }}>
          <h3 style={S.cardTitle}>Energy Expenditure</h3>
          <BarRow label="High Focus" value={highEnergy} max={maxEnergy}
            color="var(--accent-amber)" suffix="h" />
          <BarRow label="Low Energy" value={lowEnergy} max={maxEnergy}
            color="var(--accent-mint)" suffix="h" />
        </div>

        {/* Priority Distribution */}
        <div className="glass-card" style={{ padding: 18 }}>
          <h3 style={S.cardTitle}>Priority Distribution</h3>
          {priorityKeys.map(p => (
            <BarRow key={p} label={PRIORITY_CONFIG[p].label}
              value={priorityCounts[p]} max={maxPriority} color={PRIORITY_CONFIG[p].color} />
          ))}
        </div>
      </div>

      {/* ══════ Weekly Habit Streaks ══════ */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 24 }}>
        <h3 style={S.cardTitle}>Weekly Habit Streaks</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 110 }}>
            {DAYS.map(d => (
              <div key={d} style={{ width: 32, textAlign: 'center', fontSize: 10,
                fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          {/* Habit rows */}
          {habits.map(habit => {
            const streak = habit.streak || [0, 0, 0, 0, 0, 0, 0];
            return (
              <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{habit.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.name}</span>
                </div>
                {DAYS.map((_, di) => {
                  const color = habit.color || 'var(--accent-blue)';
                  return (
                    <div key={di} style={{
                      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                      background: streak[di] ? color : 'rgba(255,255,255,0.08)',
                      boxShadow: streak[di] ? `0 0 8px ${color}66` : 'none',
                    }} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════ Gamification ══════ */}
      <div className="glass-card" style={{ padding: 18 }}>
        <h3 style={S.cardTitle}>Gamification</h3>

        {/* XP Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 20px rgba(167,139,250,0.35)', flexShrink: 0 }}>{level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Level {level}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {xpInLevel}/100 XP</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpInLevel}%`, borderRadius: 4,
                background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-blue))',
                transition: 'width 0.6s var(--ease-out-expo)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Total XP: {xp}</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {BADGES.map(badge => {
            const earned = badge.req(badgeCtx);
            return (
              <div key={badge.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: earned ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${earned ? 'rgba(129,140,248,0.20)' : 'rgba(255,255,255,0.04)'}`,
                opacity: earned ? 1 : 0.45,
                transition: 'all var(--dur-normal) var(--ease-out-expo)',
              }}>
                <span style={{ fontSize: 22, filter: earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600,
                    color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>{badge.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {earned ? 'Earned' : 'Locked'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
