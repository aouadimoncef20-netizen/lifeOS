import React from 'react';
import { ACCENT_COLORS, THEME_MODES } from '../utils/constants';

export default function ThemeSettings({ theme, onThemeChange }) {
  const modeIcon = { dark: '🌙', light: '☀️', dim: '🌓' };
  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="text-[11px] font-bold text-themed-muted uppercase tracking-widest px-0.5 mb-1">Theme</div>
      <div className="flex gap-1 bg-themed-surface/50 rounded-lg p-0.5">
        {THEME_MODES.map(m => (
          <button key={m}
            className={`flex-1 py-1.5 px-2 border-none rounded text-[11px] font-medium cursor-pointer transition-all duration-150 ${
              theme.mode === m ? 'bg-accent-blue/15 text-accent-blue shadow-sm' : 'bg-transparent text-themed-secondary hover:text-themed hover:bg-themed-surface'
            }`}
            onClick={() => onThemeChange({ ...theme, mode: m })}>
            {modeIcon[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <div className="text-[11px] font-bold text-themed-muted uppercase tracking-widest px-0.5 mb-1">Accent</div>
      <div className="flex gap-1.5 flex-wrap">
        {ACCENT_COLORS.map(c => (
          <button key={c.value}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-150 flex items-center justify-center hover:scale-110 ${
              theme.accent === c.value ? 'border-themed' : 'border-transparent'
            }`}
            style={{ background: c.value, boxShadow: theme.accent === c.value ? '0 0 8px ' + c.value : 'none' }}
            onClick={() => onThemeChange({ ...theme, accent: c.value })}>
            {theme.accent === c.value && <span className="text-[10px] font-bold text-white/90">✓</span>}
          </button>
        ))}
      </div>
      <div className="text-[11px] font-bold text-themed-muted uppercase tracking-widest px-0.5">Size</div>
      <input type="range" min="12" max="16" step="2" value={theme.fontSize}
        onChange={e => onThemeChange({ ...theme, fontSize: Number(e.target.value) })} />
      <div className="flex justify-between text-[10px] text-themed-muted -mt-1"><span>Compact</span><span>Comfortable</span></div>
    </div>
  );
}
