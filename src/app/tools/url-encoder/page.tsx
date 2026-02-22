"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Link2, ArrowRightLeft } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

export default function URLEncoder() {
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const process = (text: string, m: "encode" | "decode") => {
        setInput(text);
        setError(null);
        if (!text) { setOutput(""); return; }
        try {
            if (m === "encode") {
                setOutput(encodeURIComponent(text));
            } else {
                setOutput(decodeURIComponent(text));
            }
        } catch {
            setError(m === "decode" ? "Invalid encoded URL string" : "Encoding failed");
            setOutput("");
        }
    };

    const swap = () => {
        const newMode = mode === "encode" ? "decode" : "encode";
        setMode(newMode);
        setInput(output);
        process(output, newMode);
    };

    const copy = async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">URL Encoder / Decoder</h1>
                <p className="font-mono text-sm text-muted-foreground">Encode or decode URL components. Handles special characters, spaces, unicode, and more.</p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Settings">
                    <div className="space-y-4">
                        {/* Mode toggle */}
                        <div className="flex gap-2">
                            {(["encode", "decode"] as const).map((m) => (
                                <button key={m} onClick={() => { setMode(m); process(input, m); }}
                                    className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all capitalize ${mode === m ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80"}`}>
                                    {m}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                                {mode === "encode" ? "Text to Encode" : "URL to Decode"}
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => process(e.target.value, mode)}
                                placeholder={mode === "encode" ? "hello world & foo=bar" : "hello%20world%20%26%20foo%3Dbar"}
                                className="font-mono text-xs min-h-[100px] resize-y"
                                rows={4}
                            />
                        </div>

                        {/* Swap */}
                        <button onClick={swap} disabled={!output} className="w-full btn-brutal flex items-center justify-center gap-2 disabled:opacity-30">
                            <ArrowRightLeft size={14} /> Swap Input ↔ Output
                        </button>
                    </div>
                </MacWindow>

                {/* Output */}
                <MacWindow title="Output">
                    {error ? (
                        <p className="font-mono text-xs text-[#ff5f56]">{error}</p>
                    ) : output ? (
                        <div className="space-y-3">
                            <div className="p-3 border border-border/40 bg-black/20">
                                <p className="font-mono text-xs break-all select-all">{output}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-[10px] text-muted-foreground">
                                    {input.length} → {output.length} chars
                                </p>
                                <button onClick={copy} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied ? <Check size={11} /> : <Copy size={11} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Link2 size={24} strokeWidth={1} className="mx-auto mb-2 text-muted-foreground/30" />
                            <p className="font-mono text-xs text-muted-foreground">Enter text above to {mode}</p>
                        </div>
                    )}
                </MacWindow>
            </div>
        </div>
    );
}
