// 엔진 레이어 barrel. 게임 코드는 항상 '@/engine' 에서 import.

export { EventBus } from './events';
export type { EventMap } from './events';

export { Input } from './input';
export type { Intent, IntentListener } from './input';

export { SceneManager } from './scenes';
export type { Scene, SceneContext } from './scenes';

export {
  createRenderer,
  gridToWorld,
  TILE_SIZE,
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  FONT_BODY,
  FONT_MONO,
  COLOR,
} from './renderer';
export type { RendererHandle } from './renderer';

export {
  listSaves,
  loadSave,
  writeSave,
  deleteSave,
  hasAnySave,
} from './save';
export type { SaveMeta, SaveRecord } from './save';

export { Settings } from './settings';
export type { SettingsState } from './settings';

export { SpriteRegistry, hashColor } from './assets';

export { AudioEngine } from './audio';
