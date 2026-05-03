// PIXI.Application 셋업.
// 두 개의 레이어:
//  - world : 정수배 스케일. 픽셀 아트(타일/스프라이트)가 들어감. nearest-neighbor.
//  - ui    : 네이티브 해상도 1:1. 텍스트/메뉴/HUD 가 들어감. 글자 크리스피.
//
// 텍스트를 world 안에 넣으면 4× 5× 로 뻥튀기 되어 깨짐. UI 는 반드시 ui 레이어에.

import { Application, Container } from 'pixi.js';

export const VIRTUAL_WIDTH = 320;
export const VIRTUAL_HEIGHT = 200;
export const TILE_SIZE = 16;

export interface RendererHandle {
  app: Application;
  world: Container; // 정수배 스케일 — 픽셀 아트 전용
  ui: Container;    // 네이티브 1:1 — 크리스피 텍스트/UI
  scale: number;    // 현재 world 의 정수 스케일
  resize(): void;
  destroy(): void;
}

export async function createRenderer(parent: HTMLElement): Promise<RendererHandle> {
  const app = new Application();
  await app.init({
    background: '#0a0b0f',
    antialias: false,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: parent,
    powerPreference: 'low-power',
  });
  parent.appendChild(app.canvas);

  const world = new Container();
  world.label = 'world';
  app.stage.addChild(world);

  const ui = new Container();
  ui.label = 'ui';
  app.stage.addChild(ui);

  const handle: RendererHandle = {
    app,
    world,
    ui,
    scale: 1,
    resize: () => updateScale(),
    destroy: () => {
      app.destroy(true, { children: true, texture: true });
    },
  };

  function updateScale(): void {
    const w = app.renderer.width / app.renderer.resolution;
    const h = app.renderer.height / app.renderer.resolution;
    const scaleX = Math.floor(w / VIRTUAL_WIDTH);
    const scaleY = Math.floor(h / VIRTUAL_HEIGHT);
    const scale = Math.max(1, Math.min(scaleX, scaleY));
    world.scale.set(scale);
    world.x = Math.floor((w - VIRTUAL_WIDTH * scale) / 2);
    world.y = Math.floor((h - VIRTUAL_HEIGHT * scale) / 2);
    handle.scale = scale;
  }

  updateScale();
  app.renderer.on('resize', updateScale);
  return handle;
}

export function gridToWorld(x: number, y: number): { x: number; y: number } {
  return { x: x * TILE_SIZE, y: y * TILE_SIZE };
}

// 공용 폰트 스택. 한국어 모노/산세리프 친화.
export const FONT_BODY = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif';
export const FONT_MONO = '"D2Coding", "Cascadia Mono", "JetBrains Mono", "Consolas", "Malgun Gothic", monospace';

// UI 색상 팔레트 (호러 톤).
export const COLOR = {
  bg: 0x0a0b0f,
  bgDeep: 0x05060a,
  fg: '#e8e4d8',
  fgMuted: '#9aa0aa',
  fgDim: '#5a6068',
  accent: '#fff2c2',
  warn: '#e8a86b',
  danger: '#d56b5b',
  panel: 0x14161c,
  panelBorder: 0x3a4150,
} as const;
