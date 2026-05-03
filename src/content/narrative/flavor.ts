// 적·소품·타일을 살피거나 처음 마주칠 때 출력될 한 줄.
// 데모: 학교 호러 톤. id → string 또는 string[] (랜덤 선택).

export const flavor: Record<string, string | string[]> = {
  // 추적자
  'late-pupil': [
    '교복 차림이지만 명찰이 비어 있다.',
    '걸음은 일정한데 그림자만 박자가 다르다.',
  ],
  'silent-teacher': '복도 끝에서 천천히 고개를 든다.',

  // 소품
  flashlight: '비상함에서 꺼낸 손전등. 배터리는 절반쯤 남았다.',
  'student-id': '낯익지 않은 이름이 적혀 있다. 학년은 비어 있다.',
  note: '책상 안쪽에 접혀 있던 종이.',
  'pa-radio': '방송실 외부에 놓인 작은 수신기.',
  sign: '복도 벽에 붙은 안내 표지.',

  // 타일
  locker: '안쪽 공간이 사람 하나 들어갈 만큼은 된다.',
  'desk-under': '책상 아래 어둠 속에서 숨을 죽일 수 있다.',
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
