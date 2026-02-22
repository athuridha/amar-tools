function clamp01(x){return Math.min(1, Math.max(0, x));}
function srgbEncode(linear){
  const c = clamp01(linear);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function toByte(x){return Math.round(clamp01(x) * 255);}
function oklabToLinearSrgb(L,a,b){
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
function oklchToRgb(L,C,h){
  const hr = h * Math.PI / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const lin = oklabToLinearSrgb(L,a,b);
  return {
    r: toByte(srgbEncode(lin.r)),
    g: toByte(srgbEncode(lin.g)),
    b: toByte(srgbEncode(lin.b)),
  };
}
function rgbCss({r,g,b}){return `rgb(${r} ${g} ${b})`;}

const palette = {
  '--background': [0.08, 0, 0],
  '--foreground': [0.95, 0, 0],
  '--card': [0.12, 0, 0],
  '--card-foreground': [0.95, 0, 0],
  '--primary': [0.95, 0, 0],
  '--primary-foreground': [0.08, 0, 0],
  '--secondary': [0.18, 0, 0],
  '--secondary-foreground': [0.85, 0, 0],
  '--muted': [0.25, 0, 0],
  '--muted-foreground': [0.55, 0, 0],
  '--accent': [0.65, 0.25, 295],
  '--accent-foreground': [0.98, 0, 0],
  '--border': [0.25, 0, 0],
  '--input': [0.2, 0, 0],
  '--ring': [0.65, 0.25, 295],
  'mac-titlebar': [0.15, 0, 0],
  'grid': [0.2, 0, 0],
  'hero-border': [0.4, 0, 0],
};

for (const [k, v] of Object.entries(palette)) {
  const [L,C,h] = v;
  console.log(k.padEnd(22), rgbCss(oklchToRgb(L,C,h)));
}
