// PIXI.Application 셋업. 픽셀-퍼펙트 정수배 스케일.
// 내부 해상도(VIRTUAL_WIDTH x VIRTUAL_HEIGHT) 는 작게 잡고, 화면 크기에 맞춰 정수배만큼 stage 를 키운다.
// nearest-neighbor 강제 — 픽셀 절대 안 흐려짐.

import { Application, Container } from 'pixi.js';

export const VIRTUAL_WIDTH = 320;
export const VIRTUAL_HEIGHT = 200;
export const TILE_SIZE = 16;

export interface RendererHandle {
  app: Application;
  root: Container; // 모든 Scene 은 root 의 자식. 정수배 스케일은 root.scale 로 일괄.
  scale: number;
  resize(): void;
  destroy(): void;
}

export async function createRenderer(parent: HTMLElement): Promise<RendererHandle> {
  const app = new Application();
  await app.init({
    background: '#0a0b0f',
    antialias: false,
    autoDensity: true,
    resolution: 1,
    resizeTo: parent,
    powerPreference: 'low-power',
  });
  parent.appendChild(app.canvas);

  const root = new Container();
  root.label = 'root';
  app.stage.addChild(root);

  const handle: RendererHandle = {
    app,
    root,
    scale: 1,
    resize: () => updateScale(),
    destroy: () => {
      app.destroy(true, { children: true, texture: true });
    },
  };

  function updateScale(): void {
    const w = app.renderer.width;
    const h = app.renderer.height;
    const scaleX = Math.floor(w / VIRTUAL_WIDTH);
    const scaleY = Math.floor(h / VIRTUAL_HEIGHT);
    const scale = Math.max(1, Math.min(scaleX, scaleY));
    root.scale.set(scale);
    root.x = Math.floor((w - VIRTUAL_WIDTH * scale) / 2);
    root.y = Math.floor((h - VIRTUAL_HEIGHT * scale) / 2);
    handle.scale = scale;
  }

  updateScale();
  app.renderer.on('resize', updateScale);
  return handle;
}

export function gridToWorld(x: number, y: number): { x: number; y: number } {
  return { x: x * TILE_SIZE, y: y * TILE_SIZE };
}
