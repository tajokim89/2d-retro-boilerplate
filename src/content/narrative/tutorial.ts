// 튜토리얼(=챕터 0). TutorialScene 이 순서대로 보여주고 챕터 1 으로 진입.
// 데모: 학교 호러 컨셉의 짧은 안내.

export interface TutorialStep {
  id: string;
  title: string;
  prompt: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'move',
    title: '이동',
    prompt: '↑ ↓ ← → 또는 W A S D 또는 vi-keys (h j k l) 로 복도를 따라 이동합니다. 마침표(.)로 한 박자 멈춰 듣기.',
  },
  {
    id: 'interact',
    title: '상호작용',
    prompt: 'e 로 게시판·메모·교내 방송기를 확인합니다. g 로 책상이나 사물함 안의 물건을 줍습니다.',
  },
  {
    id: 'use',
    title: '손전등',
    prompt: 'f 로 손전등을 켜고 끕니다. 켜면 시야가 넓어지지만, 그쪽도 당신을 더 잘 봅니다.',
  },
  {
    id: 'hide',
    title: '은신',
    prompt: 'c 로 사물함이나 책상 밑에 숨습니다. 들키지 않으면 발걸음이 지나갈 때까지 기다릴 수 있습니다.',
  },
  {
    id: 'exit',
    title: '탈출',
    prompt: '> 로 비상구·계단·열린 출구를 빠져나갑니다. 들키지 않고 도달하는 것이 목표.',
  },
  {
    id: 'goal',
    title: '시작',
    prompt: '학교 1층. Enter 로 시작합니다.',
  },
];
