# 타일 프롬프트 — 학교 1층 야간 데모

<!-- direction -->
## 작업 방향
- **데모 톤**: 평범한 한국 학교의 1층 복도, 야간. 차가운 형광등 톤, 회녹색·바램색 그라데이션.
- 16×16 px. 시점은 **탑뷰(top-down) 또는 약간의 3/4 view** 일관성 있게.
- 핵심 타일 (이름은 `src/content/tiles.ts` 의 `sprite` 와 일치):
  - `tile-floor` — 복도 리놀륨 / 교실 마룻바닥
  - `tile-wall` — 시멘트 / 페인트 벽
  - `tile-door` — 교실/사무실 문 (닫힘)
  - `tile-locker` — 학생 사물함 (은신 가능)
  - `tile-desk` — 책상 (밑이 어둡게 — 은신 가능)
  - `tile-stairs-down` — 1층 계단 (다음 구역)
  - `tile-exit` — 비상구 / 정문

<!-- prompt -->
## 프롬프트 (영문)

### 복도 바닥
```
A 16x16 pixel art top-down dim school hallway floor tile, worn pale-green linoleum with faint scuff
streaks, limited 12-color palette of cold grays and faded green, hard 1px outlines, no anti-aliasing,
perfectly tileable on all four edges, late-night fluorescent feel, retro horror.
```

### 벽
```
A 16x16 pixel art top-down school hallway wall tile, painted plaster with a darker gray dado below
and faint scratches, limited 12-color palette, hard outlines, no anti-aliasing, perfectly tileable
horizontally, slight darker shade on the bottom edge to suggest height. Transparent background.
```

### 교실 문
```
A 16x16 pixel art top-down classroom door tile (closed), brown wooden door with small frosted glass
panel and metal handle, limited 12-color palette of warm browns against cool walls, hard outlines,
no anti-aliasing, transparent background.
```

### 학생 사물함 (은신 가능)
```
A 16x16 pixel art top-down vertical metal student locker tile, two narrow doors with vents and tiny
combination dials, slightly ajar suggesting hide spot, limited 12-color palette of pale teal-green
and chrome, hard outlines, no anti-aliasing, transparent background.
```

### 책상 (은신 가능)
```
A 16x16 pixel art top-down student desk tile viewed from above, wooden top with metal legs, dark
hollow space underneath suggesting hide spot, limited 12-color palette, hard outlines, no anti-aliasing,
transparent background.
```

### 계단 (하강)
```
A 16x16 pixel art top-down concrete staircase descending into darkness, viewed from directly above,
limited 12-color palette, hard outlines, no anti-aliasing, dark interior fading to black at the lower
steps, clearly readable as "going down". Transparent background.
```

### 비상구
```
A 16x16 pixel art top-down emergency exit door tile with faint green EXIT sign above, dim lit, limited
palette, hard outlines, no anti-aliasing, transparent background, retro horror feel.
```

## 한국어 한 줄

```
한국 학교 1층 야간 복도 환경 타일 7종 (바닥/벽/교실문/학생사물함/책상/계단/비상구). 16x16 픽셀, 탑뷰,
차가운 회녹색-바램색 12색 팔레트, 1px 외곽선, anti-aliasing 없음, 타일링 가능, 투명 배경.
```
