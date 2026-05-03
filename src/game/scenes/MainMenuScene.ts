// 메인메뉴: 새로시작 / 불러오기 / 환경설정 / 종료.
// 모두 ui 레이어 — 크리스피 텍스트.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR, hasAnySave } from '@/engine';
import { Menu } from '../ui/menu';
import { TutorialScene } from './TutorialScene';
import { SettingsScene } from './SettingsScene';

export class MainMenuScene implements Scene {
  private root = new Container();
  private menu!: Menu;
  private bg!: Graphics;
  private title!: Text;
  private subtitle!: Text;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.bg = new Graphics();
    this.root.addChild(this.bg);

    this.title = new Text({
      text: 'retro-napolitan',
      style: { fill: COLOR.accent, fontSize: 44, fontFamily: FONT_BODY, fontWeight: '700' },
    });
    this.title.anchor.set(0.5, 0);
    this.root.addChild(this.title);

    this.subtitle = new Text({
      text: 'a 2d pixel horror exploration boilerplate',
      style: { fill: COLOR.fgDim, fontSize: 14, fontFamily: FONT_BODY },
    });
    this.subtitle.anchor.set(0.5, 0);
    this.root.addChild(this.subtitle);

    this.menu = new Menu({
      items: [
        { id: 'new', label: '새로시작' },
        { id: 'load', label: '불러오기', enabled: hasAnySave() },
        { id: 'settings', label: '환경설정' },
        { id: 'quit', label: '종료' },
      ],
    });
    this.root.addChild(this.menu.view);
    this.menu.onSelect((id) => this.handleSelect(id));

    this.layout();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    this.menu.handleIntent(intent);
  }

  onResize(): void {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;
    this.bg.clear();
    this.bg.rect(0, 0, w, h).fill(COLOR.bg);
    this.title.x = w / 2;
    this.title.y = Math.round(h * 0.22);
    this.subtitle.x = w / 2;
    this.subtitle.y = Math.round(h * 0.22) + 56;
    this.menu.layout({ centerX: w / 2, top: Math.round(h * 0.5) });
  }

  private handleSelect(id: string): void {
    switch (id) {
      case 'new':
        void this.ctx.manager.replace(new TutorialScene());
        break;
      case 'load':
        void this.ctx.manager.replace(new TutorialScene());
        break;
      case 'settings':
        void this.ctx.manager.push(new SettingsScene());
        break;
      case 'quit':
        if (confirm('정말 종료하시겠습니까?')) {
          window.location.replace('about:blank');
        }
        break;
    }
  }
}
