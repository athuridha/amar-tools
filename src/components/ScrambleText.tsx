"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

interface ScrambleTextProps {
    text: string;
    className?: string;
    /** Delay in ms before each character starts resolving */
    charDelay?: number;
    /** How fast the scramble cycles (ms per tick) */
    speed?: number;
}

export default function ScrambleText({
    text,
    className = "",
    charDelay = 80,
    speed = 40,
}: ScrambleTextProps) {
    const [reduceMotion, setReduceMotion] = useState(false);
    // IMPORTANT: Keep the initial render deterministic to avoid Next.js hydration mismatch.
    // We render the final text first, then start scrambling after mount.
    const initialTarget = text.toUpperCase().split("");
    const [settledUntil, setSettledUntil] = useState(initialTarget.length - 1);
    const settledUntilRef = useRef(initialTarget.length - 1);
    const [display, setDisplay] = useState<string[]>(initialTarget);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(media.matches);
        update();
        if (media.addEventListener) media.addEventListener("change", update);
        else media.addListener(update);
        return () => {
            if (media.removeEventListener) media.removeEventListener("change", update);
            else media.removeListener(update);
        };
    }, []);

    useEffect(() => {
        const target = text.toUpperCase().split("");

        if (reduceMotion) {
            settledUntilRef.current = target.length - 1;
            setSettledUntil(settledUntilRef.current);
            setDisplay(target);
            return;
        }

        // Start animation after mount: scramble first, then settle progressively.
        settledUntilRef.current = -1;
        setSettledUntil(-1);
        setDisplay(target.map(() => CHARS[Math.floor(Math.random() * CHARS.length)]));

        // Stagger: schedule each character to settle
        const timeouts = target.map((_, i) =>
            setTimeout(() => {
                settledUntilRef.current = Math.max(settledUntilRef.current, i);
                setSettledUntil(settledUntilRef.current);
            }, charDelay * (i + 1) + 200)
        );

        // Run scramble loop
        intervalRef.current = setInterval(() => {
            const settledIndex = settledUntilRef.current;
            setDisplay(
                target.map((char, i) => {
                    if (i <= settledIndex) return char;
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
            );

            if (settledIndex >= target.length - 1) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplay(target);
            }
        }, speed);

        return () => {
            timeouts.forEach(clearTimeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, charDelay, speed, reduceMotion]);

    return (
        <span className={className} aria-label={text}>
            <span aria-hidden="true">
                {display.map((char, i) => (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            color: i <= settledUntil ? "inherit" : "var(--accent)",
                            transition: "color 0.15s",
                        }}
                    >
                        {char}
                    </span>
                ))}
            </span>
        </span>
    );
}
