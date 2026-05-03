# AGENTS.md

AI 에이전트(Claude Code / Codex / Gemini CLI 등)가 이 저장소에서 작업할 때 가장 먼저 읽는 문서.

## 한 줄 요약
**2D 픽셀 호러 탐험 보일러플레이트.** 시점은 탑뷰(top-down 3/4) 고정. 전투 없음. 플레이어는 무기 없는 평범한 인물 — 회피·은신·추적 긴장감으로 생존. 환경 서사는 메모/방송/표지판 기반. 모든 게임 콘텐츠는 `src/content/` 의 데이터 파일 안에 살고, **코드 안에는 텍스트가 없어야 함**.

스택: PixiJS v8 + ROT.js (FOV) + Vite + TypeScript + Vitest.

## 컨셉 핵심 축

| 축 | 내용 |
|---|---|
| 시점 | 탑뷰(top-down 3/4 view) 고정. 횡스크롤·아이소메트릭으로 변경 X |
| 전투 | 없음. 의도(Intent)에 'attack' 추가 X. 추적자는 죽일 수 없음 |
| 회피/은신 | 추적자 시야 안에 들어가면 들킴. `c` 로 락커·책상밑 같은 hide 타일에서 숨음 |
| 탐색 | 손전등 / 열쇠 / 잠긴 문 |
| 환경 서사 | 메모(documents) · 방송(broadcasts) · 표지판(signs) — NPC 대사는 보조 |
| 루프 | 한 zone 클리어 → 하강(descend) 또는 탈출(escape). 챕터로 묶음 |
| 보일러플레이트 정신 | 모든 데모 콘텐츠는 일부러 generic — 포크한 사람이 부담 없이 다 지울 수 있게 |

## 30초 진입점 — 어디에 무엇을 추가하나

### 게임 데이터
| 작업 | 파일 |
|---|---|
| 새 추적자 | `src/content/stalkers.ts` (HP/atk 없음 — `detectionRange/hearing/loseInterestRange/behavior/catchEffect`) |
| 새 소품 | `src/content/props.ts` (효과 enum-tagged) |
| 새 타일 | `src/content/tiles.ts` (`walkable/transparent/hidesPlayer/trigger`) |
| 새 zone | `src/content/zones.ts` + 챕터의 `zoneIds` 에 등록 |
| 새 챕터 | `src/content/narrative/chapters.ts` |
| zone 의 실제 맵 | `public/assets/maps/<id>.json` (legend + tiles 행 배열 + spawns) |

### 서사
| 작업 | 파일 |
|---|---|
| 인트로 슬라이드 | `src/content/narrative/intro.ts` |
| 튜토리얼 | `src/content/narrative/tutorial.ts` |
| 엔딩 | `src/content/narrative/endings.ts` |
| 메모/책/벽글 | `src/content/narrative/documents.ts` |
| 라디오/인터컴 | `src/content/narrative/broadcasts.ts` |
| 표지판 | `src/content/narrative/signs.ts` |
| 코덱스 (잠금해제형 로어) | `src/content/narrative/codex.ts` |
| NPC 대사 | `src/content/narrative/dialogue.ts` |
| 자동 트리거 이벤트 | `src/content/narrative/events.ts` (`{ trigger, then }` — 효과 4종 구현됨) |
| 한 줄 플레이버 | `src/content/narrative/flavor.ts` |

### 코드/엔진
| 작업 | 파일 |
|---|---|
| 새 키 바인딩 | `src/engine/input.ts` 의 `KEY_TO_INTENT` |
| 새 시스템(시야/소리/배터리/...) | `src/game/systems/<이름>.ts` 만들고 GameScene 의 update/onIntent 에서 호출 |
| 새 화면(인벤토리 풀스크린 등) | `src/game/scenes/` 에 Scene 구현체 추가 후 push/replace |
| 새 SFX | `src/engine/audio.ts` 의 `play*` 메서드 + `EventBus` 에 새 이벤트 |
| 픽셀 아트 자산 | `public/assets/sprites/main.json` + `main.png` 한 쌍 (Aseprite Hash 포맷). frame 이름은 콘텐츠의 `sprite` 필드와 일치 |

## 시스템 일람

