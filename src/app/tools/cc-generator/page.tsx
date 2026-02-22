"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Copy, Check, RefreshCw, CreditCard, Trash2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

// Luhn algorithm to calculate check digit
function luhnCheckDigit(partialNumber: string): number {
    const digits = partialNumber.split("").reverse().map(Number);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === 0) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return (10 - (sum % 10)) % 10;
}

function detectNetwork(bin: string): string {
    if (/^4/.test(bin)) return "Visa";
    if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return "Mastercard";
    if (/^3[47]/.test(bin)) return "American Express";
    if (/^6(?:011|5)/.test(bin)) return "Discover";
    if (/^35(?:2[89]|[3-8])/.test(bin)) return "JCB";
    if (/^3(?:0[0-5]|[68])/.test(bin)) return "Diners Club";
    return "Unknown";
}

function getCardLength(network: string): number {
    if (network === "American Express") return 15;
    if (network === "Diners Club") return 14;
    return 16;
}

function generateCardFromBin(bin: string, cardLength: number): string {
    // Pad BIN with random digits until length - 1 (leave room for check digit)
    let number = bin.replace(/x/gi, () => String(Math.floor(Math.random() * 10)));
    while (number.length < cardLength - 1) {
        number += Math.floor(Math.random() * 10).toString();
    }
    // Truncate if BIN is too long
    number = number.slice(0, cardLength - 1);
    number += luhnCheckDigit(number);
    return number;
}

function formatCardNumber(number: string): string {
    if (number.length === 15) return `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`;
    if (number.length === 14) return `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`;
    return number.replace(/(.{4})/g, "$1 ").trim();
}

function generateExpiry(): string {
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    return `${month}/${String(year).slice(-2)}`;
}

