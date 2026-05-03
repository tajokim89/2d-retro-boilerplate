// 수직 메뉴 위젯 — UI 레이어용 (네이티브 해상도, 크리스피 텍스트).
// 위/아래 키로 선택, Enter/Space 로 confirm, Esc/Tab 로 cancel.
//
// 사용:
//   const menu = new Menu({ items: [...], onSelect, onCancel });
//   ctx.ui.addChild(menu.view);
//   menu.layout({ centerX: app.screen.width / 2, top: 240 });

import { Container, Graphics, Text } from 'pixi.js';
import type { Intent } from '@/engine';
import { FONT_BODY, COLOR } from '@/engine';

export interface MenuItem {
  id: string;
  label: string;
  enabled?: boolean;
}

export interface MenuOptions {
  items: MenuItem[];
  width?: number;
  itemHeight?: number;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
}

export class Menu {
  readonly view = new Container();
  private bg = new Graphics();
  private texts: Text[] = [];
  private items: MenuItem[];
  private index = 0;
  private selectListeners = new Set<(id: string) => void>();
  private cancelListeners = new Set<() => void>();
  private opts: Required<Omit<MenuOptions, 'items'>>;

  constructor(options: MenuOptions) {
    this.items = options.items;
    this.opts = {
      width: options.width ?? 280,
      itemHeight: options.itemHeight ?? 32,
      fontSize: options.fontSize ?? 18,
      paddingX: options.paddingX ?? 20,
      paddingY: options.paddingY ?? 12,
    };
    this.view.addChild(this.bg);
    this.build();

    const firstEnabled = this.items.findIndex((it) => it.enabled !== false);
    this.index = firstEnabled === -1 ? 0 : firstEnabled;
    this.render();
  }

  /**
   * 메뉴 위치 잡기. centerX 중심, top 부터 아래로.
   */
  layout({ centerX, top }: { centerX: number; top: number }): void {
    this.view.x = Math.round(centerX - this.opts.width / 2);
    this.view.y = Math.round(top);
  }

  setItems(items: MenuItem[]): void {
    this.items = items;
    this.view.removeChildren();
    this.bg = new Graphics();
    this.view.addChild(this.bg);
    this.texts = [];
    this.build();
    const firstEnabled = this.items.findIndex((it) => it.enabled !== false);
    this.index = firstEnabled === -1 ? 0 : firstEnabled;
    this.render();
  }

  onSelect(listener: (id: string) => void): () => void {
    this.selectListeners.add(listener);
    return () => this.selectListeners.delete(listener);
  }

  onCancel(listener: () => void): () => void {
    this.cancelListeners.add(listener);
    return () => this.cancelListeners.delete(listener);
  }

  handleIntent(intent: Intent): void {
    if (intent.kind === 'move') {
      if (intent.dy < 0) this.move(-1);
      else if (intent.dy > 0) this.move(1);
      return;
    }
    if (intent.kind === 'confirm') {
      const item = this.items[this.index];
      if (item && item.enabled !== false) {
        for (const l of this.selectListeners) l(item.id);
      }
      return;
    }
    if (intent.kind === 'cancel' || intent.kind === 'menu') {
      for (const l of this.cancelListeners) l();
    }
  }

  private build(): void {
    const { itemHeight, fontSize, width, paddingX, paddingY } = this.opts;
    this.items.forEach((item, i) => {
      const text = new Text({
        text: item.label,
        style: {
          fill: COLOR.fg,
          fontSize,
          fontFamily: FONT_BODY,
          fontWeight: '500',
        },
      });
      text.x = paddingX;
      text.y = paddingY + i * itemHeight + Math.round((itemHeight - fontSize) / 2);
      this.view.addChild(text);
      this.texts.push(text);
    });
    const totalH = paddingY * 2 + this.items.length * itemHeight;
    this.bg.clear();
    this.bg.rect(0, 0, width, totalH).fill({ color: COLOR.panel, alpha: 0.92 });
    this.bg.rect(0, 0, width, totalH).stroke({ color: COLOR.panelBorder, width: 1, alpha: 1 });
  }

  private move(dir: 1 | -1): void {
    const n = this.items.length;
    for (let step = 0; step < n; step++) {
      this.index = (this.index + dir + n) % n;
      if (this.items[this.index]?.enabled !== false) break;
    }
    this.render();
  }

  private render(): void {
    this.texts.forEach((text, i) => {
      const item = this.items[i];
      if (!item) return;
      const isSelected = i === this.index;
      const isEnabled = item.enabled !== false;
      text.text = `${isSelected ? '▶  ' : '    '}${item.label}`;
      text.style.fill = !isEnabled ? COLOR.fgDim : isSelected ? COLOR.accent : COLOR.fg;
    });
  }
}
