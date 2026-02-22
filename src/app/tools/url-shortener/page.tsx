"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Link2, Copy, Check, Loader2, Trash2, ExternalLink } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface ShortenedUrl {
    original: string;
    short: string;
    timestamp: string;
}

export default function UrlShortener() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<ShortenedUrl[]>([]);

    const shorten = useCallback(async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("https://cleanuri.com/api/v1/shorten", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `url=${encodeURIComponent(url.trim())}`,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (!data.result_url) throw new Error("No shortened URL returned");
            setResult(data.result_url);
            setHistory((prev) => [
                { original: url.trim(), short: data.result_url, timestamp: new Date().toLocaleTimeString() },
                ...prev.slice(0, 9),
            ]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to shorten URL. Please check the URL and try again.");
        } finally {
            setLoading(false);
        }
    }, [url]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        shorten();
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
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
                    URL Shortener
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Shorten long URLs instantly. No sign-up required. Powered by CleanURI.
                </p>
            </div>

            <MacWindow title="Shorten URL">
                <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                                Paste your long URL
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/very/long/url/that/needs/shortening"
                                className="text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!url.trim() || loading}
                            className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                            {loading ? "Shortening..." : "Shorten URL"}
                        </button>
                    </form>

                    {/* Result */}
                    {error && (
                        <div className="border border-red-500/30 p-4">
                            <p className="text-sm text-red-400 font-mono">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="border border-accent/30 bg-accent/5 p-5">
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-accent">
                                Shortened URL
                            </label>
                            <div className="flex items-center gap-3">
                                <a
                                    href={result}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 font-mono text-sm font-bold text-accent hover:underline break-all"
                                >
                                    {result}
                                </a>
                                <button
                                    onClick={() => copyToClipboard(result)}
                                    className="btn-brutal shrink-0 flex items-center gap-1.5 !py-2 !px-3"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </MacWindow>

            {/* History */}
            {history.length > 0 && (
                <div className="mt-6">
                    <MacWindow title="Recent">
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            {history.map((item, i) => (
                                <div key={i} className="p-3 border border-border flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono text-[10px] text-muted-foreground truncate">{item.original}</div>
                                        <a
                                            href={item.short}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-sm font-bold text-accent hover:underline inline-flex items-center gap-1"
                                        >
                                            {item.short} <ExternalLink size={10} />
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(item.short)}
                                        className="shrink-0 p-2 hover:opacity-70 transition-opacity text-muted-foreground"
                                        title="Copy"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setHistory([])}
                            className="mt-3 btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3"
                        >
                            <Trash2 size={11} /> Clear History
                        </button>
                    </MacWindow>
                </div>
            )}
        </div>
    );
}
