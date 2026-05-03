// NarrativeSystem 이 EventBus 의 사실을 받아 content/narrative/events.ts 의 효과를 emit 하는지.
// 보일러플레이트의 데모 이벤트 first-detection / first-caught / pa-broadcast 를 트리거.

import { describe, it, expect } from 'vitest';
import { EventBus } from '@/engine/events';
import { NarrativeSystem } from '@/game/systems/narrative';

describe('NarrativeSystem', () => {
  it('emits a danger message on first detection', () => {
    const bus = new EventBus();
    new NarrativeSystem(bus);
    let seen: { text: string; tone?: string } | null = null;
    bus.on('message', (m) => {
      seen = m;
    });
    bus.emit('detected', { stalker: 1, player: 0 });
    expect(seen).not.toBeNull();
    expect(seen!.text).toMatch(/들켰/);
    expect(seen!.tone).toBe('danger');
  });

  it('fires the caught -> ending pipeline', () => {
    const bus = new EventBus();
    new NarrativeSystem(bus);
    let endingId: string | null = null;
    bus.on('ending', ({ id }) => {
      endingId = id;
    });
    bus.emit('caught', { stalker: 1, player: 0, effect: 'death' });
    expect(endingId).toBe('caught');
  });

  it('once-only events do not fire twice', () => {
    const bus = new EventBus();
    new NarrativeSystem(bus);
    let count = 0;
    bus.on('message', () => {
      count += 1;
    });
    bus.emit('detected', { stalker: 1, player: 0 });
    bus.emit('detected', { stalker: 1, player: 0 });
    expect(count).toBe(1);
  });

  it('unlocks codex when the right broadcast is heard', () => {
    const bus = new EventBus();
    new NarrativeSystem(bus);
    let unlockedId: string | null = null;
    bus.on('codexUnlocked', ({ id }) => {
      unlockedId = id;
    });
    bus.emit('broadcastHeard', { id: 'bc-school-pa' });
    expect(unlockedId).toBe('codex-shadow-line');
  });
});
