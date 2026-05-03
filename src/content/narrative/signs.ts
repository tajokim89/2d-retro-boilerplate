// 표지판 — 환경 표시. 짧은 한두 줄.
// 데모: 학교 1층 안내 표지.

export interface SignEntry {
  id: string;
  body: string;
}

export const signs: SignEntry[] = [
  { id: 'sign-emergency-exit', body: '비상구 →' },
  { id: 'sign-toilet', body: '화장실 ↑' },
  { id: 'sign-classroom', body: '1-3 / 1-4 교실' },
  { id: 'sign-broadcast-room', body: '방송실 — 관계자 외 출입금지' },
  { id: 'sign-placeholder', body: '— 출입 금지 —' },
];

export function findSign(id: string): SignEntry | undefined {
  return signs.find((s) => s.id === id);
}
