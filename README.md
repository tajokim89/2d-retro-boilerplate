# 2d-retro-boilerplate

**This is a boilerplate.** 여기에 lore/세계관/스토리는 없습니다. 포크해서 자기 게임을 만드세요.

2D 픽셀 **호러 탐험** 게임용 출발점. 시점은 **탑뷰(top-down 3/4 view)**. 전투 시스템 없음 — 회피·은신·추적 긴장감에 집중.
플레이어는 무기 없는 평범한 인물. 적과 싸우지 않고 도망치고 숨고 규칙을 파악하며 생존.
환경 서사는 **방송 / 문서 / 표지판** 기반. 한 구역 클리어 → 하강(descend) 또는 탈출(escape).

스택: PixiJS v8 + ROT.js + TypeScript + Vite.

## 빠른 시작

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # dist/ 정적 빌드
npm run preview      # 빌드 결과 미리보기
npm run typecheck    # tsc --noEmit
npm test             # vitest
```

## 진행 흐름

```
IntroScene (인트로 슬라이드)
   ↓
MainMenuScene (새로시작 / 불러오기 / 환경설정 / 종료)
   ↓
TutorialScene (이동·은신·상호작용·탈출 학습)
   ↓
GameScene (챕터 1 — 구역 진행)
   ↓
EndingScene
```

## 구조 한눈에

```
src/
├─ main.ts                # 진입
├─ engine/                # 재사용 레이어
│  ├─ scenes.ts           # SceneManager (push/pop/replace)
│  ├─ renderer.ts         # PIXI 셋업, 픽셀-퍼펙트 정수배 스케일
│  ├─ input.ts            # 키 → Intent (move/hide/use/interact/pickup/descend/...)
│  ├─ events.ts           # 타입 안전 EventBus (detected/lost/caught/hideEnter/...)
│  ├─ save.ts             # localStorage 슬롯
│  └─ settings.ts         # 사용자 설정 영속
├─ game/                  # 이 게임 고유
│  ├─ scenes/             # Intro / MainMenu / Settings / Tutorial / Game / Ending
│  ├─ ui/menu.ts          # 공용 수직 메뉴
│  └─ App.ts              # 부팅 조립
└─ content/               # **데이터-주도** — 모든 게임 콘텐츠가 여기
   ├─ tiles.ts            # walkable / transparent / hidesPlayer / trigger
   ├─ stalkers.ts         # 추적자 (HP/atk 없음 — speed/detection/hearing/behavior/catchEffect)
   ├─ props.ts            # 손전등/열쇠/메모/라디오/표지판
   ├─ zones.ts            # 한 구역 (exitMode: descend/escape/loop)
   └─ narrative/
      ├─ intro.ts / chapters.ts / tutorial.ts / endings.ts
      ├─ documents.ts / broadcasts.ts / signs.ts   # 환경 서사 노드
      └─ codex.ts / dialogue.ts / events.ts / flavor.ts
```

## 다음 단계

- 자기 게임으로 만들려면 → [`CUSTOMIZE.md`](./CUSTOMIZE.md)
- AI 에이전트(Claude Code, Codex)에게 작업 시키려면 → [`AGENTS.md`](./AGENTS.md)
- 픽셀 아트 만들려면 → [`docs/image-prompts/`](./docs/image-prompts/)

## 라이센스

자유롭게 포크/수정해서 쓰십시오. attribution 필요 없음.
