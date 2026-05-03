# AGENTS.md

AI 에이전트(Claude Code / Codex / Gemini CLI 등)가 이 저장소에서 작업할 때 가장 먼저 읽는 문서.

## 한 줄 요약
이 저장소는 **2D 픽셀 호러 탐험 보일러플레이트**입니다. 전투 게임이 아닙니다.
플레이어는 무기 없이 평범한 인물이며, 적과 싸우지 않고 **회피·은신·추적 긴장감** 으로 생존합니다.
**모든 게임 콘텐츠는 `src/content/` 의 데이터 파일 안에 있고, 코드 안에는 텍스트가 없어야 합니다.**

## 컨셉 핵심 축
- **시점: 탑뷰(top-down 3/4 view) 고정.** 횡스크롤·1인칭·아이소메트릭 X. 모든 그리드 좌표·타일·은신·추적자 시야는 이 시점 가정 위에서 동작합니다.
- **회피/은신** — 추적자에게 들키면 도망. 락커·책상 밑 같은 hide 타일에서 'c' 로 은신.
- **탐색** — 구역(zone) 단위. 손전등, 열쇠, 문 잠금 같은 장치로 진행.
- **환경 서사** — 메모(documents) / 라디오·인터컴(broadcasts) / 표지판(signs) 으로 이야기 전달. NPC 대사는 보조.
- **루프** — 한 구역 클리어 → 다음 구역 하강(descend) 또는 탈출(escape). 챕터로 묶음.
- **무기 없음** — 적은 죽일 수 없습니다. 시스템 어디에도 'attack' 의도 없음.

## 어디에 무엇이 있는가

| 작업 | 수정할 파일 | 비고 |
|---|---|---|
| 새 추적자(=적) 추가 | `src/content/stalkers.ts` | `detectionRange/hearing/loseInterestRange/behavior/catchEffect`. HP/atk 없음. |
| 새 소품(손전등/열쇠/메모/라디오/표지판) | `src/content/props.ts` | `effect` 는 enum-tagged. |
| 새 타일 추가 | `src/content/tiles.ts` | `walkable/transparent/hidesPlayer/trigger` 4개 결정 |
| 새 구역(zone) | `src/content/zones.ts` + 챕터의 `zoneIds` 에 등록 | `exitMode`: `descend`/`escape`/`loop` |
| 새 챕터 | `src/content/narrative/chapters.ts` | `zoneIds` 배열로 구역 묶음 |
| 인트로 슬라이드 | `src/content/narrative/intro.ts` | IntroScene 이 자동으로 한 장씩 표시 |
| 튜토리얼 단계 | `src/content/narrative/tutorial.ts` | TutorialScene 이 순서대로 진행 |
| 엔딩 | `src/content/narrative/endings.ts` | |
| 메모/책/벽글 (문서) | `src/content/narrative/documents.ts` | `unlocksCodex` 로 코덱스 잠금해제 |
| 라디오/인터컴 (방송) | `src/content/narrative/broadcasts.ts` | `loop` 로 앰비언트, `lines[]` 로 한 줄씩 |
| 표지판 | `src/content/narrative/signs.ts` | 짧은 한두 줄 |
| 코덱스(로어 모음) | `src/content/narrative/codex.ts` | 문서/방송/표지판 또는 events 의 효과로 잠금해제 |
| 자동 트리거 이벤트(정전/소리/추적자 출현) | `src/content/narrative/events.ts` | `trigger`(=조건) + `then`(=효과) 쌍 |
| NPC 대사 (드물게) | `src/content/narrative/dialogue.ts` | 라디오 대화나 인간 NPC 만남용 |
| 적·소품·타일 플레이버 한 줄 | `src/content/narrative/flavor.ts` | `id → string \| string[]` |
| 새 키 바인딩 | `src/engine/input.ts` 의 `KEY_TO_INTENT` | |
| 새 시스템(시야/소리/배터리 등) | `src/game/systems/<이름>.ts` 만들고 GameScene 의 tick 에서 호출 | |
| 새 화면 | `src/game/scenes/` 에 Scene 구현체 추가 후 push/replace | |

## 절대 규칙

1. **텍스트는 코드에 박지 마세요.** 시스템 메시지("들켰다" 같은 거)도 `content/narrative/` 의 어딘가에서 가져와야 합니다.
2. **전투를 도입하지 마세요.** 의도(Intent)에 'attack' 추가 X. 적은 죽지 않고, 플레이어는 무기를 들지 않습니다. 이 컨셉을 깨면 보일러플레이트의 정체성이 무너집니다.
3. **시점은 탑뷰(top-down 3/4)에 고정.** 횡스크롤·아이소메트릭으로 변경하지 마세요 — 그리드/은신/추적자 시야 가정이 전부 깨집니다.
4. **새 의존성 추가는 신중히.** 의존성은 `pixi.js`, `rot-js` 둘뿐. 추가 전 정말 필요한지 확인.
5. **`src/engine/` 은 `src/game/` 이나 `src/content/` 를 import 하지 않습니다.** 단방향: engine ← game ← content.
6. **PIXI v8 API.** v7 API 사용 금지. v8 은 `new Text({ text, style })`.
7. **랜덤은 `ROT.RNG` 를 통해서만.** `Math.random()` 직접 호출은 시드 재현을 깸.

## 보일러플레이트 변형 시 자주 묻는 질문

**Q. 게임 이름을 바꾸고 싶습니다.** → `package.json` / `vite.config.ts` / `.github/workflows/deploy.yml` 세 곳에 박힌 `2d-retro-boilerplate` (또는 `retro-napolitan`) 를 새 이름으로 치환. `index.html` 의 `<title>` 도.

**Q. 챕터 1 의 placeholder 화면 대신 진짜 구역을 띄우려면?** → `src/game/scenes/GameScene.ts` 의 placeholder 그리드/추적자 부분을 zone 로딩(authored map JSON 또는 ROT.Map procgen) + 추적자 AI 시스템으로 교체. 이 부분은 의도적으로 비워둔 곳입니다.

**Q. 픽셀 아트는 어떻게 넣나요?** → `docs/image-prompts/` 의 프롬프트 템플릿으로 ChatGPT/SD 등에서 생성 → Aseprite 로 spritesheet+JSON export → `public/assets/sprites/` 에 배치.

**Q. 빌드/실행/테스트?** → `npm run dev` / `npm run build` / `npm test` / `npm run typecheck`.
