"use client";

import { useState, useMemo } from "react";
import { FileText, Hash, AlignLeft, Pilcrow, Clock, LetterText, Copy, Trash2, ArrowLeft } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

export default function TextCounter() {
    const [text, setText] = useState("");

    const stats = useMemo(() => {
        const trimmed = text.trim();
        if (!trimmed) return { characters: 0, charactersNoSpaces: 0, words: 0, sentences: 0, paragraphs: 0, readingTime: "0 sec" };
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, "").length;
        const words = trimmed.split(/\s+/).filter(Boolean).length;
        const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
        const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
        const minutes = words / 200;
        const readingTime = minutes < 1 ? `${Math.max(1, Math.round(minutes * 60))} sec` : `${Math.round(minutes)} min`;
        return { characters, charactersNoSpaces, words, sentences, paragraphs, readingTime };
    }, [text]);

    const statCards = [
        { label: "Words", value: stats.words, icon: FileText },
        { label: "Characters", value: stats.characters, icon: Hash },
        { label: "No Spaces", value: stats.charactersNoSpaces, icon: LetterText },
        { label: "Sentences", value: stats.sentences, icon: AlignLeft },
        { label: "Paragraphs", value: stats.paragraphs, icon: Pilcrow },
        { label: "Read Time", value: stats.readingTime, icon: Clock },
    ];

    const copyText = async () => { await navigator.clipboard.writeText(text); };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Breadcrumb */}
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Text Counter
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Paste or type your text below. Word count, character count, and reading time update instantly.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                {statCards.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="border border-border p-4 text-center">
                        <Icon size={16} strokeWidth={1.5} className="text-accent mx-auto mb-2" />
                        <div className="text-xl font-black font-mono">{value}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest mt-1 text-muted-foreground">{label}</div>
                    </div>
                ))}
            </div>

            {/* Text area */}
            <MacWindow title="Your Text">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Type or paste your text</p>
                    <div className="flex gap-2">
                        <button onClick={copyText} disabled={!text} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30">
                            <Copy size={11} /> Copy All
                        </button>
                        <button onClick={() => setText("")} disabled={!text} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30">
                            <Trash2 size={11} /> Clear
                        </button>
                    </div>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing or paste your text here..." rows={14} className="resize-y min-h-[250px]" />
            </MacWindow>
        </div>
    );
}
