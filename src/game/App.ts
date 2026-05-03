// 앱 부팅 진입점.
// 1) Renderer (world + ui)
// 2) Settings + AudioEngine — 단일 인스턴스, ctx 로 모든 Scene 에 전달
// 3) SpriteRegistry — procedural placeholder + 진짜 spritesheet 시도
// 4) Input + EventBus + SceneManager
// 5) 첫 Scene = IntroScene
// 6) AudioEngine 은 첫 사용자 제스처 후 활성화 (브라우저 자동재생 정책)

import {
  Input,
  EventBus,
  SceneManager,
  SpriteRegistry,
  Settings,
  AudioEngine,
  hashColor,
  createRenderer,
} from '@/engine';
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
  const settings = new Settings();
  const audio = new AudioEngine(events, settings);
  audio.activateOnGesture();

  // SpriteRegistry — placeholder 등록 후 진짜 시트 시도.
  const sprites = new SpriteRegistry();
  for (const t of tiles) sprites.registerProcedural(t.sprite, hashColor(t.id), t.id);
  for (const s of stalkers) sprites.registerProcedural(s.sprite, 0x9a2a2a, s.id);
  for (const p of props) sprites.registerProcedural(p.sprite, 0xc8a868, p.id);
  sprites.registerProcedural('player-down-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-up-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-left-0', 0xfff2c2, 'P');
  sprites.registerProcedural('player-right-0', 0xfff2c2, 'P');
  await sprites.loadSpritesheet(`${import.meta.env.BASE_URL}assets/sprites/main.json`);

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
    settings,
    audio,
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
