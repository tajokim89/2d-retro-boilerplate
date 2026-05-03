// 대사 트리. 호러 탐험에선 직접 만남이 드물지만,
// 라디오 너머나 가끔의 만남에 사용.

export interface DialogueChoice {
  text: string;
  nextId: string | null;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: string[];
  choices?: DialogueChoice[];
}

export const dialogueNodes: DialogueNode[] = [
  {
    id: 'classroom-voice',
    speaker: '교실 안의 목소리',
    lines: [
      '거기 누구야?',
      '문 좀 열어줘. 깜빡 잠들었나봐.',
    ],
    choices: [
      { text: '문을 연다.', nextId: null },
      { text: '대답하지 않고 지나간다.', nextId: null },
    ],
  },
  {
    id: 'placeholder',
    speaker: '???',
    lines: ['여기에 자기 게임의 대사를 채워 넣으십시오.'],
    choices: [{ text: '알겠다.', nextId: null }],
  },
];
