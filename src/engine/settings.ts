// 사용자 설정. localStorage 영속.
// 새 설정 추가: SettingsState 에 필드 추가, DEFAULTS 채우기, UI 에 노출.

const KEY = 'retro-napolitan:settings';

export interface SettingsState {
  masterVolume: number; // 0..1
  musicVolume: number;
  sfxVolume: number;
  language: 'ko' | 'en';
  showFps: boolean;
}

const DEFAULTS: SettingsState = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.9,
  language: 'ko',
  showFps: false,
};

export class Settings {
  private state: SettingsState;
  private listeners = new Set<(s: SettingsState) => void>();

  constructor() {
    this.state = this.load();
  }

  get(): Readonly<SettingsState> {
    return this.state;
  }

  patch(partial: Partial<SettingsState>): void {
    this.state = { ...this.state, ...partial };
    this.persist();
    for (const l of this.listeners) l(this.state);
  }

  reset(): void {
    this.state = { ...DEFAULTS };
    this.persist();
    for (const l of this.listeners) l(this.state);
  }

  onChange(listener: (s: SettingsState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private load(): SettingsState {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    try {
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SettingsState>) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private persist(): void {
    localStorage.setItem(KEY, JSON.stringify(this.state));
  }
}
