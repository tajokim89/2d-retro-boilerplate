// 적·소품·타일을 살피거나 처음 마주칠 때 출력될 한 줄.
// id → string 또는 string[] (랜덤 선택).
// 호러 탐험 컨셉이라 짧고 톤이 무거운 한 줄이 잘 어울림.

export const flavor: Record<string, string | string[]> = {
  // 'wanderer': '걸음 소리가 일정하지 않다.',
  // 'flashlight': '배터리 게이지가 깜빡인다.',
  // 'locker': '안쪽 공간이 사람 하나 들어갈 만큼은 된다.',
};

export function getFlavor(id: string): string | null {
  const v = flavor[id];
  if (!v) return null;
  if (Array.isArray(v)) {
    if (v.length === 0) return null;
    return v[Math.floor(Math.random() * v.length)] ?? null;
  }
  return v;
}
