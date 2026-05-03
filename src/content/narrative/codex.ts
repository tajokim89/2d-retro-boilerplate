// 잠금해제형 로어 항목. narrative 시스템이 unlockCondition 평가.
// 문서/방송/표지판을 읽으면 자동으로 잠금해제되도록 documents/broadcasts/signs 에서
// unlocksCodex 필드로 연결할 수 있음.

export interface CodexEntry {
  id: string;
  title: string;
  body: string;
}

export const codexEntries: CodexEntry[] = [
  {
    id: 'placeholder',
    title: '코덱스 placeholder',
    body: '여기에 로어 텍스트가 들어갑니다. 잠금해제는 documents/broadcasts/signs 의 unlocksCodex 또는 events.ts 의 unlockCodex 효과로.',
  },
];
