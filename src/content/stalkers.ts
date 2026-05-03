// 추적자(=적) 정의. 보일러플레이트 호러 컨셉 — 전투 X.
// 플레이어는 이들을 죽일 수 없고, 들키면 도망/숨기.
//
// 새 추적자 추가: 객체 push, spritesheet 에 프레임 추가.

export type StalkerBehavior =
  | 'idle'              // 가만히 있다가 시야에 들어오면 추적
  | 'patrol'            // 정해진 경로 순찰
  | 'wander'            // 무작위 방향 배회
  | 'sound-driven';     // 소리 들리면 그 방향으로

export type CatchEffect =
  | { kind: 'death' }                                       // 즉사 — 게임오버 또는 구역 재시작
  | { kind: 'restart-zone' }                                // 잡히면 구역 시작점으로
  | { kind: 'sanity'; amount: number }                      // 정신력 깎기
  | { kind: 'teleport'; targetTile: string }                // 다른 타일로 강제 이동
  | { kind: 'flag'; id: string };                           // 게임 진행 플래그 set (서사 트리거)

export interface StalkerDef {
  id: string;
  name: string;
  sprite: string;
  speed: number;             // 100 = 플레이어와 같은 속도. 0 = 고정.
  detectionRange: number;    // 시야 범위 (타일 단위). 들키는 거리.
  loseInterestRange: number; // 시야 잃은 후 추적 포기까지 따라오는 거리
  hearing: number;           // 시야 밖 발자국·소음 들리는 거리
  behavior: StalkerBehavior;
  catchEffect: CatchEffect;
  spawnWeight: number;       // 0 이면 자동 스폰 안 함 (스크립트 스폰만)
}

export const stalkers: StalkerDef[] = [
  {
    id: 'wanderer',
    name: '배회자',
    sprite: 'stalker-wanderer',
    speed: 70,
    detectionRange: 6,
    loseInterestRange: 10,
    hearing: 4,
    behavior: 'wander',
    catchEffect: { kind: 'restart-zone' },
    spawnWeight: 5,
  },
  {
    id: 'watcher',
    name: '응시자',
    sprite: 'stalker-watcher',
    speed: 0,
    detectionRange: 8,
    loseInterestRange: 0,
    hearing: 0,
    behavior: 'idle',
    catchEffect: { kind: 'sanity', amount: 1 },
    spawnWeight: 0,
  },
];
