import Link from "next/link";

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    color: string;
    delay?: string;
}

export default function ToolCard({
    title,
    description,
    href,
    icon,
    color,
    delay = "",
}: ToolCardProps) {
    return (
        <Link
            href={href}
            aria-label={`${title}. ${description}`}
            className={`mac-window group animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${delay}`}
        >
            {/* macOS title bar */}
            <div className="mac-titlebar">
                <div className="mac-dot mac-dot-red" />
                <div className="mac-dot mac-dot-yellow" />
                <div className="mac-dot mac-dot-green" />
                <span className="ml-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {title}
                </span>
            </div>

            {/* Content */}
            <div className="p-5">
                <div
                    className={`w-12 h-12 rounded-xl border-[3px] border-foreground flex items-center justify-center mb-4 ${color} transition-transform group-hover:rotate-6`}
                >
                    {icon}
                </div>
                <h3 className="text-lg font-black text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool →
                </div>
            </div>
        </Link>
    );
}
