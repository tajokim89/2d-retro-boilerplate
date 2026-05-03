# CUSTOMIZE.md

이 보일러플레이트를 **자기 호러 탐험 게임**으로 만드는 4단계.

## 1. 저장소 포크

GitHub 의 **Use this template** 버튼으로 새 저장소 생성. 또는 `gh repo create my-game --template tajokim89/2d-retro-boilerplate`.

## 2. 이름 치환 (3 곳)

`2d-retro-boilerplate` 또는 `retro-napolitan` 라는 단어가 코드에 박혀있는 곳은 다음 셋. 새 이름으로 일괄 치환:

```
package.json              # "name" 필드
vite.config.ts            # "base" 필드 — gh-pages 서브패스
.github/workflows/deploy.yml  # 배포 path
index.html                # <title>
```

## 3. 콘텐츠 교체

`src/content/` 를 자기 호러 세계로 갈아치웁니다.

### 게임 데이터
- **`tiles.ts`** — 환경 타일. `hidesPlayer` 로 은신 가능 타일(락커/책상 밑/구석) 표시.
- **`stalkers.ts`** — 추적자. **무기/HP/공격 필드 없음.** 감지 거리 / 청각 / 추격 행동 / 잡혔을 때 효과.
- **`props.ts`** — 손전등, 열쇠, 메모, 라디오, 표지판 같은 환경 도구.
- **`zones.ts`** — 한 구역(맵). `exitMode` 로 하강/탈출/루프 선택.

### 서사
- **`narrative/intro.ts`** — 게임 오프닝 슬라이드
- **`narrative/chapters.ts`** — 챕터 = 구역 묶음
- **`narrative/tutorial.ts`** — 튜토리얼 단계
- **`narrative/endings.ts`** — 엔딩 분기
- **`narrative/documents.ts`** — 메모, 책, 벽 글
- **`narrative/broadcasts.ts`** — 라디오, 인터컴, 확성기 음성
- **`narrative/signs.ts`** — 환경 표지판
- **`narrative/events.ts`** — 환경 이벤트(정전, 추적자 출현, 소리)
- **`narrative/codex.ts`** — 잠금해제형 로어 모음
- **`narrative/dialogue.ts`** — NPC 대사 (드물게 사용)
- **`narrative/flavor.ts`** — 적/소품/타일 한 줄 플레이버

## 4. 이미지 자산 준비

1. `docs/image-prompts/` 의 프롬프트로 ChatGPT 등에서 픽셀 아트 생성
2. Aseprite 에서 슬라이스 → spritesheet + JSON export
3. `public/assets/sprites/` 에 배치
4. (placeholder Graphics 사용 중인 부분을 진짜 Sprite 로 교체)

## 5. 배포

`main` 브랜치에 push 하면 GitHub Actions 가 자동으로 빌드해서 GitHub Pages 에 배포합니다.

최초 1회: 저장소 Settings → Pages → Source 를 **GitHub Actions** 로 설정.

배포 URL: `https://<user>.github.io/<repo>/`

---

## 코드 더 깊이 손볼 때

- 키 바인딩 → `src/engine/input.ts` 의 `KEY_TO_INTENT`
- 화면 흐름 → `src/game/App.ts` 가 첫 Scene 결정. 각 Scene 이 다음 Scene 으로 전환.
- 가상 해상도 → `src/engine/renderer.ts` 의 `VIRTUAL_WIDTH/HEIGHT/TILE_SIZE`
- 저장 슬롯 형식 → `src/engine/save.ts`
- 새 시스템(시야/소리/배터리/심박/정신력 등) → `src/game/systems/` 에 추가, GameScene 의 tick 에서 호출

## 컨셉 보존을 위한 가이드

- **'attack' 의도 추가 금지.** 무기 시스템은 컨셉 자체를 바꾼다.
- **추적자는 죽지 않는다.** Stalker 에 hp 필드를 다시 넣지 말 것.
- **모든 텍스트는 `content/narrative/` 안에서만.** UI 시스템 메시지조차도.
- **방송/문서/표지판 = 1차 서사 매체.** NPC 대사는 보조.
