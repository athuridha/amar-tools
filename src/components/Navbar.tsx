"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isToolRoute = pathname?.startsWith("/tools");

    const baseLink =
        "font-mono text-[10px] uppercase tracking-[0.3em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";
    const mutedLink = `${baseLink} text-muted-foreground hover:text-foreground`;
    const activeLink = `${baseLink} text-foreground`;

    return (
        <nav
            aria-label="Primary"
            className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-sm"
        >
            <div className="mx-auto max-w-6xl flex items-center justify-between px-6 sm:px-8 md:px-16 lg:px-24 py-5">
                <Link
                    href="/"
                    aria-label="AmarTools home"
                    aria-current={isHome ? "page" : undefined}
                    className={`${isHome ? activeLink : mutedLink} font-bold`}
                >
                    AmarTools
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/#tools"
                        aria-current={isToolRoute ? "page" : undefined}
                        className={isToolRoute ? activeLink : mutedLink}
                    >
                        Tools
                    </Link>

                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open GitHub"
                        className={mutedLink}
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </nav>
    );
}