function generateCVV(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

interface GeneratedCard {
    number: string;
    expiry: string;
    cvv: string;
    network: string;
}

export default function CCGenerator() {
    const [bin, setBin] = useState("4");
    const [quantity, setQuantity] = useState(10);
    const [expiryMode, setExpiryMode] = useState<"random" | "custom">("random");
    const [customMonth, setCustomMonth] = useState("01");
    const [customYear, setCustomYear] = useState(String(new Date().getFullYear() + 2).slice(-2));
    const [cvvMode, setCvvMode] = useState<"random" | "custom">("random");
    const [customCvv, setCustomCvv] = useState("");
    const [cards, setCards] = useState<GeneratedCard[]>([]);
    const [copied, setCopied] = useState<string | null>(null);

    const detectedNetwork = detectNetwork(bin.replace(/x/gi, "0"));
    const cardLength = getCardLength(detectedNetwork);
    const isAmex = detectedNetwork === "American Express";
    const cvvLength = isAmex ? 4 : 3;

    const generate = useCallback(() => {
        const newCards: GeneratedCard[] = [];
        for (let i = 0; i < quantity; i++) {
            const number = generateCardFromBin(bin, cardLength);
            const network = detectNetwork(number);
            const expiry = expiryMode === "custom" ? `${customMonth}/${customYear}` : generateExpiry();
            const cvv = cvvMode === "custom" && customCvv ? customCvv.padEnd(cvvLength, "0").slice(0, cvvLength) : generateCVV(cvvLength);

            newCards.push({ number, expiry, cvv, network });
        }
        setCards(newCards);
    }, [bin, quantity, cardLength, expiryMode, customMonth, customYear, cvvMode, customCvv, cvvLength]);

    const copyCard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAll = async () => {
        const text = cards
            .map((c) => `${c.number}|${c.expiry}|${c.cvv}`)
            .join("\n");
        await navigator.clipboard.writeText(text);
        setCopied("all");
        setTimeout(() => setCopied(null), 2000);
    };

    const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
    const currentYearShort = new Date().getFullYear() % 100;
    const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYearShort + i).padStart(2, "0"));

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    Test Card Generator
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Generate valid test credit card numbers by BIN using the Luhn algorithm. For development and testing only.
                </p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 mb-6 border border-accent/30 bg-accent/5">
                <CreditCard size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                    <p className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest mb-1">For Testing Only</p>
                    <p className="font-mono text-xs text-muted-foreground">
                        These numbers pass Luhn validation but are not real cards. Intended for payment gateway integration testing.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* BIN Input */}
                <MacWindow title="BIN Input">
                    <div className="space-y-4">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">
                                Enter BIN (first 6-8 digits) — use &quot;x&quot; for random digits
                            </label>
                            <input
                                type="text"
                                value={bin}
                                onChange={(e) => setBin(e.target.value.replace(/[^0-9xX]/g, "").slice(0, 10))}
                                placeholder="e.g. 411111, 5500xx, 37xxxx"
                                className="font-mono text-lg tracking-[0.3em]"
                                maxLength={10}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="border border-border px-3 py-2">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">Network</span>
                                <span className="font-mono text-sm font-bold text-accent">{detectedNetwork}</span>
                            </div>
                            <div className="border border-border px-3 py-2">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">Length</span>
                                <span className="font-mono text-sm font-bold">{cardLength} digits</span>
                            </div>
                            <div className="border border-border px-3 py-2">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">CVV</span>
                                <span className="font-mono text-sm font-bold">{cvvLength} digits</span>
                            </div>
                        </div>
                    </div>
                </MacWindow>

                {/* Expiry & CVV Settings */}
                <MacWindow title="Expiry & CVV">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Expiry */}
                        <div className="space-y-3">
                            <label className="font-mono text-[10px] uppercase tracking-widest block text-muted-foreground">Expiry Date</label>
                            <div className="flex gap-2">
                                {(["random", "custom"] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setExpiryMode(m)}
                                        className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all capitalize ${expiryMode === m
                                                ? "border-accent/60 bg-accent/10 text-accent"
                                                : "border-border text-muted-foreground hover:border-border/80"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            {expiryMode === "custom" && (
                                <div className="flex gap-2">
                                    <select
                                        value={customMonth}
                                        onChange={(e) => setCustomMonth(e.target.value)}
                                        className="flex-1 bg-input border border-border text-foreground font-mono text-xs p-2"
                                    >
                                        {MONTHS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <span className="font-mono text-lg text-muted-foreground self-center">/</span>
                                    <select
                                        value={customYear}
                                        onChange={(e) => setCustomYear(e.target.value)}
                                        className="flex-1 bg-input border border-border text-foreground font-mono text-xs p-2"
                                    >
                                        {YEARS.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* CVV */}
                        <div className="space-y-3">
                            <label className="font-mono text-[10px] uppercase tracking-widest block text-muted-foreground">CVV</label>
                            <div className="flex gap-2">
                                {(["random", "custom"] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setCvvMode(m)}
                                        className={`flex-1 py-2 font-mono text-[10px] font-bold border transition-all capitalize ${cvvMode === m
                                                ? "border-accent/60 bg-accent/10 text-accent"
                                                : "border-border text-muted-foreground hover:border-border/80"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            {cvvMode === "custom" && (
                                <input
                                    type="text"
                                    value={customCvv}
                                    onChange={(e) => setCustomCvv(e.target.value.replace(/\D/g, "").slice(0, cvvLength))}
                                    placeholder={`${cvvLength} digits`}
                                    maxLength={cvvLength}
                                    className="font-mono text-lg tracking-[0.3em]"
                                />
                            )}
                        </div>
                    </div>
                </MacWindow>

                {/* Quantity + Generate */}
                <MacWindow title="Generate">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quantity</label>
                                <span className="font-mono text-xs text-foreground font-bold">{quantity}</span>
                            </div>
                            <input type="range" min="1" max="50" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        </div>
                        <button onClick={generate} disabled={!bin.replace(/x/gi, "").length} className="w-full btn-brutal btn-brutal-accent flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                            <RefreshCw size={14} /> Generate Cards
                        </button>
                    </div>
                </MacWindow>

                {/* Results */}
                {cards.length > 0 && (
                    <MacWindow title={`Results (${cards.length})`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                {detectedNetwork} · BIN {bin}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={copyAll} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied === "all" ? <Check size={11} /> : <Copy size={11} />}
                                    {copied === "all" ? "Copied!" : "Copy All"}
                                </button>
                                <button onClick={() => setCards([])} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    <Trash2 size={11} /> Clear
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {cards.map((card, i) => {
                                const cardId = `card-${i}`;
                                const formatted = formatCardNumber(card.number);
                                const line = `${card.number}|${card.expiry}|${card.cvv}`;
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-2.5 border border-border/40 group hover:border-border/80 transition-colors"
                                    >
                                        <span className="font-mono text-[10px] text-muted-foreground/30 shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                                        <p className="font-mono text-xs sm:text-sm font-bold tracking-wider flex-1 select-all truncate">{formatted}</p>
                                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">{card.expiry}</span>
                                        <span className="font-mono text-[10px] text-accent font-bold shrink-0">{card.cvv}</span>
                                        <button
                                            onClick={() => copyCard(line, cardId)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground p-1"
                                            title="Copy"
                                        >
                                            {copied === cardId ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </MacWindow>
                )}

                {cards.length === 0 && (
                    <div className="border border-border/40 p-12 text-center">
                        <CreditCard size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Generated test cards will appear here</p>
                        <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">Enter a BIN and click Generate</p>
                    </div>
                )}
            </div>
        </div>
    );
}
