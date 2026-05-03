// 본 게임 루프. 챕터 단위로 진입.
// 호러 탐험 보일러플레이트 — 전투 없음. 회피·은신·탐색·탈출.
//
// 두 레이어 활용:
//  - ctx.world : 픽셀 아트 (그리드/플레이어/추적자) — 정수배 스케일
//  - ctx.ui    : HUD/타이틀/힌트/메시지 — 네이티브 해상도, 크리스피
//
// MVP placeholder: 실제 zone 로딩/추적자 AI/시야 시스템은 다음 단계.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, FONT_MONO, COLOR, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { chapters } from '@/content/narrative/chapters';
import { zonesForChapter } from '@/content/zones';
import { MainMenuScene } from './MainMenuScene';
import { EndingScene } from './EndingScene';

export interface GameSceneOptions {
  chapterId: string;
}

type State = 'safe' | 'spotted' | 'hidden';

const COLS = 20;
const ROWS = 12;
const CELL = 14; // world 안의 가상 픽셀

export class GameScene implements Scene {
  private worldRoot = new Container();
  private uiRoot = new Container();
  private ctx!: SceneContext;
  private playerX = 4;
  private playerY = 6;
  private stalkerX = 16;
  private stalkerY = 4;
  private state: State = 'safe';
  private flashlightOn = false;
  private gridGfx!: Graphics;
  private player!: Graphics;
  private stalker!: Graphics;
  // UI
  private hudBg!: Graphics;
  private chapterTitle!: Text;
  private zoneName!: Text;
  private stateText!: Text;
  private flashlightText!: Text;
  private hint!: Text;
  private message!: Text;
  private chapter = chapters[0]!;

