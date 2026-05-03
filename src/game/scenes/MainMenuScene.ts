// 메인메뉴: 새로시작 / 불러오기 / 환경설정 / 종료.
// '불러오기' 는 저장 슬롯이 하나라도 있을 때만 활성화.
// '종료' 는 웹에선 confirm 한 번 띄우고 about:blank 로.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, hasAnySave } from '@/engine';
import { Menu } from '../ui/menu';
import { TutorialScene } from './TutorialScene';
import { SettingsScene } from './SettingsScene';

export class MainMenuScene implements Scene {
  private root = new Container();
  private menu!: Menu;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const bg = new Graphics();
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x0a0b0f);
    this.root.addChild(bg);

    const title = new Text({
      text: 'retro-napolitan',
      style: { fill: '#fff7d6', fontSize: 18, fontFamily: 'monospace' },
    });
    title.anchor.set(0.5, 0);
    title.x = VIRTUAL_WIDTH / 2;
    title.y = 32;
    this.root.addChild(title);

    const subtitle = new Text({
      text: 'a roguelike boilerplate',
      style: { fill: '#5a6068', fontSize: 8, fontFamily: 'monospace' },
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.x = VIRTUAL_WIDTH / 2;
    subtitle.y = 54;
    this.root.addChild(subtitle);

    this.menu = new Menu({
      items: [
        { id: 'new', label: '새로시작' },
        { id: 'load', label: '불러오기', enabled: hasAnySave() },
        { id: 'settings', label: '환경설정' },
        { id: 'quit', label: '종료' },
      ],
      x: Math.floor((VIRTUAL_WIDTH - 140) / 2),
      y: 100,
    });
    this.root.addChild(this.menu.view);

    this.menu.onSelect((id) => this.handleSelect(id));
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    this.menu.handleIntent(intent);
  }

  private handleSelect(id: string): void {
    switch (id) {
      case 'new':
        void this.ctx.manager.replace(new TutorialScene());
        break;
      case 'load':
        // TODO: 슬롯 선택 화면. 보일러플레이트에선 가장 최근 슬롯으로 바로 진입.
        void this.ctx.manager.replace(new TutorialScene());
        break;
      case 'settings':
        void this.ctx.manager.push(new SettingsScene());
        break;
      case 'quit':
        // 웹 환경: 빈 화면으로 보내거나 탭 닫기 안내.
        if (confirm('정말 종료하시겠습니까?')) {
          window.location.replace('about:blank');
        }
        break;
    }
  }
}
