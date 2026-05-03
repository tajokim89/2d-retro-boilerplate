# 추적자(stalker) 프롬프트 — 학교 호러 데모

<!-- direction -->
## 작업 방향
- 데모 추적자 두 종 (이름은 `src/content/stalkers.ts` 의 `sprite` 와 일치):
  - `stalker-late-pupil` — 야간자율학습이 끝난 뒤에도 복도에 남은 *학생처럼 보이는* 형상
  - `stalker-silent-teacher` — 복도 끝에 서 있는 *교사처럼 보이는* 형상 (고정)
- 한 추적자당 최소 **idle 2프레임 + walk 4프레임**, 가능하면 **detect 1프레임**.
- 가로 strip 으로 export. 프레임당 16×24.
- frameTags: `idle (0..1)`, `walk (2..5)`, `detect (6)`.

<!-- prompt -->
## 프롬프트 (영문)

### 늦은 학생 (`stalker-late-pupil`)
```
A 16x24 pixel art top-down humanoid sprite sheet of a Korean high school student silhouette for a
horror exploration game, plain dark school uniform with faceless or shadow-filled face,
slightly hunched as if listening, 6 frames horizontal strip (2 idle frames with subtle sway, 4 walk
frames cycling), limited 16-color palette dominated by cold grays and one accent (pale glowing
eye-dots), hard 1px outlines, no anti-aliasing, transparent background, single drop shadow oval
below, NES/SNES retro horror feel.
```

### 조용한 교사 (`stalker-silent-teacher`) — 고정형
```
A 16x24 pixel art top-down stationary watcher entity for a horror school game, an adult figure in a
muted gray suit jacket, head tilted slightly, hollow black eyes, no walk animation only 2 idle frames,
limited 16-color palette of muted blues and grays, hard 1px outlines, no anti-aliasing, transparent
background, drop shadow below, ominous and very still.
```

## 일반 템플릿 (새 추적자 추가용)

```
A 16x24 pixel art top-down [stalker concept] sprite sheet for a horror exploration game,
6 frames in horizontal strip (2 idle + 4 walk), limited 16-color palette focused on cold tones with
at most one accent color, hard 1px outlines, no anti-aliasing, transparent background,
single drop shadow oval below, threatening but ambiguous silhouette readable at small size.
```

## 한국어 한 줄

```
[추적자 이름] 16x24 픽셀 호러 추적자 스프라이트 시트. idle 2 + walk 4 프레임 가로 strip.
차가운 톤 16색 팔레트, 1px 외곽선, anti-aliasing 없음, 투명 배경. 작은 크기에서도 위협감 전달되는 실루엣.
[캐릭터 묘사 한 줄 — 예: 교복 입은 학생 형상, 얼굴은 그림자].
```
