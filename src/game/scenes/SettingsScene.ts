// 환경설정. 메인메뉴 위에 push 로 올라옴. Esc 로 pop.
// 모두 ui 레이어.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR, Settings } from '@/engine';
import { Menu } from '../ui/menu';

const settings = new Settings();

export class SettingsScene implements Scene {
  private root = new Container();
  private menu!: Menu;
  private dim!: Graphics;
  private title!: Text;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.title = new Text({
      text: '환경설정',
      style: { fill: COLOR.fg, fontSize: 28, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.title.anchor.set(0.5, 0);
    this.root.addChild(this.title);

    this.menu = new Menu({ items: this.buildItems(), width: 360 });
    this.root.addChild(this.menu.view);
    this.menu.onSelect((id) => this.handleSelect(id));
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
    this.title.y = Math.round(h * 0.18);
    this.menu.layout({ centerX: w / 2, top: Math.round(h * 0.32) });
  }

  private buildItems() {
    const s = settings.get();
    return [
      { id: 'master', label: `마스터 볼륨    ${pct(s.masterVolume)}` },
      { id: 'music', label: `음악 볼륨      ${pct(s.musicVolume)}` },
      { id: 'sfx', label: `효과음 볼륨    ${pct(s.sfxVolume)}` },
      { id: 'language', label: `언어            ${s.language === 'ko' ? '한국어' : 'English'}` },
      { id: 'fps', label: `FPS 표시        ${s.showFps ? 'ON' : 'OFF'}` },
      { id: 'reset', label: '— 기본값으로 초기화 —' },
      { id: 'back', label: '— 돌아가기 —' },
    ];
  }

  private handleSelect(id: string): void {
    const s = settings.get();
    switch (id) {
      case 'master':
        settings.patch({ masterVolume: cycle(s.masterVolume) });
        break;
      case 'music':
        settings.patch({ musicVolume: cycle(s.musicVolume) });
        break;
      case 'sfx':
        settings.patch({ sfxVolume: cycle(s.sfxVolume) });
        break;
      case 'language':
        settings.patch({ language: s.language === 'ko' ? 'en' : 'ko' });
        break;
      case 'fps':
        settings.patch({ showFps: !s.showFps });
        break;
      case 'reset':
        settings.reset();
        break;
      case 'back':
        void this.ctx.manager.pop();
        return;
    }
    this.menu.setItems(this.buildItems());
  }
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
function cycle(v: number): number {
  const next = Math.round((v + 0.2) * 10) / 10;
  return next > 1.0 + 1e-6 ? 0 : next;
}
