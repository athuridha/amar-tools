"use client";

import { useState } from "react";
import { ArrowLeft, Check, X, Landmark, Copy } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

// IBAN lengths by country code
const IBAN_LENGTHS: Record<string, number> = {
    AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BY: 28, BE: 16, BA: 20, BR: 29,
    BG: 22, CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28, TL: 23, EE: 20,
    FO: 18, FI: 18, FR: 27, GE: 22, DE: 22, GI: 23, GR: 27, GL: 18, GT: 28,
    HU: 28, IS: 26, IQ: 23, IE: 22, IL: 23, IT: 27, JO: 30, KZ: 20, XK: 20,
    KW: 30, LV: 21, LB: 28, LI: 21, LT: 20, LU: 20, MK: 19, MT: 31, MR: 27,
    MU: 30, MC: 27, MD: 24, ME: 22, NL: 18, NO: 15, PK: 24, PS: 29, PL: 28,
    PT: 25, QA: 29, RO: 24, LC: 32, SM: 27, ST: 25, SA: 24, RS: 22, SC: 31,
    SK: 24, SI: 19, ES: 24, SE: 24, CH: 21, TN: 24, TR: 26, UA: 29, AE: 23,
    GB: 22, VA: 22, VG: 24,
};

const COUNTRY_NAMES: Record<string, string> = {
    AL: "Albania", AD: "Andorra", AT: "Austria", AZ: "Azerbaijan", BH: "Bahrain",
    BY: "Belarus", BE: "Belgium", BA: "Bosnia & Herzegovina", BR: "Brazil",
    BG: "Bulgaria", CR: "Costa Rica", HR: "Croatia", CY: "Cyprus", CZ: "Czech Republic",
    DK: "Denmark", DO: "Dominican Republic", EE: "Estonia", FI: "Finland", FR: "France",
    GE: "Georgia", DE: "Germany", GI: "Gibraltar", GR: "Greece", GT: "Guatemala",
    HU: "Hungary", IS: "Iceland", IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy",
    JO: "Jordan", KZ: "Kazakhstan", KW: "Kuwait", LV: "Latvia", LB: "Lebanon",
    LI: "Liechtenstein", LT: "Lithuania", LU: "Luxembourg", MK: "North Macedonia",
    MT: "Malta", MR: "Mauritania", MU: "Mauritius", MC: "Monaco", MD: "Moldova",
    ME: "Montenegro", NL: "Netherlands", NO: "Norway", PK: "Pakistan", PS: "Palestine",
    PL: "Poland", PT: "Portugal", QA: "Qatar", RO: "Romania", SA: "Saudi Arabia",
    RS: "Serbia", SK: "Slovakia", SI: "Slovenia", ES: "Spain", SE: "Sweden",
    CH: "Switzerland", TN: "Tunisia", TR: "Turkey", UA: "Ukraine", AE: "UAE",
    GB: "United Kingdom", VA: "Vatican",
};

function validateIBAN(iban: string): { valid: boolean; country: string; error?: string; bban?: string; checkDigit?: string } {
    const cleaned = iban.replace(/[\s\-]/g, "").toUpperCase();

    if (cleaned.length < 2) return { valid: false, country: "", error: "Too short" };

    const countryCode = cleaned.substring(0, 2);
    const country = COUNTRY_NAMES[countryCode] || "Unknown";

    if (!/^[A-Z]{2}/.test(cleaned)) return { valid: false, country, error: "Must start with 2 letter country code" };
    if (!/^[A-Z]{2}\d{2}/.test(cleaned)) return { valid: false, country, error: "Check digits must be numeric" };

    const expectedLength = IBAN_LENGTHS[countryCode];
    if (!expectedLength) return { valid: false, country, error: `Country code ${countryCode} not recognized` };
    if (cleaned.length !== expectedLength) return { valid: false, country, error: `Expected ${expectedLength} characters for ${countryCode}, got ${cleaned.length}` };

    // Mod-97 check
    const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
    const numeric = rearranged.split("").map((c) => {
        const code = c.charCodeAt(0);
        return code >= 65 ? String(code - 55) : c;
    }).join("");

    let remainder = 0;
    for (const digit of numeric) {
        remainder = (remainder * 10 + parseInt(digit)) % 97;
    }

    const valid = remainder === 1;
    return {
        valid,
        country,
        checkDigit: cleaned.substring(2, 4),
        bban: cleaned.substring(4),
        error: valid ? undefined : "Failed MOD-97 check — invalid check digits",
    };
}

