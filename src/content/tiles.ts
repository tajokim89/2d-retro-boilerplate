// 타일 정의. mapgen 이 이걸 참조해 GridMap 채움.
// 새 타일 추가: 객체 push, spritesheet 에 프레임 추가.
//
// 호러 탐험 보일러플레이트:
//  - hidesPlayer: 이 타일 위에서 'hide' 의도가 있으면 추적자 시야에서 사라짐 (락커/구석)
//  - trigger:     플레이어가 진입할 때 발생할 환경 이벤트 id (narrative/events.ts 와 매칭)

export interface TileDef {
  id: string;
  walkable: boolean;
  transparent: boolean; // 시야 차단 여부 — 적·플레이어 시야 모두에 영향
  hidesPlayer: boolean; // 이 타일에서 hide 토글 가능 여부
  trigger?: string;     // 진입 시 트리거할 환경 이벤트 id
  sprite: string;
}

export const tiles: TileDef[] = [
  { id: 'floor',       walkable: true,  transparent: true,  hidesPlayer: false, sprite: 'tile-floor' },
  { id: 'wall',        walkable: false, transparent: false, hidesPlayer: false, sprite: 'tile-wall' },
  { id: 'door',        walkable: true,  transparent: false, hidesPlayer: false, sprite: 'tile-door' },
  { id: 'locker',      walkable: true,  transparent: false, hidesPlayer: true,  sprite: 'tile-locker' },
  { id: 'desk-under',  walkable: true,  transparent: true,  hidesPlayer: true,  sprite: 'tile-desk' },
  { id: 'stairs-down', walkable: true,  transparent: true,  hidesPlayer: false, sprite: 'tile-stairs-down' },
  { id: 'exit',        walkable: true,  transparent: true,  hidesPlayer: false, sprite: 'tile-exit' },
];
