"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import MacWindow from "@/components/MacWindow";

type ImageItem = {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
};

const A4_PORTRAIT: [number, number] = [595.28, 841.89];
const A4_LANDSCAPE: [number, number] = [841.89, 595.28];
const LETTER_PORTRAIT: [number, number] = [612, 792];
const LETTER_LANDSCAPE: [number, number] = [792, 612];

type PageSize = "A4" | "Letter";
type Orientation = "auto" | "portrait" | "landscape";
type FitMode = "contain" | "cover";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fitRect(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  if (srcW <= 0 || srcH <= 0) return { w: 0, h: 0 };
  const scale = Math.min(maxW / srcW, maxH / srcH);
  return { w: srcW * scale, h: srcH * scale };
}

function coverRect(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  if (srcW <= 0 || srcH <= 0) return { w: 0, h: 0 };
  const scale = Math.max(maxW / srcW, maxH / srcH);
  return { w: srcW * scale, h: srcH * scale };
}

function getPageDims(size: PageSize, orientation: Orientation, isLandscapeByImage: boolean): [number, number] {
  const portrait = size === "A4" ? A4_PORTRAIT : LETTER_PORTRAIT;
  const landscape = size === "A4" ? A4_LANDSCAPE : LETTER_LANDSCAPE;
  if (orientation === "portrait") return portrait;
  if (orientation === "landscape") return landscape;
  return isLandscapeByImage ? landscape : portrait;
}

async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });
  return img;
}

async function rasterizeUrlToBytes(url: string, opts: { mime: "image/png" | "image/jpeg"; quality?: number; maxDim?: number }) {
  const img = await loadImageFromUrl(url);
  const maxDim = opts.maxDim ?? 3000;
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (opts.mime === "image/jpeg") {
    // Avoid black/transparent artifacts when source has alpha.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, opts.mime, opts.quality)
  );
  if (!blob) throw new Error("Failed to encode image");
  return new Uint8Array(await blob.arrayBuffer());
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number; url: string }> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });
  return { width: img.naturalWidth, height: img.naturalHeight, url };
}

