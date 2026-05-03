// 추적자 정의. 보일러플레이트 호러 컨셉 — 전투 X.
// 데모: 학교 1층 — 야간 복도의 두 형상.

export type StalkerBehavior =
  | 'idle'
  | 'patrol'
  | 'wander'
  | 'sound-driven';

export type CatchEffect =
  | { kind: 'death' }
  | { kind: 'restart-zone' }
  | { kind: 'sanity'; amount: number }
  | { kind: 'teleport'; targetTile: string }
  | { kind: 'flag'; id: string };

export interface StalkerDef {
  id: string;
  name: string;
  sprite: string;
  speed: number;
  detectionRange: number;
  loseInterestRange: number;
  hearing: number;
  behavior: StalkerBehavior;
  catchEffect: CatchEffect;
  spawnWeight: number;
}

export const stalkers: StalkerDef[] = [
  {
    id: 'late-pupil',
    name: '늦은 학생',
    sprite: 'stalker-late-pupil',
    speed: 80,
    detectionRange: 6,
    loseInterestRange: 10,
    hearing: 4,
    behavior: 'wander',
    catchEffect: { kind: 'restart-zone' },
    spawnWeight: 5,
  },
  {
    id: 'silent-teacher',
    name: '조용한 교사',
    sprite: 'stalker-silent-teacher',
    speed: 0,
    detectionRange: 9,
    loseInterestRange: 0,
    hearing: 0,
    behavior: 'idle',
    catchEffect: { kind: 'sanity', amount: 1 },
    spawnWeight: 0,
  },
];
