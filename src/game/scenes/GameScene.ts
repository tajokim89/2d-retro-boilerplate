// 본 게임 루프. 챕터 단위로 진입.
// 호러 탐험 보일러플레이트 — 전투 없음. 회피·은신·탐색·탈출.
//
// MVP placeholder: 실제 zone 로딩/추적자 AI/시야 시스템은 다음 단계.
// 이 보일러플레이트에서는 placeholder 그리드 + 플레이어 + 단순 추적자 + STATE HUD.
// 후속 작업: World/Scheduler/맵로딩/시야·소리·은신 시스템이 이 자리에 채워짐.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { chapters } from '@/content/narrative/chapters';
import { zonesForChapter } from '@/content/zones';
import { MainMenuScene } from './MainMenuScene';
import { EndingScene } from './EndingScene';

export interface GameSceneOptions {
  chapterId: string;
}

type State = 'safe' | 'spotted' | 'hidden';

export class GameScene implements Scene {
  private root = new Container();
  private ctx!: SceneContext;
  private playerX = 4;
  private playerY = 6;
  private stalkerX = 16;
  private stalkerY = 4;
  private state: State = 'safe';
  private flashlightOn = false;
  private hud!: Text;
  private grid!: Graphics;
  private player!: Graphics;
  private stalker!: Graphics;

  constructor(private options: GameSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.stage.addChild(this.root);

    const chapter = chapters.find((c) => c.id === this.options.chapterId) ?? chapters[0]!;
    const firstZone = zonesForChapter(chapter)[0];

    const bg = new Graphics();
    bg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x05060a);
    this.root.addChild(bg);

    const title = new Text({
      text: chapter.title,
      style: { fill: '#fff7d6', fontSize: 10, fontFamily: 'monospace' },
    });
    title.x = 8;
    title.y = 6;
    this.root.addChild(title);

    const subtitle = new Text({
      text: firstZone ? firstZone.name : '— 구역 미정 —',
      style: { fill: '#9aa0aa', fontSize: 8, fontFamily: 'monospace' },
    });
    subtitle.x = 8;
    subtitle.y = 18;
    this.root.addChild(subtitle);

    this.hud = new Text({
      text: '',
      style: { fill: '#9aa0aa', fontSize: 8, fontFamily: 'monospace' },
    });
    this.hud.x = 8;
    this.hud.y = VIRTUAL_HEIGHT - 14;
    this.root.addChild(this.hud);

    this.grid = new Graphics();
    this.drawGrid();
    this.root.addChild(this.grid);

    this.stalker = new Graphics();
    this.stalker.rect(0, 0, 7, 7).fill(0x9a2a2a);
    this.root.addChild(this.stalker);
    this.syncStalker();

    this.player = new Graphics();
    this.player.rect(0, 0, 7, 7).fill(0xfff7d6);
    this.root.addChild(this.player);
    this.syncPlayer();

    const hint = new Text({
      text: '↑↓←→ 이동 / e 상호작용 / c 은신 / f 손전등 / g 줍기 / > 탈출 / Esc 메뉴',
      style: { fill: '#5a6068', fontSize: 6, fontFamily: 'monospace' },
    });
    hint.anchor.set(1, 0);
    hint.x = VIRTUAL_WIDTH - 8;
    hint.y = 6;
    this.root.addChild(hint);

    this.renderHud();
    ctx.events.emit('message', { text: chapter.intro, tone: 'warn' });
  }

  exit(): void {
    this.ctx.stage.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    switch (intent.kind) {
      case 'cancel':
        void this.ctx.manager.replace(new MainMenuScene());
        return;
      case 'descend':
        this.ctx.events.emit('zoneExit', { fromZone: 'zone-ch1-1', toZone: null, mode: 'escape' });
        void this.ctx.manager.replace(new EndingScene({ endingId: 'placeholder' }));
        return;
      case 'hide':
        if (this.state === 'hidden') {
          this.state = 'safe';
          this.ctx.events.emit('hideExit', { entity: 0 });
        } else {
          this.state = 'hidden';
          this.ctx.events.emit('hideEnter', { entity: 0, tile: 'placeholder' });
        }
        this.renderHud();
        return;
      case 'use':
        this.flashlightOn = !this.flashlightOn;
        this.renderHud();
        this.ctx.events.emit('message', {
          text: this.flashlightOn ? '손전등을 켰다.' : '손전등을 껐다.',
        });
        return;
      case 'interact':
      case 'pickup':
        this.ctx.events.emit('message', { text: '주변에 상호작용할 대상이 없다.' });
        return;
      case 'move': {
        if (this.state === 'hidden') {
          this.state = 'safe';
          this.ctx.events.emit('hideExit', { entity: 0 });
        }
        const nx = clamp(this.playerX + intent.dx, 1, 18);
        const ny = clamp(this.playerY + intent.dy, 2, 10);
        this.playerX = nx;
        this.playerY = ny;
        this.syncPlayer();
        this.tickStalker();
        this.renderHud();
        return;
      }
      default:
        return;
    }
  }

  private tickStalker(): void {
    // placeholder: 추적자가 플레이어 쪽으로 한 칸씩.
    const dx = Math.sign(this.playerX - this.stalkerX);
    const dy = Math.sign(this.playerY - this.stalkerY);
    if (Math.abs(dx) >= Math.abs(dy)) this.stalkerX += dx;
    else this.stalkerY += dy;
    this.syncStalker();

    const distance = Math.abs(this.playerX - this.stalkerX) + Math.abs(this.playerY - this.stalkerY);
    if (distance <= 1 && this.state !== 'hidden') {
      this.state = 'spotted';
      this.ctx.events.emit('caught', { stalker: 1, player: 0, effect: 'restart-zone' });
      this.ctx.events.emit('message', { text: '잡혔다. (placeholder — 게임오버 시스템 추후)', tone: 'danger' });
      // placeholder: 위치 리셋
      this.playerX = 4;
      this.playerY = 6;
      this.stalkerX = 16;
      this.stalkerY = 4;
      this.state = 'safe';
      this.syncPlayer();
      this.syncStalker();
    } else if (distance <= 4 && this.state !== 'hidden') {
      if (this.state !== 'spotted') {
        this.ctx.events.emit('detected', { stalker: 1, player: 0 });
      }
      this.state = 'spotted';
    } else if (this.state === 'spotted') {
      this.state = 'safe';
      this.ctx.events.emit('lost', { stalker: 1 });
    }
  }

  private syncPlayer(): void {
    this.player.x = 24 + this.playerX * 8;
    this.player.y = 30 + this.playerY * 8;
    this.player.alpha = this.state === 'hidden' ? 0.25 : 1;
  }

  private syncStalker(): void {
    this.stalker.x = 24 + this.stalkerX * 8;
    this.stalker.y = 30 + this.stalkerY * 8;
  }

  private drawGrid(): void {
    const cols = 20;
    const rows = 12;
    this.grid.clear();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const isWall = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
        const color = isWall ? 0x2a2f3a : 0x14161c;
        this.grid.rect(24 + x * 8, 30 + y * 8, 7, 7).fill(color);
      }
    }
  }

  private renderHud(): void {
    const stateLabel = ({
      safe: 'STATE: SAFE',
      spotted: 'STATE: SPOTTED',
      hidden: 'STATE: HIDDEN',
    } as const)[this.state];
    const flashlight = this.flashlightOn ? 'FLASHLIGHT: ON' : 'FLASHLIGHT: OFF';
    this.hud.text = `${stateLabel}   ${flashlight}`;
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
