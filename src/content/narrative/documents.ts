// 문서/메모/벽글/책 — 환경에 박힌 서사 노드.
// 'fixed' 종류의 prop (메모/책) 또는 인벤토리 안의 메모와 연동.
// 새 문서 추가: 객체 push, props.ts 의 effect 와 id 매칭.

export interface DocumentEntry {
  id: string;
  title: string;
  body: string;
  unlocksCodex?: string; // 읽으면 codex 항목 잠금해제
}

export const documents: DocumentEntry[] = [
  {
    id: 'doc-placeholder',
    title: '낡은 메모',
    body: '여기에 메모 텍스트를 채워 넣으십시오.\n포크 후 src/content/narrative/documents.ts 편집.',
  },
];

export function findDocument(id: string): DocumentEntry | undefined {
  return documents.find((d) => d.id === id);
}
