"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Check, Trash2, ArrowLeft, Braces, AlertTriangle, Minimize2, Maximize2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

export default function JsonFormatter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [indent, setIndent] = useState(2);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const format = useCallback((raw: string, spaces: number) => {
        if (!raw.trim()) {
            setOutput("");
            setError(null);
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            setOutput(JSON.stringify(parsed, null, spaces));
            setError(null);
        } catch (err) {
            const msg = err instanceof SyntaxError ? err.message : "Invalid JSON";
            setError(msg);
            setOutput("");
        }
    }, []);

    const handleFormat = () => format(input, indent);

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (err) {
            const msg = err instanceof SyntaxError ? err.message : "Invalid JSON";
            setError(msg);
            setOutput("");
        }
    };

    const copyOutput = async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            format(text, indent);
        } catch {
            /* clipboard may not be available */
        }
    };

    // Stats
    const stats = output
        ? (() => {
            try {
                const parsed = JSON.parse(output);
                const keys = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
                const type = Array.isArray(parsed) ? "Array" : "Object";
                const size = new Blob([output]).size;
                const sizeStr = size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
                return { type, keys, size: sizeStr };
            } catch {
                return null;
            }
        })()
        : null;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    JSON Formatter
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Paste raw JSON to format, validate, and minify. All processing runs locally in your browser.
                </p>
            </div>

            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <button onClick={handleFormat} className="btn-brutal btn-brutal-accent flex items-center gap-2">
                    <Braces size={14} /> Format
                </button>
                <button onClick={handleMinify} disabled={!input.trim()} className="btn-brutal flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                    <Minimize2 size={14} /> Minify
                </button>
                <button onClick={handlePaste} className="btn-brutal flex items-center gap-2">
                    <Maximize2 size={14} /> Paste from Clipboard
                </button>

                {/* Indent selector */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Indent</span>
                    <div className="flex gap-1">
                        {[2, 4].map((n) => (
                            <button
                                key={n}
                                onClick={() => {
                                    setIndent(n);
                                    if (output) format(input, n);
                                }}
                                className={`px-3 py-1.5 font-mono text-[10px] font-bold border transition-all ${indent === n
                                        ? "border-accent/60 bg-accent/10 text-accent"
                                        : "border-border text-muted-foreground hover:border-border/80"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 p-4 mb-6 border border-[#ff5f56]/40 bg-[#ff5f56]/5">
                    <AlertTriangle size={16} className="text-[#ff5f56] shrink-0 mt-0.5" />
                    <div>
                        <p className="font-mono text-xs font-bold text-[#ff5f56] uppercase tracking-widest mb-1">Invalid JSON</p>
                        <p className="font-mono text-xs text-muted-foreground">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="flex gap-4 mb-6">
                    {[
                        { label: "Type", value: stats.type },
                        { label: Array.isArray(JSON.parse(output)) ? "Items" : "Keys", value: stats.keys },
                        { label: "Size", value: stats.size },
                    ].map(({ label, value }) => (
                        <div key={label} className="border border-border px-4 py-2.5">
                            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
                            <div className="font-mono text-sm font-bold">{value}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <MacWindow title="Input">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Paste your raw JSON</p>
                        <button
                            onClick={() => { setInput(""); setOutput(""); setError(null); }}
                            disabled={!input}
                            className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30"
                        >
                            <Trash2 size={11} /> Clear
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError(null);
                        }}
                        placeholder='{"key": "value", ...}'
                        rows={18}
                        spellCheck={false}
                        className="resize-y min-h-[300px] font-mono text-xs leading-relaxed"
                    />
                </MacWindow>

                {/* Output */}
                <MacWindow title="Output">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {error ? "Fix the errors and try again" : output ? "Formatted result" : "Output will appear here"}
                        </p>
                        <button
                            onClick={copyOutput}
                            disabled={!output}
                            className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30"
                        >
                            {copied ? <Check size={11} /> : <Copy size={11} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <div className="min-h-[300px] max-h-[500px] overflow-auto p-4 bg-secondary/30 border border-border">
                        {output ? (
                            <pre className="font-mono text-xs leading-relaxed text-accent whitespace-pre-wrap break-words select-all">
                                {output}
                            </pre>
                        ) : (
                            <p className="font-mono text-xs text-muted-foreground/40 py-12 text-center">
                                Formatted JSON will appear here
                            </p>
                        )}
                    </div>
                </MacWindow>
            </div>
        </div>
    );
}
