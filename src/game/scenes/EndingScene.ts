// 엔딩 화면. content/narrative/endings.ts 에서 텍스트 가져옴.
// 키 입력 시 메인메뉴로.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { endings } from '@/content/narrative/endings';
import { MainMenuScene } from './MainMenuScene';

export interface EndingSceneOptions {
  endingId: string;
}

export class EndingScene implements Scene {
  private root = new Container();
  private ctx!: SceneContext;

  constructor(private options: EndingSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const ending = endings.find((e) => e.id === this.options.endingId) ?? endings[0]!;

    const bg = new Graphics();
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x05060a);
    this.root.addChild(bg);

    const title = new Text({
      text: ending.title,
      style: { fill: '#fff7d6', fontSize: 14, fontFamily: 'monospace' },
    });
    title.anchor.set(0.5);
    title.x = VIRTUAL_WIDTH / 2;
    title.y = 60;
    this.root.addChild(title);

    const body = new Text({
      text: ending.body,
      style: {
        fill: '#9aa0aa',
        fontSize: 9,
        fontFamily: 'monospace',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: VIRTUAL_WIDTH - 48,
      },
    });
    body.anchor.set(0.5, 0);
    body.x = VIRTUAL_WIDTH / 2;
    body.y = 88;
    this.root.addChild(body);

    const hint = new Text({
      text: '— 아무 키나 눌러 메인메뉴로 —',
      style: { fill: '#5a6068', fontSize: 8, fontFamily: 'monospace' },
    });
    hint.anchor.set(0.5);
    hint.x = VIRTUAL_WIDTH / 2;
    hint.y = VIRTUAL_HEIGHT - 16;
    this.root.addChild(hint);
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(_intent: Intent): void {
    void this.ctx.manager.replace(new MainMenuScene());
  }
}
