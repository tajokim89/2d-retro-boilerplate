# UI 프롬프트

<!-- direction -->
## 작업 방향
- 호러 탐험 톤 — 화려한 RPG UI X. 차분하고 조금 낡은 느낌.
- 패널 프레임은 9-slice (모서리 4 + 가장자리 4 + 중앙 1) 형식이 가장 유연.
- 폰트는 우선 시스템 monospace 로 가고, 추후 비트맵 폰트로 교체.
- HP 하트 같은 RPG 적 아이콘 X. 대신 STATE(SAFE/SPOTTED/HIDDEN) 텍스트, 손전등 배터리 게이지, 심박 게이지 등 호러 정보축 사용.

## 9-slice 프레임 권장 사이즈
- 한 코너 = 4×4 px → 전체 frame 한 변 최소 12px.
- spritesheet 안에 corners(4) + edges(4) + center(1) 9개 frame.

<!-- prompt -->
## 프롬프트 (영문)

### 패널 프레임 (9-slice)
```
A pixel art UI panel frame in 9-slice format for a horror exploration game,
near-black background with faint cold gray 1px border, slight inner shadow on the top edge for depth,
limited 8-color palette, no anti-aliasing, each of the 9 slices fits in a 4x4 px corner / edge / center cell,
transparent outside the frame.
```

### 손전등 배터리 게이지 (수평 막대)
```
A 32x6 pixel art horizontal battery meter for a horror UI, thin dark frame with segmented inner cells
that fill from left, color shifts from pale green (full) to dim amber (low) to faint red (empty),
limited 8-color palette, hard 1px outlines, no anti-aliasing, transparent background.
```

### 심박 / 정신력 게이지
```
A 16x6 pixel art tiny vertical bar gauge representing heartbeat or composure for a horror game,
muted reds with a faint pulsing accent, simple frame with a few segment cells, limited 6-color palette,
hard outlines, no anti-aliasing, transparent background.
```

### 메시지 로그 패널 텍스처
```
A 16x16 tileable pixel art dark slate panel texture for a horror message log background,
near-black with subtle cold gray noise, limited 6-color palette, no anti-aliasing,
transparent edges so text overlays cleanly.
```

## 한국어 한 줄

```
호러 톤 UI. 9-slice 패널 프레임(어두운 배경 + 차가운 회색 테두리), 손전등 배터리 가로 게이지,
심박/정신력 미니 게이지, 메시지 로그 다크 슬레이트 텍스처. 8~16색 팔레트, 1px 외곽선, anti-aliasing 없음.
```
