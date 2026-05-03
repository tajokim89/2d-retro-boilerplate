# 5분 온보딩 가이드

이 보일러플레이트의 **모든 부분이 어떻게 맞물리는지** 빠르게 파악하기 위한 단일 문서.
포크 후 자기 게임으로 바꾸려면 [`CUSTOMIZE.md`](../CUSTOMIZE.md), AI 에이전트에게 작업 시킬 거면 [`AGENTS.md`](../AGENTS.md) 를 참고하세요. 이 문서는 *사람이 코드 베이스를 이해하기 위한 것*.

---

## 1. 한 줄 요약

**2D 픽셀 호러 탐험 게임 보일러플레이트.** 시점은 **탑뷰(top-down 3/4)** 고정. 전투 없음 — 회피·은신·추적 긴장감. 환경 서사는 **방송 / 문서 / 표지판** 기반.

데모 콘텐츠는 *학교 1층 야간자율학습 이후* — 포크 후 자유롭게 교체.

---

## 2. 3-레이어 아키텍처 (단방향)

```
                ┌─────────────────────────────┐
                │   src/content/  (데이터)      │  ← 게임 콘텐츠 (다 여기서 산다)
                │   tiles/stalkers/props/zones/│
                │   narrative/*               │
                └──────────────┬──────────────┘
                               │ import
                               ▼
                ┌─────────────────────────────┐
                │   src/game/  (이 게임 고유)    │  ← Scene / System / UI
                │   scenes/* / systems/*      │
                └──────────────┬──────────────┘
                               │ import
                               ▼
                ┌─────────────────────────────┐
                │   src/engine/  (재사용 레이어) │  ← 게임 종류 무관한 기반
                │   PIXI / Input / Audio /    │
                │   Save / Settings / FOV     │
                └─────────────────────────────┘
```

**규칙: 화살표 반대 방향 import 금지.** engine 이 game/content 를 모르면 좋은 boilerplate 가 됨.

---

## 3. 진행 흐름 (Scene 다이어그램)

```
IntroScene
   └─ aniIntent → MainMenuScene
                     ├─ 새로시작 → TutorialScene
                     │                └─ confirm → GameScene
                     ├─ 불러오기 → SaveSlotScene(load)
                     │                └─ pick → manager.replaceAll(GameScene+snapshot)
                     ├─ 환경설정 → SettingsScene (push)
                     └─ 종료    → window.location.replace('about:blank')

GameScene  ◀──────────────────────┐
   │ Esc/Tab → PauseScene  ───────┘
   │              ├─ 재개      → pop
   │              ├─ 저장      → SaveSlotScene(save)
   │              ├─ 환경설정   → SettingsScene
   │              └─ 메인메뉴   → manager.replaceAll(MainMenuScene)
   │
   │ i → InventoryScene (push)
   │ ? → CodexScene (push)
   │ e/g on prop → ReaderScene (push)
   │ > on exit/stairs → EndingScene
   └─ caught → narrative.goEnding → EndingScene
```

`SceneManager` 는 **top scene 만 update + onIntent** 받음 → push 만 해도 자동 일시정지 (추적자 멈춤).

---

## 4. 데이터가 화면에 닿는 경로 (학교 데모 기준)

### 예: "교내 방송 들으면 코덱스 잠금해제"

```
1. 플레이어가 (12, 1) 의 PA 수신기 위에 도착
   src/content/zones.ts → spawns.props 의 좌표

2. 'e' 누름 → tryInteract()
   src/game/scenes/GameScene.ts

3. props.ts 에서 prop 정의 찾음 → effect.kind === 'broadcast'
   src/content/props.ts

4. broadcasts.ts 에서 broadcastId 로 entry 찾음
   src/content/narrative/broadcasts.ts

5. ReaderScene push, kind: 'broadcast'
   src/game/scenes/ReaderScene.ts
   → enter() 시 events.emit('broadcastHeard', { id })

6. NarrativeSystem 이 EventBus 구독 중 → 사실 등록
   "broadcastHeard:bc-school-pa"
   src/game/systems/narrative.ts

7. 사실 등록 → narrativeEvents 평가
   src/content/narrative/events.ts
   → 'pa-broadcast-first-trigger' 매치
   → effect: { kind: 'unlockCodex', entryId: 'codex-shadow-line' }

8. NarrativeSystem.applyEffect → events.emit('codexUnlocked', { id })

9. AudioEngine 이 codexUnlocked 구독 → 잠금해제 사운드
   GameScene 도 구독 → "[코덱스] '한 줄 더' 잠금해제." 메시지
```

**텍스트는 코드 안에 한 줄도 없음** — 7개 데이터 파일과 EventBus 만 거쳐서 화면에 닿음.

---

## 5. 흔히 하는 작업 — 30초 레시피

