// 소품 정의 (이전의 'items'). 호러 탐험 보일러플레이트엔 무기 없음.
// 손전등/열쇠/메모/라디오/표지판 같은 환경적/서사적 도구.
//
// 새 소품 추가: 객체 push.

export type PropEffect =
  | { kind: 'light'; radius: number; battery?: number }   // 손전등
  | { kind: 'unlock'; doorId: string }                    // 열쇠
  | { kind: 'broadcast'; broadcastId: string }            // 라디오/인터컴 — broadcasts.ts 참조
  | { kind: 'document'; documentId: string }              // 메모/책/벽글 — documents.ts 참조
  | { kind: 'sign'; signId: string }                      // 표지판 — signs.ts 참조
  | { kind: 'tool'; action: string };                     // 일반 도구 — narrative event 트리거용

export type PropKind = 'pickup' | 'fixed';

export interface PropDef {
  id: string;
  name: string;
  sprite: string;
  kind: PropKind;          // pickup: 인벤토리에 들어옴. fixed: 그 자리에서만 상호작용.
  effect: PropEffect;
}

export const props: PropDef[] = [
  {
    id: 'flashlight',
    name: '손전등',
    sprite: 'prop-flashlight',
    kind: 'pickup',
    effect: { kind: 'light', radius: 5, battery: 100 },
  },
  {
    id: 'key',
    name: '열쇠',
    sprite: 'prop-key',
    kind: 'pickup',
    effect: { kind: 'unlock', doorId: 'door-placeholder' },
  },
  {
    id: 'note',
    name: '메모',
    sprite: 'prop-note',
    kind: 'fixed',
    effect: { kind: 'document', documentId: 'doc-placeholder' },
  },
  {
    id: 'radio',
    name: '라디오',
    sprite: 'prop-radio',
    kind: 'fixed',
    effect: { kind: 'broadcast', broadcastId: 'bc-placeholder' },
  },
  {
    id: 'sign',
    name: '표지판',
    sprite: 'prop-sign',
    kind: 'fixed',
    effect: { kind: 'sign', signId: 'sign-placeholder' },
  },
];
