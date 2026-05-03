# 플레이어 캐릭터 프롬프트 — 학교 호러 데모

<!-- direction -->
## 작업 방향
- **무기 없는 평범한 학생.** 한국 고등학교 교복 차림, 빈손.
- 16×24 (머리 위 살짝 길게).
- 4방향 (down / up / left / right) × idle 2프레임 + walk 4프레임 = 24프레임.
- frame 이름:
  - `player-down-0`, `player-down-1` (idle)
  - `player-down-2..5` (walk)
  - `player-up-0..5`, `player-left-0..5`, `player-right-0..5`
- 손전등을 들고 있는 변형(`player-hold-flashlight-*`)은 별도 시트로 추가 가능.

<!-- prompt -->
## 프롬프트 (영문)

```
A 16x24 pixel art top-down ordinary Korean high school student sprite sheet for a horror exploration
game, 4 directions (down/up/left/right), each direction has 2 idle frames and 4 walk frames, total
24 frames arranged in 4 rows of 6, limited 16-color palette dominated by muted earth tones (gray
school uniform jacket and slacks/skirt, white shirt collar peeking), hard 1px outlines, no
anti-aliasing, transparent background, clear readable silhouette at small size, retro NES/SNES feel,
the character is unarmed and slightly tense in posture.
```

### 변형: 손전등 든 자세
```
Same character as above but holding a small flashlight in front, the lit beam is NOT drawn here
(the beam will be added in-engine), 24 frames same layout, palette and pose continuity matched.
```

## 한국어 한 줄

```
무기 없는 평범한 한국 고등학생(교복) 4방향 × (idle 2 + walk 4) = 24프레임 시트. 16x24 픽셀.
16색 팔레트(차분한 회색 교복 위주), 1px 외곽선, anti-aliasing 없음, 투명 배경, 작은 크기에서도 실루엣이 명확하게.
```
