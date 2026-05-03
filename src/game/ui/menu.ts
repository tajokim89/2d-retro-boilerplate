// 수직 메뉴 위젯. 메인메뉴/일시정지/설정 화면 모두 동일한 위젯 사용.
// PIXI Text 로 그림. 위/아래 키로 선택, Enter/Space 로 confirm, Esc/Tab 로 cancel.
//
// 사용:
//   const menu = new Menu({ items: [{ id: 'new', label: '새로시작' }, ...] });
//   menu.onSelect((id) => ...);
//   stage.addChild(menu.view);

import { Container, Graphics, Text } from 'pixi.js';
import type { Intent } from '@/engine';

export interface MenuItem {
  id: string;
  label: string;
  enabled?: boolean;
}

export interface MenuOptions {
  items: MenuItem[];
  x?: number;
  y?: number;
  width?: number;
  itemHeight?: number;
  fontSize?: number;
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
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: options.width ?? 140,
      itemHeight: options.itemHeight ?? 14,
      fontSize: options.fontSize ?? 10,
    };
    this.view.x = this.opts.x;
    this.view.y = this.opts.y;
    this.view.addChild(this.bg);
    this.build();
    this.render();

    // 첫 번째 활성 항목 자동 선택
    const firstEnabled = this.items.findIndex((it) => it.enabled !== false);
    this.index = firstEnabled === -1 ? 0 : firstEnabled;
    this.render();
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
    const { itemHeight, fontSize, width } = this.opts;
    this.items.forEach((item, i) => {
      const text = new Text({
        text: item.label,
        style: {
          fill: '#d8d2c2',
          fontSize,
          fontFamily: 'monospace',
        },
      });
      text.x = 8;
      text.y = i * itemHeight + 2;
      this.view.addChild(text);
      this.texts.push(text);
    });
    const totalH = this.items.length * itemHeight + 8;
    this.bg.rect(0, 0, width, totalH).fill({ color: 0x14161c, alpha: 0.85 });
    this.bg.rect(0, 0, width, totalH).stroke({ color: 0x3a4150, width: 1 });
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
      text.text = `${isSelected ? '> ' : '  '}${item.label}`;
      text.style.fill = !isEnabled ? '#5a5a5a' : isSelected ? '#fff7d6' : '#d8d2c2';
    });
  }
}
