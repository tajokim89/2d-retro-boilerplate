# 2d-retro-boilerplate

**This is a boilerplate.** 여기에 lore/세계관/스토리는 없습니다 — 데모 콘텐츠는 일부러 generic.
포크해서 자기 게임을 만드세요.

2D 픽셀 **호러 탐험** 게임용 출발점. 시점 탑뷰(top-down 3/4). 전투 없음 — 회피·은신·추적 긴장감.
환경 서사는 **방송 / 문서 / 표지판** 기반. zone 클리어 → 하강 또는 탈출. 챕터로 묶음.

스택: PixiJS v8 + ROT.js (FOV) + TypeScript + Vite + Vitest.

## 빠른 시작

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview
npm run typecheck
npm run test:run     # vitest 단발 (watch 모드는 npm test)
```

## 진행 흐름

```
Intro → MainMenu (새로시작 / 불러오기 / 환경설정 / 종료)
         ↓
       Tutorial → Game (챕터 1)
                    ├ Esc/Tab  → Pause (재개 / 저장 / 환경설정 / 메인메뉴)
                    ├ i        → Inventory
                    ├ ?        → Codex
                    ├ e/g      → Reader (메모/방송/표지판)
                    ├ c        → 은신/해제
                    ├ f        → 손전등 토글
                    ├ >        → 비상구/계단
                    └ 잡힘     → Ending
```

## 구조

```
src/
├─ main.ts                # 진입
├─ engine/                # 재사용 레이어 (게임 종류 무관)
│  ├─ scenes.ts           # SceneManager (push/pop/replace/replaceAll)
│  ├─ renderer.ts         # PIXI 셋업, world(픽셀) + ui(텍스트) 두 레이어
│  ├─ input.ts            # 키 → Intent
│  ├─ events.ts           # 타입 안전 EventBus
│  ├─ assets.ts           # SpriteRegistry — placeholder + Aseprite spritesheet
│  ├─ audio.ts            # AudioEngine — Web Audio SFX, EventBus 자동 구독
│  ├─ save.ts             # localStorage 슬롯
│  └─ settings.ts         # 사용자 설정 영속
├─ game/                  # 이 게임 고유
│  ├─ scenes/             # Intro / MainMenu / Settings / Tutorial / Game /
│  │                      # Pause / SaveSlot / Reader / Codex / Inventory / Ending
│  ├─ systems/            # narrative / fov
│  ├─ ui/menu.ts          # 공용 수직 메뉴
│  ├─ state.ts            # GameSnapshot 타입 (Save 페이로드)
│  └─ App.ts              # 부팅 조립
└─ content/               # **데이터-주도** — 모든 게임 콘텐츠
   ├─ tiles.ts / stalkers.ts / props.ts / zones.ts
   └─ narrative/
      ├─ intro.ts / chapters.ts / tutorial.ts / endings.ts
      ├─ documents.ts / broadcasts.ts / signs.ts   # 환경 서사 노드
      └─ codex.ts / dialogue.ts / events.ts / flavor.ts

public/
├─ assets/
│  ├─ sprites/            # main.json + main.png (Aseprite export)
│  └─ maps/               # <zone>.json (authored map)

tests/
├─ engine/save.test.ts
├─ game/narrative.test.ts
└─ game/fov.test.ts

docs/
└─ image-prompts/         # ChatGPT/SD 픽셀 아트 프롬프트 템플릿
```

## 다음 단계

- 자기 게임으로 만들려면 → [`CUSTOMIZE.md`](./CUSTOMIZE.md)
- AI 에이전트(Claude Code, Codex)에게 작업 시키려면 → [`AGENTS.md`](./AGENTS.md)
- 픽셀 아트 만들려면 → [`docs/image-prompts/`](./docs/image-prompts/)

## 라이센스

자유롭게 포크/수정해서 쓰십시오. attribution 필요 없음.
