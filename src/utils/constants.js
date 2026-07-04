// ═══════════════════════════════════════════════════════════════
// LIFE OS — Constants & Configuration
// ═══════════════════════════════════════════════════════════════

export const PRIORITY_CONFIG = {
  low:       { label: 'Low',       color: '#22c55e', glow: 'rgba(34,197,94,0.35)',  order: 0 },
  medium:    { label: 'Medium',    color: '#3b82f6', glow: 'rgba(59,130,246,0.35)', order: 1 },
  high:      { label: 'High',      color: '#f59e0b', glow: 'rgba(245,158,11,0.40)', order: 2 },
  critical:  { label: 'Critical',  color: '#ef4444', glow: 'rgba(239,68,68,0.45)',  order: 3 },
};

export const ENERGY_ICON = { low: '🧘', high: '⚡' };

export const QUADRANTS = {
  q1: { label: 'Do First',          subtitle: 'Urgent & Important',    className: 'quadrant-q1' },
  q2: { label: 'Schedule',          subtitle: 'Not Urgent & Important',className: 'quadrant-q2' },
  q3: { label: 'Delegate',          subtitle: 'Urgent & Not Important',className: 'quadrant-q3' },
  q4: { label: 'Eliminate',         subtitle: 'Not Urgent & Not Imp.',className: 'quadrant-q4' },
};

export const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM – 10 PM

export const POMODORO_FOCUS = 25;
export const POMODORO_BREAK = 5;

export const DEFAULT_HABITS = [
  { id: 'h1', name: 'Drink Water',    icon: '💧', target: 8,  streak: [0,1,1,0,1,1,1], color: '#38bdf8' },
  { id: 'h2', name: 'Deep Work',      icon: '🧠', target: 1,  streak: [1,1,0,1,1,1,1], color: '#a78bfa' },
  { id: 'h3', name: 'Exercise',       icon: '🏃', target: 1,  streak: [0,1,1,0,1,0,0], color: '#f472b6' },
  { id: 'h4', name: 'Read 30 min',    icon: '📖', target: 1,  streak: [1,1,1,1,1,1,0], color: '#34d399' },
  { id: 'h5', name: 'Meditate',       icon: '🧘', target: 1,  streak: [0,0,1,1,1,1,1], color: '#fbbf24' },
];

export const DEFAULT_TASKS = [
  { id: 't1', title: 'Design System Audit',    description: 'Review color tokens and typography scale across all components.',     tags: ['design','systems'],    priority: 'high',     energy: 'high', completed: false, createdAt: Date.now()-86400000*3, completedAt: null, timeBlock: 9,  quadrant: 'q1', pomodoroSessions: 2, subtasks: [], recurring: null },
  { id: 't2', title: 'API Integration Tests',   description: 'Write integration tests for the new payment gateway endpoints.',     tags: ['backend','testing'],  priority: 'critical', energy: 'high', completed: false, createdAt: Date.now()-86400000*2, completedAt: null, timeBlock: 11, quadrant: 'q1', pomodoroSessions: 0, subtasks: [], recurring: null },
  { id: 't3', title: 'Update Documentation',    description: 'Refresh the onboarding guide with the latest feature screenshots.',  tags: ['docs'],              priority: 'medium',  energy: 'low',  completed: false, createdAt: Date.now()-86400000*5, completedAt: null, timeBlock: 14, quadrant: 'q2', pomodoroSessions: 0, subtasks: [], recurring: null },
  { id: 't4', title: 'Fix Mobile Nav Overlap',  description: 'The bottom nav bar overlaps the cart button on iPhone SE screens.',  tags: ['frontend','bug'],    priority: 'high',     energy: 'high', completed: false, createdAt: Date.now()-86400000*1, completedAt: null, timeBlock: 15, quadrant: 'q1', pomodoroSessions: 1, subtasks: [], recurring: null },
  { id: 't5', title: 'Team Standup Notes',      description: 'Prepare agenda and compile sprint progress highlights for standup.', tags: ['meetings'],          priority: 'low',      energy: 'low',  completed: true,  createdAt: Date.now()-86400000*4, completedAt: Date.now()-86400000*1, timeBlock: null, quadrant: null, pomodoroSessions: 0, subtasks: [], recurring: null },
  { id: 't6', title: 'Competitor Analysis',     description: 'Research top 3 competitor onboarding flows and compile findings.',   tags: ['research','strategy'],priority: 'medium',  energy: 'low',  completed: false, createdAt: Date.now()-86400000*6, completedAt: null, timeBlock: null, quadrant: 'q2', pomodoroSessions: 0, subtasks: [], recurring: null },
  { id: 't7', title: 'Refactor Auth Middleware',description: 'Simplify the JWT verification chain and remove deprecated deps.',    tags: ['backend','refactor'],priority: 'medium',  energy: 'high', completed: false, createdAt: Date.now()-86400000*7, completedAt: null, timeBlock: null, quadrant: 'q2', pomodoroSessions: 0, subtasks: [], recurring: null },
  { id: 't8', title: 'Weekly Newsletter Draft', description: 'Draft the Friday community newsletter featuring latest releases.',   tags: ['content'],          priority: 'low',      energy: 'low',  completed: false, createdAt: Date.now()-86400000*1, completedAt: null, timeBlock: null, quadrant: 'q3', pomodoroSessions: 0, subtasks: [], recurring: 'weekly' },
];

export const ACCENT_COLORS = [
  { name: 'Electric Blue',  value: '#818cf8' },
  { name: 'Cyber Purple',   value: '#a78bfa' },
  { name: 'Mint Green',     value: '#34d399' },
  { name: 'Neon Pink',      value: '#f472b6' },
  { name: 'Amber Glow',     value: '#fbbf24' },
  { name: 'Coral',          value: '#fb7185' },
  { name: 'Cyan',           value: '#22d3ee' },
  { name: 'Lime',           value: '#a3e635' },
];

export const THEME_MODES = ['dark', 'light', 'dim'];

export const AMBIENT_SOUNDS = [
  { id: 'lofi',     name: 'Lo-Fi Beats',   icon: '🎵', url: '' },
  { id: 'rain',     name: 'Rainy Day',     icon: '🌧', url: '' },
  { id: 'whitenoise',name: 'White Noise',  icon: '📡', url: '' },
  { id: 'forest',   name: 'Forest',        icon: '🌲', url: '' },
  { id: 'ocean',    name: 'Ocean Waves',   icon: '🌊', url: '' },
  { id: 'cafe',     name: 'Café Ambience', icon: '☕', url: '' },
];

export const RECURRENCE_OPTIONS = [
  { value: null,      label: 'None' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekdays',label: 'Weekdays' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const SORT_OPTIONS = [
  { value: 'created',   label: 'Created Date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'energy',    label: 'Energy Level' },
  { value: 'title',     label: 'Title A-Z' },
  { value: 'pomodoro',  label: 'Pomodoro Count' },
];

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
