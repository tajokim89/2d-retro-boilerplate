// 앱 부팅 진입점. main.ts 가 이걸 호출.
// 1) Renderer 만들고 (world + ui 두 레이어)
// 2) SpriteRegistry 셋업: 모든 콘텐츠의 sprite id 마다 procedural placeholder 등록 → 진짜 spritesheet 시도
// 3) Input + EventBus + SceneManager 묶고
// 4) 첫 Scene = IntroScene 으로 시작
// 5) ticker / resize 중계

import { Input, EventBus, SceneManager, SpriteRegistry, hashColor, createRenderer } from '@/engine';
import { tiles, stalkers, props } from '@/content';
import { IntroScene } from './scenes/IntroScene';

export interface AppHandle {
  destroy(): void;
}

export async function startApp(parent: HTMLElement): Promise<AppHandle> {
  const renderer = await createRenderer(parent);
  const input = new Input();
  input.attach(window);
  const events = new EventBus();

  // 1) procedural placeholder 등록 — 자산이 없어도 게임이 보이도록.
  const sprites = new SpriteRegistry();
  for (const t of tiles) {
    sprites.registerProcedural(t.sprite, hashColor(t.id), t.id);
  }
  for (const s of stalkers) {
    sprites.registerProcedural(s.sprite, 0x9a2a2a, s.id);
  }
  for (const p of props) {
    sprites.registerProcedural(p.sprite, 0xc8a868, p.id);
  }
  // 플레이어 placeholder (4방향 단일 프레임씩)
  sprites.registerProcedural('player-down-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-up-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-left-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-right-0', 0xfff2c2, 'P');

  // 2) 진짜 spritesheet 가 있으면 덮어쓰기. 없으면 placeholder 유지.
  await sprites.loadSpritesheet(
    `${import.meta.env.BASE_URL}assets/sprites/main.json`,
  );

  events.on('message', ({ text, tone }) => {
    console.info(`[${tone ?? 'info'}] ${text}`);
  });

  const manager = new SceneManager({
    app: renderer.app,
    world: renderer.world,
    ui: renderer.ui,
    input,
    events,
    sprites,
  });

  await manager.replace(new IntroScene());

  renderer.app.ticker.add((ticker) => {
    manager.update(ticker.deltaMS);
  });
  renderer.app.renderer.on('resize', () => {
    manager.resize(renderer.app.renderer.width, renderer.app.renderer.height);
  });

  return {
    destroy() {
      input.detach(window);
      events.clear();
      renderer.destroy();
    },
  };
}
