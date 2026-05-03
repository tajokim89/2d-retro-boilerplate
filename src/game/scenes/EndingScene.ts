// 엔딩 화면. 모두 ui 레이어.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { endings } from '@/content/narrative/endings';
import { MainMenuScene } from './MainMenuScene';

export interface EndingSceneOptions {
  endingId: string;
}

export class EndingScene implements Scene {
  private root = new Container();
  private ctx!: SceneContext;
  private bg!: Graphics;
  private title!: Text;
  private body!: Text;
  private hint!: Text;

  constructor(private options: EndingSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    const ending = endings.find((e) => e.id === this.options.endingId) ?? endings[0]!;

    this.bg = new Graphics();
    this.root.addChild(this.bg);

    this.title = new Text({
      text: ending.title,
      style: { fill: COLOR.accent, fontSize: 36, fontFamily: FONT_BODY, fontWeight: '700' },
    });
    this.title.anchor.set(0.5);
    this.root.addChild(this.title);

    this.body = new Text({
      text: ending.body,
      style: {
        fill: COLOR.fgMuted,
        fontSize: 17,
        fontFamily: FONT_BODY,
        align: 'center',
        wordWrap: true,
        lineHeight: 26,
      },
    });
    this.body.anchor.set(0.5, 0);
    this.root.addChild(this.body);

    this.hint = new Text({
      text: '— 아무 키나 눌러 메인메뉴로 —',
      style: { fill: COLOR.fgDim, fontSize: 13, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(0.5);
    this.root.addChild(this.hint);

    this.layout();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(_intent: Intent): void {
    void this.ctx.manager.replace(new MainMenuScene());
  }

  onResize(): void {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;
    this.bg.clear();
    this.bg.rect(0, 0, w, h).fill(COLOR.bgDeep);
    this.title.x = w / 2;
    this.title.y = Math.round(h * 0.32);
    this.body.x = w / 2;
    this.body.y = Math.round(h * 0.32) + 60;
    this.body.style.wordWrapWidth = Math.min(w - 96, 760);
    this.hint.x = w / 2;
    this.hint.y = h - 32;
  }
}
