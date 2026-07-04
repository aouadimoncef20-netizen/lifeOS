import React, { useState } from 'react';
import { PRIORITY_CONFIG, QUADRANTS, RECURRENCE_OPTIONS } from '../utils/constants';

export default function TaskForm({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    title: '', description: '', tags: '', priority: 'medium', energy: 'low',
    timeBlock: null, quadrant: null, recurring: null, subtasks: [],
  });
  const h = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
      timeBlock: form.timeBlock ? Number(form.timeBlock) : null,
    });
    onClose();
  };

  const chipActive = (k) => {
    const map = {
      low: 'bg-accent-mint/20 border-accent-mint/50 text-accent-mint',
      medium: 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue',
      high: 'bg-accent-amber/20 border-accent-amber/50 text-accent-amber',
      critical: 'bg-accent-red/20 border-accent-red/50 text-accent-red',
    };
    return map[k] || '';
  };

  const quadActive = (k) => {
    const map = {
      q1: 'border-accent-red bg-accent-red/15 text-accent-red',
      q2: 'border-accent-blue bg-accent-blue/15 text-accent-blue',
      q3: 'border-accent-amber bg-accent-amber/15 text-accent-amber',
      q4: 'border-white/25 bg-white/8 text-themed-muted',
    };
    return map[k] || '';
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-themed bg-themed-input text-themed text-sm font-inherit outline-none transition-all duration-150 focus:border-accent-blue/40 focus:shadow-[0_0_0_3px_rgba(129,140,248,0.08)] placeholder:text-themed-muted';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in"
      style={{backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}} onClick={onClose}>
      <div className="glass-card w-[520px] max-w-[94vw] max-h-[85vh] overflow-y-auto p-7 animate-scale-in" onClick={e=>e.stopPropagation()}>
        <h3 className="text-lg font-bold tracking-tight mb-5 text-themed">{task ? '✏️ Edit Task' : '✨ New Task'}</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className={inputClass} placeholder="Task title..." value={form.title} onChange={e=>h('title',e.target.value)} autoFocus />
          <textarea className={inputClass + ' resize-y min-h-[60px]'} placeholder="Description..." value={form.description} onChange={e=>h('description',e.target.value)} rows={2} />

          <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Priority</label>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <button key={k} type="button"
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all font-inherit ${
                      form.priority === k ? chipActive(k) : 'border-themed bg-transparent text-themed-secondary'
                    }`}
                    onClick={()=>h('priority',k)}>{v.label}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Energy</label>
              <div className="flex gap-1.5">
                {['low','high'].map(e => (
                  <button key={e} type="button"
                    className={`flex-1 px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer text-center transition-all font-inherit ${
                      form.energy === e ? 'bg-accent-blue/15 border-accent-blue/40 text-accent-blue' : 'border-themed bg-transparent text-themed-secondary'
                    }`}
                    onClick={()=>h('energy',e)}>{e==='low'?'🧘 Low':'⚡ High'}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Tags</label>
              <input className={inputClass} placeholder="design, frontend..."
                value={typeof form.tags==='string'?form.tags:(form.tags||[]).join(', ')} onChange={e=>h('tags',e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Recurrence</label>
              <select className={inputClass} value={form.recurring||''} onChange={e=>h('recurring',e.target.value||null)}>
                {RECURRENCE_OPTIONS.map(o => <option key={o.value||'none'} value={o.value||''}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Sub-tasks</label>
              <button type="button" className="text-[11px] text-accent-blue cursor-pointer bg-transparent border-none hover:underline font-inherit"
                onClick={()=>{const t=prompt('Add sub-task:'); if(t?.trim()) h('subtasks',[...(form.subtasks||[]),{id:'sub-'+Date.now(),title:t.trim(),done:false}]);}}>+ Add</button>
            </div>
            {form.subtasks?.length > 0 && (
              <div className="flex flex-col gap-1">
                {form.subtasks.map((s,i) => (
                  <div key={s.id||i} className="flex items-center justify-between py-1 px-2 bg-themed-surface/50 rounded text-xs text-themed-secondary">
                    <span>{s.title}</span>
                    <button type="button" className="border-none bg-transparent text-themed-muted cursor-pointer text-[11px] hover:text-accent-red transition-colors"
                      onClick={()=>h('subtasks',form.subtasks.filter((_,j)=>j!==i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-themed-muted uppercase tracking-wider">Eisenhower Quadrant</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(QUADRANTS).map(([k,v]) => (
                <button key={k} type="button"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all font-inherit ${
                    form.quadrant === k ? quadActive(k) : 'border-themed bg-transparent text-themed-secondary'
                  }`}
                  onClick={()=>h('quadrant',form.quadrant===k?null:k)}>{v.label}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3.5">
            <input className={inputClass + ' w-32'} type="number" min="6" max="22" placeholder="Hour (6-22)"
              value={form.timeBlock??''} onChange={e=>h('timeBlock',e.target.value)} />
            <div className="flex-1" />
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button type="button"
              className="px-5 py-2.5 rounded-lg border border-themed bg-transparent text-themed-secondary text-sm font-medium cursor-pointer hover:bg-themed-surface hover:text-themed transition-all font-inherit active:scale-95"
              onClick={onClose}>Cancel</button>
            <button type="submit"
              className="px-5 py-2.5 rounded-lg border-none bg-grad-accent text-white text-sm font-semibold cursor-pointer hover:shadow-[0_4px_20px_rgba(129,140,248,0.35)] hover:-translate-y-0.5 transition-all font-inherit active:translate-y-0">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
