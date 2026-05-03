// 본 게임 루프. 챕터 단위로 진입.
// 호러 탐험 보일러플레이트 — 전투 없음. 회피·은신·탐색·탈출.
//
// 두 레이어:
//   ctx.world : 픽셀 아트 (타일/플레이어/추적자) — 정수배 스케일
//   ctx.ui    : HUD/타이틀/힌트/메시지 — 네이티브 해상도, 크리스피
//
// 데모 흐름:
//   1) zone 의 authoredMap JSON 을 fetch → 셀 배열 구성 (벽/사물함/책상밑/계단/비상구/문/바닥)
//   2) 각 셀에 sprite registry 텍스처로 Sprite 배치
//   3) 플레이어는 입력 1회 = 1칸. 벽 막힘. 은신은 hidesPlayer 타일에서만.
//   4) 추적자는 자율 — PIXI ticker 의 deltaMS 누산, 700ms 마다 그리디 1칸 (벽 회피).
//   5) 비상구('exit') 또는 계단('stairs-down') 위에서 '>' 누르면 다음 단계.
//   6) 거리 ≤ 1 + 은신 X → caught → 미귀가 엔딩.

import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, FONT_MONO, COLOR, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { chapters } from '@/content/narrative/chapters';
import { zonesForChapter } from '@/content/zones';
import { findStalker, findTile } from '@/content';
import { MainMenuScene } from './MainMenuScene';
import { EndingScene } from './EndingScene';

export interface GameSceneOptions {
  chapterId: string;
}

type State = 'safe' | 'spotted' | 'hidden';

const CELL = 16;
const STALKER_TICK_MS = 700;
const DETECT_RANGE = 4; // 은신 X 일 때 거리 ≤ 4 면 spotted
const CATCH_RANGE = 1;  // 거리 ≤ 1 면 catch

interface MapData {
  cells: string[][]; // [y][x] = tile id
  spawns: {
    player: { x: number; y: number };
    stalkers: Array<{ id: string; x: number; y: number }>;
  };
}

export class GameScene implements Scene {
  private worldRoot = new Container();
  private uiRoot = new Container();
  private ctx!: SceneContext;
  private cells: string[][] = [];
  private playerX = 2;
  private playerY = 1;
  private stalkerX = 15;
  private stalkerY = 1;
  private stalkerId = 'late-pupil';
  private state: State = 'safe';
  private flashlightOn = false;
  private stalkerAccumMs = 0;
  private endingTriggered = false;
  // sprites
  private player!: Sprite;
  private stalker!: Sprite;
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
    const zone = zonesForChapter(this.chapter)[0];

    ctx.world.addChild(this.worldRoot);
    ctx.ui.addChild(this.uiRoot);

    // === World: 맵 로드 ===
    let mapData: MapData | null = null;
    if (zone?.generator === 'authored' && zone.authoredMap) {
      mapData = await loadAuthoredMap(zone.authoredMap);
    }
    if (!mapData) {
      mapData = makeFallbackRoom();
    }
    this.cells = mapData.cells;
    this.playerX = mapData.spawns.player.x;
    this.playerY = mapData.spawns.player.y;
    const firstStalkerSpawn = mapData.spawns.stalkers[0];
    if (firstStalkerSpawn) {
      this.stalkerId = firstStalkerSpawn.id;
      this.stalkerX = firstStalkerSpawn.x;
      this.stalkerY = firstStalkerSpawn.y;
    }

    this.buildTileSprites();

    const stalkerDef = findStalker(this.stalkerId);
    const stalkerTex = stalkerDef ? ctx.sprites.get(stalkerDef.sprite) : null;
    this.stalker = new Sprite(stalkerTex ?? undefined);
    this.stalker.width = CELL;
    this.stalker.height = CELL;
    this.worldRoot.addChild(this.stalker);
    this.syncStalker();

    const playerTex = ctx.sprites.get('player-down-0');
    this.player = new Sprite(playerTex ?? undefined);
    this.player.width = CELL;
    this.player.height = CELL;
    this.worldRoot.addChild(this.player);
    this.syncPlayer();

    // === UI ===
    this.hudBg = new Graphics();
    this.uiRoot.addChild(this.hudBg);

