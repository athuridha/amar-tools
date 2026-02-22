"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, CaseSensitive } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const CONVERSIONS = [
    { key: "upper", label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
    { key: "lower", label: "lowercase", fn: (s: string) => s.toLowerCase() },
    { key: "title", label: "Title Case", fn: (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()) },
    { key: "sentence", label: "Sentence case", fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
    { key: "camel", label: "camelCase", fn: (s: string) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase()) },
    { key: "pascal", label: "PascalCase", fn: (s: string) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase()) },
    { key: "snake", label: "snake_case", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s\-]+/g, "_").toLowerCase() },
    { key: "kebab", label: "kebab-case", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase() },
    { key: "dot", label: "dot.case", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1.$2").replace(/[\s\-_]+/g, ".").toLowerCase() },
    { key: "constant", label: "CONSTANT_CASE", fn: (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s\-]+/g, "_").toUpperCase() },
    { key: "alternating", label: "aLtErNaTiNg", fn: (s: string) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("") },
    { key: "inverse", label: "iNVERSE", fn: (s: string) => s.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("") },
];

export default function CaseConverter() {
    const [input, setInput] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const copy = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Case Converter</h1>
                <p className="font-mono text-sm text-muted-foreground">Convert text between UPPER, lower, Title, camelCase, snake_case, kebab-case, and more.</p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Input">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="font-mono text-sm min-h-[120px] resize-y"
                        rows={4}
                    />
                    {input && (
                        <p className="font-mono text-[10px] text-muted-foreground mt-2">
                            {input.length} characters · {input.split(/\s+/).filter(Boolean).length} words
                        </p>
                    )}
                </MacWindow>

                {input && (
                    <MacWindow title="Conversions">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {CONVERSIONS.map(({ key, label, fn }) => {
                                const result = fn(input);
                                return (
                                    <div key={key} className="p-3 border border-border/40 group hover:border-border/80 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">{label}</span>
                                            <button onClick={() => copy(result, key)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1">
                                                {copied === key ? <Check size={12} /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                        <p className="font-mono text-xs text-muted-foreground truncate select-all">{result}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </MacWindow>
                )}

                {!input && (
                    <div className="border border-border/40 p-12 text-center">
                        <CaseSensitive size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Converted text will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