function formatIBAN(iban: string): string {
    return iban.replace(/[\s\-]/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
}

export default function IBANValidator() {
    const [input, setInput] = useState("");
    const [copied, setCopied] = useState(false);

    const cleaned = input.replace(/[\s\-]/g, "").toUpperCase();
    const result = cleaned.length >= 4 ? validateIBAN(cleaned) : null;
    const formatted = formatIBAN(cleaned);

    const copy = async () => {
        await navigator.clipboard.writeText(formatted);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">IBAN Validator</h1>
                <p className="font-mono text-sm text-muted-foreground">Validate International Bank Account Numbers with MOD-97 check. Supports {Object.keys(IBAN_LENGTHS).length}+ countries.</p>
            </div>

            <div className="space-y-6">
                <MacWindow title="Input">
                    <div className="space-y-4">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2 text-muted-foreground">Enter IBAN</label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                                className="font-mono text-lg tracking-[0.15em]"
                            />
                        </div>
                        {cleaned && (
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-xs text-muted-foreground">{formatted}</p>
                                <button onClick={copy} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                                    {copied ? <Check size={11} /> : <Copy size={11} />}
                                    {copied ? "Copied!" : "Copy Formatted"}
                                </button>
                            </div>
                        )}
                    </div>
                </MacWindow>

                {result && (
                    <MacWindow title="Validation Result">
                        <div className="space-y-4">
                            {/* Status */}
                            <div className={`flex items-center gap-3 p-4 border ${result.valid ? "border-emerald-500/40 bg-emerald-500/5" : "border-[#ff5f56]/40 bg-[#ff5f56]/5"}`}>
                                {result.valid ? (
                                    <Check size={20} className="text-emerald-400 shrink-0" />
                                ) : (
                                    <X size={20} className="text-[#ff5f56] shrink-0" />
                                )}
                                <div>
                                    <p className={`font-mono text-sm font-bold ${result.valid ? "text-emerald-400" : "text-[#ff5f56]"}`}>
                                        {result.valid ? "Valid IBAN" : "Invalid IBAN"}
                                    </p>
                                    {result.error && <p className="font-mono text-xs text-muted-foreground mt-0.5">{result.error}</p>}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 border border-border/40">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Country</span>
                                    <span className="font-mono text-sm font-bold">{result.country}</span>
                                </div>
                                <div className="p-3 border border-border/40">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Country Code</span>
                                    <span className="font-mono text-sm font-bold text-accent">{cleaned.substring(0, 2)}</span>
                                </div>
                                {result.checkDigit && (
                                    <div className="p-3 border border-border/40">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Check Digits</span>
                                        <span className="font-mono text-sm font-bold">{result.checkDigit}</span>
                                    </div>
                                )}
                                {result.bban && (
                                    <div className="p-3 border border-border/40">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">BBAN</span>
                                        <span className="font-mono text-xs font-bold break-all">{result.bban}</span>
                                    </div>
                                )}
                                <div className="p-3 border border-border/40">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Length</span>
                                    <span className="font-mono text-sm font-bold">{cleaned.length} / {IBAN_LENGTHS[cleaned.substring(0, 2)] || "?"}</span>
                                </div>
                            </div>
                        </div>
                    </MacWindow>
                )}

                {!result && (
                    <div className="border border-border/40 p-12 text-center">
                        <Landmark size={32} strokeWidth={1} className="mx-auto mb-3 text-muted-foreground/30" />
                        <p className="font-mono text-sm text-muted-foreground">Validation result will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
