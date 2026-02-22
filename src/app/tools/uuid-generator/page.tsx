"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Copy, Check, RefreshCw, Trash2, Fingerprint } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

function generateUUIDv4(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0x0f) | (c === "x" ? 0 : 0x40);
        const v = c === "x" ? r & 0x0f : (r & 0x03) | 0x08;
        return v.toString(16);
    });
}

export default function UUIDGenerator() {
    const [quantity, setQuantity] = useState(10);
    const [format, setFormat] = useState<"lowercase" | "uppercase" | "no-dashes">("lowercase");
    const [uuids, setUuids] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    const generate = useCallback(() => {
        const newUuids = Array.from({ length: quantity }, () => {
            let uuid = generateUUIDv4();
            if (format === "uppercase") uuid = uuid.toUpperCase();
            if (format === "no-dashes") uuid = uuid.replace(/-/g, "");
            return uuid;
        });
        setUuids(newUuids);
    }, [quantity, format]);

    const copyUuid = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = async () => {
        await navigator.clipboard.writeText(uuids.join("\n"));
        setCopied("all");
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">UUID Generator</h1>
                <p className="font-mono text-sm text-muted-foreground">Generate cryptographically-random UUIDs (v4) in bulk. Runs locally in your browser.</p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Settings">
                    <div className="space-y-4">
                        {/* Format */}
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Format</label>
                            <div className="flex gap-2">
                                {([["lowercase", "abc-def"], ["uppercase", "ABC-DEF"], ["no-dashes", "abcdef"]] as const).map(([key, label]) => (
                                    <button key={key} onClick={() => setFormat(key)}
                                        className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${format === key ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80"}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quantity</label>
                                <span className="font-mono text-xs text-foreground font-bold">{quantity}</span>
                            </div>
                            <input type="range" min="1" max="100" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        </div>

                        <button onClick={generate} className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2">
                            <RefreshCw size={14} /> Generate UUIDs
                        </button>
                    </div>
                </MacWindow>

                {uuids.length > 0 && (
                    <MacWindow title={`Results (${uuids.length})`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">UUID v4 · {format}</p>
                            <div className="flex gap-2">
                                <button onClick={copyAll} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied === "all" ? <Check size={11} /> : <Copy size={11} />}
                                    {copied === "all" ? "Copied!" : "Copy All"}
                                </button>
                                <button onClick={() => setUuids([])} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    <Trash2 size={11} /> Clear
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {uuids.map((uuid, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 border border-border/40 group hover:border-border/80 transition-colors">
                                    <span className="font-mono text-[10px] text-muted-foreground/30 shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
                                    <p className="font-mono text-xs sm:text-sm tracking-wider flex-1 select-all truncate">{uuid}</p>
                                    <button onClick={() => copyUuid(uuid, `uuid-${i}`)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground p-1">
                                        {copied === `uuid-${i}` ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                )}

                {uuids.length === 0 && (
                    <div className="border border-border/40 p-12 text-center">
                        <Fingerprint size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Generated UUIDs will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
