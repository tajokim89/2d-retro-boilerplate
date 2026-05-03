// 잠금해제형 로어 항목. documents/broadcasts/signs 에서 unlocksCodex 로 자동 잠금해제.

export interface CodexEntry {
  id: string;
  title: string;
  body: string;
}

export const codexEntries: CodexEntry[] = [
  {
    id: 'codex-shadow-line',
    title: '한 줄 더',
    body: '교내 방송과 칠판 낙서가 같은 메시지를 반복한다.\n야자 인원은 39명이었지만, 방송기는 그보다 더 많은 숫자를 부른다.\n복도에서 발걸음을 셀 때 자기 자신의 발걸음을 함께 세지 않도록 주의할 것.',
  },
  {
    id: 'placeholder',
    title: '코덱스 placeholder',
    body: '여기에 로어 텍스트가 들어갑니다. documents/broadcasts/signs 의 unlocksCodex 또는 events.ts 의 unlockCodex 효과로 잠금해제.',
  },
];
