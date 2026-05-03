// 가벼운 SFX 엔진. Web Audio 만 쓰고 외부 음원 파일은 안 씀.
// EventBus 에 자동 구독 — 게임 코드는 평소대로 emit 만 하면 SFX 가 따라 붙음.
//
// 활성화: 브라우저 자동재생 정책 때문에 첫 사용자 제스처 후에만 AudioContext 생성 가능.
// activateOnGesture() 가 keydown/pointerdown 한 번 잡고 자기 해제.
//
// 볼륨: settings.masterVolume × settings.sfxVolume. 변경 시 즉시 반영.

import type { EventBus } from './events';
import type { Settings } from './settings';

interface BlipOptions {
  freq: number;
  type?: OscillatorType;
  duration: number;
  attack?: number;
  peakGain?: number;
  detune?: number;
  sweepTo?: number;
  delay?: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private events: EventBus;
  private settings: Settings;
  private gestureHandler: (() => void) | null = null;

  constructor(events: EventBus, settings: Settings) {
    this.events = events;
    this.settings = settings;
    this.subscribe();
    this.settings.onChange(() => this.applyVolume());
  }

  activateOnGesture(): void {
    if (this.ctx || this.gestureHandler) return;
    const handler = () => {
      void this.activate();
      window.removeEventListener('keydown', handler);
      window.removeEventListener('pointerdown', handler);
      this.gestureHandler = null;
    };
    this.gestureHandler = handler;
    window.addEventListener('keydown', handler);
    window.addEventListener('pointerdown', handler);
  }

  async activate(): Promise<void> {
    if (this.ctx) return;
    try {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.applyVolume();
    } catch (err) {
      console.warn('[audio] activation failed', err);
    }
  }

  private applyVolume(): void {
    if (!this.master) return;
    const s = this.settings.get();
    const v = Math.max(0, Math.min(1, s.masterVolume * s.sfxVolume));
    this.master.gain.value = v;
  }

  private subscribe(): void {
    this.events.on('step', () => this.playStep());
    this.events.on('detected', () => this.playDetected());
    this.events.on('lost', () => this.playLost());
    this.events.on('caught', () => this.playCaught());
    this.events.on('pickup', () => this.playPickup());
    this.events.on('hideEnter', () => this.playHide(true));
    this.events.on('hideExit', () => this.playHide(false));
    this.events.on('flashlightToggle', ({ on }) => this.playFlashlight(on));
    this.events.on('codexUnlocked', () => this.playUnlock());
    this.events.on('broadcastHeard', () => this.playStatic());
  }

  private blip(opts: BlipOptions): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + (opts.delay ?? 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.sweepTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.sweepTo), t0 + opts.duration);
    }
    osc.detune.value = opts.detune ?? 0;
    osc.connect(gain);
    gain.connect(this.master);
    const peak = opts.peakGain ?? 0.18;
    const attack = opts.attack ?? 0.005;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + opts.duration);
    osc.start(t0);
    osc.stop(t0 + opts.duration + 0.02);
  }

  // ============================================================================
  // 효과음
  // ============================================================================
  playStep(): void {
    this.blip({ freq: 110, type: 'square', duration: 0.04, peakGain: 0.06 });
  }
  playDetected(): void {
    this.blip({ freq: 220, type: 'sawtooth', duration: 0.14, peakGain: 0.18, sweepTo: 110 });
  }
  playLost(): void {
    this.blip({ freq: 320, type: 'sine', duration: 0.18, peakGain: 0.10, sweepTo: 480 });
  }
  playCaught(): void {
    this.blip({ freq: 80, type: 'sawtooth', duration: 0.5, peakGain: 0.25, sweepTo: 40 });
    this.blip({ freq: 60, type: 'square', duration: 0.6, peakGain: 0.18, delay: 0.05 });
  }
  playPickup(): void {
    this.blip({ freq: 660, type: 'triangle', duration: 0.06, peakGain: 0.14 });
    this.blip({ freq: 990, type: 'triangle', duration: 0.08, peakGain: 0.10, delay: 0.05 });
  }
  playHide(_entering: boolean): void {
    this.blip({ freq: 220, type: 'sine', duration: 0.15, peakGain: 0.10, sweepTo: 160 });
  }
  playFlashlight(on: boolean): void {
    this.blip({ freq: on ? 700 : 400, type: 'square', duration: 0.04, peakGain: 0.12 });
  }
  playUnlock(): void {
    this.blip({ freq: 440, type: 'triangle', duration: 0.08, peakGain: 0.12 });
    this.blip({ freq: 660, type: 'triangle', duration: 0.12, peakGain: 0.10, delay: 0.06 });
    this.blip({ freq: 880, type: 'triangle', duration: 0.16, peakGain: 0.08, delay: 0.13 });
  }
  playStatic(): void {
    // 잡음 흉내 — 짧은 sq 펄스 무작위 주파수.
    for (let i = 0; i < 6; i++) {
      this.blip({
        freq: 200 + Math.random() * 1200,
        type: 'square',
        duration: 0.04,
        peakGain: 0.04,
        delay: i * 0.05,
      });
    }
  }
}
