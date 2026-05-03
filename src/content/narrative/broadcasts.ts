// 방송/인터컴 — 라디오나 스피커에서 흘러나오는 음성 텍스트.
// 'fixed' prop 인 라디오와 연동, 또는 zone.ambientSignals 에 등록되어 진입 시 자동 재생.
// 새 방송 추가: 객체 push, props.ts 또는 zones.ts 와 id 매칭.

export interface BroadcastEntry {
  id: string;
  source: string;          // '라디오', '인터컴', '확성기', '?' 등
  lines: string[];         // 한 줄씩 흘러나옴
  loop?: boolean;          // 자동 반복 여부 (앰비언트)
  unlocksCodex?: string;
}

export const broadcasts: BroadcastEntry[] = [
  {
    id: 'bc-placeholder',
    source: '라디오',
    lines: [
      '... 지지직 ...',
      '여기에 방송 텍스트를 채워 넣으십시오.',
      '포크 후 src/content/narrative/broadcasts.ts 편집.',
    ],
  },
];

export function findBroadcast(id: string): BroadcastEntry | undefined {
  return broadcasts.find((b) => b.id === id);
}