export default function ImageToPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [fit, setFit] = useState<FitMode>("contain");
  const [margin, setMargin] = useState(36);
  const [optimize, setOptimize] = useState(false);
  const [jpegQuality, setJpegQuality] = useState(0.82);

  const totalCount = items.length;

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setBusy(true);
    try {
      const newItems: ImageItem[] = [];
      for (const file of list) {
        const { width, height, url } = await readImageDimensions(file);
        newItems.push({ id: uid(), file, url, width, height });
      }
      setItems((prev) => [...prev, ...newItems]);
    } finally {
      setBusy(false);
    }
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => URL.revokeObjectURL(it.url));
      return [];
    });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const removeOne = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      const removed = prev.find((x) => x.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        void addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const hint = useMemo(() => {
    if (busy) return "Reading images...";
    if (totalCount === 0) return "Drop images here or click to browse";
    return `${totalCount} image${totalCount === 1 ? "" : "s"} ready`;
  }, [busy, totalCount]);

  const totalSizeLabel = useMemo(() => {
    const totalBytes = items.reduce((sum, it) => sum + it.file.size, 0);
    if (totalBytes <= 0) return "";
    const mb = totalBytes / (1024 * 1024);
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }, [items]);

  const generatePdf = useCallback(async () => {
    if (items.length === 0) return;

    setBusy(true);
    try {
      const pdf = await PDFDocument.create();

      for (const it of items) {
        const isLandscape = it.width > it.height;
        const [pageW, pageH] = getPageDims(pageSize, orientation, isLandscape);
        const page = pdf.addPage([pageW, pageH]);

        // pdf-lib only embeds PNG/JPG. For other image formats, rasterize via canvas.
        let embedded:
          | Awaited<ReturnType<PDFDocument["embedPng"]>>
          | Awaited<ReturnType<PDFDocument["embedJpg"]>>;

        const type = it.file.type;
        if (type === "image/png" && !optimize) {
          embedded = await pdf.embedPng(await it.file.arrayBuffer());
        } else if ((type === "image/jpeg" || type === "image/jpg") && !optimize) {
          embedded = await pdf.embedJpg(await it.file.arrayBuffer());
        } else {
          const mime: "image/png" | "image/jpeg" = optimize ? "image/jpeg" : "image/png";
          const bytes = await rasterizeUrlToBytes(it.url, {
            mime,
            quality: mime === "image/jpeg" ? jpegQuality : undefined,
            maxDim: 3000,
          });
          embedded = mime === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        }

        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const rect = fit === "cover"
          ? coverRect(embedded.width, embedded.height, maxW, maxH)
          : fitRect(embedded.width, embedded.height, maxW, maxH);
        const x = (pageW - rect.w) / 2;
        const y = (pageH - rect.h) / 2;

        page.drawImage(embedded, { x, y, width: rect.w, height: rect.h });
      }

      const out = await pdf.save();
      const bytes = out instanceof Uint8Array ? out : new Uint8Array(out);
      const arrayBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(arrayBuffer).set(bytes);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }, [fit, items, jpegQuality, margin, optimize, orientation, pageSize]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Link
        href="/#tools"
        className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Tools
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
          Image to PDF
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          Convert one or multiple images into a single PDF. Everything runs locally in your browser.
        </p>
      </div>

      <div className="space-y-5">
        <MacWindow title="1. Select images">
          <div
            className={`p-10 text-center border border-dashed cursor-pointer transition-colors ${
              dragActive
                ? "border-accent/60 bg-accent/5"
                : "border-border/60 hover:border-accent/40"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
          >
            <Upload size={32} className="mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="font-bold text-lg mb-1">{hint}</p>
            <p className="font-mono text-xs text-muted-foreground">
              PNG, JPG, WEBP, GIF · multiple files supported
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void addFiles(e.target.files);
              }}
            />
          </div>
        </MacWindow>

        {items.length > 0 && (
          <MacWindow title="2. Options">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                  Page size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSize)}
                  className="w-full bg-input border border-border px-3 py-2 font-mono text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="w-full bg-input border border-border px-3 py-2 font-mono text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                  Fit
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFit("contain")}
                    className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${
                      fit === "contain"
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-border hover:border-border/80 text-muted-foreground"
                    }`}
                  >
                    Contain
                  </button>
                  <button
                    type="button"
                    onClick={() => setFit("cover")}
                    className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${
                      fit === "cover"
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-border hover:border-border/80 text-muted-foreground"
                    }`}
                  >
                    Cover
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Margin
                  </label>
                  <span className="font-mono text-xs text-foreground font-bold">{margin}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={96}
                  step={2}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={optimize}
                    onChange={(e) => setOptimize(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Optimize for smaller PDF (re-encode images)
                  </span>
                </label>

                {optimize && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        JPEG quality
                      </label>
                      <span className="font-mono text-xs text-foreground font-bold">
                        {Math.round(jpegQuality * 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.6}
                      max={0.95}
                      step={0.01}
                      value={jpegQuality}
                      onChange={(e) => setJpegQuality(Number(e.target.value))}
                    />
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      Higher quality = bigger file size.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </MacWindow>
        )}

        {items.length > 0 && (
          <MacWindow title={`3. Files ${totalSizeLabel ? `· ${totalSizeLabel}` : ""}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((it) => (
                <div key={it.id} className="border border-border bg-secondary/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url}
                    alt={it.file.name}
                    className="w-full h-32 object-cover border-b border-border"
                  />
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{it.file.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {it.width}×{it.height}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOne(it.id)}
                      className="p-2 border border-border hover:opacity-80 transition-opacity shrink-0"
                      aria-label={`Remove ${it.file.name}`}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </MacWindow>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={generatePdf}
            disabled={items.length === 0 || busy}
            className="flex-1 btn-brutal btn-brutal-accent flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download size={16} /> {busy ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={items.length === 0 || busy}
            className="flex-1 btn-brutal flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
