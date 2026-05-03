// 환경 이벤트 — 트리거 ↔ 효과 쌍.
// 호러 탐험 컨셉: 정전, 이상한 소리, 추적자 출현, 표지판 등장 등.
// narrative 시스템이 매 턴 평가, 발화 후 'once' 면 다시 발화 안 함.

export type Condition =
  | { kind: 'enterTile'; tileId: string }
  | { kind: 'enterZone'; zoneId: string }
  | { kind: 'pickup'; propId: string }
  | { kind: 'documentRead'; documentId: string }
  | { kind: 'broadcastHeard'; broadcastId: string }
  | { kind: 'detected' }                      // 추적자에게 들켰을 때
  | { kind: 'caught' }                        // 잡혔을 때
  | { kind: 'flag'; id: string; value?: boolean }
  | { kind: 'turnGte'; value: number }        // 구역 진입 후 N틱 경과
  | { kind: 'and'; all: Condition[] }
  | { kind: 'or'; any: Condition[] }
  | { kind: 'not'; cond: Condition };

export type Effect =
  | { kind: 'message'; text: string; tone?: 'info' | 'warn' | 'danger' }
  | { kind: 'lightsOut'; turns: number }                       // 조명 N턴 동안 꺼짐
  | { kind: 'noise'; x: number; y: number; loudness: number }  // 소리 발생 — 추적자가 hearing 으로 반응
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
  // 예시 (보일러플레이트엔 비활성화됨):
  // {
  //   id: 'first-detection',
  //   trigger: { kind: 'detected' },
  //   then: [{ kind: 'message', text: '들켰다.', tone: 'danger' }],
  //   once: true,
  // },
];
