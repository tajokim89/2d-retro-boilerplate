// 인트로 슬라이드. IntroScene 이 한 장씩 보여주고, 다 끝나면 메인메뉴로.
//
// 보일러플레이트 데모: 학교 야간자습 이후 호러 탐험.
// 포크 후 자기 게임 톤으로 자유롭게 교체 — 이건 "어떻게 데이터를 채우는지" 의 예시.

export interface IntroSlide {
  title: string;
  body: string;
}

export const introSlides: IntroSlide[] = [
  {
    title: '야간자율학습 21:00',
    body: '교실은 평소처럼 형광등이 깜빡였다. 한 시간 전부터 복도가 너무 조용하다.',
  },
  {
    title: '23:47',
    body: '경비실은 비어 있다. 정문은 안에서 잠겨 있다.\n뒷문, 비상구, 어디라도 — 1층을 빠져나갈 길이 필요하다.',
  },
  {
    title: '시작',
    body: '무기는 없다. 마주치면 피하고, 들키면 숨어라.',
  },
];
