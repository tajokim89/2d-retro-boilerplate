// localStorage 슬롯 기반 save/load.
// 슬롯 0~2. payload 는 임의 JSON 직렬화 가능 객체.
// 게임 상태 직렬화는 game/ 레이어 책임. 이 모듈은 storage I/O 만.

const NAMESPACE = 'retro-napolitan';
const SLOT_PREFIX = `${NAMESPACE}:save:`;

export interface SaveMeta {
  slot: number;
  savedAt: string; // ISO
  label: string;
}

export interface SaveRecord<T> {
  meta: SaveMeta;
  payload: T;
}

export function listSaves<T = unknown>(): SaveRecord<T>[] {
  const out: SaveRecord<T>[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(SLOT_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw) as SaveRecord<T>);
    } catch {
      // 손상된 슬롯은 무시.
    }
  }
  return out.sort((a, b) => a.meta.slot - b.meta.slot);
}

export function loadSave<T>(slot: number): SaveRecord<T> | null {
  const raw = localStorage.getItem(SLOT_PREFIX + slot);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveRecord<T>;
  } catch {
    return null;
  }
}

export function writeSave<T>(slot: number, payload: T, label: string): SaveMeta {
  const meta: SaveMeta = {
    slot,
    savedAt: new Date().toISOString(),
    label,
  };
  const record: SaveRecord<T> = { meta, payload };
  localStorage.setItem(SLOT_PREFIX + slot, JSON.stringify(record));
  return meta;
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(SLOT_PREFIX + slot);
}

export function hasAnySave(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith(SLOT_PREFIX)) return true;
  }
  return false;
}
