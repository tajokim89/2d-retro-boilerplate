// 엔딩 정의. EndingScene 이 endingId 로 검색.
// 호러 탐험 컨셉 — 탈출/실패/오염 등 분기. 보일러플레이트엔 placeholder 1개.

export interface EndingDef {
  id: string;
  title: string;
  body: string;
}

export const endings: EndingDef[] = [
  {
    id: 'placeholder',
    title: '— END —',
    body: '여기에 엔딩 텍스트를 채워 넣으십시오.\n포크 후 src/content/narrative/endings.ts 를 편집.',
  },
];
