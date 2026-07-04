import React, { useState, useEffect, useRef, useCallback } from 'react';

const RING = 2 * Math.PI * 40;

export default function PomodoroTimer({
  activeTask, onComplete, isActive, setIsActive, activeTaskId, setActiveTaskId, onNotify,
  focusMinutes = 25, breakMinutes = 5, onSettingsChange, todaySessions = 0, todayMinutes = 0,
}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [left, setLeft] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [focusMins, setFocusMins] = useState(focusMinutes);
  const [breakMins, setBreakMins] = useState(breakMinutes);
  const [expanded, setExpanded] = useState(false);
  const tick = useRef(null);
  const audioCtx = useRef(null);

  const total = mode === 'focus' ? focusMins * 60 : breakMins * 60;
  const pct = ((total - left) / total) * 100;
  const offset = RING - (pct / 100) * RING;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  // ── beep sound using Web Audio API ──────────────────────────
  const playBeep = useCallback(() => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      // second beep higher
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.6);
      }, 200);
    } catch {}
  }, []);

  // reset when focus/break minutes change
  useEffect(() => {
    if (!running) {
      setLeft(mode === 'focus' ? focusMins * 60 : breakMins * 60);
    }
  }, [focusMins, breakMins, mode, running]);

  useEffect(() => {
    if (running && left > 0) {
      tick.current = setInterval(() => setLeft(s => s - 1), 1000);
    }
    return () => clearInterval(tick.current);
  }, [running, left]);

  useEffect(() => {
    if (left > 0) return;
    setRunning(false);
    if (mode === 'focus') {
      playBeep();
      onComplete?.(focusMins);
      onNotify?.('🍅 Pomodoro Complete!', { body: `Finished ${focusMins} min focus session. Take a break.` });
      setMode('break');
      setLeft(breakMins * 60);
    } else {
      playBeep();
      onNotify?.('☕ Break Over', { body: 'Ready to refocus?' });
      setMode('focus');
      setLeft(focusMins * 60);
    }
  }, [left]); // eslint-disable-line

  useEffect(() => {
    if (!isActive) { setRunning(false); setLeft(focusMins * 60); setMode('focus'); }
  }, [isActive, focusMins]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    if (!activeTask && mode === 'focus') return;
    if (!isActive && mode === 'focus') setIsActive(true);
    setRunning(r => !r);
  }, [activeTask, mode, isActive, setIsActive]);

  const reset = useCallback(() => {
    setRunning(false); setIsActive(false); setActiveTaskId(null);
    setLeft(focusMins * 60); setMode('focus');
  }, [setIsActive, setActiveTaskId, focusMins]);

  const saveSettings = () => {
    setLeft(mode === 'focus' ? focusMins * 60 : breakMins * 60);
    onSettingsChange?.({ focusMinutes: focusMins, breakMinutes: breakMins });
    setShowSettings(false);
  };

  let barClass = 'shrink-0 flex border-b transition-all duration-300 border-themed';
  if (isActive) barClass += ' pomodoro-active-glow';
  else if (mode === 'break') barClass += ' pomodoro-break-glow';

  const color = mode === 'break' ? '#34d399' : '#818cf8';

  return (
    <div className={barClass}>
      {/* main row */}
      <div className="h-14 flex items-center justify-between px-6 w-full bg-themed-surface/70"
        style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-4">
          {/* ring */}
          <div className="relative w-10 h-10 shrink-0 cursor-pointer" onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Collapse' : 'Show pomodoro details'}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth="5" />
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={RING} strokeDashoffset={offset}
                style={{ stroke: color, filter: 'drop-shadow(0 0 6px currentColor)', transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-themed">{mm}:{ss}</span>
          </div>

          {/* info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-themed-secondary uppercase tracking-wider">
                {mode === 'focus' ? '🔴 Focus' : '🟢 Break'}
              </span>
              <span className="text-[10px] text-themed-muted">
                {mode === 'focus' ? `${focusMins}m` : `${breakMins}m`}
              </span>
            </div>
            {activeTask && mode === 'focus' ? (
              <span className="text-sm text-themed max-w-[260px] truncate flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-blue animate-pulse-glow" />
                {activeTask.title}
              </span>
            ) : mode === 'focus' && !activeTask ? (
              <span className="text-sm text-themed-muted italic">Pick a task to start</span>
            ) : (
              <span className="text-sm text-accent-mint/80">{todaySessions} sessions today · {todayMinutes}m focused</span>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-accent-blue font-semibold bg-accent-blue/10 px-2 py-1 rounded-md tabular-nums hidden sm:block">
            🍅 {todaySessions}
          </span>

          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-blue text-white cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 hover:shadow-[0_0_16px_rgba(129,140,248,0.35)] active:scale-95"
            onClick={toggle} disabled={!activeTask && mode === 'focus'}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>

          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-transparent border border-themed text-themed-secondary cursor-pointer transition-all duration-150 hover:bg-themed-surface hover:text-themed active:scale-95"
            onClick={reset}>↺ Reset</button>

          <button className="w-7 h-7 rounded-md border border-themed bg-transparent text-themed-muted text-xs cursor-pointer flex items-center justify-center hover:bg-themed-surface hover:text-themed transition-all"
            onClick={() => setShowSettings(s => !s)} title="Timer settings">⚙</button>
        </div>
      </div>

      {/* expandable settings panel */}
      {showSettings && (
        <div className="px-6 py-4 border-t border-themed bg-themed-surface/40 animate-slide-down"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-themed-muted uppercase tracking-wider">Focus (min)</label>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border border-themed bg-transparent text-themed text-sm cursor-pointer hover:bg-themed-surface"
                  onClick={() => setFocusMins(m => Math.max(5, m - 5))}>−</button>
                <span className="w-12 text-center text-sm font-bold text-themed tabular-nums">{focusMins}</span>
                <button className="w-7 h-7 rounded border border-themed bg-transparent text-themed text-sm cursor-pointer hover:bg-themed-surface"
                  onClick={() => setFocusMins(m => Math.min(90, m + 5))}>+</button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-themed-muted uppercase tracking-wider">Break (min)</label>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border border-themed bg-transparent text-themed text-sm cursor-pointer hover:bg-themed-surface"
                  onClick={() => setBreakMins(m => Math.max(1, m - 1))}>−</button>
                <span className="w-12 text-center text-sm font-bold text-themed tabular-nums">{breakMins}</span>
                <button className="w-7 h-7 rounded border border-themed bg-transparent text-themed text-sm cursor-pointer hover:bg-themed-surface"
                  onClick={() => setBreakMins(m => Math.min(30, m + 1))}>+</button>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent-blue text-white cursor-pointer transition-all hover:shadow-[0_0_12px_rgba(129,140,248,0.3)]"
                onClick={saveSettings}>Save</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-transparent border border-themed text-themed-secondary cursor-pointer hover:bg-themed-surface"
                onClick={() => { setFocusMins(focusMinutes); setBreakMins(breakMinutes); setShowSettings(false); }}>Cancel</button>
            </div>

            <div className="text-[10px] text-themed-muted ml-auto">
              ⏱ {todaySessions} completed · {todayMinutes}m total focus
            </div>
          </div>
        </div>
      )}

      {/* today progress bar */}
      {todayMinutes > 0 && (
        <div className="h-1 w-full bg-themed-surface/50">
          <div className="h-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-500"
            style={{ width: `${Math.min(100, (todayMinutes / (focusMins * 8)) * 100)}%` }}
            title={`${todayMinutes} min focused today`} />
        </div>
      )}
    </div>
  );
}
