// 모바일/터치 가상 컨트롤러. CSS 미디어 쿼리(`pointer: coarse`) 가 표시 여부 결정.
// 데스크톱 마우스에서는 안 보이고, 터치 디바이스에서만 화면 하단에 D-pad + 액션 버튼.
//
// D-pad: 길게 누르면 250ms 후부터 150ms 간격 자동 반복.
// 액션 버튼: edge-trigger 1회.
//
// CSS 는 index.html 에 같이 박혀 있음 — 별도 파일 안 만듦 (보일러플레이트 의존성 최소).

import type { Input, Intent } from './input';

const ACTION_INTENTS: Record<string, Intent> = {
  interact: { kind: 'interact' },
  hide: { kind: 'hide' },
  use: { kind: 'use' },
  pickup: { kind: 'pickup' },
  descend: { kind: 'descend' },
  cancel: { kind: 'cancel' },
  inventory: { kind: 'inventory' },
  codex: { kind: 'codex' },
  confirm: { kind: 'confirm' },
};

export class TouchControls {
  private root: HTMLDivElement;
  private input: Input;

  constructor(input: Input) {
    this.input = input;
    this.root = this.build();
    document.body.appendChild(this.root);
  }

  destroy(): void {
    this.root.remove();
  }

  private build(): HTMLDivElement {
    const root = document.createElement('div');
    root.id = 'touch-controls';
    root.innerHTML = `
      <div class="dpad">
        <button class="dpad-btn dpad-up"    data-dx="0"  data-dy="-1" aria-label="up">▲</button>
        <button class="dpad-btn dpad-left"  data-dx="-1" data-dy="0"  aria-label="left">◀</button>
        <button class="dpad-btn dpad-right" data-dx="1"  data-dy="0"  aria-label="right">▶</button>
        <button class="dpad-btn dpad-down"  data-dx="0"  data-dy="1"  aria-label="down">▼</button>
      </div>
      <div class="actions">
        <button data-intent="interact" title="상호작용 (e)">E</button>
        <button data-intent="hide"     title="은신 (c)">C</button>
        <button data-intent="use"      title="손전등 (f)">F</button>
        <button data-intent="pickup"   title="줍기 (g)">G</button>
        <button data-intent="descend"  title="탈출/계단 (>)">&gt;</button>
        <button data-intent="cancel"   title="메뉴 (Esc)">M</button>
        <button data-intent="inventory" title="인벤 (i)">I</button>
        <button data-intent="codex"    title="코덱스 (?)">?</button>
      </div>
    `;

    root.querySelectorAll<HTMLButtonElement>('.dpad-btn').forEach((btn) => {
      const dx = Number(btn.dataset.dx ?? 0);
      const dy = Number(btn.dataset.dy ?? 0);
      this.attachRepeat(btn, { kind: 'move', dx, dy });
    });

    root.querySelectorAll<HTMLButtonElement>('.actions button').forEach((btn) => {
      const key = btn.dataset.intent ?? '';
      const intent = ACTION_INTENTS[key];
      if (!intent) return;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.input.trigger(intent);
      });
    });

    return root;
  }

  private attachRepeat(btn: HTMLButtonElement, intent: Intent): void {
    let initialTimer: number | null = null;
    let repeatTimer: number | null = null;

    const cancel = () => {
      if (initialTimer !== null) {
        clearTimeout(initialTimer);
        initialTimer = null;
      }
      if (repeatTimer !== null) {
        clearInterval(repeatTimer);
        repeatTimer = null;
      }
    };

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.input.trigger(intent);
      initialTimer = window.setTimeout(() => {
        repeatTimer = window.setInterval(() => this.input.trigger(intent), 150);
      }, 250);
    });
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('pointerleave', cancel);
  }
}
