// 환경 이벤트 — 트리거 ↔ 효과 쌍.
// 데모: 첫 발견 시 짧은 메시지, 특정 메모 읽으면 코덱스 잠금해제.

export type Condition =
  | { kind: 'enterTile'; tileId: string }
  | { kind: 'enterZone'; zoneId: string }
  | { kind: 'pickup'; propId: string }
  | { kind: 'documentRead'; documentId: string }
  | { kind: 'broadcastHeard'; broadcastId: string }
  | { kind: 'detected' }
  | { kind: 'caught' }
  | { kind: 'flag'; id: string; value?: boolean }
  | { kind: 'turnGte'; value: number }
  | { kind: 'and'; all: Condition[] }
  | { kind: 'or'; any: Condition[] }
  | { kind: 'not'; cond: Condition };

export type Effect =
  | { kind: 'message'; text: string; tone?: 'info' | 'warn' | 'danger' }
  | { kind: 'lightsOut'; turns: number }
  | { kind: 'noise'; x: number; y: number; loudness: number }
  | { kind: 'spawnStalker'; stalkerId: string; x: number; y: number }
  | { kind: 'openDocument'; documentId: string }
  | { kind: 'playBroadcast'; broadcastId: string }
  | { kind: 'unlockCodex'; entryId: string }
  | { kind: 'setFlag'; id: string; value: boolean }
  | { kind: 'goEnding'; endingId: string };

export interface NarrativeEvent {
  id: string;
  trigger: Condition;
  then: Effect[];
  once?: boolean;
}

export const narrativeEvents: NarrativeEvent[] = [
  {
    id: 'first-detection',
    trigger: { kind: 'detected' },
    then: [{ kind: 'message', text: '들켰다. 발걸음 소리가 멈췄다.', tone: 'danger' }],
    once: true,
  },
  {
    id: 'first-caught',
    trigger: { kind: 'caught' },
    then: [{ kind: 'goEnding', endingId: 'caught' }],
    once: true,
  },
  {
    id: 'pa-broadcast-first-trigger',
    trigger: { kind: 'broadcastHeard', broadcastId: 'bc-school-pa' },
    then: [{ kind: 'unlockCodex', entryId: 'codex-shadow-line' }],
    once: true,
  },
];
