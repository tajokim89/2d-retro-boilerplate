// 챕터 정의. GameScene 이 chapterId 로 검색.
// 챕터 = 여러 구역(zone)의 묶음 + 진입/완료 텍스트.
//
// 데모: 학교 1층 빠져나가기 1챕터.

export interface ChapterDef {
  id: string;
  title: string;
  intro: string;
  outro: string;
  zoneIds: string[];
}

export const chapters: ChapterDef[] = [
  {
    id: 'ch1',
    title: '챕터 1 — 야간자율학습 이후',
    intro: '복도는 비어 있다. 정문은 잠겼다. 1층을 빠져나갈 길을 찾는다.',
    outro: '학교 밖 가로등이 다시 보인다. 챕터 1 끝.',
    zoneIds: ['zone-school-1f'],
  },
];
