// 튜토리얼(=챕터 0). 데이터 기반 — content/narrative/tutorial.ts 의 단계대로.
// 모두 ui 레이어.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { tutorialSteps } from '@/content/narrative/tutorial';
import { GameScene } from './GameScene';

export class TutorialScene implements Scene {
  private root = new Container();
  private stepIndex = 0;
  private titleText!: Text;
  private promptText!: Text;
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
      style: { fill: COLOR.accent, fontSize: 28, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.titleText.anchor.set(0.5, 0);
    this.root.addChild(this.titleText);

    this.promptText = new Text({
      text: '',
      style: {
        fill: COLOR.fg,
        fontSize: 17,
        fontFamily: FONT_BODY,
        align: 'center',
        wordWrap: true,
        lineHeight: 26,
      },
    });
    this.promptText.anchor.set(0.5, 0);
    this.root.addChild(this.promptText);

    this.hintText = new Text({
      text: '— Enter/Space 로 다음, Esc 로 건너뛰기 —',
      style: { fill: COLOR.fgDim, fontSize: 13, fontFamily: FONT_BODY },
    });
    this.hintText.anchor.set(0.5);
    this.root.addChild(this.hintText);

    this.layout();
    this.renderStep();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    if (intent.kind === 'cancel') {
      void this.ctx.manager.replace(new GameScene({ chapterId: 'ch1' }));
      return;
    }
    if (intent.kind === 'confirm' || intent.kind === 'move') {
      this.stepIndex += 1;
      if (this.stepIndex >= tutorialSteps.length) {
        void this.ctx.manager.replace(new GameScene({ chapterId: 'ch1' }));
        return;
      }
      this.renderStep();
    }
  }

  onResize(): void {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;
    this.bg.clear();
    this.bg.rect(0, 0, w, h).fill(COLOR.bg);
    this.titleText.x = w / 2;
    this.titleText.y = Math.round(h * 0.25);
    this.promptText.x = w / 2;
    this.promptText.y = Math.round(h * 0.25) + 60;
    this.promptText.style.wordWrapWidth = Math.min(w - 96, 760);
    this.hintText.x = w / 2;
    this.hintText.y = h - 32;
  }

  private renderStep(): void {
    const step = tutorialSteps[this.stepIndex];
    if (!step) return;
    this.titleText.text = step.title;
    this.promptText.text = step.prompt;
  }
}
