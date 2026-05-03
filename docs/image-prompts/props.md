# 소품(prop) 프롬프트 — 학교 호러 데모

<!-- direction -->
## 작업 방향
- 데모 소품 (이름은 `src/content/props.ts` 의 `sprite` 와 일치):
  - `prop-flashlight` — 비상함 손전등
  - `prop-student-id` — 학생증
  - `prop-note` — 책상 안 메모
  - `prop-blackboard` — 칠판 (낙서가 있는 환경 prop)
  - `prop-pa-radio` — 교내 방송 수신기
  - `prop-sign` — 복도 안내 표지
- 16×16 정사각, 단일 프레임. 인벤토리 아이콘 겸용.

<!-- prompt -->
## 프롬프트 (영문)

### 손전등 (`prop-flashlight`)
```
A 16x16 pixel art handheld flashlight icon for a horror school game, dark metal body with rubber grip,
two frames showing OFF (dark lens) and ON (pale yellow beam from lens), limited 12-color palette,
hard 1px outlines, no anti-aliasing, transparent background, slightly worn appearance.
```

### 학생증 (`prop-student-id`)
```
A 16x16 pixel art student ID card icon for a Korean school horror game, small laminated card with a
faint photo box and a plastic strap loop at the top, off-white face with a thin colored stripe at
top, limited 8-color palette, hard 1px outlines, no anti-aliasing, transparent background.
```

### 메모 (`prop-note`)
```
A 16x16 pixel art crumpled paper note icon, folded once with faint pencil ink lines visible,
off-white parchment, limited 6-color palette, hard 1px outlines, no anti-aliasing, transparent
background.
```

### 칠판 (`prop-blackboard`)
```
A 16x16 pixel art top-down classroom blackboard tile/icon, dark green slate with faint chalk smudges
in the center suggesting writing without legibility, wooden frame, limited 8-color palette, hard
outlines, no anti-aliasing, transparent background, retro horror feel.
```

### 교내 방송 수신기 (`prop-pa-radio`)
```
A 16x16 pixel art old wall-mounted school PA speaker / receiver icon, beige plastic body with a
single dim red status LED and a small grille, limited 10-color palette, hard outlines, no
anti-aliasing, transparent background.
```

### 표지판 (`prop-sign`)
```
A 16x16 pixel art metal hallway sign on a small post, weathered surface, faintly readable Korean
character marks (do not draw legible text — just the impression), limited 12-color palette, hard
1px outlines, no anti-aliasing, transparent background, retro horror feel.
```

## 일반 템플릿

```
A 16x16 pixel art [prop description] inventory icon for a horror school exploration game,
limited 16-color palette, hard 1px outlines, no anti-aliasing, transparent background,
weathered/used appearance.
```

## 한국어 한 줄

```
[소품 이름] 16x16 픽셀 인벤토리 아이콘. 한국 학교 호러 톤. 16색 팔레트, 1px 외곽선, anti-aliasing 없음, 투명 배경.
```
