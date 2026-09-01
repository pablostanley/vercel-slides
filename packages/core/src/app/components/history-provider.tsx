import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isTypingTarget } from '@/lib/keys';

export type HistoryEntry = {
  undo: () => void;
  redo: () => void;
  coalesceKey?: string;
  ts: number;
};

type HistoryCtx = {
  canUndo: boolean;
  canRedo: boolean;
  record: (entry: Omit<HistoryEntry, 'ts'>) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

const COALESCE_WINDOW_MS = 500;

const Ctx = createContext<HistoryCtx | null>(null);

export function useHistory(): HistoryCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHistory must be used inside <HistoryProvider>');
  return v;
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  // Set while invoking an entry's undo/redo so providers can skip
  // re-recording the resulting state mutation.
  const suppressedRef = useRef(false);

  const record = useCallback((entry: Omit<HistoryEntry, 'ts'>) => {
    if (suppressedRef.current) return;
    const ts = Date.now();
    setPast((prev) => {
      const top = prev.at(-1);
      if (
        top &&
        entry.coalesceKey !== undefined &&
        top.coalesceKey === entry.coalesceKey &&
        ts - top.ts < COALESCE_WINDOW_MS
      ) {
        const merged: HistoryEntry = {
          undo: top.undo,
          redo: entry.redo,
          coalesceKey: entry.coalesceKey,
          ts,
        };
        return [...prev.slice(0, -1), merged];
      }
      return [...prev, { ...entry, ts }];
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((prev) => {
      const top = prev.at(-1);
      if (!top) return prev;
      suppressedRef.current = true;
      try {
        top.undo();
      } finally {
        suppressedRef.current = false;
      }
      setFuture((f) => [...f, top]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prev) => {
      const top = prev.at(-1);
      if (!top) return prev;
      suppressedRef.current = true;
      try {
        top.redo();
      } finally {
        suppressedRef.current = false;
      }
      setPast((p) => [...p, top]);
      return prev.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((!event.metaKey && !event.ctrlKey) || event.altKey) return;

      const key = event.key.toLowerCase();
      const wantsUndo = key === 'z' && !event.shiftKey;
      const wantsRedo =
        (key === 'z' && event.shiftKey) ||
        (key === 'y' && event.ctrlKey && !event.metaKey && !event.shiftKey);
      if (!wantsUndo && !wantsRedo) return;

      const ownsEditableHistory =
        event.target instanceof Element && event.target.closest('[data-slide-editing]') !== null;
      if (isTypingTarget(event.target) && !ownsEditableHistory) return;
      if ((wantsUndo && !past.length) || (wantsRedo && !future.length)) return;

      event.preventDefault();
      if (wantsUndo) undo();
      else redo();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [past.length, future.length, undo, redo]);

  const value = useMemo<HistoryCtx>(
    () => ({
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      record,
      undo,
      redo,
      clear,
    }),
    [past.length, future.length, record, undo, redo, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
