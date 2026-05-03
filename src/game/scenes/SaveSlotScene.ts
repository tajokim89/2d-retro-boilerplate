// Save/Load 슬롯 선택. 3개 슬롯 표시.
// mode='save': snapshot 을 선택 슬롯에 기록.
// mode='load': 선택 슬롯 읽어서 onLoad 콜백 호출 (호출자가 Scene 전이 결정).
//
// 슬롯 데이터 형식은 engine/save.ts 의 SaveRecord<GameSnapshot>.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, FONT_MONO, COLOR, listSaves, loadSave, writeSave } from '@/engine';
import type { GameSnapshot } from '../state';

const SLOT_COUNT = 3;

export type SaveSlotMode =
  | { mode: 'save'; snapshot: GameSnapshot }
  | { mode: 'load'; onLoad: (snapshot: GameSnapshot) => void };

export class SaveSlotScene implements Scene {
  private root = new Container();
  private dim!: Graphics;
  private panel!: Graphics;
  private title!: Text;
  private rowsContainer = new Container();
  private rows: Array<{ container: Container; bg: Graphics; text: Text }> = [];
  private rowsContainerWidth = 600;
  private selectedIndex = 0;
  private hint!: Text;
  private toast!: Text;
  private ctx!: SceneContext;

  constructor(private opts: SaveSlotMode) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.panel = new Graphics();
    this.root.addChild(this.panel);

    this.title = new Text({
      text: this.opts.mode === 'save' ? '저장 슬롯 선택' : '불러오기 슬롯 선택',
      style: { fill: COLOR.accent, fontSize: 22, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.root.addChild(this.title);

    this.root.addChild(this.rowsContainer);

    this.toast = new Text({
      text: '',
      style: { fill: COLOR.warn, fontSize: 14, fontFamily: FONT_BODY, fontStyle: 'italic' },
    });
    this.root.addChild(this.toast);

    this.hint = new Text({
      text: '↑↓ 선택   Enter 결정   Esc 취소',
      style: { fill: COLOR.fgDim, fontSize: 12, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(1, 0);
    this.root.addChild(this.hint);

    this.buildRows();
    this.layout();
    this.renderRows();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    if (intent.kind === 'cancel') {
      void this.ctx.manager.pop();
      return;
    }
    if (intent.kind === 'move') {
      if (intent.dy < 0) this.move(-1);
      else if (intent.dy > 0) this.move(1);
      return;
    }
    if (intent.kind === 'confirm') {
      void this.commit();
    }
  }

  onResize(): void {
    this.layout();
  }

  private move(dir: 1 | -1): void {
    this.selectedIndex = (this.selectedIndex + dir + SLOT_COUNT) % SLOT_COUNT;
    this.renderRows();
  }

  private async commit(): Promise<void> {
    const slot = this.selectedIndex;
    if (this.opts.mode === 'save') {
      const snapshot = this.opts.snapshot;
      const label = `${snapshot.chapterId} · ${snapshot.zoneId}`;
      writeSave(slot, snapshot, label);
      this.toast.text = `슬롯 ${slot + 1} 에 저장되었습니다.`;
      this.buildRows();
      this.renderRows();
      return;
    }
    // load
    const rec = loadSave<GameSnapshot>(slot);
    if (!rec) {
      this.toast.text = `슬롯 ${slot + 1} 은(는) 비어 있습니다.`;
      return;
    }
    this.opts.onLoad(rec.payload);
  }

  private buildRows(): void {
    this.rowsContainer.removeChildren();
    this.rows = [];

    const all = listSaves<GameSnapshot>();
    const bySlot = new Map(all.map((r) => [r.meta.slot, r]));

    for (let i = 0; i < SLOT_COUNT; i++) {
      const c = new Container();
      const bg = new Graphics();
      const rec = bySlot.get(i);
      const text = new Text({
        text: this.formatSlotLabel(i, rec ? rec.meta : null, rec ? rec.payload : null),
        style: { fill: COLOR.fg, fontSize: 14, fontFamily: FONT_MONO, lineHeight: 22 },
      });
      c.addChild(bg);
      c.addChild(text);
      this.rowsContainer.addChild(c);
      this.rows.push({ container: c, bg, text });
    }
  }

  private formatSlotLabel(
    slot: number,
    meta: { savedAt: string; label: string } | null,
    payload: GameSnapshot | null,
  ): string {
    const head = `슬롯 ${slot + 1}`;
    if (!meta || !payload) return `${head}    — 비어 있음 —`;
    const when = formatWhen(meta.savedAt);
    return `${head}    ${payload.chapterId} · ${payload.zoneId}\n         ${when}`;
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;

    this.dim.clear();
    this.dim.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

    const panelW = Math.min(640, w - 80);
    const panelH = Math.min(400, h - 120);
    const px = Math.round((w - panelW) / 2);
    const py = Math.round((h - panelH) / 2);

    this.panel.clear();
    this.panel.rect(px, py, panelW, panelH).fill({ color: COLOR.panel, alpha: 0.96 });
    this.panel.rect(px, py, panelW, panelH).stroke({ color: COLOR.panelBorder, width: 1 });

    this.title.x = px + 24;
    this.title.y = py + 18;

    const rowH = 56;
    this.rowsContainerWidth = panelW - 48;
    this.rowsContainer.x = px + 24;
    this.rowsContainer.y = py + 64;
    this.rows.forEach((r, i) => {
      r.container.x = 0;
      r.container.y = i * rowH;
      r.text.x = 16;
      r.text.y = 8;
    });

    this.toast.x = px + 24;
    this.toast.y = py + panelH - 56;

    this.hint.x = px + panelW - 24;
    this.hint.y = py + panelH - 28;

    this.renderRows();
  }

  private renderRows(): void {
    const rowW = this.rowsContainerWidth;
    this.rows.forEach((r, i) => {
      const selected = i === this.selectedIndex;
      r.bg.clear();
      r.bg.rect(0, 0, rowW, 48).fill({ color: selected ? 0x2a3142 : 0x000000, alpha: selected ? 0.85 : 0 });
      r.bg.rect(0, 0, rowW, 48).stroke({ color: selected ? COLOR.accent : COLOR.panelBorder, width: 1 });
      r.text.style.fill = selected ? COLOR.accent : COLOR.fg;
    });
  }
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso;
  }
}
