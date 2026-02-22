interface MacWindowProps {
    title: string;
    children: React.ReactNode;
}

export default function MacWindow({ title, children }: MacWindowProps) {
    return (
        <div className="mac-window">
            <div className="mac-titlebar">
                <div className="mac-dot red" />
                <div className="mac-dot yellow" />
                <div className="mac-dot green" />
                <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {title}
                </span>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}
