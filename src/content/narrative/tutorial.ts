// 튜토리얼(=챕터 0). TutorialScene 이 순서대로 보여주고 챕터 1 으로 진입.
// 호러 탐험 컨셉 — 이동/은신/상호작용/탈출 가르침.

export interface TutorialStep {
  id: string;
  title: string;
  prompt: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'move',
    title: '이동',
    prompt: '↑ ↓ ← → 또는 W A S D 또는 vi-keys (h j k l) 로 이동합니다. 마침표(.)로 한 박자 대기.',
  },
  {
    id: 'interact',
    title: '상호작용',
    prompt: 'e 키로 메모를 읽고, 라디오를 켜고, 표지판을 확인합니다. g 로 휴대 가능한 물건을 줍습니다.',
  },
  {
    id: 'use',
    title: '도구 사용',
    prompt: 'f 키로 손전등을 켜고 끕니다. 켜면 시야가 늘지만, 적도 더 잘 봅니다.',
  },
  {
    id: 'hide',
    title: '은신',
    prompt: 'c 키로 락커·책상 밑 같은 은신 가능 타일에서 숨습니다. 들키지 않으면 시야에서 사라집니다.',
  },
  {
    id: 'exit',
    title: '탈출 / 하강',
    prompt: '> 키로 탈출구나 계단을 통과해 다음 구역으로 진행합니다. 들키지 않고 도달하는 게 목표.',
  },
  {
    id: 'goal',
    title: '시작',
    prompt: '챕터 1 을 시작합니다. Enter 로 진행하십시오.',
  },
];