| 시스템 | 위치 | 역할 |
|---|---|---|
| SceneManager | `src/engine/scenes.ts` | push / pop / replace / replaceAll. top scene 만 update / onIntent 받음 |
| Input | `src/engine/input.ts` | 키 → Intent (move/hide/use/interact/pickup/descend/inventory/codex/...) |
| EventBus | `src/engine/events.ts` | 타입 안전 발행/구독 |
| SpriteRegistry | `src/engine/assets.ts` | 콘텐츠 sprite id 마다 procedural placeholder 등록 → 진짜 spritesheet 가 있으면 덮어씀. Aseprite frameTags → animations 자동 등록 |
| AudioEngine | `src/engine/audio.ts` | Web Audio SFX. EventBus 자동 구독. 첫 사용자 제스처 후 활성화. 환경설정 볼륨 실시간 반영 |
| Settings | `src/engine/settings.ts` | localStorage 영속. master/music/sfx volume, language, FPS toggle |
| Save / Load | `src/engine/save.ts` | localStorage 슬롯 1~3. payload = `GameSnapshot` (`src/game/state.ts`) |
| FovSystem | `src/game/systems/fov.ts` | ROT.FOV.PreciseShadowcasting 래핑. visible / explored 두 단계. serialize/restore |
| NarrativeSystem | `src/game/systems/narrative.ts` | EventBus 구독 → 사실(fact) 등록 → `narrativeEvents` 평가 → 효과 emit (message/unlockCodex/setFlag/goEnding) |

## 진행 흐름

```
IntroScene  →  MainMenuScene (새로시작 / 불러오기 / 환경설정 / 종료)
                  │           │             │
                  ▼           ▼             ▼
              TutorialScene  SaveSlotScene  SettingsScene
                  │           (mode='load')
                  ▼
              GameScene  ◀─ ▶  PauseScene (재개 / 저장 / 환경설정 / 메인메뉴)
                  │              │
                  │              ▼
                  │           SaveSlotScene (mode='save') / SettingsScene
                  │
                  ├ 'i' → InventoryScene
                  ├ '?' → CodexScene
                  ├ 'e/g' on prop → ReaderScene (document / broadcast / sign)
                  ├ '>' on exit/stairs → EndingScene
                  └ caught (narrative.goEnding) → EndingScene
```

## 절대 규칙

1. **텍스트는 코드에 박지 마세요.** 시스템 메시지("들켰다" 등)도 `content/narrative/` 의 어딘가에서 가져와야 함.
2. **전투 도입 금지.** Intent 'attack' 추가 X. 추적자에 hp 필드 X. 무기 X.
3. **시점 탑뷰 고정.** 횡스크롤/아이소메트릭으로 변경 X — 그리드/은신/시야 가정이 전부 깨짐.
4. **새 의존성 추가는 신중히.** 의존성은 `pixi.js`, `rot-js` 둘뿐.
5. **단방향 import.** `src/engine/` ← `src/game/` ← `src/content/`. engine 이 game/content 를 import 하면 안 됨.
6. **PIXI v8 API.** v7 API (`new PIXI.Sprite.from()`, `new Text('hi', style)`) 금지. v8 은 `new Text({ text, style })`.
7. **랜덤은 ROT.RNG.** `Math.random()` 직접 호출은 시드 재현을 깸 (단, audio 같이 결정성 무관한 곳은 OK).

## 빌드 / 실행 / 테스트

```
npm install
npm run dev          # http://localhost:5173 (자동 redirect to /2d-retro-boilerplate/)
npm run build        # dist/ 정적 빌드
npm run preview      # 빌드 결과 미리보기
npm run typecheck    # tsc --noEmit
npm test             # vitest watch
npm run test:run     # vitest 단발
```

## 자주 묻는 질문

**Q. 이 데모를 자기 호러 게임으로 바꾸려면?** → [`CUSTOMIZE.md`](./CUSTOMIZE.md). 4단계 체크리스트.

**Q. 픽셀 아트는 어떻게 넣나요?** → [`docs/image-prompts/`](./docs/image-prompts/) 의 프롬프트로 ChatGPT/SD 생성 → Aseprite 슬라이스 → `public/assets/sprites/main.json + main.png` 드롭. frame 이름이 콘텐츠 sprite id 와 일치하면 자동 매칭.

**Q. zone 맵을 직접 디자인하려면?** → `public/assets/maps/<id>.json` 에 `{ legend, tiles, spawns }` 형식. 예시: `zone-school-1f.json`. zones.ts 에서 `generator: 'authored'` + `authoredMap: 'assets/maps/<id>.json'`.

**Q. 새 narrative 효과(예: lightsOut) 가 안 작동해요.** → `narrative.ts` 의 `applyEffect` 에 4종(`message/unlockCodex/setFlag/goEnding`)만 구현됨. 나머지(lightsOut/noise/spawnStalker/openDocument/playBroadcast)는 stub. 새 효과 추가하려면 거기에 case 추가.

**Q. GitHub Pages 배포는?** → `main` 푸시 → `.github/workflows/deploy.yml` 자동 빌드/배포. 최초 1회 Settings → Pages → Source 를 GitHub Actions 로 설정.
