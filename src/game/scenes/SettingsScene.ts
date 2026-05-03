// 환경설정: 볼륨/언어/FPS 표시 토글.
// 일시정지처럼 push 로 올라옴. Esc 로 pop.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, Settings } from '@/engine';
import { Menu } from '../ui/menu';

const settings = new Settings();

export class SettingsScene implements Scene {
  private root = new Container();
  private menu!: Menu;
  private ctx!: SceneContext;

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const dim = new Graphics();
    dim.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.6 });
    this.root.addChild(dim);

    const title = new Text({
      text: '환경설정',
      style: { fill: '#fff7d6', fontSize: 12, fontFamily: 'monospace' },
    });
    title.anchor.set(0.5, 0);
    title.x = VIRTUAL_WIDTH / 2;
    title.y = 24;
    this.root.addChild(title);

    this.menu = new Menu({
      items: this.buildItems(),
      x: Math.floor((VIRTUAL_WIDTH - 180) / 2),
      y: 56,
      width: 180,
    });
    this.root.addChild(this.menu.view);

    this.menu.onSelect((id) => this.handleSelect(id));
    this.menu.onCancel(() => void this.ctx.manager.pop());
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    this.menu.handleIntent(intent);
  }

  private buildItems() {
    const s = settings.get();
    return [
      { id: 'master', label: `마스터 볼륨    ${pct(s.masterVolume)}` },
      { id: 'music', label: `음악 볼륨      ${pct(s.musicVolume)}` },
      { id: 'sfx', label: `효과음 볼륨    ${pct(s.sfxVolume)}` },
      { id: 'language', label: `언어           ${s.language === 'ko' ? '한국어' : 'English'}` },
      { id: 'fps', label: `FPS 표시       ${s.showFps ? 'ON' : 'OFF'}` },
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