    this.chapterTitle = new Text({
      text: this.chapter.title,
      style: { fill: COLOR.accent, fontSize: 18, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.uiRoot.addChild(this.chapterTitle);

    this.zoneName = new Text({
      text: zone ? zone.name : '— 구역 미정 —',
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
      text: '↑↓←→ 이동   c 은신   f 손전등   g 줍기   e 상호작용   >  탈출   Esc 메뉴',
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

  update(deltaMs: number): void {
    if (this.endingTriggered) return;
    this.stalkerAccumMs += deltaMs;
    while (this.stalkerAccumMs >= STALKER_TICK_MS) {
      this.stalkerAccumMs -= STALKER_TICK_MS;
      this.stepStalker();
      if (this.endingTriggered) return;
    }
  }

  onIntent(intent: Intent): void {
    if (this.endingTriggered) return;
    switch (intent.kind) {
      case 'cancel':
        void this.ctx.manager.replace(new MainMenuScene());
        return;
      case 'descend': {
        const here = this.tileAt(this.playerX, this.playerY);
        if (here === 'exit') {
          this.endingTriggered = true;
          this.ctx.events.emit('zoneExit', { fromZone: 'zone-school-1f', toZone: null, mode: 'escape' });
          void this.ctx.manager.replace(new EndingScene({ endingId: 'placeholder' }));
        } else if (here === 'stairs-down') {
          this.endingTriggered = true;
          this.ctx.events.emit('zoneExit', { fromZone: 'zone-school-1f', toZone: null, mode: 'descend' });
          void this.ctx.manager.replace(new EndingScene({ endingId: 'placeholder' }));
        } else {
          this.message.text = '여기는 출구가 아니다.';
        }
        return;
      }
      case 'hide': {
        if (this.state === 'hidden') {
          this.state = 'safe';
          this.ctx.events.emit('hideExit', { entity: 0 });
          this.message.text = '몸을 일으킨다.';
        } else {
          const here = this.tileAt(this.playerX, this.playerY);
          const tileDef = findTile(here);
          if (tileDef?.hidesPlayer) {
            this.state = 'hidden';
            this.ctx.events.emit('hideEnter', { entity: 0, tile: here });
            this.message.text = '숨었다. 발걸음이 지나가길 기다린다.';
          } else {
            this.message.text = '여기엔 숨을 곳이 없다.';
          }
        }
        this.renderHud();
        this.syncPlayer();
        return;
      }
      case 'use':
        this.flashlightOn = !this.flashlightOn;
        this.renderHud();
        this.message.text = this.flashlightOn ? '손전등을 켰다.' : '손전등을 껐다.';
        return;
      case 'interact':
      case 'pickup': {
        const here = this.tileAt(this.playerX, this.playerY);
        if (here === 'locker') this.message.text = '사물함 안쪽이 들여다보인다. c 로 숨을 수 있다.';
        else if (here === 'desk-under') this.message.text = '책상 밑 어둠. c 로 숨을 수 있다.';
        else if (here === 'door') this.message.text = '잠겨 있지 않다.';
        else this.message.text = '주변에 상호작용할 대상이 없다.';
        return;
      }
      case 'move': {
        if (this.state === 'hidden') {
          this.state = 'safe';
          this.ctx.events.emit('hideExit', { entity: 0 });
        }
        const nx = this.playerX + intent.dx;
        const ny = this.playerY + intent.dy;
        if (this.isWalkable(nx, ny)) {
          this.playerX = nx;
          this.playerY = ny;
          this.swapPlayerSprite(intent.dx, intent.dy);
          this.syncPlayer();
          this.maybeAnnounceTile(nx, ny);
        }
        this.evaluateContact();
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

  // ============================================================================
  // 추적자 자율 행동
  // ============================================================================
  private stepStalker(): void {
    const ddx = this.playerX - this.stalkerX;
    const ddy = this.playerY - this.stalkerY;
    if (ddx === 0 && ddy === 0) return;
    const dx = Math.sign(ddx);
    const dy = Math.sign(ddy);
    // 거리 큰 축 우선, 막히면 다른 축.
    const tries: Array<[number, number]> =
      Math.abs(ddx) >= Math.abs(ddy) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    for (const [mx, my] of tries) {
      if (mx === 0 && my === 0) continue;
      const nx = this.stalkerX + mx;
      const ny = this.stalkerY + my;
      if (this.isWalkable(nx, ny)) {
        this.stalkerX = nx;
        this.stalkerY = ny;
        this.syncStalker();
        break;
      }
    }
    this.evaluateContact();
    this.renderHud();
  }

  private evaluateContact(): void {
    const distance = Math.abs(this.playerX - this.stalkerX) + Math.abs(this.playerY - this.stalkerY);
    if (this.state === 'hidden') {
      // 은신 중에는 detect / catch 모두 차단.
      return;
    }
    if (distance <= CATCH_RANGE) {
      this.endingTriggered = true;
      this.ctx.events.emit('caught', { stalker: 1, player: 0, effect: 'death' });
      this.message.text = '잡혔다.';
      void this.ctx.manager.replace(new EndingScene({ endingId: 'caught' }));
      return;
    }
    if (distance <= DETECT_RANGE) {
      if (this.state !== 'spotted') {
        this.ctx.events.emit('detected', { stalker: 1, player: 0 });
        this.message.text = '들켰다. 발걸음이 멈췄다.';
      }
      this.state = 'spotted';
    } else if (this.state === 'spotted') {
      this.state = 'safe';
      this.ctx.events.emit('lost', { stalker: 1 });
      this.message.text = '발걸음이 다시 멀어진다.';
    }
  }

  // ============================================================================
  // 맵 / 셀 조회
  // ============================================================================
  private get cols(): number {
    return this.cells[0]?.length ?? 0;
  }
  private get rows(): number {
    return this.cells.length;
  }

  private tileAt(x: number, y: number): string {
    const row = this.cells[y];
    if (!row) return 'wall';
    return row[x] ?? 'wall';
  }

  private isWalkable(x: number, y: number): boolean {
    const id = this.tileAt(x, y);
    const def = findTile(id);
    return def ? def.walkable : false;
  }

  private maybeAnnounceTile(x: number, y: number): void {
    const id = this.tileAt(x, y);
    if (id === 'locker') this.message.text = '사물함. c 로 숨을 수 있다.';
    else if (id === 'desk-under') this.message.text = '책상 밑. c 로 숨을 수 있다.';
    else if (id === 'stairs-down') this.message.text = '계단 — > 로 내려갈 수 있다.';
    else if (id === 'exit') this.message.text = '비상구 — > 로 빠져나갈 수 있다.';
    else if (id === 'door') this.message.text = '문이 열렸다.';
  }

  // ============================================================================
  // 렌더 / 동기화
  // ============================================================================
  private gridOrigin(): { x: number; y: number } {
    return {
      x: Math.floor((VIRTUAL_WIDTH - this.cols * CELL) / 2),
      y: Math.floor((VIRTUAL_HEIGHT - this.rows * CELL) / 2),
    };
  }

  private buildTileSprites(): void {
    const o = this.gridOrigin();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const id = this.tileAt(x, y);
        const def = findTile(id);
        const tex = def ? this.ctx.sprites.get(def.sprite) : null;
        const sprite = new Sprite(tex ?? undefined);
        sprite.width = CELL;
        sprite.height = CELL;
        sprite.x = o.x + x * CELL;
        sprite.y = o.y + y * CELL;
        this.worldRoot.addChild(sprite);
      }
    }
  }

  private swapPlayerSprite(dx: number, dy: number): void {
    let dir: 'down' | 'up' | 'left' | 'right' = 'down';
    if (Math.abs(dx) >= Math.abs(dy)) dir = dx < 0 ? 'left' : dx > 0 ? 'right' : 'down';
    else dir = dy < 0 ? 'up' : 'down';
    const tex = this.ctx.sprites.get(`player-${dir}-0`);
    if (tex) this.player.texture = tex;
  }

  private syncPlayer(): void {
    const origin = this.gridOrigin();
    this.player.x = origin.x + this.playerX * CELL;
    this.player.y = origin.y + this.playerY * CELL;
    this.player.alpha = this.state === 'hidden' ? 0.25 : 1;
  }

  private syncStalker(): void {
    const origin = this.gridOrigin();
    this.stalker.x = origin.x + this.stalkerX * CELL;
    this.stalker.y = origin.y + this.stalkerY * CELL;
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;

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
    this.message.x = 280;
    this.message.y = h - 48;
    this.message.style.wordWrap = true;
    this.message.style.wordWrapWidth = Math.max(240, w - 280 - 24);
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

// ============================================================================
// 맵 로더 — public/assets/maps/<name>.json fetch
// ============================================================================
async function loadAuthoredMap(path: string): Promise<MapData | null> {
  try {
    const url = `${import.meta.env.BASE_URL}${path}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      legend?: Record<string, string>;
      tiles: string[];
      spawns: MapData['spawns'];
    };
    const legend: Record<string, string> = json.legend ?? {};
    const cells = json.tiles.map((row) =>
      row.split('').map((c) => legend[c] ?? 'floor'),
    );
    return { cells, spawns: json.spawns };
  } catch (err) {
    console.warn(`[mapLoader] failed: ${path}`, err);
    return null;
  }
}

function makeFallbackRoom(): MapData {
  // 18 × 11 빈 방, 외곽선만 벽.
  const cols = 18;
  const rows = 11;
  const cells: string[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    for (let x = 0; x < cols; x++) {
      const isWall = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
      row.push(isWall ? 'wall' : 'floor');
    }
    cells.push(row);
  }
  return {
    cells,
    spawns: {
      player: { x: 2, y: 2 },
      stalkers: [{ id: 'late-pupil', x: cols - 3, y: 2 }],
    },
  };
}