### 새 추적자 추가
```ts
// src/content/stalkers.ts
export const stalkers: StalkerDef[] = [
  ...,
  {
    id: 'wandering-janitor',
    name: '청소부',
    sprite: 'stalker-janitor',
    speed: 60,
    detectionRange: 3,
    loseInterestRange: 8,
    hearing: 5,
    behavior: 'patrol',
    catchEffect: { kind: 'restart-zone' },
    spawnWeight: 3,
  },
];
```
→ zone JSON 의 `spawns.stalkers` 에 `{ id: 'wandering-janitor', x, y }` 추가하면 등장.

### 새 메모 추가 (읽으면 코덱스 잠금)
```ts
// src/content/narrative/documents.ts
{ id: 'doc-class-roster', title: '학급 명부', body: '...' }

// src/content/narrative/events.ts
{
  id: 'roster-read',
  trigger: { kind: 'documentRead', documentId: 'doc-class-roster' },
  then: [{ kind: 'unlockCodex', entryId: 'codex-missing-name' }],
  once: true,
}

// src/content/narrative/codex.ts
{ id: 'codex-missing-name', title: '비어 있는 자리', body: '...' }

// src/content/props.ts (지도에 놓을 prop)
{ id: 'roster', name: '학급 명부', sprite: 'prop-roster',
  kind: 'fixed', effect: { kind: 'document', documentId: 'doc-class-roster' } }

// public/assets/maps/<zone>.json — spawns.props 에 prop 좌표 등록
```

### 새 zone (학교 2층) 추가
1. `public/assets/maps/zone-school-2f.json` — 18×11 tile 배열 + spawns
2. `src/content/zones.ts` — `{ id: 'zone-school-2f', generator: 'authored', authoredMap: 'assets/maps/zone-school-2f.json', ... }`
3. `src/content/narrative/chapters.ts` — chapter 의 `zoneIds` 에 추가 (또는 새 chapter)

### 새 SFX 추가
```ts
// src/engine/audio.ts 의 AudioEngine 클래스 안:
playWhisper(): void {
  this.blip({ freq: 600, type: 'sine', duration: 0.25, sweepTo: 400, peakGain: 0.08 });
}
// subscribe() 에:
this.events.on('whisperHeard', () => this.playWhisper());

// src/engine/events.ts EventMap 에:
whisperHeard: { source: string };

// 게임 코드 어디서든:
events.emit('whisperHeard', { source: 'unknown' });
```

### 새 키 바인딩
```ts
// src/engine/input.ts KEY_TO_INTENT:
m: { kind: 'use' }, // M 도 손전등
```

---

## 6. 핵심 시스템 한 눈에

| 시스템 | 파일 | 역할 |
|---|---|---|
| SceneManager | `engine/scenes.ts` | push/pop/replace/replaceAll. top 만 활성 |
| Input | `engine/input.ts` | 키 → Intent. trigger() 로 게임패드/터치도 같은 스트림 |
| EventBus | `engine/events.ts` | 타입 안전 emit/on. 시스템 간 결합 줄임 |
| SpriteRegistry | `engine/assets.ts` | 콘텐츠 sprite id → procedural placeholder 또는 실제 Aseprite 텍스처. animations 자동 등록 |
| AudioEngine | `engine/audio.ts` | Web Audio SFX. EventBus 자동 구독. 첫 제스처 후 활성화 |
| Settings | `engine/settings.ts` | localStorage 영속 + onChange |
| Save / Load | `engine/save.ts` | 슬롯 1~3 + JSON 직렬화 |
| GamepadInput | `engine/gamepad.ts` | 표준 매핑 폴러. 매 프레임 poll() |
| TouchControls | `engine/touch.ts` | DOM D-pad + 액션. CSS 미디어 쿼리로 모바일만 표시 |
| FovSystem | `game/systems/fov.ts` | ROT.FOV 래퍼. visible / explored |
| NarrativeSystem | `game/systems/narrative.ts` | 사실(fact) 등록 → events 평가 → 효과 emit |

---

## 7. 데모 컨트롤

| 키 | 동작 |
|---|---|
| `↑↓←→` / `WASD` / `hjkl` | 이동 |
| `.` | 한 박자 대기 |
| `e` | 상호작용 (메모/방송/표지판) |
| `g` | 줍기 (손전등/학생증) |
| `f` | 손전등 토글 |
| `c` | 은신 / 해제 |
| `>` | 비상구·계단 통과 |
| `i` | 인벤토리 |
| `?` | 코덱스 |
| `Esc` / `Tab` | 일시정지 |

게임패드: A=confirm, B=cancel, X=interact, Y=use, L1=hide, R1=pickup, L2=codex, R2=inv, Start=pause, D-pad/스틱=이동.

모바일: 화면 하단에 D-pad + 8개 액션 버튼 자동 표시.

---

## 8. 데모 클리어 가이드 (감 잡기 좋은 minimum 플레이)

