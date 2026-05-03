// 타입 안전 EventBus. 시스템 간 결합 줄이고 UI 가 게임 상태를 폴링하지 않게.
// 새 이벤트 추가: EventMap 에 한 줄 추가, emit/on 하면 끝.
//
// 호러 탐험 보일러플레이트 이벤트 셋:
//  - 발견/은신/포획 (스텔스 상태 전이)
//  - 환경 이벤트 (정전, 추적자 출현, 이상 신호)
//  - 서사 노드 (문서/방송/표지판 열람)
//  - 코덱스 잠금해제, 엔딩, 일반 메시지

export interface EventMap {
  message: { text: string; tone?: 'info' | 'warn' | 'danger' };
  // 스텔스 상태 전이
  detected: { stalker: number; player: number };
  lost: { stalker: number };
  hideEnter: { entity: number; tile: string };
  hideExit: { entity: number };
  caught: { stalker: number; player: number; effect: string };
  // 환경
  envEvent: { id: string };
  lightsOut: { duration: number };
  noise: { x: number; y: number; loudness: number };
  // 서사 노드 열람
  documentRead: { id: string };
  broadcastHeard: { id: string };
  signRead: { id: string };
  // 진행
  pickup: { entity: number; prop: string };
  zoneExit: { fromZone: string; toZone: string | null; mode: 'descend' | 'escape' | 'loop' };
  codexUnlocked: { id: string };
  dialogueOpen: { nodeId: string };
  dialogueClose: { nodeId: string };
  ending: { id: string };
}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export class EventBus {
  private handlers = new Map<keyof EventMap, Set<(payload: unknown) => void>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    const wrapped = handler as (p: unknown) => void;
    set.add(wrapped);
    return () => set!.delete(wrapped);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      handler(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
