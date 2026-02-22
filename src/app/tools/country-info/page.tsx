"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Search, Globe, Users, MapPin, Phone, Banknote, Clock, Languages, Loader2 } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface Country {
    name: { common: string; official: string };
    capital?: string[];
    region: string;
    subregion?: string;
    population: number;
    area: number;
    languages?: Record<string, string>;
    currencies?: Record<string, { name: string; symbol: string }>;
    timezones: string[];
    flags: { png: string; svg: string; alt?: string };
    idd?: { root?: string; suffixes?: string[] };
    maps?: { googleMaps?: string };
    cca2: string;
}

export default function CountryInfo() {
    const [query, setQuery] = useState("");
    const [countries, setCountries] = useState<Country[]>([]);
    const [selected, setSelected] = useState<Country | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const search = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError("");
        setSelected(null);
        setCountries([]);
        try {
            const res = await fetch(
                `https://restcountries.com/v3.1/name/${encodeURIComponent(query.trim())}?fields=name,capital,region,subregion,population,area,languages,currencies,timezones,flags,idd,maps,cca2`
            );
            if (res.status === 404) throw new Error("No countries found");
            if (!res.ok) throw new Error("API error");
            const data: Country[] = await res.json();
            setCountries(data);
            if (data.length === 1) setSelected(data[0]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Search failed");
        } finally {
            setLoading(false);
        }
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); search(); };

    const fmt = (n: number) => n.toLocaleString("en-US");

    const c = selected;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Country Info</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Search any country — population, capital, currency, languages, and more. Powered by REST Countries.
                </p>
            </div>

            <MacWindow title="Search">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a country name..."
                        className="flex-1"
                    />
                    <button type="submit" disabled={!query.trim() || loading} className="btn-brutal btn-brutal-accent flex items-center gap-2 shrink-0 disabled:opacity-30">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Search
                    </button>
                </form>
            </MacWindow>

            {error && (
                <div className="mt-6 border border-red-500/30 p-4 text-center">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <span className="font-mono text-sm text-muted-foreground">Searching...</span>
                </div>
            )}

            {/* Multiple results selector */}
            {countries.length > 1 && !loading && (
                <div className="mt-6">
                    <MacWindow title={`${countries.length} Results`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {countries.map((co) => (
                                <button
                                    key={co.cca2}
                                    onClick={() => setSelected(co)}
                                    className={`p-3 border text-left transition-all flex items-center gap-3 ${selected?.cca2 === co.cca2 ? "border-accent/60 bg-accent/10" : "border-border hover:border-accent/30"}`}
                                >
                                    <img src={co.flags.png} alt={co.name.common} className="w-8 h-5 object-cover border border-border shrink-0" />
                                    <span className="text-sm font-bold truncate">{co.name.common}</span>
                                </button>
                            ))}
                        </div>
                    </MacWindow>
                </div>
            )}

            {/* Selected country details */}
            {c && !loading && (
                <div className="mt-6 space-y-5">
                    {/* Header */}
                    <MacWindow title={c.name.common}>
                        <div className="flex items-center gap-5">
                            <img src={c.flags.svg} alt={c.flags.alt || c.name.common} className="w-20 h-14 object-cover border border-border" />
                            <div>
                                <h2 className="text-2xl font-black">{c.name.common}</h2>
                                <p className="font-mono text-xs text-muted-foreground">{c.name.official}</p>
                            </div>
                        </div>
                    </MacWindow>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Capital", value: c.capital?.join(", ") || "N/A", icon: MapPin },
                            { label: "Region", value: `${c.region}${c.subregion ? ` / ${c.subregion}` : ""}`, icon: Globe },
                            { label: "Population", value: fmt(c.population), icon: Users },
                            { label: "Area", value: `${fmt(c.area)} km²`, icon: MapPin },
                            { label: "Languages", value: c.languages ? Object.values(c.languages).join(", ") : "N/A", icon: Languages },
                            { label: "Currency", value: c.currencies ? Object.values(c.currencies).map((cu) => `${cu.name} (${cu.symbol})`).join(", ") : "N/A", icon: Banknote },
                            { label: "Phone", value: c.idd?.root ? `${c.idd.root}${c.idd.suffixes?.[0] || ""}` : "N/A", icon: Phone },
                            { label: "Timezone", value: c.timezones?.[0] || "N/A", icon: Clock },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="border border-border p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={14} className="text-accent shrink-0" />
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
                                </div>
                                <div className="text-sm font-bold break-words">{value}</div>
                            </div>
                        ))}
                    </div>

                    {c.maps?.googleMaps && (
                        <a href={c.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="btn-brutal inline-flex items-center gap-2 text-[10px]">
                            <Globe size={11} /> View on Google Maps
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
