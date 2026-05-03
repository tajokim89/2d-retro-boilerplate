// 문서/방송/표지판 리더. push 로 GameScene 위에 올라옴.
// kind 별 동작:
//  - document: body 전체 표시. 키 누르면 닫힘.
//  - broadcast: lines[] 한 줄씩 진행. 마지막 줄 후 키 누르면 닫힘.
//  - sign: body 짧게 표시. 키 누르면 닫힘.
//
// 진입 시 적절한 이벤트 발행 (documentRead / broadcastHeard / signRead) → narrative 가 받음.
// 닫히면 GameScene 으로 자연스럽게 복귀.

import { Container, Graphics, Text } from 'pixi.js';
import type { Scene, SceneContext, Intent } from '@/engine';
import { FONT_BODY, FONT_MONO, COLOR } from '@/engine';
import type { DocumentEntry } from '@/content/narrative/documents';
import type { BroadcastEntry } from '@/content/narrative/broadcasts';
import type { SignEntry } from '@/content/narrative/signs';

export type ReaderContent =
  | { kind: 'document'; entry: DocumentEntry }
  | { kind: 'broadcast'; entry: BroadcastEntry }
  | { kind: 'sign'; entry: SignEntry };

export class ReaderScene implements Scene {
  private root = new Container();
  private dim!: Graphics;
  private panel!: Graphics;
  private eyebrow!: Text;
  private title!: Text;
  private body!: Text;
  private hint!: Text;
  private ctx!: SceneContext;
  private broadcastLineIndex = 0;

  constructor(private content: ReaderContent) {}

  async enter(ctx: SceneContext): Promise<void> {
    this.ctx = ctx;
    ctx.ui.addChild(this.root);

    this.dim = new Graphics();
    this.root.addChild(this.dim);

    this.panel = new Graphics();
    this.root.addChild(this.panel);

    this.eyebrow = new Text({
      text: this.eyebrowText(),
      style: { fill: COLOR.fgDim, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: 1 },
    });
    this.root.addChild(this.eyebrow);

    this.title = new Text({
      text: this.titleText(),
      style: { fill: COLOR.accent, fontSize: 22, fontFamily: FONT_BODY, fontWeight: '600' },
    });
    this.root.addChild(this.title);

    this.body = new Text({
      text: '',
      style: {
        fill: COLOR.fg,
        fontSize: 16,
        fontFamily: FONT_BODY,
        wordWrap: true,
        lineHeight: 24,
      },
    });
    this.root.addChild(this.body);

    this.hint = new Text({
      text: this.hintText(),
      style: { fill: COLOR.fgDim, fontSize: 12, fontFamily: FONT_BODY },
    });
    this.hint.anchor.set(1, 0);
    this.root.addChild(this.hint);

    this.layout();
    this.renderBody();

    // narrative 시스템이 받음
    if (this.content.kind === 'document') {
      ctx.events.emit('documentRead', { id: this.content.entry.id });
    } else if (this.content.kind === 'broadcast') {
      ctx.events.emit('broadcastHeard', { id: this.content.entry.id });
    } else {
      ctx.events.emit('signRead', { id: this.content.entry.id });
    }
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
    if (intent.kind === 'confirm' || intent.kind === 'interact' || intent.kind === 'move') {
      // broadcast 는 한 줄씩
      if (this.content.kind === 'broadcast') {
        this.broadcastLineIndex += 1;
        if (this.broadcastLineIndex >= this.content.entry.lines.length) {
          void this.ctx.manager.pop();
          return;
        }
        this.renderBody();
        return;
      }
      void this.ctx.manager.pop();
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

    const panelW = Math.min(720, w - 80);
    const panelH = Math.min(360, h - 120);
    const px = Math.round((w - panelW) / 2);
    const py = Math.round((h - panelH) / 2);

    this.panel.clear();
    this.panel.rect(px, py, panelW, panelH).fill({ color: COLOR.panel, alpha: 0.96 });
    this.panel.rect(px, py, panelW, panelH).stroke({ color: COLOR.panelBorder, width: 1 });

    this.eyebrow.x = px + 24;
    this.eyebrow.y = py + 18;
    this.title.x = px + 24;
    this.title.y = py + 36;
    this.body.x = px + 24;
    this.body.y = py + 80;
    this.body.style.wordWrapWidth = panelW - 48;
    this.hint.x = px + panelW - 24;
    this.hint.y = py + panelH - 28;
  }

  private renderBody(): void {
    if (this.content.kind === 'broadcast') {
      const i = this.broadcastLineIndex;
      const lines = this.content.entry.lines;
      const so_far = lines.slice(0, i + 1).join('\n\n');
      this.body.text = so_far;
      const remaining = lines.length - 1 - i;
      this.hint.text =
        remaining > 0 ? `Enter — 다음 (${i + 1}/${lines.length})` : 'Enter — 끝내기';
    } else {
      this.body.text = this.content.entry.body;
      this.hint.text = 'Enter / Esc — 닫기';
    }
  }

  private eyebrowText(): string {
    if (this.content.kind === 'document') return 'DOCUMENT';
    if (this.content.kind === 'broadcast') return `BROADCAST · ${this.content.entry.source}`;
    return 'SIGN';
  }

  private titleText(): string {
    if (this.content.kind === 'document') return this.content.entry.title;
    if (this.content.kind === 'broadcast') return this.content.entry.source;
    return '— 표지 —';
  }

  private hintText(): string {
    if (this.content.kind === 'broadcast') {
      return `Enter — 다음 (1/${this.content.entry.lines.length})`;
    }
    return 'Enter / Esc — 닫기';
  }
}
