// localStorage 슬롯 R/W. node 환경이라 localStorage 가 없어 minimal 스텁을 깐다.

import { describe, it, expect, beforeEach } from 'vitest';

beforeEach(() => {
  const store: Record<string, string> = {};
  const stub: Storage = {
    get length() {
      return Object.keys(store).length;
    },
    key(i) {
      return Object.keys(store)[i] ?? null;
    },
    getItem(k) {
      return store[k] ?? null;
    },
    setItem(k, v) {
      store[k] = String(v);
    },
    removeItem(k) {
      delete store[k];
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
  (globalThis as unknown as { localStorage: Storage }).localStorage = stub;
});

describe('engine/save', () => {
  it('round-trips a payload through writeSave / loadSave', async () => {
    const { writeSave, loadSave } = await import('@/engine/save');
    writeSave(1, { x: 7, y: 3 }, 'demo');
    const rec = loadSave<{ x: number; y: number }>(1);
    expect(rec).not.toBeNull();
    expect(rec!.payload.x).toBe(7);
    expect(rec!.meta.label).toBe('demo');
    expect(rec!.meta.slot).toBe(1);
    expect(rec!.meta.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('hasAnySave reflects writes and deletes', async () => {
    const { writeSave, deleteSave, hasAnySave } = await import('@/engine/save');
    expect(hasAnySave()).toBe(false);
    writeSave(0, { foo: 'bar' }, 'demo');
    expect(hasAnySave()).toBe(true);
    deleteSave(0);
    expect(hasAnySave()).toBe(false);
  });

  it('listSaves returns slots in id order', async () => {
    const { writeSave, listSaves } = await import('@/engine/save');
    writeSave(2, { a: 1 }, 'c');
    writeSave(0, { a: 2 }, 'a');
    writeSave(1, { a: 3 }, 'b');
    const all = listSaves();
    expect(all.map((r) => r.meta.slot)).toEqual([0, 1, 2]);
    expect(all.map((r) => r.meta.label)).toEqual(['a', 'b', 'c']);
  });
});
