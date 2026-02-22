"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, RefreshCw, Quote, Copy, Check, Loader2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface QuoteData {
    _id: string;
    content: string;
    author: string;
    tags: string[];
}

export default function RandomQuote() {
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<QuoteData[]>([]);

    const fetchQuote = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("https://api.quotable.io/random");
            if (!res.ok) throw new Error("API error");
            const data: QuoteData = await res.json();
            setQuote(data);
            setHistory((prev) => [data, ...prev.slice(0, 19)]);
        } catch {
            setError("Failed to fetch quote. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    const copyQuote = async () => {
        if (!quote) return;
        try {
            await navigator.clipboard.writeText(`"${quote.content}" — ${quote.author}`);
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
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Random Quote
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Get inspired with random quotes. Powered by Quotable API.
                </p>
            </div>

            <div className="space-y-5">
                <button
                    onClick={fetchQuote}
                    disabled={loading}
                    className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2 disabled:opacity-30"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {loading ? "Fetching..." : quote ? "New Quote" : "Get a Quote"}
                </button>

                {error && (
                    <div className="border border-red-500/30 p-4 text-center">
                        <p className="text-sm text-red-400 font-mono">{error}</p>
                    </div>
                )}

                {quote && !loading && (
                    <MacWindow title="Quote">
                        <div className="py-4">
                            <Quote size={28} className="text-accent/40 mb-4" />
                            <blockquote className="text-xl sm:text-2xl font-bold leading-relaxed mb-6">
                                &ldquo;{quote.content}&rdquo;
                            </blockquote>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="font-mono text-sm text-accent font-bold">— {quote.author}</p>
                                    {quote.tags.length > 0 && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {quote.tags.map((tag) => (
                                                <span key={tag} className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border border-border text-muted-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={copyQuote}
                                    className="btn-brutal flex items-center gap-1.5 !py-1.5 !px-3 text-[10px] shrink-0"
                                >
                                    {copied ? <Check size={11} /> : <Copy size={11} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </MacWindow>
                )}

                {/* History */}
                {history.length > 1 && (
                    <MacWindow title={`History (${history.length})`}>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {history.slice(1).map((q, i) => (
                                <div key={`${q._id}-${i}`} className="p-3 border border-border">
                                    <p className="text-sm mb-1 line-clamp-2">&ldquo;{q.content}&rdquo;</p>
                                    <p className="font-mono text-[10px] text-accent">— {q.author}</p>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                )}
            </div>
        </div>
    );
}
