"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Copy, Check, ArrowRightLeft, Upload, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

type Mode = "encode" | "decode";

export default function Base64Tool() {
    const [mode, setMode] = useState<Mode>("encode");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const process = (text: string, m: Mode) => {
        if (!text.trim()) {
            setOutput("");
            setError(null);
            return;
        }
        try {
            if (m === "encode") {
                // Use TextEncoder for proper UTF-8 support
                const bytes = new TextEncoder().encode(text);
                let binary = "";
                bytes.forEach((b) => (binary += String.fromCharCode(b)));
                setOutput(btoa(binary));
            } else {
                const binary = atob(text.replace(/\s/g, ""));
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                setOutput(new TextDecoder().decode(bytes));
            }
            setError(null);
        } catch {
            setError(m === "decode" ? "Invalid Base64 string" : "Encoding failed");
            setOutput("");
        }
    };

    const handleInputChange = (text: string) => {
        setInput(text);
        process(text, mode);
    };

    const switchMode = () => {
        const newMode = mode === "encode" ? "decode" : "encode";
        setMode(newMode);
        // Swap: output becomes input for new mode
        if (output) {
            setInput(output);
            process(output, newMode);
        } else {
            setInput("");
            setOutput("");
        }
        setError(null);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // data:type;base64,XXXX → extract just the base64 part or use full data URL
            setInput(result);
            setOutput(result);
            setError(null);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const copyOutput = async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const inputSize = new Blob([input]).size;
    const outputSize = new Blob([output]).size;
    const formatSize = (b: number) => (b > 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Base64 Encoder / Decoder
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Encode text or files to Base64, or decode Base64 strings back to text. Everything runs in your browser.
                </p>
            </div>

            {/* Mode + controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex">
                    {(["encode", "decode"] as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => {
                                setMode(m);
                                setInput("");
                                setOutput("");
                                setError(null);
                                setFileName("");
                            }}
                            className={`px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest border transition-all ${mode === m
                                    ? "border-accent/60 bg-accent/10 text-accent"
                                    : "border-border text-muted-foreground hover:border-border/80"
                                } ${m === "encode" ? "border-r-0" : ""}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <button onClick={switchMode} disabled={!output} className="btn-brutal flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ArrowRightLeft size={14} /> Swap
                </button>

                {mode === "encode" && (
                    <>
                        <button onClick={() => fileInputRef.current?.click()} className="btn-brutal flex items-center gap-2">
                            <Upload size={14} /> File to Base64
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                    </>
                )}

                {fileName && (
                    <span className="font-mono text-[10px] text-muted-foreground">{fileName}</span>
                )}
            </div>

            {/* Stats */}
            {(input || output) && (
                <div className="flex gap-4 mb-6">
                    <div className="border border-border px-4 py-2.5">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Input</div>
                        <div className="font-mono text-sm font-bold">{formatSize(inputSize)}</div>
                    </div>
                    <div className="border border-border px-4 py-2.5">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Output</div>
                        <div className="font-mono text-sm font-bold text-accent">{formatSize(outputSize)}</div>
                    </div>
                    {mode === "encode" && inputSize > 0 && (
                        <div className="border border-border px-4 py-2.5">
                            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Ratio</div>
                            <div className="font-mono text-sm font-bold">{(outputSize / inputSize).toFixed(2)}×</div>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 p-4 mb-6 border border-[#ff5f56]/40 bg-[#ff5f56]/5">
                    <p className="font-mono text-xs text-[#ff5f56] font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <MacWindow title={mode === "encode" ? "Text Input" : "Base64 Input"}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {mode === "encode" ? "Type or paste text to encode" : "Paste Base64 to decode"}
                        </p>
                        <button
                            onClick={() => { setInput(""); setOutput(""); setError(null); setFileName(""); }}
                            disabled={!input}
                            className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30"
                        >
                            <Trash2 size={11} /> Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={mode === "encode" ? "Hello, World!" : "SGVsbG8sIFdvcmxkIQ=="}
                        rows={14}
                        spellCheck={false}
                        className="resize-y min-h-[280px] font-mono text-xs leading-relaxed"
                    />
                </MacWindow>

                {/* Output */}
                <MacWindow title={mode === "encode" ? "Base64 Output" : "Decoded Text"}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {output ? "Result" : "Output will appear here"}
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
                    <div className="min-h-[280px] max-h-[500px] overflow-auto p-4 bg-secondary/30 border border-border">
                        {output ? (
                            <pre className="font-mono text-xs leading-relaxed text-accent whitespace-pre-wrap break-all select-all">
                                {output}
                            </pre>
                        ) : (
                            <p className="font-mono text-xs text-muted-foreground/40 py-12 text-center">
                                {mode === "encode" ? "Base64 result" : "Decoded text"} will appear here
                            </p>
                        )}
                    </div>
                </MacWindow>
            </div>
        </div>
    );
}
