// 표지판 — 환경 표시. 벽에 새겨진 글자, 출입 금지, 비상구 안내 등.
// 'fixed' prop 인 sign 과 연동.
// 새 표지판 추가: 객체 push, props.ts 와 id 매칭.

export interface SignEntry {
  id: string;
  body: string;       // 짧은 한두 줄
}

export const signs: SignEntry[] = [
  {
    id: 'sign-placeholder',
    body: '— 출입 금지 —',
  },
];

export function findSign(id: string): SignEntry | undefined {
  return signs.find((s) => s.id === id);
}
