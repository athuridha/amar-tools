"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Unlock,
  RefreshCw,
  Download,
} from "lucide-react";

type PaletteColor = {
  hex: string;
  locked: boolean;
};

const DEFAULT_COUNT = 5;

function clampHex(hex: string) {
  const normalized = hex.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : "#000000";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = clampHex(hex).slice(1);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function drawPaletteExport(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: PaletteColor[]
) {
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, width, height);

  const pad = Math.round(width * 0.02);
  const innerX = pad;
  const innerY = pad;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  // Slight outer frame
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(innerX, innerY, innerW, innerH);

  const count = Math.max(1, palette.length);
  const colW = innerW / count;

  const hexBoxH = Math.round(innerH * 0.18);
  const hexBoxPadX = Math.round(hexBoxH * 0.35);

  for (let i = 0; i < count; i++) {
    const c = palette[i];
    const x = innerX + i * colW;
    const y = innerY;

    // Column fill
    ctx.fillStyle = clampHex(c.hex);
    ctx.fillRect(x, y, colW, innerH);

    // Subtle depth overlay (like Coolors)
    const overlay = ctx.createLinearGradient(x, y, x + colW, y + innerH);
    overlay.addColorStop(0, "rgba(255,255,255,0.08)");
    overlay.addColorStop(0.5, "rgba(0,0,0,0.00)");
    overlay.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, colW, innerH);

    // Divider
    if (i !== count - 1) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(x + colW - 2, y, 2, innerH);
    }

    // HEX box
    const hbW = Math.round(colW * 0.62);
    const hbX = Math.round(x + colW * 0.08);
    const hbY = Math.round(y + innerH - hexBoxH - innerH * 0.12);
    ctx.fillStyle = "rgba(0,0,0,0.40)";
    ctx.fillRect(hbX, hbY, hbW, hexBoxH);

    // HEX text
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round(hexBoxH * 0.42)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace`;
    ctx.fillText(clampHex(c.hex), hbX + hexBoxPadX, hbY + hexBoxH / 2);
  }
}

function randomHex(): string {
  // Use crypto when available for better randomness.
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(3);
    window.crypto.getRandomValues(bytes);
    return (
      "#" +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0")}`.toUpperCase();
}

function makePalette(count: number): PaletteColor[] {
  return Array.from({ length: count }, () => ({ hex: randomHex(), locked: false }));
}

export default function GradientGenerator() {
  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState<PaletteColor[]>(() =>
    // Deterministic initial render to avoid hydration mismatch.
    Array.from({ length: DEFAULT_COUNT }, () => ({ hex: "#111111", locked: false }))
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPalette(makePalette(DEFAULT_COUNT));
  }, []);

  const gradientCss = useMemo(() => {
    const stops = palette.map((c) => clampHex(c.hex)).join(", ");
    return `linear-gradient(90deg, ${stops})`;
  }, [palette]);

  const regenerate = useCallback(() => {
    setPalette((prev) =>
      prev.map((c) => (c.locked ? c : { ...c, hex: randomHex() }))
    );
  }, []);

  const toggleLock = useCallback((index: number) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  }, []);

  const setHexAt = useCallback((index: number, nextHex: string) => {
    setPalette((prev) =>
      prev.map((c, i) => (i === index ? { ...c, hex: nextHex.toUpperCase() } : c))
    );
  }, []);

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradientCss};`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [gradientCss]);

  const downloadPng = useCallback(async () => {
    if (!mounted) return;
    setDownloading(true);
    try {
      // Wide palette export (Coolors-like)
      const width = 2400;
      const height = 520;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawPaletteExport(ctx, width, height, palette);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "amartools-palette.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [mounted, palette]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        (target as HTMLElement | null)?.isContentEditable;
      if (isTyping) return;
      e.preventDefault();
      regenerate();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, regenerate]);

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-16 lg:px-24 py-8 md:py-10">
        <Link
          href="/#tools"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Tools
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Gradient Generator
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-xl">
              Press <span className="text-foreground font-bold">Space</span> to generate a new palette.
              Lock any color to keep it, then copy the CSS gradient.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={regenerate}
              className="btn-brutal btn-brutal-accent flex items-center gap-2"
            >
              <RefreshCw size={16} /> Generate
            </button>
            <button
              type="button"
              onClick={downloadPng}
              disabled={!mounted || downloading}
              className="btn-brutal flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={16} /> {downloading ? "Preparing..." : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={copyCss}
              className="btn-brutal flex items-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy CSS"}
            </button>
          </div>
        </div>

        {/* Gradient preview bar */}
        <div className="border border-border mb-4">
          <div className="h-16" style={{ background: gradientCss }} aria-hidden="true" />
        </div>

        {/* Palette columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-border overflow-hidden">
          {palette.map((c, idx) => (
            <div
              key={idx}
              className="relative min-h-[220px] p-5 border-b border-border lg:border-b-0 lg:border-r last:border-r-0"
              style={{ backgroundColor: clampHex(c.hex) }}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLock(idx)}
                  className="p-2 border border-border/40 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
                  aria-label={c.locked ? "Unlock color" : "Lock color"}
                  title={c.locked ? "Unlock" : "Lock"}
                >
                  {c.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center gap-3">
                  <input
                    value={c.hex}
                    onChange={(e) => setHexAt(idx, e.target.value)}
                    className="font-mono text-sm font-bold bg-background/70 backdrop-blur-sm border border-border/40 px-3 py-2 w-full tracking-widest"
                    inputMode="text"
                    spellCheck={false}
                    aria-label={`Hex color ${idx + 1}`}
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/80">
                  {c.locked ? "Locked" : "Unlocked"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient CSS snippet */}
        <div className="mt-6 mac-window">
          <div className="mac-titlebar">
            <div className="mac-dot red" />
            <div className="mac-dot yellow" />
            <div className="mac-dot green" />
            <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              CSS
            </span>
          </div>
          <div className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Background
            </p>
            <code className="block font-mono text-sm font-bold border border-border bg-secondary/30 p-4 overflow-x-auto">
              background: {gradientCss};
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
