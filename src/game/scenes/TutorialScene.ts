// 튜토리얼(=챕터 0). 데이터 기반.
// content/narrative/tutorial.ts 의 단계 배열대로 진행.
// 각 단계는 prompt + 통과 조건. MVP: '아무 키 눌러 다음' 식의 가장 가벼운 형태.
// 통과 후 챕터 1 (= GameScene) 으로 replace.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { tutorialSteps } from '@/content/narrative/tutorial';
import { GameScene } from './GameScene';

export class TutorialScene implements Scene {
  private root = new Container();
  private stepIndex = 0;
  private titleText!: Text;
  private promptText!: Text;
  private hintText!: Text;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const bg = new Graphics();
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x0a0b0f);
    this.root.addChild(bg);

    this.titleText = new Text({
      text: '',
      style: { fill: '#fff7d6', fontSize: 12, fontFamily: 'monospace' },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = VIRTUAL_WIDTH / 2;
    this.titleText.y = 32;
    this.root.addChild(this.titleText);

    this.promptText = new Text({
      text: '',
      style: {
        fill: '#d8d2c2',
        fontSize: 9,
        fontFamily: 'monospace',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 48,
      },
    });
    this.promptText.anchor.set(0.5, 0);
    this.promptText.x = VIRTUAL_WIDTH / 2;
    this.promptText.y = 64;
    this.root.addChild(this.promptText);

    this.hintText = new Text({
      text: '— Enter/Space 로 다음, Esc 로 건너뛰기 —',
      style: { fill: '#5a6068', fontSize: 8, fontFamily: 'monospace' },
    });
    this.hintText.anchor.set(0.5);
    this.hintText.x = VIRTUAL_WIDTH / 2;
    this.hintText.y = VIRTUAL_HEIGHT - 16;
    this.root.addChild(this.hintText);

    this.renderStep();
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
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

  private renderStep(): void {
    const step = tutorialSteps[this.stepIndex];
    if (!step) return;
    this.titleText.text = step.title;
    this.promptText.text = step.prompt;
  }
}
