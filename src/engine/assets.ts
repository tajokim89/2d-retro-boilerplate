// 스프라이트 자산 레지스트리.
//
// 두 가지 소스에서 frame 이름 → Texture 매핑을 채운다:
//   1) public/assets/sprites/main.json (Aseprite Hash 포맷) — 있으면 자동 로드.
//   2) procedural placeholder — 색깔 16x16 정사각형 + 첫 글자 라벨. 진짜 자산이 없을 때 fallback.
//
// 게임 코드는 항상:
//   const tex = sprites.get('stalker-wanderer');
//   const s = new Sprite(tex ?? Texture.WHITE);
// 으로 텍스처를 받아 쓰기 때문에, placeholder 든 진짜 자산이든 같은 코드 경로.
//
// 자산 워크플로우 (포크 후):
//   1) docs/image-prompts/ 의 프롬프트로 ChatGPT/SD 에서 픽셀 아트 생성
//   2) Aseprite 로 슬라이스, frame 이름을 콘텐츠의 sprite id 와 일치시킴 (e.g. 'stalker-wanderer')
//   3) Export → public/assets/sprites/main.png + main.json
//   4) 새로고침. 같은 frame id 는 자동으로 진짜 텍스처가 덮어씀.

import { Assets, Spritesheet, Texture } from 'pixi.js';

export class SpriteRegistry {
  private textures = new Map<string, Texture>();

  /** 외부 spritesheet 로드. 실패해도 throw 안 하고 false 리턴 (placeholder 유지). */
  async loadSpritesheet(url: string): Promise<boolean> {
    try {
      const sheet = await Assets.load<Spritesheet>(url);
      const sheetTextures = sheet.textures;
      let count = 0;
      for (const name in sheetTextures) {
        const tex = sheetTextures[name];
        if (tex) {
          tex.source.scaleMode = 'nearest';
          this.textures.set(name, tex);
          count += 1;
        }
      }
      console.info(`[assets] loaded ${count} frames from ${url}`);
      return count > 0;
    } catch (err) {
      console.info(`[assets] no spritesheet at ${url} — using procedural placeholders`);
      return false;
    }
  }

  /** procedural placeholder 등록. 같은 이름이 이미 있으면 (진짜 자산이 들어간 경우) 덮어쓰지 않음. */
  registerProcedural(name: string, color: number, label?: string): void {
    if (this.textures.has(name)) return;
    const texture = createProceduralTexture(color, label);
    texture.source.scaleMode = 'nearest';
    this.textures.set(name, texture);
  }

  get(name: string): Texture | null {
    return this.textures.get(name) ?? null;
  }

  has(name: string): boolean {
    return this.textures.has(name);
  }

  list(): string[] {
    return [...this.textures.keys()];
  }
}

function createProceduralTexture(color: number, label?: string): Texture {
  const SIZE = 16;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;

  // 베이스 색
  ctx.fillStyle = hex(color);
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 외곽선 — 베이스 색을 어둡게
  const dark = darken(color, 0.45);
  ctx.fillStyle = hex(dark);
  ctx.fillRect(0, 0, SIZE, 1);
  ctx.fillRect(0, 0, 1, SIZE);
  ctx.fillRect(SIZE - 1, 0, 1, SIZE);
  ctx.fillRect(0, SIZE - 1, SIZE, 1);

  // 라벨 (첫 글자) — 가독성용 흰색
  if (label && label.length > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.charAt(0).toUpperCase(), SIZE / 2, SIZE / 2 + 1);
  }

  return Texture.from(canvas);
}

function hex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

/** 문자열 id → 안정적 색상. 같은 id 는 항상 같은 색. */
export function hashColor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // HSL 에서 채도 제한해서 호러 톤에 맞는 차분한 색
  const hue = (h >>> 0) % 360;
  return hslToRgb(hue, 35, 45);
}

function hslToRgb(h: number, s: number, l: number): number {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return (r << 16) | (g << 8) | b;
}
