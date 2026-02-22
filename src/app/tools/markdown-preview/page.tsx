"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, FileText, Eye, Code } from "lucide-react";
import MacWindow from "@/components/MacWindow";
import Link from "next/link";

// Simple markdown to HTML converter (no dependencies)
function markdownToHtml(md: string): string {
    let html = md;

    // Code blocks (``` ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="md-code-block"><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

    // Headers
    html = html.replace(/^###### (.+)$/gm, '<h6 class="md-h6">$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5 class="md-h5">$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links & Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="md-hr" />');

    // Unordered lists
    html = html.replace(/^[*\-] (.+)$/gm, '<li class="md-li">$1</li>');
    html = html.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>');
    html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>');

    // Checkboxes
    html = html.replace(/\[x\]/g, '<input type="checkbox" checked disabled />');
    html = html.replace(/\[ \]/g, '<input type="checkbox" disabled />');

    // Paragraphs (lines that aren't already wrapped)
    html = html.replace(/^(?!<[hublop]|<li|<pre|<hr|<block)(.+)$/gm, '<p class="md-p">$1</p>');

    return html;
}

const SAMPLE = `# Hello World

This is a **Markdown Preview** tool. Type on the left, see the result on the right.

## Features

- **Bold** and *italic* text
- ~~Strikethrough~~ text
- [Links](https://example.com)
- Inline \`code\` and code blocks

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote

---

1. First item
2. Second item
3. Third item

- [x] Task completed
- [ ] Task pending
`;

export default function MarkdownPreview() {
    const [input, setInput] = useState(SAMPLE);
    const [view, setView] = useState<"split" | "preview" | "source">("split");
    const [copied, setCopied] = useState(false);

    const html = markdownToHtml(input);

    const copyHtml = async () => {
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link href="/#tools" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
                <ArrowLeft size={14} /> Back to Tools
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Markdown Preview</h1>
                <p className="font-mono text-sm text-muted-foreground">Write Markdown and see it rendered live. Supports headers, lists, code blocks, links, and more.</p>
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    {([["split", "Split"], ["preview", "Preview"], ["source", "HTML"]] as const).map(([key, label]) => (
                        <button key={key} onClick={() => setView(key)}
                            className={`px-3 py-1.5 font-mono text-[10px] font-bold border transition-all ${view === key ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80"}`}>
                            {key === "source" ? <Code size={12} className="inline mr-1" /> : key === "preview" ? <Eye size={12} className="inline mr-1" /> : null}
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={copyHtml} className="btn-brutal text-[10px] flex items-center gap-1.5 !py-1.5 !px-3">
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? "Copied!" : "Copy HTML"}
                    </button>
                </div>
            </div>

            <div className={`grid gap-4 ${view === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {/* Editor */}
                {(view === "split" || view === "source") && (
                    <MacWindow title={view === "source" ? "HTML Source" : "Markdown"}>
                        {view === "source" ? (
                            <pre className="font-mono text-xs whitespace-pre-wrap break-all text-muted-foreground select-all max-h-[600px] overflow-auto">{html}</pre>
                        ) : (
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="font-mono text-xs min-h-[500px] resize-y"
                                placeholder="Type your markdown here..."
                                spellCheck={false}
                            />
                        )}
                    </MacWindow>
                )}

                {/* Preview */}
                {(view === "split" || view === "preview") && (
                    <MacWindow title="Preview">
                        <div
                            className="markdown-preview min-h-[500px] max-h-[600px] overflow-auto"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </MacWindow>
                )}
            </div>
        </div>
    );
}
