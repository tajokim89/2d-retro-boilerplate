// 부팅 직후 인트로. 타이틀 슬라이드, 키 입력 시 다음 슬라이드.
// 모두 ui 레이어 (네이티브 해상도, 크리스피 텍스트).

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { introSlides } from '@/content/narrative/intro';
import { MainMenuScene } from './MainMenuScene';

export class IntroScene implements Scene {
  private root = new Container();
  private slideIndex = 0;
  private titleText!: Text;
  private bodyText!: Text;
  private hintText!: Text;
  private bg!: Graphics;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.bg = new Graphics();
    this.root.addChild(this.bg);

    this.titleText = new Text({
      text: '',
      style: { fill: COLOR.accent, fontSize: 36, fontFamily: FONT_BODY, fontWeight: '700', align: 'center' },
    });
    this.titleText.anchor.set(0.5);
    this.root.addChild(this.titleText);

    this.bodyText = new Text({
      text: '',
      style: {
        fill: COLOR.fgMuted,
        fontSize: 16,
        fontFamily: FONT_BODY,
        align: 'center',
        wordWrap: true,
        lineHeight: 22,
      },
    });
    this.bodyText.anchor.set(0.5);
    this.root.addChild(this.bodyText);

    this.hintText = new Text({
      text: '— 아무 키나 눌러 진행 —',
      style: { fill: COLOR.fgDim, fontSize: 13, fontFamily: FONT_BODY, align: 'center' },
    });
    this.hintText.anchor.set(0.5);
    this.root.addChild(this.hintText);

    this.layout();
    this.renderSlide();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(): void {
    this.slideIndex += 1;
    if (this.slideIndex >= introSlides.length) {
      void this.ctx.manager.replace(new MainMenuScene());
      return;
    }
    this.renderSlide();
  }

  onResize(): void {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;
    this.bg.clear();
    this.bg.rect(0, 0, w, h).fill(COLOR.bgDeep);
    this.titleText.x = w / 2;
    this.titleText.y = h / 2 - 40;
    this.bodyText.x = w / 2;
    this.bodyText.y = h / 2 + 16;
    this.bodyText.style.wordWrapWidth = Math.min(w - 64, 720);
    this.hintText.x = w / 2;
    this.hintText.y = h - 32;
  }

  private renderSlide(): void {
    const slide = introSlides[this.slideIndex];
    if (!slide) return;
    this.titleText.text = slide.title;
    this.bodyText.text = slide.body;
  }
}
