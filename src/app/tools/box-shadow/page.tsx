"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Plus, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface Shadow {
    id: number;
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    opacity: number;
    inset: boolean;
}

let nextId = 1;

function createShadow(): Shadow {
    return { id: nextId++, x: 4, y: 4, blur: 16, spread: 0, color: "#9f5fff", opacity: 40, inset: false };
}

function shadowToCSS(s: Shadow): string {
    const hex = s.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = s.opacity / 100;
    return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function BoxShadowGenerator() {
    const [shadows, setShadows] = useState<Shadow[]>([createShadow()]);
    const [activeId, setActiveId] = useState(shadows[0].id);
    const [bgColor, setBgColor] = useState("#0a0a0a");
    const [boxColor, setBoxColor] = useState("#161616");
    const [borderRadius, setBorderRadius] = useState(0);
    const [copied, setCopied] = useState(false);

    const activeShadow = shadows.find((s) => s.id === activeId) || shadows[0];

    const updateShadow = (field: keyof Omit<Shadow, "id">, value: number | string | boolean) => {
        setShadows((prev) =>
            prev.map((s) => (s.id === activeId ? { ...s, [field]: value } : s))
        );
    };

    const addShadow = () => {
        const s = createShadow();
        setShadows((prev) => [...prev, s]);
        setActiveId(s.id);
    };

    const removeShadow = (id: number) => {
        if (shadows.length <= 1) return;
        setShadows((prev) => {
            const next = prev.filter((s) => s.id !== id);
            if (activeId === id) setActiveId(next[0].id);
            return next;
        });
    };

    const cssValue = shadows.map(shadowToCSS).join(",\n    ");
    const fullCSS = `box-shadow: ${cssValue};`;

    const copyCSS = async () => {
        await navigator.clipboard.writeText(fullCSS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sliders: { label: string; field: "x" | "y" | "blur" | "spread" | "opacity"; min: number; max: number; unit: string }[] = [
        { label: "X Offset", field: "x", min: -100, max: 100, unit: "px" },
        { label: "Y Offset", field: "y", min: -100, max: 100, unit: "px" },
        { label: "Blur", field: "blur", min: 0, max: 200, unit: "px" },
        { label: "Spread", field: "spread", min: -50, max: 100, unit: "px" },
        { label: "Opacity", field: "opacity", min: 0, max: 100, unit: "%" },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Box Shadow Generator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Design CSS box shadows with a visual editor. Multiple layers, live preview, and one-click copy.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Shadow layers */}
                    <MacWindow title="Shadow Layers">
                        <div className="space-y-2 mb-3">
                            {shadows.map((s, i) => (
                                <div
                                    key={s.id}
                                    onClick={() => setActiveId(s.id)}
                                    className={`flex items-center justify-between p-2.5 border cursor-pointer transition-all ${activeId === s.id
                                        ? "border-accent/60 bg-accent/5"
                                        : "border-border/40 hover:border-border/80"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-5 h-5 border border-border shrink-0"
                                            style={{ background: s.color, opacity: s.opacity / 100 }}
                                        />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">
                                            {s.inset ? "Inset " : ""}Shadow {i + 1}
                                        </span>
                                    </div>
                                    {shadows.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeShadow(s.id); }}
                                            className="text-muted-foreground/40 hover:text-[#ff5f56] transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addShadow} className="w-full btn-brutal flex items-center justify-center gap-2 text-[10px]">
                            <Plus size={12} /> Add Shadow Layer
                        </button>
                    </MacWindow>

                    {/* Active shadow controls */}
                    <MacWindow title={`Edit Shadow ${shadows.findIndex((s) => s.id === activeId) + 1}`}>
                        <div className="space-y-4">
                            {sliders.map(({ label, field, min, max, unit }) => (
                                <div key={field}>
                                    <div className="flex justify-between mb-1.5">
                                        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
                                        <span className="font-mono text-xs text-foreground font-bold">
                                            {activeShadow[field] as number}{unit}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={min}
                                        max={max}
                                        value={activeShadow[field] as number}
                                        onChange={(e) => updateShadow(field, Number(e.target.value))}
                                    />
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Shadow Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-border">
                                        <input type="color" value={activeShadow.color} onChange={(e) => updateShadow("color", e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" />
                                        <span className="font-mono text-xs uppercase text-muted-foreground">{activeShadow.color}</span>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => updateShadow("inset", !activeShadow.inset)}
                                        className={`w-full py-2.5 font-mono text-[10px] font-bold border transition-all ${activeShadow.inset
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-border/80"
                                            }`}
                                    >
                                        {activeShadow.inset ? "✓ Inset" : "Inset"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </MacWindow>

                    {/* Box styling */}
                    <MacWindow title="Box Styling">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Background</label>
                                    <div className="flex items-center gap-3 p-2 border border-border">
                                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" />
                                        <span className="font-mono text-xs uppercase text-muted-foreground">{bgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Box Color</label>
                                    <div className="flex items-center gap-3 p-2 border border-border">
                                        <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="w-8 h-8 cursor-pointer border-0 p-0" />
                                        <span className="font-mono text-xs uppercase text-muted-foreground">{boxColor}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Border Radius</label>
                                    <span className="font-mono text-xs text-foreground font-bold">{borderRadius}px</span>
                                </div>
                                <input type="range" min="0" max="100" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} />
                            </div>
                        </div>
                    </MacWindow>
                </div>

                {/* Preview + CSS */}
                <div className="lg:col-span-7 space-y-5">
                    {/* Live preview */}
                    <MacWindow title="Live Preview">
                        <div
                            className="flex items-center justify-center min-h-[350px] p-8 border border-border transition-colors"
                            style={{ background: bgColor }}
                        >
                            <div
                                className="w-48 h-48 sm:w-56 sm:h-56 transition-all duration-200"
                                style={{
                                    background: boxColor,
                                    borderRadius: `${borderRadius}px`,
                                    boxShadow: shadows.map(shadowToCSS).join(", "),
                                }}
                            />
                        </div>
                    </MacWindow>

                    {/* CSS Output */}
                    <MacWindow title="CSS Output">
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Generated CSS</p>
                            <button onClick={copyCSS} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                {copied ? <Check size={11} /> : <Copy size={11} />}
                                {copied ? "Copied!" : "Copy CSS"}
                            </button>
                        </div>
                        <pre className="font-mono text-xs leading-relaxed p-4 bg-secondary/30 border border-border text-accent whitespace-pre-wrap select-all">
                            {fullCSS}
                            {borderRadius > 0 && `\nborder-radius: ${borderRadius}px;`}
                        </pre>
                    </MacWindow>
                </div>
            </div>
        </div>
    );
}
