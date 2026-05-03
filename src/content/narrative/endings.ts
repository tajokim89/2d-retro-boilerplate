// 엔딩 정의. EndingScene 이 endingId 로 검색.
// 데모: 탈출 / 미귀가 두 개.

export interface EndingDef {
  id: string;
  title: string;
  body: string;
}

export const endings: EndingDef[] = [
  {
    id: 'placeholder',
    title: '— 탈출 —',
    body: '비상구가 열렸다. 새벽 공기가 밀려들어왔다.\n학교 안에서 무엇이 깨어났는지 끝내 알 수 없었지만, 적어도 오늘 밤은 거기에 두고 나왔다.',
  },
  {
    id: 'caught',
    title: '— 미귀가 —',
    body: '발걸음이 점점 가까워졌다. 사물함 안에서 마지막으로 본 것은 형광등 아래로 천천히 길어지는 그림자였다.',
  },
];
