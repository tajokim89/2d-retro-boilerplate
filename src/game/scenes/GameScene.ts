// 본 게임 루프. 챕터 단위로 진입.
// 호러 탐험 보일러플레이트 — 전투 없음. 회피·은신·탐색·탈출.
//
// 두 레이어:
//   ctx.world : 픽셀 아트 (타일/소품/플레이어/추적자) — 정수배 스케일
//   ctx.ui    : HUD/타이틀/힌트/메시지 — 네이티브 해상도, 크리스피
//
// 시스템:
//   - FOV : ROT.js PreciseShadowcasting. 플레이어 시야로 타일·추적자·소품 가시성 결정.
//   - Narrative : content/narrative/events.ts 의 데이터 이벤트 런타임. 사실 등록 → 효과 emit.
//   - Pickup/Reader : 소품 위에서 'e'/'g' → 인벤토리 추가 또는 ReaderScene push.
//
// 흐름:
//   1) zone JSON fetch → cells / spawns
//   2) tileSprites/propSprites/player/stalker 배치
//   3) FOV 초기 계산
//   4) Player 입력 1회 → 이동 / 상호작용 / 은신 / 손전등 / 출구 → 후속 이벤트
//   5) 추적자 자율 (ticker accum 700ms) → wander when hidden / chase otherwise
//   6) 잡힘 → caught 엔딩, 탈출 → escape 엔딩

