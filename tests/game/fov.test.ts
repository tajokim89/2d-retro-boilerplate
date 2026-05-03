// FovSystem 의 가시 / 탐색됨 / 차단 동작.
// ROT.FOV.PreciseShadowcasting 을 래핑한 얇은 시스템이라 ROT 동작에도 의존하지만,
// 거기서 깨지는 회귀가 있으면 알아채는 게 의도.

import { describe, it, expect } from 'vitest';
import { FovSystem } from '@/game/systems/fov';

describe('FovSystem', () => {
  it('marks center cell as visible after recompute', () => {
    const fov = new FovSystem(20, 20, () => true);
    fov.recompute(10, 10, 5);
    expect(fov.isVisible(10, 10)).toBe(true);
    expect(fov.isExplored(10, 10)).toBe(true);
  });

  it('does not see beyond radius', () => {
    const fov = new FovSystem(40, 40, () => true);
    fov.recompute(20, 20, 3);
    expect(fov.isVisible(20, 30)).toBe(false);
  });

  it('walls block sight', () => {
    // column 5 is opaque; everything else transparent.
    const transparent = (x: number, _y: number) => x !== 5;
    const fov = new FovSystem(20, 20, transparent);
    fov.recompute(2, 5, 12);
    expect(fov.isVisible(4, 5)).toBe(true);
    expect(fov.isVisible(8, 5)).toBe(false);
  });

  it('keeps explored cells across recompute', () => {
    const fov = new FovSystem(20, 20, () => true);
    fov.recompute(10, 10, 4);
    expect(fov.isExplored(13, 10)).toBe(true);
    fov.recompute(2, 2, 2);
    expect(fov.isVisible(13, 10)).toBe(false);
    expect(fov.isExplored(13, 10)).toBe(true);
  });

  it('serialize / restore round-trip preserves explored set', () => {
    const fov = new FovSystem(20, 20, () => true);
    fov.recompute(5, 5, 3);
    const snap = fov.serialize();
    const fresh = new FovSystem(20, 20, () => true);
    fresh.restore(snap);
    expect(fresh.isExplored(5, 5)).toBe(true);
    expect(fresh.isExplored(5, 8)).toBe(true);
  });
});
