# 소품(prop) 프롬프트

<!-- direction -->
## 작업 방향
- 호러 탐험 컨셉의 도구 — **무기 없음**. 손전등, 열쇠, 메모, 라디오, 표지판, 일반 도구.
- 16×16 정사각, 단일 프레임. 인벤토리 아이콘 겸용.
- 손전등은 ON/OFF 별도 프레임으로 export 가능 (frameTag `off`/`on`).

## 등록 위치
프레임 이름은 `prop-<id>` 컨벤션. `src/content/props.ts` 의 `sprite` 필드와 일치.

```ts
{ id: 'flashlight', sprite: 'prop-flashlight', kind: 'pickup', effect: { kind: 'light', radius: 5 } }
```

<!-- prompt -->
## 프롬프트 (영문)

### 손전등
```
A 16x16 pixel art handheld flashlight icon, dark metal body with rubber grip, lens facing right,
two frames showing OFF (dark lens) and ON (bright yellow beam emanating from lens),
limited 16-color palette, hard 1px outlines, no anti-aliasing, transparent background, retro horror feel.
```

### 열쇠
```
A 16x16 pixel art old brass key icon, simple bow and toothed bit, slight tarnish,
limited 8-color palette, hard 1px outlines, no anti-aliasing, transparent background.
```

### 메모 / 종이
```
A 16x16 pixel art crumpled paper note icon, off-white parchment with faint ink lines,
slight folds, limited 6-color palette, hard 1px outlines, no anti-aliasing, transparent background.
```

### 라디오
```
A 16x16 pixel art old portable radio icon, boxy body with antenna and speaker grille,
single dim red status light, limited 12-color palette of grays and dark green, hard outlines,
no anti-aliasing, transparent background.
```

### 표지판
```
A 16x16 pixel art rusted metal warning sign on a post, weathered surface with faded text marks,
limited 12-color palette, hard 1px outlines, no anti-aliasing, transparent background, retro horror feel.
```

## 일반 템플릿

```
A 16x16 pixel art [prop description] inventory icon for a horror exploration game,
limited 16-color palette, hard 1px outlines, no anti-aliasing, transparent background,
weathered/used appearance.
```

## 한국어 한 줄

```
[소품 이름] 16x16 픽셀 인벤토리 아이콘. 16색 팔레트, 1px 외곽선, anti-aliasing 없음, 투명 배경. 호러 톤(낡고 닳은 느낌).
```
