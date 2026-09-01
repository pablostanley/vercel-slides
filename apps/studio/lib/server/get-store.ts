import { MemoryStudioStore } from './memory-store';
import { NeonStudioStore } from './neon-store';
import type { StudioStore } from './store';

let store: StudioStore | null = null;

export function getStore(): StudioStore {
  if (store) return store;
  const requested = process.env.STUDIO_STORAGE;
  if (requested === 'memory') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('The in-memory studio store is disabled in production');
    }
    store = new MemoryStudioStore();
    return store;
  }
  if (process.env.DATABASE_URL) {
    store = new NeonStudioStore();
    return store;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL must be configured in production');
  }
  store = new MemoryStudioStore();
  return store;
}
