// Scene + SceneManager. 화면 단위로 라이프사이클 관리.
// 각 Scene 은 두 개의 컨테이너를 받음:
//  - ctx.world : 정수배 스케일 (픽셀 아트용)
//  - ctx.ui    : 네이티브 1:1 (텍스트/메뉴/HUD 용)
//
// 텍스트는 반드시 ui 에. 픽셀 스프라이트/타일은 world 에.

import type { Container, Application } from 'pixi.js';
import type { Input, Intent } from './input';
import type { EventBus } from './events';

export interface SceneContext {
  app: Application;
  world: Container;
  ui: Container;
  input: Input;
  events: EventBus;
  manager: SceneManager;
}

export interface Scene {
  enter(ctx: SceneContext): void | Promise<void>;
  exit(): void | Promise<void>;
  update?(deltaMs: number): void;
  onIntent?(intent: Intent): void;
  onResize?(width: number, height: number): void;
}

export class SceneManager {
  private stack: Scene[] = [];
  private intentUnsub: (() => void) | null = null;

  constructor(private readonly ctx: Omit<SceneContext, 'manager'>) {}

  private fullCtx(): SceneContext {
    return { ...this.ctx, manager: this };
  }

  current(): Scene | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  async push(scene: Scene): Promise<void> {
    this.detachIntent();
    this.stack.push(scene);
    await scene.enter(this.fullCtx());
    this.attachIntent();
  }

  async pop(): Promise<void> {
    const top = this.stack.pop();
    if (!top) return;
    this.detachIntent();
    await top.exit();
    this.attachIntent();
  }

  async replace(scene: Scene): Promise<void> {
    const top = this.stack.pop();
    this.detachIntent();
    if (top) await top.exit();
    this.stack.push(scene);
    await scene.enter(this.fullCtx());
    this.attachIntent();
  }

  update(deltaMs: number): void {
    this.current()?.update?.(deltaMs);
  }

  resize(width: number, height: number): void {
    this.current()?.onResize?.(width, height);
  }

  private attachIntent(): void {
    const scene = this.current();
    if (!scene?.onIntent) return;
    this.intentUnsub = this.ctx.input.onIntent((intent) => scene.onIntent!(intent));
  }

  private detachIntent(): void {
    this.intentUnsub?.();
    this.intentUnsub = null;
  }
}
