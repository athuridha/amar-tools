"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle2, XCircle, AlertTriangle, Search } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface ValidationResult {
    format: boolean;
    domain: string;
    disposable: boolean;
    dns: boolean;
}

export default function EmailValidator() {
    const [email, setEmail] = useState("");
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validate = useCallback(async () => {
        if (!email.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch(
                `https://www.disify.com/api/email/${encodeURIComponent(email.trim())}`
            );
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResult({
                format: data.format ?? false,
                domain: data.domain ?? "",
                disposable: data.disposable ?? false,
                dns: data.dns ?? false,
            });
        } catch {
            setError("Failed to validate. Please check the email and try again.");
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        validate();
    };

    const getOverallStatus = () => {
        if (!result) return null;
        if (!result.format) return { label: "Invalid Format", color: "text-red-400", icon: XCircle };
        if (result.disposable) return { label: "Disposable Email", color: "text-yellow-400", icon: AlertTriangle };
        if (!result.dns) return { label: "DNS Not Found", color: "text-red-400", icon: XCircle };
        return { label: "Valid Email", color: "text-green-400", icon: CheckCircle2 };
    };

    const status = getOverallStatus();

    const checks = result
        ? [
            {
                label: "Format Valid",
                passed: result.format,
                desc: result.format ? "Email format is correct" : "Email format is invalid",
            },
            {
                label: "Not Disposable",
                passed: !result.disposable,
                desc: result.disposable ? "This is a disposable/temporary email" : "Not a disposable email",
            },
            {
                label: "DNS Records",
                passed: result.dns,
                desc: result.dns ? "Domain has valid DNS records" : "Domain DNS records not found",
            },
            {
                label: "Domain",
                passed: true,
                desc: result.domain || "N/A",
            },
        ]
        : [];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Email Validator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Check email format, disposable status, and DNS records. Powered by Disify API.
                </p>
            </div>

            <MacWindow title="Validate Email">
                <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="relative flex-1">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="pl-10"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!email.trim() || loading}
                            className="btn-brutal btn-brutal-accent flex items-center gap-2 shrink-0 disabled:opacity-30"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Validate
                        </button>
                    </form>

                    {error && (
                        <div className="border border-red-500/30 p-4">
                            <p className="text-sm text-red-400 font-mono">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center gap-3 py-8">
                            <Loader2 size={20} className="animate-spin text-accent" />
                            <span className="font-mono text-sm text-muted-foreground">Validating...</span>
                        </div>
                    )}

                    {result && !loading && status && (
                        <div className="space-y-4">
                            {/* Overall */}
                            <div className="border border-border p-6 flex items-center gap-4">
                                <status.icon size={32} className={status.color} />
                                <div>
                                    <div className={`text-xl font-black ${status.color}`}>{status.label}</div>
                                    <div className="font-mono text-xs text-muted-foreground mt-1">{email}</div>
                                </div>
                            </div>

                            {/* Detail checks */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {checks.map(({ label, passed, desc }) => (
                                    <div key={label} className="border border-border p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {passed ? (
                                                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                            ) : (
                                                <XCircle size={14} className="text-red-400 shrink-0" />
                                            )}
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                {label}
                                            </span>
                                        </div>
                                        <p className="text-sm font-mono break-all">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </MacWindow>
        </div>
    );
}
