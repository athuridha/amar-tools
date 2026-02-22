type RGB = { r: number; g: number; b: number };

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function srgbEncode(linear: number) {
  const c = clamp01(linear);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function toByte(x: number) {
  return Math.round(clamp01(x) * 255);
}

function oklabToLinearSrgb(L: number, a: number, b: number): RGB {
  // https://bottosson.github.io/posts/oklab/
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function parseOkLch(input: string): { L: number; C: number; h: number } | null {
  const s = input.trim();
  if (!s.toLowerCase().startsWith("oklch(")) return null;
  const inner = s.slice(s.indexOf("(") + 1, s.lastIndexOf(")")).trim();

  // Drop alpha if present: "... / 0.5"
  const noAlpha = inner.split("/")[0]?.trim() ?? inner;

  // Normalize commas to spaces.
  const parts = noAlpha.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;

  const parseL = (v: string) => {
    if (v.endsWith("%")) return Number(v.slice(0, -1)) / 100;
    return Number(v);
  };

  const L = parseL(parts[0]!);
  const C = Number(parts[1]!);
  const hRaw = parts[2]!;
  const h = hRaw.endsWith("deg") ? Number(hRaw.slice(0, -3)) : Number(hRaw);

  if (!Number.isFinite(L) || !Number.isFinite(C) || !Number.isFinite(h)) return null;
  return { L, C, h };
}

export function cssColorToRgbCss(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  // Already safe-ish
  if (
    s.startsWith("#") ||
    s.toLowerCase().startsWith("rgb(") ||
    s.toLowerCase().startsWith("rgba(")
  ) {
    return s;
  }

  const oklch = parseOkLch(s);
  if (!oklch) return null;

  const hRad = (oklch.h * Math.PI) / 180;
  const a = oklch.C * Math.cos(hRad);
  const b = oklch.C * Math.sin(hRad);

  const lin = oklabToLinearSrgb(oklch.L, a, b);
  const r = toByte(srgbEncode(lin.r));
  const g = toByte(srgbEncode(lin.g));
  const b2 = toByte(srgbEncode(lin.b));

  return `rgb(${r} ${g} ${b2})`;
}