1. 인트로 3장 → MainMenu → 새로시작 → 튜토리얼 6단계 → 챕터 1
2. 시작 위치 (2,1). 추적자가 (15,1) 에 있음
3. 아래로 내려가서 (2,9) 의 손전등 줍기 (`g`) — HUD 에 LIGHT 게이지 등장
4. (5,6) 의 메모 — `e` — "반장의 메모"
5. (12,1) 의 PA 수신기 — `e` — 인원 수가 점점 늘어남. 끝까지 본 직후 코덱스 잠금해제 토스트
6. (8,4) 의 칠판 — `e` — "한 명이 모자란다"
7. 빨간 detection 영역 피해서 (16,9) 의 비상구로 이동 → `>` → 탈출 엔딩
8. **추적자에 들켜서 사물함 들어가면**: 사물함 빨갛게 변하고 추적자도 빨갛게. 방향키로 다시 도망 — 시야 멀어지면 다시 정상.

---

## 9. 자주 만나는 함정

- **placeholder 스프라이트가 색깔 정사각형으로만 보임** — 정상. `public/assets/sprites/main.json` + `main.png` 한 쌍을 드롭하면 진짜 텍스처가 같은 frame 이름으로 자동 매칭됨.
- **사운드 안 남** — 첫 키 입력/클릭 후에야 AudioContext 활성화 (브라우저 자동재생 정책).
- **터치 컨트롤러 안 보임** — 데스크톱은 `pointer: coarse` 미디어 쿼리 미통과. Chrome devtools 의 mobile mode 켜면 보임.
- **/ 로 가면 빈 화면** — `vite.config.ts` 의 `base: '/2d-retro-boilerplate/'` 때문. 자동 redirect 됨. 또는 `http://localhost:5173/2d-retro-boilerplate/` 직접.
- **새 narrative 효과가 안 작동** — `applyEffect()` 에 4종(`message/unlockCodex/setFlag/goEnding`)만 구현됨. 나머지(lightsOut/noise/spawnStalker/openDocument/playBroadcast)는 stub. 원하면 거기에 case 추가.
- **GitHub Pages 빈 화면** — Settings → Pages → Source 를 `GitHub Actions` 로 한 번만 설정.

---

## 10. 빌드 / 실행 / 테스트

```bash
npm install
npm run dev          # http://localhost:5173 (자동 redirect)
npm run build        # dist/
npm run preview      # 빌드 결과 미리보기
npm run typecheck    # tsc --noEmit
npm run test:run     # vitest 단발 (12 tests)
npm test             # vitest watch
```

---

## 11. 어디서부터 손볼 것인가 (포크 후)

| 목적 | 첫 번째 손볼 곳 |
|---|---|
| 이름·로고 교체 | `package.json`, `vite.config.ts`, `.github/workflows/deploy.yml`, `index.html`, `MainMenuScene.ts` 의 title 텍스트 |
| 전혀 다른 세계관 | `src/content/` 전부 비우고 자기 데이터로 채우기. **코드는 그대로 작동** |
| 새 기믹 (배터리 같은 추가 자원) | `src/game/scenes/GameScene.ts` 에 상태 추가 + HUD 갱신 + snapshot 확장 |
| 진짜 픽셀 아트 자산 | `docs/image-prompts/` 의 프롬프트로 ChatGPT/SD 생성 → Aseprite export → `public/assets/sprites/main.{png,json}` |
| 다층 던전 / 스테이지 분기 | `zones.ts` + `chapters.ts` + zone JSON 추가 |
| 로컬리제이션 | (현 단계 미구현) `narrative/*.ts` 의 `body: string` 을 `body: { ko, en }` 로 확장 + Settings.language 활용 |

---

## 12. 한 페이지 파일 인덱스

```
.
├─ AGENTS.md            # AI 에이전트용 (Codex/Claude Code) 진입점
├─ CUSTOMIZE.md         # 자기 게임으로 만드는 4단계
├─ README.md            # GitHub 첫 화면용
├─ docs/
│  ├─ GUIDE.md          # ← 이 문서
│  └─ image-prompts/    # 픽셀 아트 프롬프트 5종
├─ index.html           # Vite entry + 터치 컨트롤러 CSS
├─ vite.config.ts       # base 경로
├─ vitest.config.ts     # 테스트 설정
├─ tsconfig.json        # strict + 경로 alias @
├─ package.json
├─ public/
│  └─ assets/
│     ├─ sprites/       # main.json + main.png (Aseprite Hash)
│     └─ maps/          # <zone>.json
├─ src/
│  ├─ main.ts           # #app 에 startApp 호출
│  ├─ engine/           # 9개 모듈 (재사용 레이어)
│  ├─ game/
│  │  ├─ App.ts         # 부팅 조립 (Renderer + Settings + Audio + Input + Manager)
│  │  ├─ state.ts       # GameSnapshot 타입 (단일 진실)
│  │  ├─ scenes/        # 11개 Scene
│  │  ├─ systems/       # narrative + fov
│  │  └─ ui/menu.ts     # 공용 수직 메뉴 위젯
│  └─ content/          # 데이터 파일 (4 + narrative 11)
└─ tests/               # 12 테스트 (vitest)
```

---

이 문서를 다 읽었다면 보일러플레이트의 *모든 움직이는 부분* 을 알게 됨. 막히는 부분 있으면 [`AGENTS.md`](../AGENTS.md) 의 시스템 일람표 또는 해당 파일 상단의 주석 블록을 보세요.
