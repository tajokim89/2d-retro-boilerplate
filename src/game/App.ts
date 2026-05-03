// 앱 부팅 진입점. main.ts 가 이걸 호출.
// 1) Renderer 만들고
// 2) Input + EventBus + SceneManager 묶고
// 3) 첫 Scene = IntroScene 으로 시작
// 4) ticker 에서 SceneManager.update 호출

import { Input, EventBus, SceneManager, createRenderer } from '@/engine';
import { IntroScene } from './scenes/IntroScene';

export interface AppHandle {
  destroy(): void;
}

export async function startApp(parent: HTMLElement): Promise<AppHandle> {
  const renderer = await createRenderer(parent);
  const input = new Input();
  input.attach(window);
  const events = new EventBus();

  // 메시지 이벤트는 콘솔로도 흘려보냄(개발 편의). 실제 UI 로그는 게임 씬에서 구독.
  events.on('message', ({ text, tone }) => {
    console.info(`[${tone ?? 'info'}] ${text}`);
  });

  const manager = new SceneManager({
    stage: renderer.root,
    input,
    events,
  });

  await manager.replace(new IntroScene());

  renderer.app.ticker.add((ticker) => {
    manager.update(ticker.deltaMS);
  });

  return {
    destroy() {
      input.detach(window);
      events.clear();
      renderer.destroy();
    },
  };
}
