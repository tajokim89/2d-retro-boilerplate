# 플레이어 캐릭터 프롬프트

<!-- direction -->
## 작업 방향
- **무기 없는 평범한 인물.** 군인/전사 X. 일상복 차림, 빈손.
- 16×16 또는 16×24 (머리 위 살짝 길게).
- 4방향 (down / up / left / right) × idle 2프레임 + walk 4프레임 = 24프레임.
- Aseprite frameTags 예시:
  - `idle-down (0..1)`, `walk-down (2..5)`
  - `idle-up (6..7)`, `walk-up (8..11)`
  - `idle-left (12..13)`, `walk-left (14..17)`
  - `idle-right (18..19)`, `walk-right (20..23)`
- 손전등을 들고 있는 변형(`hold-flashlight-*`)은 별도 시트로 추가 가능.

## 등록 위치
프레임 이름은 frameTag 단위로 호출. 코드에서는 frameTag 이름으로 애니메이션 재생.

<!-- prompt -->
## 프롬프트 (영문)

```
A 16x24 pixel art top-down ordinary person sprite sheet for a horror exploration game,
4 directions (down/up/left/right), each direction has 2 idle frames and 4 walk frames,
total 24 frames arranged in 4 rows of 6, limited 16-color palette dominated by muted earth tones,
hard 1px outlines, no anti-aliasing, transparent background, clear silhouette readable at small size,
retro NES/SNES feel, the character is unarmed wearing casual everyday clothes
[캐릭터 외양 한 줄 — 예: a young woman in a thin gray hoodie and dark jeans].
```

### 변형: 손전등 든 자세
```
Same character as above but holding a small flashlight in front, the lit beam is NOT drawn here
(the beam will be added in-engine), 24 frames same layout, palette and pose continuity matched.
```

## 한국어 한 줄

```
무기 없는 평범한 인물 4방향 × (idle 2 + walk 4) = 24프레임 시트. 16x24 픽셀.
16색 팔레트(차분한 흙색 위주), 1px 외곽선, anti-aliasing 없음, 투명 배경.
[외양 묘사 한 줄, 일상복 차림].
```
