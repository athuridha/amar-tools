"use client";

import ScrambleText from "@/components/ScrambleText";

export default function HeroTitle() {
    return (
        <h1 className="hero-title text-[clamp(4rem,14vw,14rem)] font-black leading-[0.85] tracking-[-0.04em] uppercase select-none">
            <ScrambleText text="AMAR" charDelay={80} speed={40} />
            <br />
            <span className="hero-title-accent">
                <ScrambleText text="TOOLS" charDelay={80} speed={40} />
            </span>
        </h1>
    );
}
