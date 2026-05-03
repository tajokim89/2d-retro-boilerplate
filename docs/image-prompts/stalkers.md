# 추적자(stalker) 프롬프트

<!-- direction -->
## 작업 방향
- 호러 탐험 컨셉 — 추적자는 죽일 수 없는 존재. **위협적이되 정체가 모호**한 실루엣이 핵심.
- 한 추적자당 최소 **idle 2프레임 + walk 4프레임**, 가능하면 **detect (발견 알림) 1프레임**.
- 가로 strip 으로 export. 프레임당 16×16 또는 16×24.
- Aseprite frameTags: `idle (0..1)`, `walk (2..5)`, `detect (6)`.

## 등록 위치
프레임 이름은 `stalker-<id>` 컨벤션. `src/content/stalkers.ts` 의 `sprite` 필드와 일치.

```ts
{ id: 'wanderer', sprite: 'stalker-wanderer', detectionRange: 6, behavior: 'wander', ... }
```

<!-- prompt -->
## 프롬프트 (영문)

### 배회자 (예시)
```
A 16x24 pixel art top-down humanoid stalker entity sprite sheet for a horror exploration game,
faceless silhouette in a long ragged coat, slightly hunched posture, 6 frames in a horizontal strip
(2 idle frames with subtle sway, 4 walk frames cycling), limited 16-color palette dominated by
cold grays and one accent (pale glowing eye-dots), hard 1px outlines, no anti-aliasing,
transparent background, single drop shadow oval below, NES/SNES retro horror feel.
```

### 응시자 (예시 — 고정형)
```
A 16x24 pixel art top-down stationary watcher entity for a horror game, only 2 idle frames
showing a still humanoid figure with head tilted, hollow black eyes, no walk animation,
limited 16-color palette of muted blues and grays, hard 1px outlines, no anti-aliasing,
transparent background, drop shadow below, ominous and quiet.
```

## 일반 템플릿

```
A 16x24 pixel art top-down [stalker concept] sprite sheet for a horror exploration game,
6 frames in horizontal strip (2 idle + 4 walk), limited 16-color palette focused on cold tones
with at most one accent color, hard 1px outlines, no anti-aliasing, transparent background,
single drop shadow oval below, threatening but ambiguous silhouette readable at small size.
```

## 한국어 한 줄

```
[추적자 이름] 16x24 픽셀 호러 추적자 스프라이트 시트. idle 2 + walk 4 프레임 가로 strip.
차가운 톤 16색 팔레트, 1px 외곽선, anti-aliasing 없음, 투명 배경. 작은 크기에서도 위협감 전달되는 실루엣.
```
