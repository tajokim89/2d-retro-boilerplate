// 구역(zone) 정의 — 한 화면/한 층. 챕터에 묶여서 등장.
// 호러 탐험 컨셉이라 'level' 대신 'zone'.
//
// generator: 'authored' | 'rooms' | 'corridor' | 'cellular'
//   - authored: public/assets/maps/*.json 같은 외부 데이터로 직접 디자인 (가장 흔함)
//   - rooms/corridor/cellular: ROT.Map 알고리즘으로 절차적 생성
//
// exitMode: 'descend'(하강 — 다음 구역) | 'escape'(탈출 — 챕터 종료) | 'loop'(원위치)

import type { ChapterDef } from './narrative/chapters';

export type ZoneGenerator = 'authored' | 'rooms' | 'corridor' | 'cellular';

export interface PropSpawn {
  propId: string;
  count: number;
}

export interface StalkerSpawn {
  stalkerId: string;
  count: number;
}

export interface ZoneDef {
  id: string;
  name: string;
  generator: ZoneGenerator;
  width: number;
  height: number;
  authoredMap?: string;          // 'authored' 일 때 public/assets/maps/<file>.json
  stalkerSpawns: StalkerSpawn[];
  propSpawns: PropSpawn[];
  exitMode: 'descend' | 'escape' | 'loop';
  ambientSignals?: string[];     // 이 구역에서 자동 재생될 broadcast id 들
}

export const zones: ZoneDef[] = [
  {
    id: 'zone-ch1-1',
    name: '시작 구역',
    generator: 'rooms',
    width: 30,
    height: 20,
    stalkerSpawns: [{ stalkerId: 'wanderer', count: 1 }],
    propSpawns: [
      { propId: 'flashlight', count: 1 },
      { propId: 'note', count: 1 },
      { propId: 'radio', count: 1 },
    ],
    exitMode: 'escape',
  },
];

export function zonesForChapter(chapter: ChapterDef): ZoneDef[] {
  return chapter.zoneIds
    .map((id) => zones.find((z) => z.id === id))
    .filter((z): z is ZoneDef => Boolean(z));
}
