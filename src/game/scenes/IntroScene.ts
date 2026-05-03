// 부팅 직후 짧은 인트로. 타이틀 + 한 줄 + Skip 안내.
// 아무 키나 누르면 즉시 다음 씬(MainMenu)으로.
// 텍스트는 모두 content/narrative/intro.ts 에서 가져옴.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { introSlides } from '@/content/narrative/intro';
import { MainMenuScene } from './MainMenuScene';

export class IntroScene implements Scene {
  private root = new Container();
  private slideIndex = 0;
  private titleText!: Text;
  private bodyText!: Text;
  private hintText!: Text;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const bg = new Graphics();
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x05060a);
    this.root.addChild(bg);

    this.titleText = new Text({
      text: '',
      style: { fill: '#fff7d6', fontSize: 16, fontFamily: 'monospace', align: 'center' },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = VIRTUAL_WIDTH / 2;
    this.titleText.y = VIRTUAL_HEIGHT / 2 - 16;
    this.root.addChild(this.titleText);

    this.bodyText = new Text({
      text: '',
      style: { fill: '#9aa0aa', fontSize: 9, fontFamily: 'monospace', align: 'center', wordWrap: true, wordWrapWidth: VIRTUAL_WIDTH - 32 },
    });
    this.bodyText.anchor.set(0.5);
    this.bodyText.x = VIRTUAL_WIDTH / 2;
    this.bodyText.y = VIRTUAL_HEIGHT / 2 + 4;
    this.root.addChild(this.bodyText);

    this.hintText = new Text({
      text: '— 아무 키나 눌러 진행 —',
      style: { fill: '#5a6068', fontSize: 8, fontFamily: 'monospace', align: 'center' },
    });
    this.hintText.anchor.set(0.5);
    this.hintText.x = VIRTUAL_WIDTH / 2;
    this.hintText.y = VIRTUAL_HEIGHT - 16;
    this.root.addChild(this.hintText);

    this.renderSlide();
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
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

  private renderSlide(): void {
    const slide = introSlides[this.slideIndex];
    if (!slide) return;
    this.titleText.text = slide.title;
    this.bodyText.text = slide.body;
  }
}
