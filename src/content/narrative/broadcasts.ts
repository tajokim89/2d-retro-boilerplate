// 방송/인터컴 — 라디오나 스피커에서 흘러나오는 음성.
// 데모: 교내 방송실에서 흘러나오는 자동 안내. 늦은 시간이라 나올 리가 없는데 흘러나온다.

export interface BroadcastEntry {
  id: string;
  source: string;
  lines: string[];
  loop?: boolean;
  unlocksCodex?: string;
}

export const broadcasts: BroadcastEntry[] = [
  {
    id: 'bc-school-pa',
    source: '교내 방송',
    lines: [
      '— 지지직 —',
      '야간자율학습이 종료되었습니다. 학생들은 1층 정문으로 하교하시기 바랍니다.',
      '오늘 야간자율학습 인원은… 39명입니다.',
      '오늘 야간자율학습 인원은… 40명입니다.',
      '오늘 야간자율학습 인원은… 41명입니다.',
    ],
    loop: false,
    unlocksCodex: 'codex-shadow-line',
  },
  {
    id: 'bc-placeholder',
    source: '라디오',
    lines: ['— 지지직 —', '여기에 자기 게임의 방송 텍스트를 채워 넣으십시오.'],
  },
];

export function findBroadcast(id: string): BroadcastEntry | undefined {
  return broadcasts.find((b) => b.id === id);
}
