// Save/Load payload 타입.
// localStorage 슬롯에 JSON 직렬화되어 들어감 — 직렬화 가능 자료형만 사용.
//
// version: 호환성 깨질 변경이 생기면 올림. 로더가 모르는 버전이면 무시.

export interface GameSnapshot {
  version: 1;
  chapterId: string;
  zoneId: string;
  player: {
    x: number;
    y: number;
    facing: 'down' | 'up' | 'left' | 'right';
  };
  stalker: {
    id: string;
    x: number;
    y: number;
  };
  state: 'safe' | 'spotted' | 'hidden';
  flashlightOn: boolean;
  inventory: string[];
  narrative: {
    facts: string[];
    flags: Record<string, boolean>;
    fired: string[];
    unlockedCodex: string[];
  };
  fov: {
    explored: string[];
  };
  savedAtIso: string;
  label: string;
}
