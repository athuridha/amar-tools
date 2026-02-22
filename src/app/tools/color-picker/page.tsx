"use client";

import { useState, useCallback } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, Math.round(l * 100)];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}

type CopyState = { [key: string]: boolean };

export default function ColorPicker() {
    const [hex, setHex] = useState("#8b5cf6");
    const [rgb, setRgb] = useState<[number, number, number]>([139, 92, 246]);
    const [hsl, setHsl] = useState<[number, number, number]>([...rgbToHsl(139, 92, 246)]);
    const [copied, setCopied] = useState<CopyState>({});

    const updateFromHex = useCallback((h: string) => {
        if (!/^#[0-9a-fA-F]{6}$/.test(h)) { setHex(h); return; }
        setHex(h); const r = hexToRgb(h); setRgb(r); setHsl(rgbToHsl(...r));
    }, []);

    const updateFromRgb = useCallback((r: number, g: number, b: number) => {
        setRgb([r, g, b]); setHex(rgbToHex(r, g, b)); setHsl(rgbToHsl(r, g, b));
    }, []);

    const updateFromHsl = useCallback((h: number, s: number, l: number) => {
        setHsl([h, s, l]); const r = hslToRgb(h, s, l); setRgb(r); setHex(rgbToHex(...r));
    }, []);

    const copy = async (key: string, value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
    };

    const formats = [
        { label: "HEX", value: hex.toUpperCase(), key: "hex" },
        { label: "RGB", value: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, key: "rgb" },
        { label: "HSL", value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`, key: "hsl" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Breadcrumb */}
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Color Picker & Converter
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Pick any color using the picker or sliders below. Copy the values in HEX, RGB, or HSL format.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Picker & Sliders */}
                <div className="space-y-5">
                    <MacWindow title="Pick a Color">
                        <div className="flex items-center gap-4 mb-4">
                            <input type="color" value={hex} onChange={(e) => updateFromHex(e.target.value)} className="w-16 h-16 cursor-pointer border-0 p-0" />
                            <div className="flex-1 h-16 border border-border" style={{ backgroundColor: hex }} />
                        </div>
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Or type a HEX code</label>
                            <input type="text" value={hex} onChange={(e) => updateFromHex(e.target.value)} placeholder="#8b5cf6" maxLength={7} />
                        </div>
                    </MacWindow>

                    <MacWindow title="Adjust RGB">
                        <div className="space-y-4">
                            {(["R", "G", "B"] as const).map((ch, i) => (
                                <div key={ch} className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold w-4 text-muted-foreground">{ch}</span>
                                    <input type="range" min="0" max="255" value={rgb[i]} onChange={(e) => {
                                        const v = [...rgb] as [number, number, number]; v[i] = Number(e.target.value); updateFromRgb(...v);
                                    }} className="flex-1" />
                                    <input type="number" min="0" max="255" value={rgb[i]} onChange={(e) => {
                                        const v = [...rgb] as [number, number, number]; v[i] = Math.max(0, Math.min(255, Number(e.target.value))); updateFromRgb(...v);
                                    }} className="!w-16 text-center !p-2 text-sm" />
                                </div>
                            ))}
                        </div>
                    </MacWindow>

                    <MacWindow title="Adjust HSL">
                        <div className="space-y-4">
                            {[{ label: "H", max: 360, unit: "°", name: "Hue" }, { label: "S", max: 100, unit: "%", name: "Saturation" }, { label: "L", max: 100, unit: "%", name: "Lightness" }].map(({ label, max, unit }, i) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold w-4 text-muted-foreground">{label}</span>
                                    <input type="range" min="0" max={max} value={hsl[i]} onChange={(e) => {
                                        const v = [...hsl] as [number, number, number]; v[i] = Number(e.target.value); updateFromHsl(...v);
                                    }} className="flex-1" />
                                    <span className="font-mono text-xs font-bold w-12 text-right text-foreground">{hsl[i]}{unit}</span>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                </div>

                {/* Right: Values & Preview */}
                <div className="space-y-5">
                    <MacWindow title="Copy Color Values">
                        <div className="space-y-3">
                            {formats.map(({ label, value, key }) => (
                                <div key={key} className="flex items-center gap-3 p-3 border border-border bg-secondary/30">
                                    <span className="font-mono text-[10px] font-bold w-8 text-muted-foreground">{label}</span>
                                    <code className="flex-1 font-mono text-sm font-bold truncate">{value}</code>
                                    <button onClick={() => copy(key, value)} className="flex items-center gap-1.5 font-mono text-[10px] font-bold px-3 py-1.5 text-accent border border-accent/30 hover:bg-accent/10 transition-all">
                                        {copied[key] ? <Check size={12} /> : <Copy size={12} />}
                                        {copied[key] ? "Done!" : "Copy"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </MacWindow>

                    <MacWindow title="Preview Contrast">
                        <p className="font-mono text-[10px] text-muted-foreground mb-3 uppercase tracking-widest">How your color looks on different backgrounds</p>
                        <div className="space-y-3">
                            <div className="p-4 text-center font-bold border border-border" style={{ backgroundColor: hex, color: "#ffffff" }}>
                                White Text on Color
                            </div>
                            <div className="p-4 text-center font-bold border border-border" style={{ backgroundColor: hex, color: "#000000" }}>
                                Black Text on Color
                            </div>
                            <div className="p-4 text-center font-bold border border-border bg-background" style={{ color: hex }}>
                                Color Text on Dark
                            </div>
                        </div>
                    </MacWindow>
                </div>
            </div>
        </div>
    );
}
