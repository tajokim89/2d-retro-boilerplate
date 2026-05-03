// 챕터 정의. GameScene 이 chapterId 로 검색.
// 챕터 = 여러 구역(zone)의 묶음 + 진입/완료 텍스트.

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
    title: '챕터 1 — 작동 확인',
    intro: '무기는 없다. 들키면 도망쳐라.',
    outro: '챕터 1 종료. 여기에 다음 챕터를 추가하십시오.',
    zoneIds: ['zone-ch1-1'],
  },
];
