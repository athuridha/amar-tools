"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const LOREM_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
    "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
    "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
    "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident",
    "similique", "mollitia", "animi", "perspiciatis", "unde", "omnis", "iste",
    "natus", "error", "voluptatem", "accusantium", "doloremque", "laudantium",
    "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore",
    "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo",
    "nemo", "ipsam", "voluptas", "aspernatur", "aut", "odit", "fugit",
    "consequuntur", "magni", "ratione", "sequi", "nesciunt", "neque", "porro",
    "quisquam", "nihil", "impedit", "quo", "minus", "maxime", "placeat", "facere",
    "possimus", "assumenda", "repellendus", "temporibus", "quibusdam", "illum",
    "fugiat", "necessitatibus", "saepe", "eveniet", "voluptates", "repudiandae",
    "recusandae", "itaque", "earum", "rerum", "hic", "tenetur", "sapiente",
];

const CLASSIC_FIRST = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

type OutputType = "paragraphs" | "sentences" | "words";

function randomWord(): string {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(minWords = 6, maxWords = 16): string {
    const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    const words = Array.from({ length: len }, randomWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
}

function generateParagraph(sentenceCount = 5): string {
    return Array.from({ length: sentenceCount }, () => generateSentence()).join(" ");
}

export default function LoremIpsumGenerator() {
    const [count, setCount] = useState(3);
    const [type, setType] = useState<OutputType>("paragraphs");
    const [startClassic, setStartClassic] = useState(true);
    const [copied, setCopied] = useState(false);
    const [seed, setSeed] = useState(0);

    const output = useMemo(() => {
        // Using seed as dependency to regenerate
        void seed;

        if (type === "words") {
            const words = Array.from({ length: count }, randomWord);
            if (startClassic && words.length > 0) {
                words[0] = "lorem";
                if (words.length > 1) words[1] = "ipsum";
            }
            return words.join(" ");
        }

        if (type === "sentences") {
            const sentences = Array.from({ length: count }, () => generateSentence());
            if (startClassic && sentences.length > 0) {
                sentences[0] = CLASSIC_FIRST;
            }
            return sentences.join(" ");
        }

        // paragraphs
        const paragraphs = Array.from({ length: count }, () => generateParagraph(4 + Math.floor(Math.random() * 4)));
        if (startClassic && paragraphs.length > 0) {
            paragraphs[0] = CLASSIC_FIRST + " " + paragraphs[0];
        }
        return paragraphs.join("\n\n");
    }, [count, type, startClassic, seed]);

    const wordCount = output.split(/\s+/).filter(Boolean).length;
    const charCount = output.length;

    const copyOutput = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const types: { value: OutputType; label: string }[] = [
        { value: "paragraphs", label: "Paragraphs" },
        { value: "sentences", label: "Sentences" },
        { value: "words", label: "Words" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Lorem Ipsum Generator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Generate placeholder text for your designs and mockups. Copy with one click.
                </p>
            </div>

            {/* Controls */}
            <MacWindow title="Settings">
                <div className="space-y-5">
                    {/* Type selector */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Output Type</label>
                        <div className="flex gap-2">
                            {types.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setType(value)}
                                    className={`flex-1 py-2.5 font-mono text-[10px] font-bold border transition-all ${type === value
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-border/80"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                Number of {type}
                            </label>
                            <span className="font-mono text-xs text-foreground font-bold">{count}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max={type === "words" ? 200 : type === "sentences" ? 30 : 10}
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                        />
                    </div>

                    {/* Start classic + generate */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setStartClassic(!startClassic)}
                            className={`flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] font-bold border transition-all ${startClassic
                                    ? "border-accent/60 bg-accent/10 text-accent"
                                    : "border-border text-muted-foreground hover:border-border/80"
                                }`}
                        >
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${startClassic ? "border-accent bg-accent" : "border-muted-foreground/40"
                                }`}>
                                {startClassic && <Check size={10} strokeWidth={3} className="text-background" />}
                            </div>
                            Start with &quot;Lorem ipsum...&quot;
                        </button>

                        <button onClick={() => setSeed((s) => s + 1)} className="btn-brutal flex items-center gap-2">
                            <RefreshCw size={14} /> Regenerate
                        </button>
                    </div>
                </div>
            </MacWindow>

            {/* Stats */}
            <div className="flex gap-4 my-5">
                <div className="border border-border px-4 py-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Words</div>
                    <div className="font-mono text-sm font-bold">{wordCount}</div>
                </div>
                <div className="border border-border px-4 py-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Characters</div>
                    <div className="font-mono text-sm font-bold">{charCount}</div>
                </div>
                <div className="border border-border px-4 py-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Type</div>
                    <div className="font-mono text-sm font-bold capitalize">{type}</div>
                </div>
            </div>

            {/* Output */}
            <MacWindow title="Generated Text">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {count} {type}
                    </p>
                    <button onClick={copyOutput} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? "Copied!" : "Copy All"}
                    </button>
                </div>
                <div className="min-h-[200px] max-h-[500px] overflow-auto p-4 bg-secondary/30 border border-border select-all">
                    {output.split("\n\n").map((para, i) => (
                        <p key={i} className="font-mono text-xs leading-relaxed text-foreground/80 mb-4 last:mb-0">
                            {para}
                        </p>
                    ))}
                </div>
            </MacWindow>
        </div>
    );
}
