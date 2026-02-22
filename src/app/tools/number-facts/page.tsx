"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Hash, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const CATEGORIES = [
    { value: "trivia", label: "Trivia" },
    { value: "math", label: "Math" },
    { value: "date", label: "Date" },
    { value: "year", label: "Year" },
];

export default function NumberFacts() {
    const [number, setNumber] = useState("");
    const [category, setCategory] = useState("trivia");
    const [fact, setFact] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<{ number: string; category: string; fact: string }[]>([]);

    const fetchFact = useCallback(async (isRandom = false) => {
        setLoading(true);
        setError("");
        const num = isRandom ? "random" : (number.trim() || "random");
        try {
            const res = await fetch(`http://numbersapi.com/${num}/${category}`, {
                headers: { Accept: "text/plain" },
            });
            if (!res.ok) throw new Error("API error");
            const text = await res.text();
            setFact(text);
            setHistory((prev) => [{ number: num, category, fact: text }, ...prev.slice(0, 9)]);
        } catch {
            setError("Failed to fetch fact. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [number, category]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); fetchFact(false); };

    const copyFact = async () => {
        if (!fact) return;
        try {
            await navigator.clipboard.writeText(fact);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Number Facts</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Discover interesting facts about any number. Powered by Numbers API.
                </p>
            </div>

            <MacWindow title="Lookup">
                <div className="space-y-5">
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Category</label>
                        <div className="flex gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all ${category === cat.value
                                        ? "border-accent/60 bg-accent/10 text-accent"
                                        : "border-border hover:border-border/80 text-muted-foreground"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder={category === "date" ? "Month/Day (e.g. 2/29)" : "Enter a number (or leave empty for random)"}
                            className="flex-1"
                        />
                        <button type="submit" disabled={loading} className="btn-brutal btn-brutal-accent flex items-center gap-2 shrink-0 disabled:opacity-30">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Hash size={16} />}
                            Get Fact
                        </button>
                    </form>

                    <button onClick={() => fetchFact(true)} disabled={loading} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30">
                        <RefreshCw size={11} /> Random Number
                    </button>
                </div>
            </MacWindow>

            {error && (
                <div className="mt-6 border border-red-500/30 p-4 text-center">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                </div>
            )}

            {fact && !loading && (
                <div className="mt-6">
                    <MacWindow title="Fact">
                        <div className="py-4">
                            <Hash size={24} className="text-accent/40 mb-3" />
                            <p className="text-lg sm:text-xl font-bold leading-relaxed">{fact}</p>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-border text-muted-foreground">{category}</span>
                                <button onClick={copyFact} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied ? <Check size={11} /> : <Copy size={11} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </MacWindow>
                </div>
            )}

            {history.length > 1 && (
                <div className="mt-5">
                    <MacWindow title="History">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {history.slice(1).map((h, i) => (
                                <div key={i} className="p-3 border border-border">
                                    <p className="text-sm line-clamp-2">{h.fact}</p>
                                    <span className="font-mono text-[9px] text-muted-foreground mt-1 block">{h.category} · {h.number}</span>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                </div>
            )}
        </div>
    );
}
