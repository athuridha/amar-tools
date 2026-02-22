export default function Footer() {
    return (
        <footer className="px-6 md:px-12 py-8 border-t border-border/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    © {new Date().getFullYear()} Amartools. All tools run locally.
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                    Designed with intention. Built with precision.
                </span>
            </div>
        </footer>
    );
}
