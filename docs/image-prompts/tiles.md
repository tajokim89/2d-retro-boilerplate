# 타일 프롬프트

<!-- direction -->
## 작업 방향
- 16×16 px. 시점은 **탑뷰(top-down) 또는 약간의 3/4 view** 일관성 있게.
- 호러 탐험용 환경 — 어두운 실내(복도/방/지하), 차가운 톤 베이스.
- 핵심 타일: floor / wall / door / locker (은신) / desk-under (은신) / stairs-down / exit
- 인접 타일과 자연스럽게 이어지도록. 시드 그래픽이 너무 강하면 반복 시 눈에 띔.

## 등록 위치
프레임 이름은 `tile-<id>` 컨벤션. `src/content/tiles.ts` 의 `sprite` 필드와 일치.

```ts
{ id: 'locker', sprite: 'tile-locker', walkable: true, transparent: false, hidesPlayer: true }
```

<!-- prompt -->
## 프롬프트 (영문)

### 바닥
```
A 16x16 pixel art top-down dim hallway floor tile, worn linoleum with faint grime patterns,
limited 12-color palette of cold grays and faint green, hard 1px outlines, no anti-aliasing,
perfectly tileable on all four edges, retro horror feel.
```

### 벽
```
A 16x16 pixel art top-down concrete wall tile, gray cinder block with grout lines and subtle stains,
limited 12-color palette, hard 1px outlines, no anti-aliasing, perfectly tileable horizontally,
slight darker shade on the bottom edge to suggest height. Transparent background.
```

### 문
```
A 16x16 pixel art top-down metal door tile (closed), heavy slab with small viewing slot,
limited 12-color palette of grays and pale teal, hard outlines, no anti-aliasing, transparent background.
```

### 락커 (은신 가능)
```
A 16x16 pixel art top-down vertical metal locker tile, two doors with small vents,
slightly ajar suggesting it can be entered, limited 12-color palette, hard outlines, no anti-aliasing,
transparent background, retro horror feel.
```

### 책상 아래 (은신 가능)
```
A 16x16 pixel art top-down wooden office desk tile (viewed from above), dark space underneath
visible suggesting hide spot, limited 12-color palette, hard outlines, no anti-aliasing, transparent background.
```

### 계단 / 출구
```
A 16x16 pixel art top-down concrete staircase descending into darkness, viewed from directly above,
limited 12-color palette, hard outlines, no anti-aliasing, dark interior fading to black at the lower steps,
clearly readable as "going down". Transparent background.
```

```
A 16x16 pixel art top-down emergency exit door with faint green sign above, limited palette,
hard outlines, no anti-aliasing, transparent background.
```

## 한국어 한 줄

```
호러 탐험 환경 타일 셋: 바닥 / 벽 / 문 / 락커 / 책상아래 / 계단 / 비상구. 16x16 픽셀, 탑뷰,
차가운 회색-청록-바램색 12~16색 팔레트, 1px 외곽선, anti-aliasing 없음, 타일링 가능, 투명 배경.
```
