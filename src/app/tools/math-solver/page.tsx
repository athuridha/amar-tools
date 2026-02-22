"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Play, Loader2, Sparkles, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const OPERATIONS = [
    { value: "simplify", label: "Simplify", desc: "Simplify an expression" },
    { value: "factor", label: "Factor", desc: "Factor an expression" },
    { value: "derive", label: "Derivative", desc: "Find the derivative" },
    { value: "integrate", label: "Integrate", desc: "Find the integral" },
    { value: "zeroes", label: "Zeroes", desc: "Find zeros / roots" },
    { value: "tangent", label: "Tangent", desc: "Tangent line at a point" },
    { value: "cos", label: "Cosine", desc: "Calculate cos(x)" },
    { value: "sin", label: "Sine", desc: "Calculate sin(x)" },
    { value: "tan", label: "Tangent (trig)", desc: "Calculate tan(x)" },
    { value: "log", label: "Logarithm", desc: "Calculate log(x)" },
    { value: "abs", label: "Absolute", desc: "Absolute value |x|" },
];

interface HistoryItem {
    operation: string;
    expression: string;
    result: string;
}

export default function MathSolver() {
    const [expression, setExpression] = useState("");
    const [operation, setOperation] = useState("simplify");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const solve = useCallback(async () => {
        if (!expression.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const encoded = encodeURIComponent(expression.trim());
            const res = await fetch(
                `https://newton.vercel.app/api/v2/${operation}/${encoded}`
            );
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            if (data.result === undefined || data.result === "undefined") {
                throw new Error("Could not compute. Check your expression.");
            }
            setResult(data.result);
            setHistory((prev) => [
                { operation, expression: expression.trim(), result: data.result },
                ...prev.slice(0, 9),
            ]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to compute. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [expression, operation]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            solve();
        }
    };

    const opLabel = OPERATIONS.find((o) => o.value === operation)?.label ?? operation;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Math Solver
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Simplify, derive, integrate, factor expressions and more. Powered by Newton API.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input */}
                <div className="lg:col-span-7 space-y-5">
                    <MacWindow title="Expression">
                        <div className="space-y-5">
                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Operation</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {OPERATIONS.map((op) => (
                                        <button
                                            key={op.value}
                                            onClick={() => setOperation(op.value)}
                                            className={`py-2 px-1 font-mono text-[10px] font-bold border transition-all ${operation === op.value
                                                ? "border-accent/60 bg-accent/10 text-accent"
                                                : "border-border hover:border-border/80 text-muted-foreground"
                                                }`}
                                        >
                                            {op.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                                    Enter expression (e.g. x^2+2x, 2|x for tangent)
                                </label>
                                <input
                                    type="text"
                                    value={expression}
                                    onChange={(e) => setExpression(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="x^2 + 2x + 1"
                                    className="text-lg font-mono"
                                />
                            </div>

                            <button
                                onClick={solve}
                                disabled={!expression.trim() || loading}
                                className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                {loading ? "Computing..." : `Calculate ${opLabel}`}
                            </button>
                        </div>
                    </MacWindow>
                </div>

                {/* Result */}
                <div className="lg:col-span-5 space-y-5">
                    <MacWindow title="Result">
                        <div className="min-h-[180px] flex flex-col justify-center">
                            {loading ? (
                                <div className="flex items-center justify-center gap-3 py-8">
                                    <Loader2 size={20} className="animate-spin text-accent" />
                                    <span className="font-mono text-sm text-muted-foreground">Computing...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-red-400 font-mono">{error}</p>
                                </div>
                            ) : result !== null ? (
                                <div className="text-center">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                                        {opLabel} of
                                    </div>
                                    <div className="font-mono text-sm text-muted-foreground mb-4 break-all">
                                        {expression}
                                    </div>
                                    <div className="border-t border-border pt-4">
                                        <Sparkles size={16} className="text-accent mx-auto mb-2" />
                                        <div className="text-2xl sm:text-3xl font-black text-accent break-all">
                                            {result}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="font-mono text-sm text-muted-foreground">
                                        Enter an expression and click Calculate
                                    </p>
                                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                                        Press Enter to compute
                                    </p>
                                </div>
                            )}
                        </div>
                    </MacWindow>

                    {/* History */}
                    {history.length > 0 && (
                        <MacWindow title="History">
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {history.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setExpression(item.expression);
                                            setOperation(item.operation);
                                        }}
                                        className="w-full text-left p-3 border border-border hover:border-accent/30 transition-colors"
                                    >
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                            {OPERATIONS.find((o) => o.value === item.operation)?.label}
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground truncate">{item.expression}</div>
                                        <div className="font-mono text-sm font-bold text-accent truncate">= {item.result}</div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setHistory([])}
                                className="mt-3 btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3"
                            >
                                <Trash2 size={11} /> Clear History
                            </button>
                        </MacWindow>
                    )}
                </div>
            </div>
        </div>
    );
}
