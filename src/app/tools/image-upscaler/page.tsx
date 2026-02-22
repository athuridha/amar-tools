"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, RefreshCw, ArrowUpRight, ArrowLeft } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

export default function ImageUpscaler() {
    const [image, setImage] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
    const [scale, setScale] = useState(2);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;
        setFileName(file.name);
        setResultUrl(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            setImage(src);
            const img = new Image();
            img.onload = () => setOriginalSize({ w: img.width, h: img.height });
            img.src = src;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        },
        [handleFile]
    );

    const upscale = useCallback(() => {
        if (!image) return;
        setProcessing(true);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const newW = Math.round(img.width * scale);
            const newH = Math.round(img.height * scale);
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext("2d")!;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, newW, newH);
            setResultUrl(canvas.toDataURL("image/png"));
            setProcessing(false);
        };
        img.src = image;
    }, [image, scale]);

    const download = useCallback(() => {
        if (!resultUrl) return;
        const a = document.createElement("a");
        a.href = resultUrl;
        const ext = fileName.split(".").slice(0, -1).join(".") || "upscaled";
        a.download = `${ext}_${scale}x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [resultUrl, fileName, scale]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Breadcrumb */}
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Image Upscaler
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Upload an image, choose a scale, and download the enlarged version. Processing happens entirely in your browser.
                </p>
            </div>

            {/* Step 1: Upload */}
            {!image && (
                <MacWindow title="1. Upload Your Image">
                    <div
                        className={`p-12 text-center border border-dashed cursor-pointer transition-colors ${dragActive ? "border-accent/60 bg-accent/5" : "border-border/60 hover:border-accent/40"}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <Upload size={32} className="mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                        <p className="font-bold text-lg mb-1">Drop an image here</p>
                        <p className="font-mono text-xs text-muted-foreground">or click to browse · PNG, JPG, WEBP, GIF</p>
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </div>
                </MacWindow>
            )}

            {/* Step 2: Configure & Preview */}
            {image && (
                <div className="space-y-5">
                    <MacWindow title="2. Choose Scale & Upscale">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="flex-1">
                                <label className="font-mono text-[10px] uppercase tracking-widest block mb-3 text-muted-foreground">How much bigger?</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {[1.5, 2, 3, 4].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setScale(s); setResultUrl(null); }}
                                            className={`px-5 py-2.5 font-mono text-sm font-bold border transition-all ${scale === s
                                                ? "border-accent/60 bg-accent/10 text-accent"
                                                : "border-border hover:border-border/80 text-muted-foreground"
                                                }`}
                                        >
                                            {s}×
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="font-mono text-sm text-muted-foreground space-y-1">
                                <p>Original: <span className="font-bold text-foreground">{originalSize.w} × {originalSize.h}</span></p>
                                <p>Result: <span className="font-bold text-accent">{Math.round(originalSize.w * scale)} × {Math.round(originalSize.h * scale)}</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border">
                            <button onClick={upscale} disabled={processing} className="btn-brutal btn-brutal-accent flex items-center justify-center gap-2 disabled:opacity-50">
                                <ArrowUpRight size={16} />
                                {processing ? "Processing..." : "Upscale Now"}
                            </button>
                            <button
                                onClick={() => { setImage(null); setResultUrl(null); setFileName(""); }}
                                className="btn-brutal flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Choose Different Image
                            </button>
                        </div>
                    </MacWindow>

                    {/* Before / After */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MacWindow title="Original">
                            <img src={image} alt="Original" className="w-full object-contain max-h-72 border border-border" />
                        </MacWindow>
                        {resultUrl ? (
                            <MacWindow title={`Result (${scale}× larger)`}>
                                <img src={resultUrl} alt="Upscaled" className="w-full object-contain max-h-72 border border-border mb-3" />
                                <button onClick={download} className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2">
                                    <Download size={14} /> Download PNG
                                </button>
                            </MacWindow>
                        ) : (
                            <MacWindow title="Result">
                                <div className="flex items-center justify-center min-h-[200px] border border-border bg-secondary/30">
                                    <p className="font-mono text-sm text-muted-foreground">Click &quot;Upscale Now&quot; to see result</p>
                                </div>
                            </MacWindow>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
