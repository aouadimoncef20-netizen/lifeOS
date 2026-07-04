import React from 'react';
import { AMBIENT_SOUNDS } from '../utils/constants';

export default function AudioPlayer({ sounds = AMBIENT_SOUNDS, currentSound, isPlaying, volume, onPlay, onStop, onVolumeChange }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.03] rounded-lg">
      <select className="px-2 py-1 rounded border border-white/5 bg-white/[0.02] text-[var(--text-secondary,#9898b0)] text-[11px] font-inherit cursor-pointer outline-none"
        value={currentSound?.id || ''} onChange={e => onPlay(e.target.value || null)}>
        <option value="">🔇 None</option>
        {sounds.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
      </select>
      {currentSound && (
        <button className={`px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all font-inherit ${isPlaying ? 'bg-accent-blue text-white border-accent-blue' : 'border-white/10 bg-transparent text-[var(--text-secondary,#9898b0)] hover:bg-white/5 hover:text-white'}`}
          onClick={isPlaying ? onStop : () => onPlay(currentSound.id)}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      )}
      {isPlaying && (
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={e => onVolumeChange(Number(e.target.value))} className="w-[60px]" />
      )}
      {currentSound && <span className="text-xs text-[var(--text-secondary,#9898b0)]">{currentSound.icon} {currentSound.name}</span>}
    </div>
  );
}
