import { useEffect } from 'react';

const SHORTCUTS = {
  'n':       { key: 'n', ctrl: false, desc: 'New Task' },
  'escape':  { key: 'Escape', ctrl: false, desc: 'Close Modal' },
  '1':       { key: '1', ctrl: false, desc: 'Focus Flow View' },
  '2':       { key: '2', ctrl: false, desc: 'Time-Block View' },
  '3':       { key: '3', ctrl: false, desc: 'Matrix View' },
  '4':       { key: '4', ctrl: false, desc: 'Calendar View' },
  '5':       { key: '5', ctrl: false, desc: 'Analytics View' },
  '6':       { key: '6', ctrl: false, desc: 'Pomodoro View' },
  ' ':       { key: ' ', ctrl: false, desc: 'Toggle Pomodoro' },
  'f':       { key: 'f', ctrl: false, desc: 'Toggle Focus Mode' },
  '?':       { key: '?', ctrl: false, desc: 'Show Shortcuts' },
  'k':       { key: 'k', ctrl: true, desc: 'Command Palette' },
  'z':       { key: 'z', ctrl: true, desc: 'Undo' },
  'shift+z': { key: 'Z', ctrl: true, desc: 'Redo' },
  'slash':   { key: '/', ctrl: false, desc: 'Search / Filter' },
};

export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e) => {
      // Don't trigger in input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) && e.key !== 'Escape') return;

      for (const [name, shortcut] of Object.entries(SHORTCUTS)) {
        const match = shortcut.ctrl
          ? (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === shortcut.key.toLowerCase()
          : e.key === shortcut.key;
        if (match && handlers[name]) {
          e.preventDefault();
          handlers[name](e);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

export { SHORTCUTS };
