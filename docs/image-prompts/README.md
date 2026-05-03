# 이미지 프롬프트 가이드

`docs/image-prompts/` 안의 MD 파일들은 **AI 에이전트(Claude CoWork, ChatGPT, SD)에게 픽셀 아트를 시킬 때** 그대로 복사해서 쓸 수 있는 프롬프트 템플릿입니다.

이 보일러플레이트의 **데모 콘텐츠는 "한국 학교 1층 야간자습 이후"** 호러 톤입니다. 프롬프트도 그 톤에 맞춰 작성되어 있습니다 — 포크 후 자기 게임 톤으로 자유롭게 교체하세요.

## 워크플로우

```
1. 프롬프트 템플릿 선택  →  2. 이미지 생성 (ChatGPT/SD 등)
                            ↓
3. Aseprite 로 슬라이스/정리 (Claude CoWork 위임 가능)
                            ↓
4. spritesheet + JSON export  →  public/assets/sprites/main.json + main.png
                            ↓
5. 새로고침. 같은 frame 이름은 자동으로 진짜 텍스처가 placeholder 를 덮어씀.
```

## 공통 스타일 가이드 (현재 데모 기준)

| 항목 | 기본값 |
|---|---|
| 타일 사이즈 | 16 × 16 px |
| 캐릭터 사이즈 | 16 × 24 (머리 위로 살짝 길게) |
| 시점 | **탑뷰(top-down) 또는 약간의 3/4 view** — 한 작품 안에서 통일 |
| 팔레트 크기 | 12~16색 (차가운 회녹색·바램색 베이스 + 한두 개의 절제된 액센트) |
| 외곽선 | 픽셀 단색 외곽선, anti-aliasing 없음 |
| 그림자 | 단색 hard drop shadow (캐릭터/추적자) |
| 톤 | **차분하고 낡고 차가움.** 화려한 RPG 색감 X. 형광 색 X. 야간 형광등 분위기. |

## 파일별 가이드

- [`tiles.md`](./tiles.md) — 학교 1층 환경 타일 (바닥/벽/교실문/사물함/책상/계단/비상구)
- [`stalkers.md`](./stalkers.md) — 추적자: 늦은 학생 / 조용한 교사
- [`props.md`](./props.md) — 손전등/학생증/메모/칠판/교내방송기/표지판
- [`player.md`](./player.md) — 무기 없는 평범한 학생 (4방향 × idle 2 + walk 4)
- [`ui.md`](./ui.md) — 패널 프레임, 게이지, 메시지 로그 텍스처

## frame 이름 컨벤션 (반드시 준수)

| 종류 | 패턴 | 예시 |
|---|---|---|
| 타일 | `tile-<id>` | `tile-floor`, `tile-wall`, `tile-locker` |
| 추적자 | `stalker-<id>` (또는 `-<dir>-<n>`) | `stalker-late-pupil`, `stalker-silent-teacher` |
| 소품 | `prop-<id>` | `prop-flashlight`, `prop-pa-radio` |
| 플레이어 | `player-<dir>-<n>` | `player-down-0`, `player-up-0` |

`src/content/*.ts` 의 `sprite` 필드 값과 정확히 일치해야 자동 매칭됩니다.

## Claude CoWork 사용 팁

- "이 프롬프트 그대로 SD/ComfyUI 에 넣어서 N장 뽑아줘" — 가능
- "Aseprite 열어서 이 이미지 16×16 / 16×24 그리드로 슬라이스해줘" — 가능
- "spritesheet json (Hash 포맷, 파일명 main.json) 으로 export 해줘" — 가능

각 MD 파일의 **`<!-- prompt -->`** 섹션이 그대로 복사할 부분, **`<!-- direction -->`** 은 사람이 작업 방향 잡을 때 참조용입니다.

## 컨셉 보존을 위한 가이드

- **무기/전투 그림 금지.**
- **추적자 디자인은 모호하게.** 명찰·계급장·뚜렷한 얼굴 X.
- **풍부한 색감 X.** 12~16색 절제된 팔레트가 호러 톤에 더 잘 맞습니다.
