"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Search, Globe, MapPin, Building2, Clock, Shield, Wifi, Loader2, LocateFixed } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

interface IpData {
    query: string;
    status: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
}

export default function IpLookup() {
    const [ip, setIp] = useState("");
    const [data, setData] = useState<IpData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const lookup = useCallback(async (target?: string) => {
        setLoading(true);
        setError("");
        setData(null);
        try {
            const url = target?.trim()
                ? `http://ip-api.com/json/${encodeURIComponent(target.trim())}`
                : `http://ip-api.com/json/`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            if (json.status === "fail") {
                throw new Error(json.message || "Invalid IP address or domain");
            }
            setData(json);
            if (!target?.trim()) setIp(json.query);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Lookup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        lookup(ip);
    };

    const infoCards = data
        ? [
            { label: "IP Address", value: data.query, icon: Shield },
            { label: "Country", value: `${data.country} (${data.countryCode})`, icon: Globe },
            { label: "Region", value: data.regionName, icon: MapPin },
            { label: "City", value: data.city, icon: Building2 },
            { label: "ZIP Code", value: data.zip || "N/A", icon: MapPin },
            { label: "Timezone", value: data.timezone, icon: Clock },
            { label: "ISP", value: data.isp, icon: Wifi },
            { label: "Organization", value: data.org || "N/A", icon: Building2 },
            { label: "AS Number", value: data.as || "N/A", icon: Shield },
            { label: "Latitude", value: String(data.lat), icon: Globe },
            { label: "Longitude", value: String(data.lon), icon: Globe },
        ]
        : [];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
                    IP Lookup
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Get geolocation, ISP, timezone, and more from any IP address. Powered by ip-api.com.
                </p>
            </div>

            <MacWindow title="Lookup">
                <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            placeholder="Enter IP address or domain (leave empty for your IP)"
                            className="flex-1"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-brutal btn-brutal-accent flex items-center gap-2 shrink-0 disabled:opacity-30"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Lookup
                        </button>
                    </form>

                    <button
                        onClick={() => { setIp(""); lookup(); }}
                        disabled={loading}
                        className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3 disabled:opacity-30"
                    >
                        <LocateFixed size={11} /> Detect My IP
                    </button>
                </div>
            </MacWindow>

            {/* Results */}
            {loading && (
                <div className="flex items-center justify-center gap-3 py-12">
                    <Loader2 size={24} className="animate-spin text-accent" />
                    <span className="font-mono text-sm text-muted-foreground">Looking up...</span>
                </div>
            )}

            {error && (
                <div className="mt-6 border border-red-500/30 p-6 text-center">
                    <p className="text-sm text-red-400 font-mono">{error}</p>
                </div>
            )}

            {data && !loading && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {infoCards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="border border-border p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className="text-accent shrink-0" />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
                            </div>
                            <div className="text-sm font-bold font-mono break-all">{value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
