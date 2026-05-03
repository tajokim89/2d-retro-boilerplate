// 소품 정의. 호러 탐험 — 무기 없음.
// 데모: 학교 1층에서 마주칠 도구·환경.

export type PropEffect =
  | { kind: 'light'; radius: number; battery?: number }
  | { kind: 'unlock'; doorId: string }
  | { kind: 'broadcast'; broadcastId: string }
  | { kind: 'document'; documentId: string }
  | { kind: 'sign'; signId: string }
  | { kind: 'tool'; action: string };

export type PropKind = 'pickup' | 'fixed';

export interface PropDef {
  id: string;
  name: string;
  sprite: string;
  kind: PropKind;
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
    id: 'student-id',
    name: '학생증',
    sprite: 'prop-student-id',
    kind: 'pickup',
    effect: { kind: 'unlock', doorId: 'door-staff' },
  },
  {
    id: 'note',
    name: '메모',
    sprite: 'prop-note',
    kind: 'fixed',
    effect: { kind: 'document', documentId: 'doc-class-leader-note' },
  },
  {
    id: 'blackboard',
    name: '칠판 낙서',
    sprite: 'prop-blackboard',
    kind: 'fixed',
    effect: { kind: 'document', documentId: 'doc-blackboard' },
  },
  {
    id: 'pa-radio',
    name: '교내 방송 수신기',
    sprite: 'prop-pa-radio',
    kind: 'fixed',
    effect: { kind: 'broadcast', broadcastId: 'bc-school-pa' },
  },
  {
    id: 'sign',
    name: '표지판',
    sprite: 'prop-sign',
    kind: 'fixed',
    effect: { kind: 'sign', signId: 'sign-emergency-exit' },
  },
];
