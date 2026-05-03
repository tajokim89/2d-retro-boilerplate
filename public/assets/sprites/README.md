# public/assets/sprites/

진짜 픽셀 아트 자산이 들어가는 곳.

## 동작

이 폴더에 **`main.json`** + **`main.png`** 한 쌍이 있으면 부팅 시 자동으로 로드되어
콘텐츠의 sprite id 별 procedural placeholder 를 같은 이름의 진짜 텍스처로 덮어씁니다.

폴더가 비어 있으면(=현재 상태) procedural placeholder(색깔 정사각형 + 첫 글자 라벨) 가
계속 사용됩니다. 게임은 어쨌든 동작합니다.

## 자산 워크플로우

```
1. docs/image-prompts/ 의 프롬프트로 ChatGPT/SD 등에서 픽셀 아트 생성
2. Aseprite 에서 슬라이스. frame 이름을 콘텐츠의 sprite id 와 일치시킴
   - 예: src/content/stalkers.ts 의 { sprite: 'stalker-wanderer' } → Aseprite frame name: stalker-wanderer
3. File > Export Sprite Sheet
   - Layout: Packed
   - JSON Data: Hash, output filename `main.json`
   - Image: `main.png`
4. main.png + main.json 을 이 폴더에 드롭
5. 새로고침 → 진짜 아트가 placeholder 자리에 그대로.
```

## frame 이름 컨벤션

| 종류 | 패턴 | 예시 |
|---|---|---|
| 타일 | `tile-<id>` | `tile-floor`, `tile-wall`, `tile-locker` |
| 추적자 | `stalker-<id>` (또는 `-<dir>-<n>` 애니메이션) | `stalker-wanderer`, `stalker-watcher` |
| 소품 | `prop-<id>` | `prop-flashlight`, `prop-radio` |
| 플레이어 | `player-<dir>-<n>` | `player-down-0`, `player-up-0`, `player-left-0`, `player-right-0` |

자세한 가이드는 `docs/image-prompts/README.md`.

## 여러 시트로 나누고 싶을 때

`engine/assets.ts` 의 `SpriteRegistry.loadSpritesheet()` 를 여러 번 호출하면 됩니다.
같은 frame 이름이 두 시트에 있으면 나중에 로드된 게 이김.
