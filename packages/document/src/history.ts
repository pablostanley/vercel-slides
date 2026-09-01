export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createHistory<T>(present: T): HistoryState<T> {
  return { past: [], present: clone(present), future: [] };
}

export function commitHistory<T>(history: HistoryState<T>, next: T, limit = 100): HistoryState<T> {
  return {
    past: [...history.past, clone(history.present)].slice(-limit),
    present: clone(next),
    future: [],
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: clone(previous),
    future: [clone(history.present), ...history.future],
  };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  const next = history.future[0];
  if (next === undefined) return history;
  return {
    past: [...history.past, clone(history.present)],
    present: clone(next),
    future: history.future.slice(1),
  };
}
