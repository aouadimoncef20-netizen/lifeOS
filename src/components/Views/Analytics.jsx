import React, { useMemo } from 'react';
import { PRIORITY_CONFIG } from '../../utils/constants';

const BADGES = [
  { id:'first',  icon:'🏆', name:'First Task',      check:(c)=>c>=1 },
  { id:'master', icon:'👑', name:'Task Master',     check:(c)=>c>=10 },
  { id:'pomo',   icon:'🍅', name:'Pomodoro Pro',    check:(_,__,pt)=>pt>=5 },
  { id:'habit',  icon:'🌟', name:'Habit Hero',      check:(_,hdh)=>hdh },
  { id:'energy', icon:'⚖️', name:'Energy Sage',     check:(_,__,___,hi,lo)=>hi>0&&lo>0 },
  { id:'streak', icon:'🔥', name:'Consistency King', check:(_,__,___,____,_____,str)=>str>=7 },
];

const KPI = [
  { icon:'📈', key:'rate', label:'Overall Completion', bar:true },
  { icon:'🔥', key:'today', label:'Tasks Done Today' },
  { icon:'⏱', key:'pomo', label:'Total Pomodoro' },
  { icon:'🎯', key:'habit', label:'Habits Done Today' },
];

export default function Analytics({ completionRate, todayCompletion, pomodoroTotal, habitsDoneToday, habitsTotal, habits, energySpent, incompleteTasks, completedTasks }) {
  const xp = useMemo(() => completedTasks.length * 10 + pomodoroTotal * 5 + habitsDoneToday * 3, [completedTasks.length, pomodoroTotal, habitsDoneToday]);
  const level = Math.floor(xp / 100) + 1;
  const xpPct = ((xp % 100) / 100) * 100;
  const maxStreak = useMemo(() => Math.max(...habits.map(h => { let m=0,c=0; h.streak.forEach(v => { if(v) c++; else { m=Math.max(m,c); c=0; } }); return Math.max(m,c); })), [habits]);
  const values = { rate: completionRate+'%', today: String(todayCompletion), pomo: String(pomodoroTotal), habit: habitsDoneToday+'/'+habitsTotal };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
      <h2 className="text-xl font-extrabold tracking-tight text-themed">Dashboard Analytics</h2>

      <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-md:grid-cols-1 stagger-1">
        {KPI.map(c => (
          <div key={c.key} className="glass-card p-5 flex gap-3.5 items-start animate-slide-up">
            <span className="text-[28px] shrink-0">{c.icon}</span>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="text-[26px] font-extrabold tracking-tight text-grad-accent">{values[c.key]}</span>
              <span className="text-[11px] font-medium text-themed-muted uppercase tracking-wider">{c.label}</span>
              {c.bar && <div className="h-1 rounded-full bg-themed-surface mt-2 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-1000 ease-out" style={{width:completionRate+'%'}} /></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up"><h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">⚡ Energy Expenditure</h4>
        {['high','low'].map((k,i) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-[110px] text-xs font-semibold text-themed-secondary shrink-0">{i===0?'⚡ High Focus':'🧘 Low Energy'}</span>
            <div className="flex-1 h-[22px] rounded-lg bg-themed-surface overflow-hidden">
              <div className={`h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-bold text-white min-w-[30px] transition-all duration-700 ease-out ${i===0?'bg-grad-high-focus':'bg-grad-low-energy'}`}
                style={{width: energySpent.total>0 ? ((energySpent[k]/energySpent.total)*100)+'%' : '0%'}}>
                <span>{energySpent[k]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up"><h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">📊 Priority Distribution</h4>
        {Object.entries(PRIORITY_CONFIG).map(([k,cfg]) => {
          const count = incompleteTasks.filter(t=>t.priority===k).length;
          const pct = incompleteTasks.length ? (count/incompleteTasks.length)*100 : 0;
          return (<div key={k} className="flex items-center gap-3"><span className="w-[110px] text-xs font-semibold shrink-0" style={{color:cfg.color}}>● {cfg.label}</span><div className="flex-1 h-[22px] rounded-lg bg-themed-surface overflow-hidden"><div className="h-full rounded-lg flex items-center justify-end pr-2.5 text-xs font-bold text-white min-w-[30px] transition-all duration-700 ease-out" style={{width:pct+'%',background:cfg.color}}><span>{count}</span></div></div></div>);
        })}
      </div>

      <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up"><h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">📅 Habit Streaks</h4>
        {habits.map(h => {
          const done = h.streak.filter(Boolean).length;
          const lbs = ['M','T','W','T','F','S','S'];
          return (<div key={h.id} className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-themed-secondary flex-1">{h.icon} {h.name}</span><div className="flex gap-1">{h.streak.map((v,i) => <span key={i} className={`w-[22px] h-[22px] rounded-md border-2 transition-all duration-200 ${v?'scale-105':''}`} style={{background:v?h.color:'transparent',borderColor:h.color}} title={lbs[i]+': '+(v?'Done':'Missed')} />)}</div><span className="text-xs font-bold text-themed-muted tabular-nums">{done}/{h.streak.length}</span></div>);
        })}
      </div>

      <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up"><h4 className="text-[11px] font-bold text-themed-muted uppercase tracking-widest">🏅 Your Progress</h4>
        <div className="flex items-center gap-4"><div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-grad-accent shrink-0"><span className="text-xl font-extrabold text-white leading-none">{level}</span><span className="text-[7px] font-bold text-white/70 uppercase tracking-widest">Level</span></div><div className="flex-1 flex flex-col gap-1"><span className="text-sm font-bold text-themed">{xp} XP</span><div className="h-1.5 rounded-full bg-themed-surface overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-1000 ease-out" style={{width:xpPct+'%'}}/></div><span className="text-[10px] text-themed-muted">{xp%100}/{level*100} XP to Level {level+1}</span></div></div>
        <div className="grid grid-cols-3 gap-2">{BADGES.map(b => {const earned=b.check(completedTasks.length,habitsDoneToday,pomodoroTotal,energySpent.high,energySpent.low,maxStreak);return(<div key={b.id} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 ${earned?'bg-accent-blue/8 border-accent-blue/20 shadow-[0_0_12px_rgba(129,140,248,0.08)]':'opacity-30 grayscale-[70%] bg-themed-surface/30 border-themed'}`}><span className="text-2xl">{earned?b.icon:'🔒'}</span><span className="text-[10px] font-semibold text-themed-secondary text-center leading-tight">{b.name}</span><span className="text-[9px] font-medium text-themed-muted">{earned?'Earned':'Locked'}</span></div>)})}</div>
      </div>
    </div>
  );
}
