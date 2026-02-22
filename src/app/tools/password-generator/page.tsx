"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw, Shield, ArrowLeft } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?/`~",
};

function getStrength(pw: string): { label: string; percent: number; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 20) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    if (score <= 2) return { label: "Weak", percent: 25, color: "#ff5f56" };
    if (score <= 3) return { label: "Fair", percent: 50, color: "#ffbd2e" };
    if (score <= 4) return { label: "Good", percent: 75, color: "#9f5fff" };
    return { label: "Strong", percent: 100, color: "#27c93f" };
}

export default function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [uppercase, setUppercase] = useState(true);
    const [lowercase, setLowercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(true);
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const generate = useCallback(() => {
        let pool = "";
        if (uppercase) pool += CHARSETS.uppercase;
        if (lowercase) pool += CHARSETS.lowercase;
        if (numbers) pool += CHARSETS.numbers;
        if (symbols) pool += CHARSETS.symbols;
        if (!pool) pool = CHARSETS.lowercase;

        const arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        const pw = Array.from(arr, (v) => pool[v % pool.length]).join("");
        setPassword(pw);
        setHistory((prev) => [pw, ...prev].slice(0, 5));
        setCopied(false);
    }, [length, uppercase, lowercase, numbers, symbols]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const strength = password ? getStrength(password) : null;

    const toggles: { label: string; checked: boolean; onChange: (v: boolean) => void }[] = [
        { label: "Uppercase (A-Z)", checked: uppercase, onChange: setUppercase },
        { label: "Lowercase (a-z)", checked: lowercase, onChange: setLowercase },
        { label: "Numbers (0-9)", checked: numbers, onChange: setNumbers },
        { label: "Symbols (!@#$…)", checked: symbols, onChange: setSymbols },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Password Generator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Generate cryptographically-secure random passwords. Everything runs locally in your browser.
                </p>
            </div>

            <div className="space-y-6">
                {/* Output */}
                <MacWindow title="Generated Password">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 overflow-hidden">
                            <p className={`font-mono text-lg break-all select-all ${password ? "text-foreground" : "text-muted-foreground/40"}`}>
                                {password || "Click generate to create a password"}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => copyToClipboard(password)}
                                disabled={!password}
                                className="btn-brutal !py-2 !px-3 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Copy"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <button
                                onClick={generate}
                                className="btn-brutal-accent btn-brutal !py-2 !px-3"
                                title="Generate"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Strength meter */}
                    {strength && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Strength</span>
                                <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-border overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{ width: `${strength.percent}%`, background: strength.color }}
                                />
                            </div>
                        </div>
                    )}
                </MacWindow>

                {/* Settings */}
                <MacWindow title="Settings">
                    <div className="space-y-5">
                        {/* Length */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Password Length
                                </label>
                                <span className="font-mono text-xs text-foreground font-bold">{length}</span>
                            </div>
                            <input
                                type="range"
                                min="4"
                                max="64"
                                step="1"
                                value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                            />
                            <div className="flex justify-between mt-1">
                                <span className="font-mono text-[9px] text-muted-foreground/50">4</span>
                                <span className="font-mono text-[9px] text-muted-foreground/50">64</span>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-3">
                            {toggles.map(({ label, checked, onChange }) => (
                                <button
                                    key={label}
                                    onClick={() => onChange(!checked)}
                                    className={`flex items-center gap-3 p-3 border transition-all font-mono text-xs ${checked
                                            ? "border-accent/60 bg-accent/10 text-accent"
                                            : "border-border text-muted-foreground hover:border-border/80"
                                        }`}
                                >
                                    <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${checked ? "border-accent bg-accent" : "border-muted-foreground/40"
                                        }`}>
                                        {checked && <Check size={10} strokeWidth={3} className="text-background" />}
                                    </div>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Generate button */}
                        <button
                            onClick={generate}
                            className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2"
                        >
                            <Shield size={16} /> Generate Password
                        </button>
                    </div>
                </MacWindow>

                {/* History */}
                {history.length > 0 && (
                    <MacWindow title="Recent Passwords">
                        <div className="space-y-2">
                            {history.map((pw, i) => (
                                <div
                                    key={`${pw}-${i}`}
                                    className="flex items-center gap-3 p-2.5 border border-border/40 group hover:border-border/80 transition-colors"
                                >
                                    <span className="font-mono text-[10px] text-muted-foreground/30 shrink-0">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <p className="font-mono text-xs text-muted-foreground truncate flex-1 select-all">
                                        {pw}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(pw)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground"
                                        title="Copy"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </MacWindow>
                )}
            </div>
        </div>
    );
}
