"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, Copy, Check, Settings2, Upload, Trash2, ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

export default function QRGenerator() {
    const [text, setText] = useState("");
    const [size, setSize] = useState(300);
    const [margin, setMargin] = useState(2);
    const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoName, setLogoName] = useState("");
    const [fgColor, setFgColor] = useState("#ffffff");
    const [bgColor, setBgColor] = useState("#000000");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        setLogoName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            setLogoUrl(event.target?.result as string);
            setErrorCorrection("H");
        };
        reader.readAsDataURL(file);
    }, []);

    const removeLogo = useCallback(() => {
        setLogoUrl(null);
        setLogoName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const generateQR = useCallback(async () => {
        if (!text.trim() || !canvasRef.current) return;
        try {
            await QRCode.toCanvas(canvasRef.current, text, {
                width: size, margin, color: { dark: fgColor, light: bgColor },
                errorCorrectionLevel: errorCorrection,
            });
            if (logoUrl) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        const logoSize = size * 0.22;
                        const x = (size - logoSize) / 2;
                        const y = (size - logoSize) / 2;
                        const pad = 6;
                        ctx.fillStyle = bgColor;
                        ctx.beginPath();
                        ctx.roundRect((size - logoSize - pad * 2) / 2, (size - logoSize - pad * 2) / 2, logoSize + pad * 2, logoSize + pad * 2, 8);
                        ctx.fill();
                        ctx.drawImage(img, x, y, logoSize, logoSize);
                    };
                    img.src = logoUrl;
                }
            }
        } catch { /* silently fail */ }
    }, [text, size, margin, errorCorrection, fgColor, bgColor, logoUrl]);

    useEffect(() => { generateQR(); }, [generateQR]);

    const download = () => {
        if (!canvasRef.current || !text.trim()) return;
        const a = document.createElement("a");
        a.href = canvasRef.current.toDataURL("image/png");
        a.download = "qrcode.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const copyToClipboard = async () => {
        if (!canvasRef.current || !text.trim()) return;
        try {
            const blob = await new Promise<Blob | null>((r) => canvasRef.current!.toBlob(r, "image/png"));
            if (blob) {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch { /* clipboard might not be available */ }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Breadcrumb */}
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    QR Code Generator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Enter a URL or text below, customize the look, then download your QR code as PNG.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-7 space-y-5">
                    <MacWindow title="1. Enter Content">
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">What should the QR code link to?</label>
                                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com or any text..." rows={3} className="resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">QR Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-border">
                                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" />
                                        <span className="font-mono text-xs uppercase text-muted-foreground">{fgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Background</label>
                                    <div className="flex items-center gap-3 p-2 border border-border">
                                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" />
                                        <span className="font-mono text-xs uppercase text-muted-foreground">{bgColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MacWindow>

                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest py-2 text-accent hover:opacity-70 transition-opacity">
                        <Settings2 size={14} />
                        {showAdvanced ? "Hide Advanced Options" : "More Options (Logo, Size, Error Correction)"}
                    </button>

                    {showAdvanced && (
                        <MacWindow title="2. Advanced Options">
                            <div className="space-y-5">
                                {/* Logo Upload */}
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Add a Logo in the Center</label>
                                    {!logoUrl ? (
                                        <div className="p-5 text-center border border-dashed border-border/60 cursor-pointer hover:border-accent/40 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                            <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm">Click to upload logo</p>
                                            <p className="font-mono text-[10px] mt-1 text-muted-foreground">PNG, JPG, or SVG</p>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 border border-border">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 overflow-hidden shrink-0 border border-border">
                                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold truncate">{logoName}</p>
                                                    <p className="font-mono text-[10px] text-accent">Logo will appear in QR center</p>
                                                </div>
                                            </div>
                                            <button onClick={removeLogo} className="p-2 hover:opacity-70 transition-opacity shrink-0 text-muted-foreground" title="Remove logo">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Size & Margin */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Image Size</label>
                                            <span className="font-mono text-xs text-foreground font-bold">{size}px</span>
                                        </div>
                                        <input type="range" min="150" max="1024" step="8" value={size} onChange={(e) => setSize(Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quiet Zone</label>
                                            <span className="font-mono text-xs text-foreground font-bold">{margin}</span>
                                        </div>
                                        <input type="range" min="0" max="10" step="1" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
                                    </div>
                                </div>

                                {/* Error Correction */}
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Error Correction (higher = more resilient)</label>
                                    <div className="flex gap-2">
                                        {[
                                            { val: "L", label: "Low 7%" },
                                            { val: "M", label: "Med 15%" },
                                            { val: "Q", label: "High 25%" },
                                            { val: "H", label: "Max 30%" },
                                        ].map(({ val, label }) => (
                                            <button
                                                key={val}
                                                onClick={() => setErrorCorrection(val as "L" | "M" | "Q" | "H")}
                                                className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${errorCorrection === val
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
                    )}
                </div>

                {/* Preview */}
                <div className="lg:col-span-5 space-y-5">
                    <MacWindow title="Preview">
                        <div className="flex items-center justify-center min-h-[300px] p-4 bg-secondary/30 border border-border">
                            {text.trim() ? (
                                <canvas ref={canvasRef} className="max-w-full" style={{ imageRendering: "pixelated" }} />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto flex items-center justify-center border border-border mb-4">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40">
                                            <rect x="3" y="3" width="7" height="7" rx="1" />
                                            <rect x="14" y="3" width="7" height="7" rx="1" />
                                            <rect x="3" y="14" width="7" height="7" rx="1" />
                                            <rect x="14" y="14" width="3" height="3" />
                                        </svg>
                                    </div>
                                    <p className="font-mono text-sm text-muted-foreground">Type something on the left</p>
                                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">Your QR code will appear here</p>
                                </div>
                            )}
                        </div>
                    </MacWindow>

                    {/* Actions — always visible, disabled when empty */}
                    <div className="flex gap-3">
                        <button onClick={download} disabled={!text.trim()} className="flex-1 btn-brutal btn-brutal-accent flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                            <Download size={16} /> Download PNG
                        </button>
                        <button onClick={copyToClipboard} disabled={!text.trim()} className="flex-1 btn-brutal flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
