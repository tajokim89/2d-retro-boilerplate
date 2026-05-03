// 구역(zone) 정의 — 한 화면/한 층. 챕터에 묶여서 등장.
// 데모: 학교 1층 야간 복도.

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
  authoredMap?: string;
  stalkerSpawns: StalkerSpawn[];
  propSpawns: PropSpawn[];
  exitMode: 'descend' | 'escape' | 'loop';
  ambientSignals?: string[];
}

export const zones: ZoneDef[] = [
  {
    id: 'zone-school-1f',
    name: '학교 1층 — 야간',
    generator: 'authored',
    authoredMap: 'maps/zone-school-1f.json',
    width: 30,
    height: 18,
    stalkerSpawns: [{ stalkerId: 'late-pupil', count: 1 }],
    propSpawns: [
      { propId: 'flashlight', count: 1 },
      { propId: 'note', count: 1 },
      { propId: 'blackboard', count: 1 },
      { propId: 'pa-radio', count: 1 },
      { propId: 'sign', count: 2 },
      { propId: 'student-id', count: 1 },
    ],
    exitMode: 'escape',
    ambientSignals: ['bc-school-pa'],
  },
];

export function zonesForChapter(chapter: ChapterDef): ZoneDef[] {
  return chapter.zoneIds
    .map((id) => zones.find((z) => z.id === id))
    .filter((z): z is ZoneDef => Boolean(z));
}
