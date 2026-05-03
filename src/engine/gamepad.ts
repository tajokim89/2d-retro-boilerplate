// 표준 Gamepad API 폴러. App 의 ticker 에서 매 프레임 poll().
// 버튼은 edge-trigger (눌리는 순간 1회). 좌측 스틱은 임계치(0.5) 넘는 순간 1회.
//
// 매핑(Xbox 기준 — 표준 매핑):
//   0 A  → confirm   |  4 L1 → hide      | 12 D▲ → move up
//   1 B  → cancel    |  5 R1 → pickup    | 13 D▼ → move down
//   2 X  → interact  |  6 L2 → codex     | 14 D◀ → move left
//   3 Y  → use       |  7 R2 → inventory | 15 D▶ → move right
//                    |  8 Select → descend
//                    |  9 Start  → cancel(=pause)

import type { Input, Intent } from './input';

const BUTTON_TO_INTENT: Record<number, Intent> = {
  0: { kind: 'confirm' },
  1: { kind: 'cancel' },
  2: { kind: 'interact' },
  3: { kind: 'use' },
  4: { kind: 'hide' },
  5: { kind: 'pickup' },
  6: { kind: 'codex' },
  7: { kind: 'inventory' },
  8: { kind: 'descend' },
  9: { kind: 'cancel' },
  12: { kind: 'move', dx: 0, dy: -1 },
  13: { kind: 'move', dx: 0, dy: 1 },
  14: { kind: 'move', dx: -1, dy: 0 },
  15: { kind: 'move', dx: 1, dy: 0 },
};

const STICK_THRESHOLD = 0.5;

export class GamepadInput {
  private prevButtons = new Map<number, boolean[]>();
  private prevStick = new Map<number, { dx: number; dy: number }>();
  private input: Input;

  constructor(input: Input) {
    this.input = input;
  }

  poll(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (!pad) continue;
      this.processButtons(pad);
      this.processStick(pad);
    }
  }

  private processButtons(pad: Gamepad): void {
    const prev = this.prevButtons.get(pad.index) ?? [];
    const next: boolean[] = [];
    for (let i = 0; i < pad.buttons.length; i++) {
      const btn = pad.buttons[i];
      const pressed = btn ? btn.pressed : false;
      next.push(pressed);
      if (pressed && !(prev[i] ?? false)) {
        const intent = BUTTON_TO_INTENT[i];
        if (intent) this.input.trigger(intent);
      }
    }
    this.prevButtons.set(pad.index, next);
  }

  private processStick(pad: Gamepad): void {
    const x = pad.axes[0] ?? 0;
    const y = pad.axes[1] ?? 0;
    let dx = 0;
    let dy = 0;
    if (x > STICK_THRESHOLD) dx = 1;
    else if (x < -STICK_THRESHOLD) dx = -1;
    if (y > STICK_THRESHOLD) dy = 1;
    else if (y < -STICK_THRESHOLD) dy = -1;

    const prev = this.prevStick.get(pad.index) ?? { dx: 0, dy: 0 };
    if ((dx !== 0 || dy !== 0) && (dx !== prev.dx || dy !== prev.dy)) {
      this.input.trigger({ kind: 'move', dx, dy });
    }
    this.prevStick.set(pad.index, { dx, dy });
  }
}
