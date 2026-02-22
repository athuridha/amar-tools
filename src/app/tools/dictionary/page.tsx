"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Search, BookOpen, Volume2, Loader2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface Phonetic {
    text?: string;
    audio?: string;
}

interface Definition {
    definition: string;
    example?: string;
    synonyms: string[];
    antonyms: string[];
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
    synonyms: string[];
    antonyms: string[];
}

interface DictEntry {
    word: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    sourceUrls?: string[];
}

export default function Dictionary() {
    const [word, setWord] = useState("");
    const [entries, setEntries] = useState<DictEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const search = useCallback(async () => {
        if (!word.trim()) return;
        setLoading(true);
        setError("");
        setEntries([]);
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
            if (res.status === 404) throw new Error("Word not found. Check spelling and try again.");
            if (!res.ok) throw new Error("API error");
            const data: DictEntry[] = await res.json();
            setEntries(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lookup failed");
        } finally {
            setLoading(false);
        }
    }, [word]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); search(); };

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch(() => { /* ignore */ });
    };

    const entry = entries[0];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Dictionary</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Look up English word definitions, phonetics, synonyms, and examples. Powered by Free Dictionary API.
                </p>
            </div>

            <MacWindow title="Search">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            placeholder="Enter an English word..."
                            className="pl-10"
                        />
                    </div>
                    <button type="submit" disabled={!word.trim() || loading} className="btn-brutal btn-brutal-accent flex items-center gap-2 shrink-0 disabled:opacity-30">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Define
                    </button>
                </form>
            </MacWindow>

            {error && (
                <div className="mt-6 border border-red-500/30 p-4 text-center">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                    <Loader2 size={24} className="animate-spin text-accent" />
                </div>
            )}

            {entry && !loading && (
                <div className="mt-6 space-y-5">
                    {/* Word header */}
                    <MacWindow title="Definition">
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                            <h2 className="text-3xl font-black">{entry.word}</h2>
                            {entry.phonetics?.filter((p) => p.text).map((p, i) => (
                                <span key={i} className="font-mono text-sm text-muted-foreground">{p.text}</span>
                            ))}
                            {entry.phonetics?.filter((p) => p.audio).map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => playAudio(p.audio!)}
                                    className="p-2 border border-border hover:border-accent/40 hover:text-accent transition-all"
                                    title="Play pronunciation"
                                >
                                    <Volume2 size={14} />
                                </button>
                            ))}
                        </div>

                        {/* Meanings */}
                        <div className="space-y-6">
                            {entry.meanings.map((m, mi) => (
                                <div key={mi}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-accent/10 text-accent border border-accent/20">
                                            {m.partOfSpeech}
                                        </span>
                                        <div className="flex-1 h-px bg-border/40" />
                                    </div>

                                    <ol className="space-y-3 list-decimal list-inside">
                                        {m.definitions.slice(0, 5).map((def, di) => (
                                            <li key={di} className="text-sm leading-relaxed">
                                                {def.definition}
                                                {def.example && (
                                                    <p className="mt-1 ml-5 font-mono text-xs text-muted-foreground italic">
                                                        &quot;{def.example}&quot;
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ol>

                                    {m.synonyms.length > 0 && (
                                        <div className="mt-3">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mr-2">Synonyms:</span>
                                            <span className="font-mono text-xs text-accent">{m.synonyms.slice(0, 8).join(", ")}</span>
                                        </div>
                                    )}

                                    {m.antonyms.length > 0 && (
                                        <div className="mt-1">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mr-2">Antonyms:</span>
                                            <span className="font-mono text-xs text-red-400">{m.antonyms.slice(0, 8).join(", ")}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {entry.sourceUrls && entry.sourceUrls.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-border">
                                <a href={entry.sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-muted-foreground hover:text-accent transition-colors">
                                    Source: {entry.sourceUrls[0]}
                                </a>
                            </div>
                        )}
                    </MacWindow>
                </div>
            )}
        </div>
    );
}
