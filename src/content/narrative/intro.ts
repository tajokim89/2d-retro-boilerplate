// 인트로 슬라이드. IntroScene 이 한 장씩 보여주고, 다 끝나면 메인메뉴로.
// 보일러플레이트 placeholder — 포크 후 자유롭게 교체.

export interface IntroSlide {
  title: string;
  body: string;
}

export const introSlides: IntroSlide[] = [
  {
    title: 'retro-napolitan',
    body: '2D pixel horror exploration boilerplate.\n포크해서 src/content/ 만 갈아끼우면 자기 게임이 됩니다.',
  },
  {
    title: '시작하기',
    body: '메인메뉴에서 [새로시작] 을 눌러 진행하십시오.',
  },
];
