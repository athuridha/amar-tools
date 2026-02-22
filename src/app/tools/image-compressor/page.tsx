"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Upload, Trash2, ArrowLeft, Image as ImageIcon, FileDown } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface CompressedImage {
    name: string;
    originalSize: number;
    compressedSize: number;
    blob: Blob;
    previewUrl: string;
    originalPreviewUrl: string;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressor() {
    const [quality, setQuality] = useState(70);
    const [maxWidth, setMaxWidth] = useState(1920);
    const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/webp");
    const [images, setImages] = useState<CompressedImage[]>([]);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = useCallback(
        (file: File): Promise<CompressedImage> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const reader = new FileReader();
                reader.onload = () => {
                    const originalPreviewUrl = reader.result as string;
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        let w = img.width;
                        let h = img.height;

                        // Scale down if exceeding max width
                        if (w > maxWidth) {
                            h = Math.round((h * maxWidth) / w);
                            w = maxWidth;
                        }

                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) return reject(new Error("Canvas not supported"));

                        ctx.drawImage(img, 0, 0, w, h);
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) return reject(new Error("Compression failed"));
                                resolve({
                                    name: file.name.replace(/\.[^.]+$/, "") + (format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg"),
                                    originalSize: file.size,
                                    compressedSize: blob.size,
                                    blob,
                                    previewUrl: URL.createObjectURL(blob),
                                    originalPreviewUrl,
                                });
                            },
                            format,
                            format === "image/png" ? undefined : quality / 100
                        );
                    };
                    img.src = originalPreviewUrl;
                };
                reader.readAsDataURL(file);
            });
        },
        [quality, maxWidth, format]
    );

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;
            setProcessing(true);
            const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
            try {
                const results = await Promise.all(imageFiles.map(compressImage));
                setImages((prev) => [...prev, ...results]);
            } catch {
                /* silent */
            }
            setProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [compressImage]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const downloadOne = (img: CompressedImage) => {
        const a = document.createElement("a");
        a.href = img.previewUrl;
        a.download = img.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadAll = () => images.forEach(downloadOne);

    const clearAll = () => {
        images.forEach((img) => {
            URL.revokeObjectURL(img.previewUrl);
        });
        setImages([]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].previewUrl);
            updated.splice(index, 1);
            return updated;
        });
    };

    const totalOriginal = images.reduce((a, b) => a + b.originalSize, 0);
    const totalCompressed = images.reduce((a, b) => a + b.compressedSize, 0);
    const totalSaving = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

    const formats: { value: typeof format; label: string }[] = [
        { value: "image/webp", label: "WebP" },
        { value: "image/jpeg", label: "JPEG" },
        { value: "image/png", label: "PNG" },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Image Compressor
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Compress images right in your browser. Supports JPEG, PNG, WebP output. No data is uploaded anywhere.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Settings */}
                <div className="lg:col-span-4 space-y-5">
                    <MacWindow title="Settings">
                        <div className="space-y-5">
                            {/* Quality */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quality</label>
                                    <span className="font-mono text-xs text-foreground font-bold">{quality}%</span>
                                </div>
                                <input type="range" min="10" max="100" step="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
                                <div className="flex justify-between mt-1">
                                    <span className="font-mono text-[9px] text-muted-foreground/50">Smaller</span>
                                    <span className="font-mono text-[9px] text-muted-foreground/50">Better</span>
                                </div>
                            </div>

                            {/* Max Width */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Max Width</label>
                                    <span className="font-mono text-xs text-foreground font-bold">{maxWidth}px</span>
                                </div>
                                <input type="range" min="320" max="3840" step="160" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} />
                            </div>

                            {/* Format */}
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Output Format</label>
                                <div className="flex gap-2">
                                    {formats.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => setFormat(value)}
                                            className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${format === value
                                                    ? "border-accent/60 bg-accent/10 text-accent"
                                                    : "border-border hover:border-border/80 text-muted-foreground"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </MacWindow>

                    {/* Total stats */}
                    {images.length > 0 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="border border-border p-3 text-center">
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Original</div>
                                    <div className="font-mono text-sm font-bold">{formatSize(totalOriginal)}</div>
                                </div>
                                <div className="border border-border p-3 text-center">
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Compressed</div>
                                    <div className="font-mono text-sm font-bold text-accent">{formatSize(totalCompressed)}</div>
                                </div>
                                <div className="border border-border p-3 text-center">
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Saved</div>
                                    <div className="font-mono text-sm font-bold" style={{ color: totalSaving > 0 ? "#27c93f" : "#ff5f56" }}>
                                        {totalSaving}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={downloadAll} className="flex-1 btn-brutal btn-brutal-accent flex items-center justify-center gap-2">
                                    <FileDown size={14} /> Download All
                                </button>
                                <button onClick={clearAll} className="btn-brutal flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload + Results */}
                <div className="lg:col-span-8 space-y-5">
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border/60 hover:border-accent/40 transition-colors cursor-pointer p-10 text-center"
                    >
                        <Upload size={28} className="mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-bold mb-1">{processing ? "Compressing…" : "Drop images here or click to upload"}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">PNG, JPEG, WebP — multiple files supported</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>

                    {/* Results */}
                    {images.length > 0 && (
                        <MacWindow title={`Results (${images.length})`}>
                            <div className="space-y-3">
                                {images.map((img, i) => {
                                    const saving = Math.round((1 - img.compressedSize / img.originalSize) * 100);
                                    return (
                                        <div key={`${img.name}-${i}`} className="flex items-center gap-4 p-3 border border-border/40 group hover:border-border/80 transition-colors">
                                            {/* Preview */}
                                            <div className="w-14 h-14 overflow-hidden shrink-0 border border-border bg-secondary/30 flex items-center justify-center">
                                                <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-xs font-bold truncate">{img.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="font-mono text-[10px] text-muted-foreground">
                                                        {formatSize(img.originalSize)} → {formatSize(img.compressedSize)}
                                                    </span>
                                                    <span
                                                        className="font-mono text-[10px] font-bold"
                                                        style={{ color: saving > 0 ? "#27c93f" : "#ff5f56" }}
                                                    >
                                                        {saving > 0 ? `-${saving}%` : `+${Math.abs(saving)}%`}
                                                    </span>
                                                </div>
                                                {/* Compression bar */}
                                                <div className="w-full h-1 bg-border mt-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.max(5, 100 - saving)}%`,
                                                            background: saving > 0 ? "#27c93f" : "#ff5f56",
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1.5 shrink-0">
                                                <button onClick={() => downloadOne(img)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Download">
                                                    <Download size={14} />
                                                </button>
                                                <button onClick={() => removeImage(i)} className="p-2 text-muted-foreground hover:text-[#ff5f56] transition-colors" title="Remove">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </MacWindow>
                    )}

                    {/* Empty state */}
                    {images.length === 0 && (
                        <div className="border border-border/40 p-12 text-center">
                            <ImageIcon size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                            <p className="font-mono text-sm text-muted-foreground">Compressed images will appear here</p>
                            <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Adjust settings on the left, then upload files above</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
