// 문서/메모/벽글/책 — 환경에 박힌 서사 노드.
// 데모: 학교 1층 곳곳에 흩어진 메모와 칠판 낙서.

export interface DocumentEntry {
  id: string;
  title: string;
  body: string;
  unlocksCodex?: string;
}

export const documents: DocumentEntry[] = [
  {
    id: 'doc-class-leader-note',
    title: '반장의 메모',
    body: '오늘 야자 끝나고 화장실 거울 보지 말라고 그렇게 말했지.\n4층은 절대 가지 말고 1층 비상구로만 나가.',
  },
  {
    id: 'doc-blackboard',
    title: '칠판 낙서',
    body: '한 명이 모자란다.\n한 명이 모자란다.\n한 명이 모자란다.',
    unlocksCodex: 'codex-shadow-line',
  },
  {
    id: 'doc-placeholder',
    title: '낡은 메모',
    body: '여기에 자기 게임의 메모 텍스트를 채워 넣으십시오.\nsrc/content/narrative/documents.ts 편집.',
  },
];

export function findDocument(id: string): DocumentEntry | undefined {
  return documents.find((d) => d.id === id);
}
