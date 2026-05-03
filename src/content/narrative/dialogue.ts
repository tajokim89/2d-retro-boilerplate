// 대사 트리. 호러 탐험 컨셉에선 직접 만남이 드물지만,
// 라디오 너머 대화나 가끔의 인간 NPC 만남에 사용 가능.
// 보일러플레이트엔 placeholder 1 노드.

export interface DialogueChoice {
  text: string;
  nextId: string | null; // null 이면 대사 종료
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: string[];
  choices?: DialogueChoice[];
}

export const dialogueNodes: DialogueNode[] = [
  {
    id: 'placeholder',
    speaker: '???',
    lines: ['여기에 대사를 넣으십시오.', '포크 후 src/content/narrative/dialogue.ts 편집.'],
    choices: [{ text: '대답하지 않는다.', nextId: null }],
  },
];
