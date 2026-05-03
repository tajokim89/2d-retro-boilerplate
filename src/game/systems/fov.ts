// FOV (Field of View) 시스템.
// ROT.js 의 PreciseShadowcasting 으로 플레이어 중심 시야 계산.
//
// 사용:
//   const fov = new FovSystem(cols, rows, isTransparent);
//   fov.recompute(playerX, playerY, radius);
//   fov.isVisible(x, y) → 지금 보이는가
//   fov.isExplored(x, y) → 한 번이라도 본 적 있는가

import * as ROT from 'rot-js';

export type TransparentFn = (x: number, y: number) => boolean;

type ShadowFov = InstanceType<typeof ROT.FOV.PreciseShadowcasting>;

export class FovSystem {
  private visible = new Set<string>();
  private explored = new Set<string>();
  private fov: ShadowFov;

  constructor(
    public readonly cols: number,
    public readonly rows: number,
    isTransparent: TransparentFn,
  ) {
    this.fov = new ROT.FOV.PreciseShadowcasting(isTransparent);
  }

  recompute(centerX: number, centerY: number, radius: number): void {
    this.visible.clear();
    this.fov.compute(centerX, centerY, radius, (x: number, y: number) => {
      const k = key(x, y);
      this.visible.add(k);
      this.explored.add(k);
    });
  }

  isVisible(x: number, y: number): boolean {
    return this.visible.has(key(x, y));
  }

  isExplored(x: number, y: number): boolean {
    return this.explored.has(key(x, y));
  }

  forgetAll(): void {
    this.visible.clear();
    this.explored.clear();
  }

  serialize(): { explored: string[] } {
    return { explored: [...this.explored] };
  }

  restore(snapshot: { explored: string[] }): void {
    this.explored = new Set(snapshot.explored);
  }
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}
