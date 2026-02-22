"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRightLeft, RefreshCw, Loader2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

const POPULAR_CURRENCIES = [
    "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD",
    "MXN", "SGD", "HKD", "NOK", "KRW", "TRY", "INR", "RUB", "BRL", "ZAR",
    "DKK", "PLN", "TWD", "THB", "IDR", "HUF", "CZK", "ILS", "CLP", "PHP",
    "AED", "MYR", "RON", "BGN", "ISK", "HRK",
];

export default function CurrencyConverter() {
    const [amount, setAmount] = useState("1");
    const [from, setFrom] = useState("USD");
    const [to, setTo] = useState("IDR");
    const [result, setResult] = useState<number | null>(null);
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const convert = useCallback(async () => {
        const num = parseFloat(amount);
        if (!amount || isNaN(num) || num <= 0) {
            setResult(null);
            setRate(null);
            return;
        }
        if (from === to) {
            setResult(num);
            setRate(1);
            setLastUpdated(new Date().toLocaleTimeString());
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `https://api.frankfurter.app/latest?amount=${num}&from=${from}&to=${to}`
            );
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            const converted = data.rates[to];
            setResult(converted);
            setRate(converted / num);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch {
            setError("Failed to fetch exchange rate. Please try again.");
            setResult(null);
            setRate(null);
        } finally {
            setLoading(false);
        }
    }, [amount, from, to]);

    useEffect(() => {
        const timeout = setTimeout(convert, 500);
        return () => clearTimeout(timeout);
    }, [convert]);

    const swap = () => {
        setFrom(to);
        setTo(from);
    };

    const formatNumber = (n: number) =>
        n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Currency Converter
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Real-time exchange rates from the European Central Bank. Powered by Frankfurter API.
                </p>
            </div>

            <MacWindow title="Convert">
                <div className="space-y-6">
                    {/* Amount */}
                    <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            step="any"
                            className="text-2xl font-bold"
                        />
                    </div>

                    {/* From / Swap / To */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">From</label>
                            <select value={from} onChange={(e) => setFrom(e.target.value)}>
                                {POPULAR_CURRENCIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={swap}
                            className="p-3 border border-border hover:border-accent/40 hover:text-accent transition-all mb-[2px]"
                            title="Swap currencies"
                        >
                            <ArrowRightLeft size={18} />
                        </button>

                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">To</label>
                            <select value={to} onChange={(e) => setTo(e.target.value)}>
                                {POPULAR_CURRENCIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Result */}
                    <div className="border border-border p-6 bg-secondary/20">
                        {loading ? (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <Loader2 size={20} className="animate-spin text-accent" />
                                <span className="font-mono text-sm text-muted-foreground">Converting...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-red-400 font-mono">{error}</p>
                                <button onClick={convert} className="mt-3 btn-brutal text-[10px] inline-flex items-center gap-1.5">
                                    <RefreshCw size={11} /> Retry
                                </button>
                            </div>
                        ) : result !== null ? (
                            <div>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{amount} {from} =</span>
                                </div>
                                <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight text-accent">
                                    {formatNumber(result)} <span className="text-lg text-muted-foreground">{to}</span>
                                </div>
                                {rate !== null && (
                                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            1 {from} = {formatNumber(rate)} {to}
                                        </span>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            1 {to} = {formatNumber(1 / rate)} {from}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center font-mono text-sm text-muted-foreground py-4">
                                Enter an amount to see the conversion
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    {lastUpdated && (
                        <p className="font-mono text-[10px] text-muted-foreground/60 text-right">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>
            </MacWindow>
        </div>
    );
}
