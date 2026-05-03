// Pause 오버레이. GameScene 위에 push 됨.
// 재개 / 저장 / 환경설정 / 메인메뉴.
//
// snapshotProvider 콜백을 통해 GameScene 의 현재 상태를 가져와 SaveSlotScene 에 전달.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { Menu } from '../ui/menu';
import { SettingsScene } from './SettingsScene';
import { SaveSlotScene } from './SaveSlotScene';
import { MainMenuScene } from './MainMenuScene';
import type { GameSnapshot } from '../state';

export interface PauseSceneOptions {
  snapshotProvider: () => GameSnapshot;
}

export class PauseScene implements Scene {
  private root = new Container();
  private menu!: Menu;
  private dim!: Graphics;
  private title!: Text;
  private ctx!: SceneContext;

  constructor(private opts: PauseSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.title = new Text({
      text: '일시정지',
      style: { fill: COLOR.fg, fontSize: 28, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.title.anchor.set(0.5, 0);
    this.root.addChild(this.title);

    this.menu = new Menu({
      items: [
        { id: 'resume', label: '재개' },
        { id: 'save', label: '저장' },
        { id: 'settings', label: '환경설정' },
        { id: 'main', label: '메인메뉴' },
      ],
      width: 280,
    });
    this.root.addChild(this.menu.view);

    this.menu.onSelect((id) => this.handle(id));
    this.menu.onCancel(() => void this.ctx.manager.pop());

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
    this.dim.clear();
    this.dim.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.7 });
    this.title.x = w / 2;
    this.title.y = Math.round(h * 0.22);
    this.menu.layout({ centerX: w / 2, top: Math.round(h * 0.36) });
  }

  private handle(id: string): void {
    switch (id) {
      case 'resume':
        void this.ctx.manager.pop();
        return;
      case 'save':
        void this.ctx.manager.push(
          new SaveSlotScene({
            mode: 'save',
            snapshot: this.opts.snapshotProvider(),
          }),
        );
        return;
      case 'settings':
        void this.ctx.manager.push(new SettingsScene());
        return;
      case 'main':
        if (confirm('진행 상황을 저장하지 않으면 잃습니다. 메인메뉴로 갈까요?')) {
          void this.ctx.manager.replaceAll(new MainMenuScene());
        }
        return;
    }
  }
}