import { AnimatedSprite, Container, Graphics, Sprite, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, FONT_MONO, COLOR, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '@/engine';
import { chapters } from '@/content/narrative/chapters';
import { zonesForChapter } from '@/content/zones';
import {
  findStalker,
  findTile,
  findProp,
} from '@/content';
import type { PropDef } from '@/content/props';
import { findDocument } from '@/content/narrative/documents';
import { findBroadcast } from '@/content/narrative/broadcasts';
import { findSign } from '@/content/narrative/signs';
import { codexEntries } from '@/content/narrative/codex';
import { NarrativeSystem } from '../systems/narrative';
import { FovSystem } from '../systems/fov';
import { EndingScene } from './EndingScene';
import { ReaderScene } from './ReaderScene';
import { PauseScene } from './PauseScene';
import { CodexScene } from './CodexScene';
import { InventoryScene } from './InventoryScene';
import type { GameSnapshot } from '../state';

export interface GameSceneOptions {
  chapterId: string;
  snapshot?: GameSnapshot;
}

type State = 'safe' | 'spotted' | 'hidden';

const CELL = 16;
const STALKER_TICK_MS = 700;
const DETECT_RANGE = 4;
const CATCH_RANGE = 1;
const FOV_RADIUS_BASE = 4;
const FOV_RADIUS_FLASHLIGHT = 7;

interface PropInstance {
  id: string;
  x: number;
  y: number;
  sprite: Sprite;
}

interface MapData {
  cells: string[][];
  spawns: {
    player: { x: number; y: number };
    stalkers: Array<{ id: string; x: number; y: number }>;
    props?: Array<{ id: string; x: number; y: number }>;
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
  private flashlightAcquired = false;
  private flashlightOn = false;
  private flashlightBattery = 0;
  private flashlightCapacity = 100;
  private stalkerAccumMs = 0;
  private endingTriggered = false;
  private inventory = new Set<string>();
  private propsOnMap: PropInstance[] = [];
  private tileSprites: Sprite[][] = [];
  private detectionOverlay!: Graphics;
  private stalkerDetectRange = 4;
  private fov!: FovSystem;
  private narrative!: NarrativeSystem;
  private endingUnsub: (() => void) | null = null;
  private codexUnsub: (() => void) | null = null;
  private playerFacing: 'down' | 'up' | 'left' | 'right' = 'down';
  private currentZoneId = '';
  // sprites
  private player!: Sprite;
  private stalker!: Sprite;
  // UI
  private hudBg!: Graphics;
  private batteryGauge!: Graphics;
  private chapterTitle!: Text;
  private zoneName!: Text;
  private stateText!: Text;
  private flashlightText!: Text;
  private inventoryText!: Text;
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

    // === Map ===
    let mapData: MapData | null = null;
    if (zone?.generator === 'authored' && zone.authoredMap) {
      mapData = await loadAuthoredMap(zone.authoredMap);
    }
    if (!mapData) mapData = makeFallbackRoom();
    this.cells = mapData.cells;
    this.playerX = mapData.spawns.player.x;
    this.playerY = mapData.spawns.player.y;
    const firstSpawn = mapData.spawns.stalkers[0];
    if (firstSpawn) {
      this.stalkerId = firstSpawn.id;
      this.stalkerX = firstSpawn.x;
      this.stalkerY = firstSpawn.y;
    }
    this.currentZoneId = zone?.id ?? '?';

    // === Systems ===
    this.fov = new FovSystem(this.cols, this.rows, (x, y) => {
      const id = this.tileAt(x, y);
      const def = findTile(id);
      return def ? def.transparent : false;
    });
    this.narrative = new NarrativeSystem(ctx.events);
    this.narrative.recordFact(`enterZone:${this.currentZoneId}`);

    // === World sprites ===
    this.buildTileSprites();
    this.detectionOverlay = new Graphics();
    this.worldRoot.addChild(this.detectionOverlay);
    this.buildPropSprites(mapData.spawns.props ?? []);

    const stalkerDef = findStalker(this.stalkerId);
    this.stalkerDetectRange = stalkerDef?.detectionRange ?? DETECT_RANGE;
    this.stalker = makeAnimatedOrStatic(
      ctx,
      stalkerDef ? `${stalkerDef.sprite}-idle` : null,
      stalkerDef?.sprite,
    );
    this.stalker.width = CELL;
    this.stalker.height = CELL;
    this.worldRoot.addChild(this.stalker);

    this.player = makeAnimatedOrStatic(ctx, 'player-idle-down', 'player-down-0');
    this.player.width = CELL;
    this.player.height = CELL;
    this.worldRoot.addChild(this.player);

    // === UI ===
    this.buildHud(zone?.name ?? '— 구역 미정 —');

    // === Listeners (narrative → scene) ===
    this.endingUnsub = ctx.events.on('ending', ({ id }) => {
      if (this.endingTriggered) return;
      this.endingTriggered = true;
      void this.ctx.manager.replace(new EndingScene({ endingId: id }));
    });
    this.codexUnsub = ctx.events.on('codexUnlocked', ({ id }) => {
      const entry = codexEntries.find((c) => c.id === id);
      this.message.text = `[코덱스] '${entry?.title ?? id}' 잠금해제.`;
    });

    // === Snapshot 복원 (있으면 위 기본값을 덮어씀) ===
    if (this.options.snapshot) {
      this.applySnapshot(this.options.snapshot);
    }

    // === First frame ===
    this.recomputeFov();
    this.syncPlayer();
    this.syncStalker();
    this.applyVisibility();
    this.layout();
    this.renderHud();
    if (!this.options.snapshot) {
      ctx.events.emit('message', { text: this.chapter.intro, tone: 'warn' });
    } else {
      this.message.text = '저장된 진행 상황을 불러왔다.';
    }
  }

  exit(): void {
    this.endingUnsub?.();
    this.codexUnsub?.();
    this.narrative.destroy();
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
      this.drainBattery();
      if (this.endingTriggered) return;
    }
  }

  private drainBattery(): void {
    if (!this.flashlightOn) return;
    this.flashlightBattery = Math.max(0, this.flashlightBattery - 1);
    if (this.flashlightBattery === 0) {
      this.flashlightOn = false;
      this.ctx.events.emit('flashlightToggle', { on: false });
      this.message.text = '배터리가 다 됐다.';
      this.recomputeFov();
      this.applyVisibility();
    }
    this.renderHud();
  }

  onIntent(intent: Intent): void {
    if (this.endingTriggered) return;
    switch (intent.kind) {
      case 'cancel':
      case 'menu':
        void this.ctx.manager.push(
          new PauseScene({ snapshotProvider: () => this.serialize() }),
        );
        return;
      case 'descend':
        return this.tryExit();
      case 'hide':
        return this.tryHide();
      case 'use':
        if (!this.flashlightAcquired) {
          this.message.text = '손전등이 없다.';
          return;
        }
        if (!this.flashlightOn && this.flashlightBattery <= 0) {
          this.message.text = '배터리가 다 됐다.';
          return;
        }
        this.flashlightOn = !this.flashlightOn;
        this.ctx.events.emit('flashlightToggle', { on: this.flashlightOn });
        this.message.text = this.flashlightOn ? '손전등을 켰다.' : '손전등을 껐다.';
        this.recomputeFov();
        this.applyVisibility();
        this.renderHud();
        return;
      case 'interact':
      case 'pickup':
        return this.tryInteract();
      case 'inventory':
        void this.ctx.manager.push(new InventoryScene({ itemIds: [...this.inventory] }));
        return;
      case 'codex':
        void this.ctx.manager.push(
          new CodexScene({ unlockedIds: this.narrative.getUnlockedCodex() }),
        );
        return;
      case 'move':
        return this.tryMove(intent.dx, intent.dy);
      default:
        return;
    }
  }

  onResize(): void {
    this.layout();
  }

  // ============================================================================
  // Player actions
  // ============================================================================
  private tryMove(dx: number, dy: number): void {
    if (this.state === 'hidden') {
      this.state = 'safe';
      this.ctx.events.emit('hideExit', { entity: 0 });
    }
    const nx = this.playerX + dx;
    const ny = this.playerY + dy;
    if (!this.isWalkable(nx, ny)) {
      this.evaluateContact();
      this.renderHud();
      return;
    }
    this.playerX = nx;
    this.playerY = ny;
    this.swapPlayerSprite(dx, dy);
    this.recomputeFov();
    this.syncPlayer();
    this.applyVisibility();
    this.maybeAnnounceTile(nx, ny);
    this.evaluateContact();
    this.renderHud();
    this.ctx.events.emit('step', { x: nx, y: ny });
  }

  private tryHide(): void {
    if (this.state === 'hidden') {
      this.state = 'safe';
      this.ctx.events.emit('hideExit', { entity: 0 });
      this.message.text = '몸을 일으킨다.';
      this.syncPlayer();
      this.renderHud();
      return;
    }
    const here = this.tileAt(this.playerX, this.playerY);
    const tileDef = findTile(here);
    if (tileDef?.hidesPlayer) {
      this.state = 'hidden';
      this.ctx.events.emit('hideEnter', { entity: 0, tile: here });
      this.message.text = '숨었다. 발걸음이 지나가길 기다린다.';
    } else {
      this.message.text = '여기엔 숨을 곳이 없다.';
    }
    this.syncPlayer();
    this.renderHud();
  }

  private tryExit(): void {
    const here = this.tileAt(this.playerX, this.playerY);
    if (here === 'exit') {
      this.endingTriggered = true;
      this.ctx.events.emit('zoneExit', { fromZone: 'zone-school-1f', toZone: null, mode: 'escape' });
      void this.ctx.manager.replace(new EndingScene({ endingId: 'placeholder' }));
      return;
    }
    if (here === 'stairs-down') {
      this.endingTriggered = true;
      this.ctx.events.emit('zoneExit', { fromZone: 'zone-school-1f', toZone: null, mode: 'descend' });
      void this.ctx.manager.replace(new EndingScene({ endingId: 'placeholder' }));
      return;
    }
    this.message.text = '여기는 출구가 아니다.';
  }

  private tryInteract(): void {
    const prop = this.propAt(this.playerX, this.playerY);
    if (!prop) {
      this.message.text = '주변에 상호작용할 대상이 없다.';
      return;
    }
    const def = findProp(prop.id);
    if (!def) return;

    if (def.kind === 'pickup') {
      this.inventory.add(prop.id);
      this.removePropFromMap(prop);
      this.message.text = `${def.name} 을(를) 주웠다.`;
      if (def.effect.kind === 'light') {
        this.flashlightAcquired = true;
        this.flashlightCapacity = def.effect.battery ?? 100;
        this.flashlightBattery = this.flashlightCapacity;
      }
      this.ctx.events.emit('pickup', { entity: 0, prop: prop.id });
      this.renderHud();
      return;
    }
    // fixed prop → 리더 열기
    this.openReaderForProp(def);
  }

  private openReaderForProp(def: PropDef): void {
    const eff = def.effect;
    if (eff.kind === 'document') {
      const entry = findDocument(eff.documentId);
      if (entry) void this.ctx.manager.push(new ReaderScene({ kind: 'document', entry }));
    } else if (eff.kind === 'broadcast') {
      const entry = findBroadcast(eff.broadcastId);
      if (entry) void this.ctx.manager.push(new ReaderScene({ kind: 'broadcast', entry }));
    } else if (eff.kind === 'sign') {
      const entry = findSign(eff.signId);
      if (entry) void this.ctx.manager.push(new ReaderScene({ kind: 'sign', entry }));
    } else {
      this.message.text = '읽을 수 있는 게 아니다.';
    }
  }

  // ============================================================================
  // Stalker
  // ============================================================================
  private stepStalker(): void {
    if (this.state === 'hidden') {
      this.wanderStalker();
    } else {
      const ddx = this.playerX - this.stalkerX;
      const ddy = this.playerY - this.stalkerY;
      if (ddx !== 0 || ddy !== 0) {
        const dx = Math.sign(ddx);
        const dy = Math.sign(ddy);
        const tries: Array<[number, number]> =
          Math.abs(ddx) >= Math.abs(ddy) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
        for (const [mx, my] of tries) {
          if (mx === 0 && my === 0) continue;
          const nx = this.stalkerX + mx;
          const ny = this.stalkerY + my;
          if (this.canStalkerStep(nx, ny)) {
            this.stalkerX = nx;
            this.stalkerY = ny;
            break;
          }
        }
      }
    }
    this.syncStalker();
    this.applyVisibility();
    this.evaluateContact();
    this.renderHud();
  }

  private wanderStalker(): void {
    if (Math.random() < 0.5) return;
    const dirs: Array<[number, number]> = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = dirs[i]!;
      const b = dirs[j]!;
      dirs[i] = b;
      dirs[j] = a;
    }
    for (const [mx, my] of dirs) {
      const nx = this.stalkerX + mx;
      const ny = this.stalkerY + my;
      if (this.canStalkerStep(nx, ny)) {
        this.stalkerX = nx;
        this.stalkerY = ny;
        return;
      }
    }
  }

  private canStalkerStep(x: number, y: number): boolean {
    if (!this.isWalkable(x, y)) return false;
    if (this.state === 'hidden' && x === this.playerX && y === this.playerY) return false;
    return true;
  }

  private evaluateContact(): void {
    if (this.state === 'hidden') return;
    const distance = Math.abs(this.playerX - this.stalkerX) + Math.abs(this.playerY - this.stalkerY);
    const detect = this.stalkerDetectRange;
    if (distance <= CATCH_RANGE) {
      this.endingTriggered = true;
      this.ctx.events.emit('caught', { stalker: 1, player: 0, effect: 'death' });
      // narrative 가 caught → goEnding('caught') 발사 → ending listener 가 EndingScene 으로 교체.
      // 만약 narrative event 가 없거나 매치 안 되면 fallback 으로 직접 전환.
      setTimeout(() => {
        if (this.endingTriggered && this.ctx.manager.current() === this) {
          void this.ctx.manager.replace(new EndingScene({ endingId: 'caught' }));
        }
      }, 0);
      return;
    }
    if (distance <= detect) {
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
  // FOV / Visibility
  // ============================================================================
  private recomputeFov(): void {
    const radius = this.flashlightOn ? FOV_RADIUS_FLASHLIGHT : FOV_RADIUS_BASE;
    this.fov.recompute(this.playerX, this.playerY, radius);
  }

  private applyVisibility(): void {
    // 타일
    for (let y = 0; y < this.rows; y++) {
      const row = this.tileSprites[y];
      if (!row) continue;
      for (let x = 0; x < this.cols; x++) {
        const sprite = row[x];
        if (!sprite) continue;
        const visible = this.fov.isVisible(x, y);
        const explored = this.fov.isExplored(x, y);
        if (visible) {
          sprite.visible = true;
          sprite.alpha = 1;
          sprite.tint = 0xffffff;
        } else if (explored) {
          sprite.visible = true;
          sprite.alpha = 1;
          sprite.tint = 0x404652;
        } else {
          sprite.visible = false;
        }
      }
    }
    // 소품 — 보이는 셀 위에서만 표시
    for (const p of this.propsOnMap) {
      p.sprite.visible = this.fov.isVisible(p.x, p.y);
    }
    // 추적자 — 보이는 셀 위에서만 표시
    this.stalker.visible = this.fov.isVisible(this.stalkerX, this.stalkerY);
    // 시야 오버레이 갱신
    this.renderDetectionOverlay();
    // 플레이어는 항상 보임 (자기 자신)
  }

  private renderDetectionOverlay(): void {
    const o = this.gridOrigin();
    this.detectionOverlay.clear();
    if (!this.fov.isVisible(this.stalkerX, this.stalkerY)) return;

    const range = this.stalkerDetectRange;
    const isSpotted = this.state === 'spotted';
    const color = isSpotted ? 0xff5552 : 0xc8666a;
    const alpha = isSpotted ? 0.32 : 0.13;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > range) continue;
        const cx = this.stalkerX + dx;
        const cy = this.stalkerY + dy;
        if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) continue;
        if (!this.fov.isVisible(cx, cy)) continue;
        if (!this.isWalkable(cx, cy)) continue;
        this.detectionOverlay
          .rect(o.x + cx * CELL, o.y + cy * CELL, CELL, CELL)
          .fill({ color, alpha });
      }
    }
  }

  // ============================================================================
  // Map / cells
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
    const prop = this.propAt(x, y);
    if (prop) {
      const def = findProp(prop.id);
      this.message.text = def?.kind === 'pickup'
        ? `${def.name} — g 또는 e 로 주울 수 있다.`
        : `${def?.name ?? prop.id} — e 로 살펴본다.`;
      return;
    }
    if (id === 'locker') this.message.text = '사물함. c 로 숨을 수 있다.';
    else if (id === 'desk-under') this.message.text = '책상 밑. c 로 숨을 수 있다.';
    else if (id === 'stairs-down') this.message.text = '계단 — > 로 내려갈 수 있다.';
    else if (id === 'exit') this.message.text = '비상구 — > 로 빠져나갈 수 있다.';
  }

  // ============================================================================
  // Props
  // ============================================================================
  private propAt(x: number, y: number): PropInstance | null {
    return this.propsOnMap.find((p) => p.x === x && p.y === y) ?? null;
  }

  private removePropFromMap(prop: PropInstance): void {
    this.worldRoot.removeChild(prop.sprite);
    prop.sprite.destroy();
    this.propsOnMap = this.propsOnMap.filter((p) => p !== prop);
  }

  // ============================================================================
  // Build / sync
  // ============================================================================
  private gridOrigin(): { x: number; y: number } {
    return {
      x: Math.floor((VIRTUAL_WIDTH - this.cols * CELL) / 2),
      y: Math.floor((VIRTUAL_HEIGHT - this.rows * CELL) / 2),
    };
  }

  private buildTileSprites(): void {
    const o = this.gridOrigin();
    this.tileSprites = [];
    for (let y = 0; y < this.rows; y++) {
      const row: Sprite[] = [];
      for (let x = 0; x < this.cols; x++) {
        const id = this.tileAt(x, y);
        const def = findTile(id);
        const tex = def ? this.ctx.sprites.get(def.sprite) : null;
        const sprite = new Sprite(tex ?? undefined);
        sprite.width = CELL;
        sprite.height = CELL;
        sprite.x = o.x + x * CELL;
        sprite.y = o.y + y * CELL;
        sprite.visible = false; // FOV 가 결정
        this.worldRoot.addChild(sprite);
        row.push(sprite);
      }
      this.tileSprites.push(row);
    }
  }

  private buildPropSprites(spawns: Array<{ id: string; x: number; y: number }>): void {
    const o = this.gridOrigin();
    for (const p of spawns) {
      const def = findProp(p.id);
      if (!def) continue;
      const tex = this.ctx.sprites.get(def.sprite);
      const sprite = new Sprite(tex ?? undefined);
      sprite.width = CELL;
      sprite.height = CELL;
      sprite.x = o.x + p.x * CELL;
      sprite.y = o.y + p.y * CELL;
      sprite.visible = false;
      this.worldRoot.addChild(sprite);
      this.propsOnMap.push({ id: p.id, x: p.x, y: p.y, sprite });
    }
  }

  private swapPlayerSprite(dx: number, dy: number): void {
    let dir: 'down' | 'up' | 'left' | 'right' = 'down';
    if (Math.abs(dx) >= Math.abs(dy)) dir = dx < 0 ? 'left' : dx > 0 ? 'right' : 'down';
    else dir = dy < 0 ? 'up' : 'down';
    this.playerFacing = dir;
    // 애니메이션이 있으면 textures 교체. 없으면 정적 texture.
    const frames = this.ctx.sprites.getAnimation(`player-idle-${dir}`);
    if (this.player instanceof AnimatedSprite && frames && frames.length > 0) {
      this.player.textures = frames;
      this.player.play();
      return;
    }
    const tex = this.ctx.sprites.get(`player-${dir}-0`);
    if (tex) this.player.texture = tex;
  }

  // ============================================================================
  // Snapshot — Save/Load 용
  // ============================================================================
  serialize(): GameSnapshot {
    return {
      version: 1,
      chapterId: this.chapter.id,
      zoneId: this.currentZoneId,
      player: { x: this.playerX, y: this.playerY, facing: this.playerFacing },
      stalker: { id: this.stalkerId, x: this.stalkerX, y: this.stalkerY },
      state: this.state,
      flashlight: {
        acquired: this.flashlightAcquired,
        on: this.flashlightOn,
        battery: this.flashlightBattery,
        capacity: this.flashlightCapacity,
      },
      inventory: [...this.inventory],
      narrative: this.narrative.serialize(),
      fov: this.fov.serialize(),
      savedAtIso: new Date().toISOString(),
      label: `${this.chapter.title}`,
    };
  }

  private applySnapshot(s: GameSnapshot): void {
    this.playerX = s.player.x;
    this.playerY = s.player.y;
    this.playerFacing = s.player.facing;
    const tex = this.ctx.sprites.get(`player-${this.playerFacing}-0`);
    if (tex) this.player.texture = tex;
    this.stalkerId = s.stalker.id;
    this.stalkerX = s.stalker.x;
    this.stalkerY = s.stalker.y;
    this.state = s.state;
    this.flashlightAcquired = s.flashlight.acquired;
    this.flashlightOn = s.flashlight.on;
    this.flashlightBattery = s.flashlight.battery;
    this.flashlightCapacity = s.flashlight.capacity;
    // 인벤토리 복원 + 그 위치의 맵 위 sprite 제거
    this.inventory = new Set(s.inventory);
    for (const id of s.inventory) {
      const inst = this.propsOnMap.find((p) => p.id === id);
      if (inst) this.removePropFromMap(inst);
    }
    this.narrative.restore(s.narrative);
    this.fov.restore(s.fov);
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

  // ============================================================================
  // HUD
  // ============================================================================
  private buildHud(zoneName: string): void {
    this.hudBg = new Graphics();
    this.uiRoot.addChild(this.hudBg);

    this.batteryGauge = new Graphics();
    this.uiRoot.addChild(this.batteryGauge);

    this.chapterTitle = new Text({
      text: this.chapter.title,
      style: { fill: COLOR.accent, fontSize: 18, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.uiRoot.addChild(this.chapterTitle);

    this.zoneName = new Text({
      text: zoneName,
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

    this.inventoryText = new Text({
      text: '',
      style: { fill: COLOR.fgMuted, fontSize: 14, fontFamily: FONT_MONO },
    });
    this.uiRoot.addChild(this.inventoryText);

    this.hint = new Text({
      text: '↑↓←→ 이동   e 상호작용   c 은신   f 손전등   g 줍기   >  탈출   i 인벤   ? 코덱스   Esc 메뉴',
      style: { fill: COLOR.fgDim, fontSize: 11, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(1, 0);
    this.uiRoot.addChild(this.hint);

    this.message = new Text({
      text: this.chapter.intro,
      style: { fill: COLOR.warn, fontSize: 14, fontFamily: FONT_BODY, fontStyle: 'italic' },
    });
    this.uiRoot.addChild(this.message);
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;
    this.hudBg.clear();
    this.hudBg.rect(0, 0, w, 56).fill({ color: COLOR.bgDeep, alpha: 0.85 });
    this.hudBg.rect(0, h - 84, w, 84).fill({ color: COLOR.bgDeep, alpha: 0.85 });

    this.chapterTitle.x = 24;
    this.chapterTitle.y = 12;
    this.zoneName.x = 24;
    this.zoneName.y = 36;

    this.hint.x = w - 24;
    this.hint.y = 18;

    this.stateText.x = 24;
    this.stateText.y = h - 72;
    this.flashlightText.x = 24;
    this.flashlightText.y = h - 50;
    this.batteryGauge.x = 24 + 130;
    this.batteryGauge.y = h - 50 + 6;
    this.inventoryText.x = 24;
    this.inventoryText.y = h - 28;
    this.message.x = 320;
    this.message.y = h - 60;
    this.message.style.wordWrap = true;
    this.message.style.wordWrapWidth = Math.max(240, w - 320 - 24);
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

    if (!this.flashlightAcquired) {
      this.flashlightText.text = 'LIGHT  :  —';
    } else {
      this.flashlightText.text = `LIGHT  :  ${this.flashlightOn ? 'ON ' : 'OFF'}`;
    }
    this.renderBatteryGauge();

    this.inventoryText.text = `BAG    :  ${this.inventory.size === 0 ? '(empty)' : [...this.inventory].map((id) => findProp(id)?.name ?? id).join(', ')}`;
  }

  private renderBatteryGauge(): void {
    this.batteryGauge.clear();
    if (!this.flashlightAcquired) return;
    const w = 96;
    const h = 8;
    const ratio = this.flashlightCapacity > 0
      ? Math.max(0, Math.min(1, this.flashlightBattery / this.flashlightCapacity))
      : 0;
    const fillW = Math.round(w * ratio);
    this.batteryGauge.rect(0, 0, w, h).fill({ color: COLOR.panel });
    this.batteryGauge.rect(0, 0, w, h).stroke({ color: COLOR.panelBorder, width: 1 });
    if (fillW > 0) {
      const color = ratio > 0.5 ? 0xb6c560 : ratio > 0.2 ? 0xc8a868 : 0xc8666a;
      this.batteryGauge.rect(0, 0, fillW, h).fill({ color });
    }
  }
}

// ============================================================================
// Map loader
// ============================================================================
async function loadAuthoredMap(path: string): Promise<MapData | null> {
  const url = `${import.meta.env.BASE_URL}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[mapLoader] HTTP ${res.status} fetching ${url} — falling back to empty room`);
      return null;
    }
    const json = (await res.json()) as {
      legend?: Record<string, string>;
      tiles: string[];
      spawns: MapData['spawns'];
    };
    const legend: Record<string, string> = json.legend ?? {};
    const cells = json.tiles.map((row) =>
      row.split('').map((c) => legend[c] ?? 'floor'),
    );
    console.info(`[mapLoader] loaded ${cells.length}x${cells[0]?.length ?? 0} from ${url}`);
    return { cells, spawns: json.spawns };
  } catch (err) {
    console.warn(`[mapLoader] error fetching ${url}`, err);
    return null;
  }
}

// Aseprite frameTag 가 있으면 AnimatedSprite, 없으면 정적 Sprite. 둘 다 Sprite 의 자식 타입.
function makeAnimatedOrStatic(
  ctx: SceneContext,
  animName: string | null,
  fallbackFrame: string | undefined,
): Sprite {
  if (animName) {
    const frames = ctx.sprites.getAnimation(animName);
    if (frames && frames.length > 1) {
      const a = new AnimatedSprite(frames);
      a.animationSpeed = 0.08;
      a.loop = true;
      a.play();
      return a;
    }
  }
  const tex = fallbackFrame ? ctx.sprites.get(fallbackFrame) : null;
  return new Sprite(tex ?? undefined);
}

function makeFallbackRoom(): MapData {
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
