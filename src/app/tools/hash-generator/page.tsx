"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Copy, Check, Hash, FileUp, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGORITHMS: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function hashText(text: string, algorithm: Algorithm): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm.replace("-", ""), data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashFile(file: File, algorithm: Algorithm): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(algorithm.replace("-", ""), buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface HashResult {
    algorithm: Algorithm;
    hash: string;
}

export default function HashGenerator() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<"text" | "file">("text");
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<HashResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const generate = useCallback(async () => {
        if (mode === "text" && !input) return;
        if (mode === "file" && !file) return;
        setLoading(true);
        const hashes: HashResult[] = [];
        for (const algo of ALGORITHMS) {
            const hash = mode === "text" ? await hashText(input, algo) : await hashFile(file!, algo);
            hashes.push({ algorithm: algo, hash });
        }
        setResults(hashes);
        setLoading(false);
    }, [input, file, mode]);

    const copyHash = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setResults([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Hash Generator</h1>
                <p className="font-mono text-sm text-muted-foreground">Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files. All processing runs locally.</p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Input">
                    <div className="space-y-4">
                        {/* Mode toggle */}
                        <div className="flex gap-2">
                            {(["text", "file"] as const).map((m) => (
                                <button key={m} onClick={() => { setMode(m); setResults([]); }}
                                    className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all capitalize ${mode === m ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80"}`}>
                                    {m === "text" ? "Text Input" : "File Upload"}
                                </button>
                            ))}
                        </div>

                        {mode === "text" ? (
                            <textarea
                                value={input}
                                onChange={(e) => { setInput(e.target.value); setResults([]); }}
                                placeholder="Enter text to hash..."
                                className="font-mono text-xs min-h-[120px] resize-y"
                                rows={5}
                            />
                        ) : (
                            <div className="border-2 border-dashed border-border/40 p-8 text-center">
                                <FileUp size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                                <label className="cursor-pointer">
                                    <span className="font-mono text-xs text-accent hover:underline">Choose a file</span>
                                    <input type="file" className="hidden" onChange={handleFile} />
                                </label>
                                {file && <p className="font-mono text-[10px] text-muted-foreground mt-2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                            </div>
                        )}

                        <button onClick={generate} disabled={loading || (mode === "text" ? !input : !file)}
                            className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                            <Hash size={14} /> {loading ? "Hashing..." : "Generate Hashes"}
                        </button>
                    </div>
                </MacWindow>

                {results.length > 0 && (
                    <MacWindow title="Results">
                        <div className="space-y-3">
                            {results.map((r) => (
                                <div key={r.algorithm} className="p-3 border border-border/40 group hover:border-border/80 transition-colors">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">{r.algorithm}</span>
                                        <button onClick={() => copyHash(r.hash, r.algorithm)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1">
                                            {copied === r.algorithm ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    <p className="font-mono text-xs break-all select-all text-muted-foreground">{r.hash}</p>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                )}

                {results.length === 0 && (
                    <div className="border border-border/40 p-12 text-center">
                        <Hash size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Hash results will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
