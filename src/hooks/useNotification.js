import { useCallback, useEffect, useRef } from 'react';

export function useNotification() {
  const grantedRef = useRef(Notification.permission === 'granted');

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(r => { grantedRef.current = r === 'granted'; });
    }
  }, []);

  const notify = useCallback((title, options = {}) => {
    if (!grantedRef.current) return;
    try {
      new Notification(title, {
        icon: 'https://img.icons8.com/fluency/96/task.png',
        badge: 'https://img.icons8.com/fluency/48/task.png',
        ...options,
      });
    } catch {}
  }, []);

  return { notify };
}
