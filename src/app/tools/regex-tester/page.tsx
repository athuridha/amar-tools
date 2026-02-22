"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Copy, Check, AlertTriangle, Info } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const FLAGS = [
    { flag: "g", label: "Global", desc: "Find all matches" },
    { flag: "i", label: "Case-Ins.", desc: "Case-insensitive" },
    { flag: "m", label: "Multi-Line", desc: "^ and $ match line boundaries" },
    { flag: "s", label: "Dot-All", desc: ". matches newlines" },
];

const CHEATSHEET = [
    { pattern: ".", desc: "Any character" },
    { pattern: "\\d", desc: "Digit [0-9]" },
    { pattern: "\\w", desc: "Word char [a-zA-Z0-9_]" },
    { pattern: "\\s", desc: "Whitespace" },
    { pattern: "^", desc: "Start of string" },
    { pattern: "$", desc: "End of string" },
    { pattern: "*", desc: "0 or more" },
    { pattern: "+", desc: "1 or more" },
    { pattern: "?", desc: "0 or 1" },
    { pattern: "{n,m}", desc: "Between n and m" },
    { pattern: "(abc)", desc: "Capture group" },
    { pattern: "[abc]", desc: "Character set" },
    { pattern: "a|b", desc: "Alternation" },
    { pattern: "(?=...)", desc: "Lookahead" },
];

export default function RegexTester() {
    const [pattern, setPattern] = useState("");
    const [testString, setTestString] = useState("");
    const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));
    const [copied, setCopied] = useState(false);
    const [showCheatsheet, setShowCheatsheet] = useState(false);

    const toggleFlag = (flag: string) => {
        setFlags((prev) => {
            const next = new Set(prev);
            if (next.has(flag)) next.delete(flag);
            else next.add(flag);
            return next;
        });
    };

    const result = useMemo(() => {
        if (!pattern || !testString) return { html: "", matches: [], error: null };
        try {
            const flagStr = Array.from(flags).join("");
            const regex = new RegExp(pattern, flagStr);
            const matches: { match: string; index: number; groups: string[] }[] = [];

            if (flags.has("g")) {
                let m;
                while ((m = regex.exec(testString)) !== null) {
                    matches.push({
                        match: m[0],
                        index: m.index,
                        groups: m.slice(1),
                    });
                    if (m.index === regex.lastIndex) regex.lastIndex++;
                }
            } else {
                const m = regex.exec(testString);
                if (m) {
                    matches.push({
                        match: m[0],
                        index: m.index,
                        groups: m.slice(1),
                    });
                }
            }

            // Build highlighted HTML
            let html = "";
            let lastIndex = 0;
            const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
            for (const m of sortedMatches) {
                const before = testString.slice(lastIndex, m.index);
                html += escapeHtml(before);
                html += `<mark class="regex-match">${escapeHtml(m.match)}</mark>`;
                lastIndex = m.index + m.match.length;
            }
            html += escapeHtml(testString.slice(lastIndex));

            return { html, matches, error: null };
        } catch (err) {
            return {
                html: "",
                matches: [],
                error: err instanceof SyntaxError ? err.message : "Invalid regex",
            };
        }
    }, [pattern, testString, flags]);

    const copyRegex = async () => {
        const flagStr = Array.from(flags).join("");
        await navigator.clipboard.writeText(`/${pattern}/${flagStr}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Regex Tester
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Write a regular expression and test it against sample text with real-time match highlighting.
                </p>
            </div>

            <div className="space-y-6">
                {/* Pattern input */}
                <MacWindow title="Pattern">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg text-accent shrink-0">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder="your regex here..."
                                spellCheck={false}
                                className="flex-1 font-mono"
                            />
                            <span className="font-mono text-lg text-accent shrink-0">/{Array.from(flags).join("")}</span>
                            <button
                                onClick={copyRegex}
                                disabled={!pattern}
                                className="btn-brutal !py-2 !px-3 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                title="Copy regex"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>

                        {/* Flags */}
                        <div className="flex flex-wrap gap-2">
                            {FLAGS.map(({ flag, label }) => (
                                <button
                                    key={flag}
                                    onClick={() => toggleFlag(flag)}
                                    className={`px-3 py-1.5 font-mono text-[10px] font-bold border transition-all ${flags.has(flag)
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-border/80"
                                        }`}
                                    title={label}
                                >
                                    {flag} <span className="ml-1 opacity-60">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </MacWindow>

                {/* Error */}
                {result.error && (
                    <div className="flex items-start gap-3 p-4 border border-[#ff5f56]/40 bg-[#ff5f56]/5">
                        <AlertTriangle size={16} className="text-[#ff5f56] shrink-0 mt-0.5" />
                        <p className="font-mono text-xs text-[#ff5f56]">{result.error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Test string + highlighted */}
                    <div className="lg:col-span-7 space-y-5">
                        <MacWindow title="Test String">
                            <textarea
                                value={testString}
                                onChange={(e) => setTestString(e.target.value)}
                                placeholder="Paste or type your test string here..."
                                rows={8}
                                spellCheck={false}
                                className="resize-y min-h-[180px] font-mono text-xs leading-relaxed"
                            />
                        </MacWindow>

                        {/* Highlighted Output */}
                        {result.html && (
                            <MacWindow title="Highlighted Matches">
                                <div
                                    className="font-mono text-sm leading-relaxed p-4 bg-secondary/30 border border-border whitespace-pre-wrap break-words min-h-[100px]"
                                    dangerouslySetInnerHTML={{ __html: result.html }}
                                />
                            </MacWindow>
                        )}
                    </div>

                    {/* Matches + Cheatsheet */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Match info */}
                        <MacWindow title={`Matches (${result.matches.length})`}>
                            {result.matches.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {result.matches.map((m, i) => (
                                        <div key={i} className="p-2.5 border border-border/40">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    Match {i + 1} · Index {m.index}
                                                </span>
                                            </div>
                                            <p className="font-mono text-xs text-accent font-bold break-all">
                                                &quot;{m.match}&quot;
                                            </p>
                                            {m.groups.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                    {m.groups.map((g, gi) => (
                                                        <span key={gi} className="font-mono text-[10px] px-2 py-0.5 border border-border bg-secondary/50 text-muted-foreground">
                                                            Group {gi + 1}: {g ?? "undefined"}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs text-muted-foreground/40 py-8 text-center">
                                    {pattern ? "No matches found" : "Enter a pattern to start"}
                                </p>
                            )}
                        </MacWindow>

                        {/* Cheatsheet */}
                        <button
                            onClick={() => setShowCheatsheet(!showCheatsheet)}
                            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest py-2 text-accent hover:opacity-70 transition-opacity"
                        >
                            <Info size={14} />
                            {showCheatsheet ? "Hide Cheatsheet" : "Show Regex Cheatsheet"}
                        </button>

                        {showCheatsheet && (
                            <MacWindow title="Cheatsheet">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    {CHEATSHEET.map(({ pattern: p, desc }) => (
                                        <div key={p} className="flex items-center gap-2">
                                            <code className="font-mono text-xs text-accent font-bold min-w-[60px]">{p}</code>
                                            <span className="font-mono text-[10px] text-muted-foreground">{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </MacWindow>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
