// 키보드 → 추상화된 의도(Intent) 매핑.
// 게임 로직은 raw 키 코드 절대 안 본다. Intent 만 본다.
// 새 키바인딩: KEY_TO_INTENT 에 한 줄.
//
// 호러 탐험 컨셉 보일러플레이트 — 전투 의도 없음.
// 핵심 의도: move, wait, confirm, cancel, interact, hide, use, pickup, descend.

export type Intent =
  | { kind: 'move'; dx: number; dy: number }
  | { kind: 'wait' }
  | { kind: 'confirm' }
  | { kind: 'cancel' }
  | { kind: 'menu' }
  | { kind: 'interact' } // e — 일반 상호작용 (메모 읽기, 라디오 켜기, 문 열기)
  | { kind: 'hide' }     // c — 은신 토글 (락커/구석/책상 밑에 들어가거나 나오기)
  | { kind: 'use' }      // f — 손전등 토글, 휴대 도구 사용
  | { kind: 'inventory' }
  | { kind: 'pickup' }
  | { kind: 'descend' }  // > — 다음 구역으로 진입(계단/탈출구)
  | { kind: 'codex' };   // ? — 모은 문서/방송 목록 열기

const KEY_TO_INTENT: Record<string, Intent> = {
  // 이동: 화살표 + WASD + vi-keys
  ArrowLeft: { kind: 'move', dx: -1, dy: 0 },
  ArrowRight: { kind: 'move', dx: 1, dy: 0 },
  ArrowUp: { kind: 'move', dx: 0, dy: -1 },
  ArrowDown: { kind: 'move', dx: 0, dy: 1 },
  a: { kind: 'move', dx: -1, dy: 0 },
  d: { kind: 'move', dx: 1, dy: 0 },
  w: { kind: 'move', dx: 0, dy: -1 },
  s: { kind: 'move', dx: 0, dy: 1 },
  h: { kind: 'move', dx: -1, dy: 0 },
  l: { kind: 'move', dx: 1, dy: 0 },
  k: { kind: 'move', dx: 0, dy: -1 },
  j: { kind: 'move', dx: 0, dy: 1 },
  // 액션
  '.': { kind: 'wait' },
  Enter: { kind: 'confirm' },
  ' ': { kind: 'confirm' },
  Escape: { kind: 'cancel' },
  Tab: { kind: 'menu' },
  e: { kind: 'interact' },
  c: { kind: 'hide' },
  f: { kind: 'use' },
  i: { kind: 'inventory' },
  g: { kind: 'pickup' },
  '>': { kind: 'descend' },
  '?': { kind: 'codex' },
};

export type IntentListener = (intent: Intent) => void;

export class Input {
  private listeners = new Set<IntentListener>();
  private down = new Set<string>();
  private boundDown = this.onKeyDown.bind(this);
  private boundUp = this.onKeyUp.bind(this);

  attach(target: Window | HTMLElement = window): void {
    target.addEventListener('keydown', this.boundDown as EventListener);
    target.addEventListener('keyup', this.boundUp as EventListener);
  }

  detach(target: Window | HTMLElement = window): void {
    target.removeEventListener('keydown', this.boundDown as EventListener);
    target.removeEventListener('keyup', this.boundUp as EventListener);
  }

  onIntent(listener: IntentListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isDown(key: string): boolean {
    return this.down.has(key);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.repeat) return;
    this.down.add(event.key);
    const intent = KEY_TO_INTENT[event.key];
    if (!intent) return;
    event.preventDefault();
    for (const listener of this.listeners) {
      listener(intent);
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.down.delete(event.key);
  }
}
