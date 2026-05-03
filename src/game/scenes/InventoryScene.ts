// 인벤토리 뷰어. i 키로 게임 위에 push.
// 가진 소품 목록. 선택 시 상세(이름/효과/플레이버) 표시.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { findProp } from '@/content';
import type { PropDef } from '@/content/props';
import { getFlavor } from '@/content/narrative/flavor';

export interface InventorySceneOptions {
  itemIds: readonly string[];
}

export class InventoryScene implements Scene {
  private root = new Container();
  private dim!: Graphics;
  private panel!: Graphics;
  private title!: Text;
  private listText!: Text;
  private detailTitle!: Text;
  private detailBody!: Text;
  private hint!: Text;
  private items: PropDef[] = [];
  private selectedIndex = 0;
  private ctx!: SceneContext;

  constructor(private opts: InventorySceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    this.items = this.opts.itemIds
      .map((id) => findProp(id))
      .filter((p): p is PropDef => Boolean(p));

    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.panel = new Graphics();
    this.root.addChild(this.panel);

    this.title = new Text({
      text: '소지품',
      style: { fill: COLOR.accent, fontSize: 22, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.root.addChild(this.title);

    this.listText = new Text({
      text: '',
      style: { fill: COLOR.fg, fontSize: 14, fontFamily: FONT_BODY, lineHeight: 24 },
    });
    this.root.addChild(this.listText);

    this.detailTitle = new Text({
      text: '',
      style: { fill: COLOR.accent, fontSize: 16, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.root.addChild(this.detailTitle);

    this.detailBody = new Text({
      text: '',
      style: {
        fill: COLOR.fg,
        fontSize: 14,
        fontFamily: FONT_BODY,
        wordWrap: true,
        lineHeight: 22,
      },
    });
    this.root.addChild(this.detailBody);

    this.hint = new Text({
      text: '↑↓ 선택   Esc 닫기',
      style: { fill: COLOR.fgDim, fontSize: 12, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(1, 0);
    this.root.addChild(this.hint);

    this.layout();
    this.renderList();
    this.renderDetail();
  }

  exit(): void {
    this.ctx.ui.removeChild(this.root);
    this.root.destroy({ children: true });
  }

  onIntent(intent: Intent): void {
    if (intent.kind === 'cancel' || intent.kind === 'inventory') {
      void this.ctx.manager.pop();
      return;
    }
    if (intent.kind === 'move' && this.items.length > 0) {
      if (intent.dy < 0) {
        this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
      } else if (intent.dy > 0) {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      }
      this.renderList();
      this.renderDetail();
    }
  }

  onResize(): void {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.app.screen.width;
    const h = this.ctx.app.screen.height;

    this.dim.clear();
    this.dim.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0.78 });

    const panelW = Math.min(800, w - 80);
    const panelH = Math.min(440, h - 120);
    const px = Math.round((w - panelW) / 2);
    const py = Math.round((h - panelH) / 2);

    this.panel.clear();
    this.panel.rect(px, py, panelW, panelH).fill({ color: COLOR.panel, alpha: 0.96 });
    this.panel.rect(px, py, panelW, panelH).stroke({ color: COLOR.panelBorder, width: 1 });

    this.title.x = px + 24;
    this.title.y = py + 18;

    const listW = 240;
    this.listText.x = px + 24;
    this.listText.y = py + 64;

    const detailX = px + 24 + listW + 24;
    this.detailTitle.x = detailX;
    this.detailTitle.y = py + 64;
    this.detailBody.x = detailX;
    this.detailBody.y = py + 64 + 28;
    this.detailBody.style.wordWrapWidth = panelW - listW - 72;

    this.hint.x = px + panelW - 24;
    this.hint.y = py + panelH - 28;
  }

  private renderList(): void {
    if (this.items.length === 0) {
      this.listText.text = '— 가진 것이 없다 —\n\nbody 위 소품에서 g 또는 e 로 줍습니다.';
      this.listText.style.fill = COLOR.fgDim;
      return;
    }
    this.listText.style.fill = COLOR.fg;
    this.listText.text = this.items
      .map((it, i) => `${i === this.selectedIndex ? '▶ ' : '  '}${it.name}`)
      .join('\n');
  }

  private renderDetail(): void {
    if (this.items.length === 0) {
      this.detailTitle.text = '';
      this.detailBody.text = '';
      return;
    }
    const cur = this.items[this.selectedIndex];
    if (!cur) return;
    this.detailTitle.text = cur.name;
    this.detailBody.text = describeProp(cur);
  }
}

function describeProp(def: PropDef): string {
  const eff = def.effect;
  let line = '';
  switch (eff.kind) {
    case 'light':
      line = `손전등. 시야 반경 +${eff.radius}. 배터리: ${eff.battery ?? '∞'}`;
      break;
    case 'unlock':
      line = `${eff.doorId} 문을 열 수 있다.`;
      break;
    case 'broadcast':
      line = '들으면 어떤 메시지가 흘러나온다.';
      break;
    case 'document':
      line = '읽을 수 있는 무엇인가가 적혀 있다.';
      break;
    case 'sign':
      line = '표지판.';
      break;
    case 'tool':
      line = `도구 — ${eff.action}`;
      break;
  }
  const flavor = getFlavor(def.id);
  return flavor ? `${line}\n\n${flavor}` : line;
}
