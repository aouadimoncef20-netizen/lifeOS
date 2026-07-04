import { useState, useCallback, useRef } from 'react';

/**
 * useUndoRedo — Lightweight undo/redo history for task operations.
 * Stores snapshots of state and allows backward/forward navigation.
 */
export function useUndoRedo(initialState, maxHistory = 50) {
  const [state, setState] = useState(initialState);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const skipRef = useRef(false);

  const pushState = useCallback((newStateOrUpdater) => {
    if (skipRef.current) {
      skipRef.current = false;
      setState(newStateOrUpdater);
      return;
    }

    setState(prev => {
      const resolved = typeof newStateOrUpdater === 'function'
        ? newStateOrUpdater(prev)
        : newStateOrUpdater;
      setPast(p => p.length >= maxHistory ? [...p.slice(1), prev] : [...p, prev]);
      setFuture([]);
      return resolved;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setPast(p => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      const newPast = p.slice(0, -1);
      skipRef.current = true;
      setState(current => {
        setFuture(f => [current, ...f]);
        return prev;
      });
      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);
      skipRef.current = true;
      setState(current => {
        setPast(p => [...p, current]);
        return next;
      });
      return newFuture;
    });
  }, []);

  const resetHistory = useCallback((newState) => {
    setPast([]);
    setFuture([]);
    setState(newState);
  }, []);

  return {
    state,
    setState: pushState,
    undo,
    redo,
    resetHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
