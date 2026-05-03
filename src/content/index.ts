// 콘텐츠 레지스트리 barrel. 게임 코드는 '@/content' 에서 import.
//
// 호러 탐험 보일러플레이트 — 전투 시스템 없음.
// 핵심 데이터 축:
//   tiles      — 환경 타일 (walkable / transparent / hidesPlayer / trigger)
//   stalkers   — 추적자(=적). 죽일 수 없음. 들키면 도망/숨기.
//   props      — 손전등/열쇠/메모/라디오/표지판 등
//   zones      — 한 구역(맵)
// 서사:
//   intro / chapters / tutorial / endings — 진행 단위
//   documents / broadcasts / signs        — 환경에 박힌 서사 노드
//   dialogue / codex / events / flavor    — 보조 텍스트

export { tiles } from './tiles';
export type { TileDef } from './tiles';

export { stalkers } from './stalkers';
export type { StalkerDef, StalkerBehavior, CatchEffect } from './stalkers';

export { props } from './props';
export type { PropDef, PropEffect, PropKind } from './props';

export { zones, zonesForChapter } from './zones';
export type { ZoneDef, ZoneGenerator, PropSpawn, StalkerSpawn } from './zones';

// 서사
export { introSlides } from './narrative/intro';
export type { IntroSlide } from './narrative/intro';

export { tutorialSteps } from './narrative/tutorial';
export type { TutorialStep } from './narrative/tutorial';

export { chapters } from './narrative/chapters';
export type { ChapterDef } from './narrative/chapters';

export { endings } from './narrative/endings';
export type { EndingDef } from './narrative/endings';

export { codexEntries } from './narrative/codex';
export type { CodexEntry } from './narrative/codex';

export { dialogueNodes } from './narrative/dialogue';
export type { DialogueNode, DialogueChoice } from './narrative/dialogue';

export { documents, findDocument } from './narrative/documents';
export type { DocumentEntry } from './narrative/documents';

export { broadcasts, findBroadcast } from './narrative/broadcasts';
export type { BroadcastEntry } from './narrative/broadcasts';

export { signs, findSign } from './narrative/signs';
export type { SignEntry } from './narrative/signs';

export { narrativeEvents } from './narrative/events';
export type { Condition, Effect, NarrativeEvent } from './narrative/events';

export { flavor, getFlavor } from './narrative/flavor';

// lookup 헬퍼
import { stalkers as S } from './stalkers';
import { props as P } from './props';
import { tiles as T } from './tiles';

export function findStalker(id: string) {
  return S.find((s) => s.id === id);
}
export function findProp(id: string) {
  return P.find((p) => p.id === id);
}
export function findTile(id: string) {
  return T.find((t) => t.id === id);
}
