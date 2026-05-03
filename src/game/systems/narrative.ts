// Narrative event 런타임.
// content/narrative/events.ts 의 { trigger, then } 데이터를 실제로 실행한다.
//
// "사실(fact)" 기반 평가:
//   GameScene 이 의미 있는 행동(들킴, 잡힘, 줍기, 문서 읽기, 방송 듣기, 표지판 보기)이 일어날 때마다
//   recordFact() 로 사실을 한 줄 등록한다. 그러면 모든 narrative event 의 trigger 를 평가해서
//   매치되는 것은 then[] 효과를 emit. once 로 표시된 것은 한 번만.
//
// 지원하는 효과:
//   - message       → events.emit('message')
//   - unlockCodex   → events.emit('codexUnlocked')
//   - setFlag       → 내부 flags 갱신 + events.emit('flagSet')
//   - goEnding      → events.emit('ending') — GameScene 이 받아서 EndingScene 으로 전환
//
// 다음 단계 미구현(데이터만 받아둠): lightsOut, noise, spawnStalker, openDocument, playBroadcast.
// 저런 건 zone/world 조작이 필요해서 GameScene 의 협력자가 필요. 먼저 데이터/타입은 살려둠.

import type { EventBus } from '@/engine';
import {
  narrativeEvents,
  type Condition,
  type Effect,
  type NarrativeEvent,
} from '@/content/narrative/events';

export class NarrativeSystem {
  private facts = new Set<string>();
  private flags: Record<string, boolean> = {};
  private fired = new Set<string>();
  private unlockedCodex = new Set<string>();
  private events: EventBus;
  private unsubs: Array<() => void> = [];

  constructor(events: EventBus) {
    this.events = events;
    this.subscribe();
  }

  destroy(): void {
    for (const u of this.unsubs) u();
    this.unsubs.length = 0;
  }

  isCodexUnlocked(id: string): boolean {
    return this.unlockedCodex.has(id);
  }

  getUnlockedCodex(): readonly string[] {
    return [...this.unlockedCodex];
  }

  flagOf(id: string): boolean {
    return this.flags[id] === true;
  }

  serialize(): {
    facts: string[];
    flags: Record<string, boolean>;
    fired: string[];
    unlockedCodex: string[];
  } {
    return {
      facts: [...this.facts],
      flags: { ...this.flags },
      fired: [...this.fired],
      unlockedCodex: [...this.unlockedCodex],
    };
  }

  restore(snapshot: {
    facts: string[];
    flags: Record<string, boolean>;
    fired: string[];
    unlockedCodex: string[];
  }): void {
    this.facts = new Set(snapshot.facts);
    this.flags = { ...snapshot.flags };
    this.fired = new Set(snapshot.fired);
    this.unlockedCodex = new Set(snapshot.unlockedCodex);
  }

  // 외부에서 직접 사실을 등록할 수도 있게 노출 (예: enterTile, enterZone, turnGte 같은 GameScene 컨텍스트).
  recordFact(fact: string): void {
    if (this.facts.has(fact)) return;
    this.facts.add(fact);
    this.evaluate();
  }

  // 이벤트 버스에 구독해서, 게임 코드는 그냥 평소대로 emit 만 하면 됨.
  private subscribe(): void {
    this.unsubs.push(
      this.events.on('detected', () => this.recordFact('detected')),
      this.events.on('caught', () => this.recordFact('caught')),
      this.events.on('pickup', ({ prop }) => this.recordFact(`pickup:${prop}`)),
      this.events.on('documentRead', ({ id }) => this.recordFact(`documentRead:${id}`)),
      this.events.on('broadcastHeard', ({ id }) => this.recordFact(`broadcastHeard:${id}`)),
      this.events.on('signRead', ({ id }) => this.recordFact(`signRead:${id}`)),
      this.events.on('zoneExit', ({ fromZone }) => this.recordFact(`zoneExit:${fromZone}`)),
    );
  }

  private evaluate(): void {
    for (const ev of narrativeEvents) {
      const once = ev.once !== false;
      if (once && this.fired.has(ev.id)) continue;
      if (!this.matches(ev.trigger)) continue;
      this.fire(ev);
    }
  }

  private matches(cond: Condition): boolean {
    switch (cond.kind) {
      case 'detected':
        return this.facts.has('detected');
      case 'caught':
        return this.facts.has('caught');
      case 'pickup':
        return this.facts.has(`pickup:${cond.propId}`);
      case 'documentRead':
        return this.facts.has(`documentRead:${cond.documentId}`);
      case 'broadcastHeard':
        return this.facts.has(`broadcastHeard:${cond.broadcastId}`);
      case 'enterTile':
        return this.facts.has(`enterTile:${cond.tileId}`);
      case 'enterZone':
        return this.facts.has(`enterZone:${cond.zoneId}`);
      case 'flag':
        return this.flags[cond.id] === (cond.value ?? true);
      case 'turnGte':
        // 보일러플레이트엔 글로벌 turn 카운터 미구현. 항상 false.
        return false;
      case 'and':
        return cond.all.every((c) => this.matches(c));
      case 'or':
        return cond.any.some((c) => this.matches(c));
      case 'not':
        return !this.matches(cond.cond);
      default:
        return false;
    }
  }

  private fire(ev: NarrativeEvent): void {
    this.fired.add(ev.id);
    for (const eff of ev.then) {
      this.applyEffect(eff);
    }
  }

  private applyEffect(eff: Effect): void {
    switch (eff.kind) {
      case 'message':
        this.events.emit(
          'message',
          eff.tone ? { text: eff.text, tone: eff.tone } : { text: eff.text },
        );
        return;
      case 'unlockCodex':
        if (this.unlockedCodex.has(eff.entryId)) return;
        this.unlockedCodex.add(eff.entryId);
        this.events.emit('codexUnlocked', { id: eff.entryId });
        return;
      case 'setFlag':
        this.flags[eff.id] = eff.value;
        this.events.emit('flagSet', { id: eff.id, value: eff.value });
        return;
      case 'goEnding':
        this.events.emit('ending', { id: eff.endingId });
        return;
      // 미구현 효과는 메시지만 흘려보냄 (디버그용).
      case 'lightsOut':
      case 'noise':
      case 'spawnStalker':
      case 'openDocument':
      case 'playBroadcast':
        console.info(`[narrative] effect not yet implemented: ${eff.kind}`);
        return;
    }
  }
}