  constructor(private options: GameSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    this.chapter = chapters.find((c) => c.id === this.options.chapterId) ?? chapters[0]!;
    const firstZone = zonesForChapter(this.chapter)[0];

    ctx.world.addChild(this.worldRoot);
    ctx.ui.addChild(this.uiRoot);

    // === World layer: 그리드 + 플레이어 + 추적자 ===
    this.gridGfx = new Graphics();
    this.drawGrid();
    this.worldRoot.addChild(this.gridGfx);

    this.stalker = new Graphics();
    this.stalker.rect(0, 0, CELL - 2, CELL - 2).fill(0x9a2a2a);
    this.worldRoot.addChild(this.stalker);
    this.syncStalker();

    this.player = new Graphics();
    this.player.rect(0, 0, CELL - 2, CELL - 2).fill(0xfff7d6);
    this.worldRoot.addChild(this.player);
    this.syncPlayer();

    // === UI layer: HUD ===
    this.hudBg = new Graphics();
    this.uiRoot.addChild(this.hudBg);

    this.chapterTitle = new Text({
      text: this.chapter.title,
      style: { fill: COLOR.accent, fontSize: 18, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.uiRoot.addChild(this.chapterTitle);

    this.zoneName = new Text({
      text: firstZone ? firstZone.name : '— 구역 미정 —',
      style: { fill: COLOR.fgMuted, fontSize: 13, fontFamily: FONT_BODY },
    });
    this.uiRoot.addChild(this.zoneName);

    this.stateText = new Text({
      text: '',
      style: { fill: COLOR.fg, fontSize: 14, fontFamily: FONT_MONO, fontWeight: '600' },
    });
    this.uiRoot.addChild(this.stateText);

    this.flashlightText = new Text({
      text: '',
      style: { fill: COLOR.fgMuted, fontSize: 14, fontFamily: FONT_MONO },
    });
    this.uiRoot.addChild(this.flashlightText);

    this.hint = new Text({
      text: '↑↓←→ 이동   e 상호작용   c 은신   f 손전등   g 줍기   >  탈출   Esc 메뉴',
      style: { fill: COLOR.fgDim, fontSize: 12, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(1, 0);
    this.uiRoot.addChild(this.hint);

    this.message = new Text({
      text: this.chapter.intro,
      style: { fill: COLOR.warn, fontSize: 14, fontFamily: FONT_BODY, fontStyle: 'italic' },
    });
    this.uiRoot.addChild(this.message);

    this.layout();
    this.renderHud();
    ctx.events.emit('message', { text: this.chapter.intro, tone: 'warn' });
  }

  exit(): void {
    this.ctx.world.removeChild(this.worldRoot);
    this.ctx.ui.removeChild(this.uiRoot);
    this.worldRoot.destroy({ children: true });
    this.uiRoot.destroy({ children: true });
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
        this.syncPlayer();
        return;
      case 'use':
        this.flashlightOn = !this.flashlightOn;
        this.renderHud();
        this.message.text = this.flashlightOn ? '손전등을 켰다.' : '손전등을 껐다.';
        return;
      case 'interact':
      case 'pickup':
        this.message.text = '주변에 상호작용할 대상이 없다.';
        return;
      case 'move': {
        if (this.state === 'hidden') {
          this.state = 'safe';
          this.ctx.events.emit('hideExit', { entity: 0 });
        }
        const nx = clamp(this.playerX + intent.dx, 1, COLS - 2);
        const ny = clamp(this.playerY + intent.dy, 1, ROWS - 2);
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

  onResize(): void {
    this.layout();
  }

  private tickStalker(): void {
    const dx = Math.sign(this.playerX - this.stalkerX);
    const dy = Math.sign(this.playerY - this.stalkerY);
    if (Math.abs(dx) >= Math.abs(dy)) this.stalkerX += dx;
    else this.stalkerY += dy;
    this.syncStalker();

    const distance = Math.abs(this.playerX - this.stalkerX) + Math.abs(this.playerY - this.stalkerY);
    if (distance <= 1 && this.state !== 'hidden') {
      this.state = 'spotted';
      this.ctx.events.emit('caught', { stalker: 1, player: 0, effect: 'restart-zone' });
      this.message.text = '잡혔다. 구역 시작점으로 돌아간다. (placeholder)';
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
    const origin = this.gridOrigin();
    this.player.x = origin.x + this.playerX * CELL;
    this.player.y = origin.y + this.playerY * CELL;
    this.player.alpha = this.state === 'hidden' ? 0.3 : 1;
  }

  private syncStalker(): void {
    const origin = this.gridOrigin();
    this.stalker.x = origin.x + this.stalkerX * CELL;
    this.stalker.y = origin.y + this.stalkerY * CELL;
  }

  private gridOrigin(): { x: number; y: number } {
    return {
      x: Math.floor((VIRTUAL_WIDTH - COLS * CELL) / 2),
      y: Math.floor((VIRTUAL_HEIGHT - ROWS * CELL) / 2),
    };
  }

  private drawGrid(): void {
    const o = this.gridOrigin();
    this.gridGfx.clear();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const isWall = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
        const color = isWall ? 0x2a2f3a : 0x14161c;
        this.gridGfx.rect(o.x + x * CELL, o.y + y * CELL, CELL - 1, CELL - 1).fill(color);
      }
    }
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;

    // 상단/하단 HUD 띠
    this.hudBg.clear();
    this.hudBg.rect(0, 0, w, 56).fill({ color: COLOR.bgDeep, alpha: 0.85 });
    this.hudBg.rect(0, h - 72, w, 72).fill({ color: COLOR.bgDeep, alpha: 0.85 });

    this.chapterTitle.x = 24;
    this.chapterTitle.y = 12;
    this.zoneName.x = 24;
    this.zoneName.y = 36;

    this.hint.x = w - 24;
    this.hint.y = 18;

    this.stateText.x = 24;
    this.stateText.y = h - 60;
    this.flashlightText.x = 24;
    this.flashlightText.y = h - 36;
    this.message.x = 260;
    this.message.y = h - 48;
  }

  private renderHud(): void {
    const stateLabel = ({
      safe: 'STATE  :  SAFE',
      spotted: 'STATE  :  SPOTTED',
      hidden: 'STATE  :  HIDDEN',
    } as const)[this.state];
    this.stateText.text = stateLabel;
    this.stateText.style.fill =
      this.state === 'spotted' ? COLOR.danger : this.state === 'hidden' ? COLOR.warn : COLOR.fg;
    this.flashlightText.text = `LIGHT  :  ${this.flashlightOn ? 'ON' : 'OFF'}`;
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
