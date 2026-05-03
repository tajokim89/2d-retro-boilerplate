// 코덱스 뷰어. ? 키로 게임 위에 push.
// 잠금해제된 항목만 표시. 위/아래로 항목 선택, 본문 우측에 표시.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';
import { codexEntries, type CodexEntry } from '@/content/narrative/codex';

export interface CodexSceneOptions {
  unlockedIds: readonly string[];
}

export class CodexScene implements Scene {
  private root = new Container();
  private dim!: Graphics;
  private panel!: Graphics;
  private title!: Text;
  private listText!: Text;
  private detailTitle!: Text;
  private detailBody!: Text;
  private hint!: Text;
  private items: CodexEntry[] = [];
  private selectedIndex = 0;
  private ctx!: SceneContext;

  constructor(private opts: CodexSceneOptions) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    this.items = this.opts.unlockedIds
      .map((id) => codexEntries.find((c) => c.id === id))
      .filter((c): c is CodexEntry => Boolean(c));

    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.panel = new Graphics();
    this.root.addChild(this.panel);

    this.title = new Text({
      text: '코덱스',
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
    if (intent.kind === 'cancel' || intent.kind === 'codex') {
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
      this.listText.text = '— 잠금해제된 항목 없음 —\n\n환경 서사(메모/방송/표지판)를 발견하면 자동으로 채워집니다.';
      this.listText.style.fill = COLOR.fgDim;
      return;
    }
    this.listText.style.fill = COLOR.fg;
    this.listText.text = this.items
      .map((it, i) => `${i === this.selectedIndex ? '▶ ' : '  '}${it.title}`)
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
    this.detailTitle.text = cur.title;
    this.detailBody.text = cur.body;
  }
}
