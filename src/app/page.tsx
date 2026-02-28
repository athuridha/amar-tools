import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HeroTitle from "@/components/HeroTitle";

const categories = [
  {
    name: "Image & Media",
    tag: "MEDIA",
    tools: [
      { title: "Image Upscaler", description: "Enlarge images up to 4× with smooth interpolation. No quality loss.", href: "/tools/image-upscaler", span: "col-span-1 sm:col-span-2" },
      { title: "Image Compressor", description: "Compress images to WebP, JPEG, or PNG with adjustable quality.", href: "/tools/image-compressor", span: "col-span-1" },
      { title: "Image to PDF", description: "Combine multiple images into a single PDF. Runs locally.", href: "/tools/image-to-pdf", span: "col-span-1" },
      { title: "QR Generator", description: "Generate QR codes with custom colors, logos, and error correction.", href: "/tools/qr-generator", span: "col-span-1" },
    ],
  },
  {
    name: "Developer Tools",
    tag: "DEV",
    tools: [
      { title: "JSON Formatter", description: "Format, validate, and minify JSON with instant feedback.", href: "/tools/json-formatter", span: "col-span-1 sm:col-span-2" },
      { title: "Regex Tester", description: "Test regex patterns with real-time highlighting and capture groups.", href: "/tools/regex-tester", span: "col-span-1 sm:col-span-2" },
      { title: "Base64 Encode/Decode", description: "Encode text or files to Base64. Decode Base64 back to text.", href: "/tools/base64", span: "col-span-1" },
      { title: "Hash Generator", description: "Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or files.", href: "/tools/hash-generator", span: "col-span-1" },
      { title: "URL Encoder/Decoder", description: "Encode or decode URL components with special characters.", href: "/tools/url-encoder", span: "col-span-1" },
    ],
  },
  {
    name: "Design Tools",
    tag: "DESIGN",
    tools: [
      { title: "Color Picker", description: "Pick colors and convert between HEX, RGB, and HSL.", href: "/tools/color-picker", span: "col-span-1" },
      { title: "Gradient Generator", description: "Generate random palettes and instant CSS gradients.", href: "/tools/gradient-generator", span: "col-span-1" },
      { title: "Box Shadow Generator", description: "Design CSS box shadows visually with multi-layer support.", href: "/tools/box-shadow", span: "col-span-1 sm:col-span-2" },
    ],
  },
  {
    name: "Content & Text",
    tag: "CONTENT",
    tools: [
      { title: "Lorem Ipsum Generator", description: "Generate placeholder text — paragraphs, sentences, or words.", href: "/tools/lorem-ipsum", span: "col-span-1" },
      { title: "Text Counter", description: "Count words, characters, sentences, and reading time.", href: "/tools/text-counter", span: "col-span-1" },
      { title: "Case Converter", description: "Convert text between UPPER, lower, camelCase, snake_case, and more.", href: "/tools/case-converter", span: "col-span-1" },
      { title: "Markdown Preview", description: "Write Markdown and see it rendered live with code blocks and lists.", href: "/tools/markdown-preview", span: "col-span-1" },
    ],
  },
  {
    name: "Security & Data",
    tag: "DATA",
    tools: [
      { title: "Password Generator", description: "Cryptographically-secure passwords with strength meter.", href: "/tools/password-generator", span: "col-span-1" },
      { title: "CC Generator", description: "Generate valid test credit card numbers by BIN with Luhn validation.", href: "/tools/cc-generator", span: "col-span-1" },
      { title: "Address Generator", description: "Generate realistic fake addresses for 80+ countries. Instant, offline.", href: "/tools/address-generator", span: "col-span-1 sm:col-span-2" },
      { title: "UUID Generator", description: "Generate cryptographically-random UUIDs v4 in bulk.", href: "/tools/uuid-generator", span: "col-span-1" },
      { title: "IBAN Validator", description: "Validate international bank account numbers with MOD-97 check.", href: "/tools/iban-validator", span: "col-span-1" },
    ],
  },
  {
    name: "API Tools",
    tag: "API",
    tools: [
      { title: "Currency Converter", description: "Real-time exchange rates from ECB. Convert between 30+ currencies.", href: "/tools/currency-converter", span: "col-span-1 sm:col-span-2" },
      { title: "Math Solver", description: "Simplify, derive, integrate, factor expressions instantly.", href: "/tools/math-solver", span: "col-span-1 sm:col-span-2" },
      { title: "IP Lookup", description: "Geolocation, ISP, timezone, and more from any IP address.", href: "/tools/ip-lookup", span: "col-span-1" },
      { title: "URL Shortener", description: "Shorten long URLs instantly. No sign-up required.", href: "/tools/url-shortener", span: "col-span-1" },
      { title: "Email Validator", description: "Check email format, disposable status, and DNS records.", href: "/tools/email-validator", span: "col-span-1" },
      { title: "Random Quote", description: "Get inspired with random quotes from famous people.", href: "/tools/random-quote", span: "col-span-1" },
      { title: "Country Info", description: "Search any country — population, flag, currency, and more.", href: "/tools/country-info", span: "col-span-1 sm:col-span-2" },
      { title: "Number Facts", description: "Discover interesting trivia and math facts about any number.", href: "/tools/number-facts", span: "col-span-1" },
      { title: "Dictionary", description: "Look up English word definitions, phonetics, and synonyms.", href: "/tools/dictionary", span: "col-span-1" },
      { title: "KBBI", description: "Cari arti kata Bahasa Indonesia lewat KBBI online.", href: "https://kbbi.athuridha.my.id/", span: "col-span-1" },
      { title: "Trivia Quiz", description: "Test your knowledge with random trivia questions.", href: "/tools/trivia-quiz", span: "col-span-1" },
    ],
  },
];

let globalIndex = 0;

export default function Home() {
  globalIndex = 0;
  return (
    <div className="min-h-screen">
      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-section relative px-6 sm:px-8 md:px-16 lg:px-24 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <HeroTitle />

          <h2 className="mt-10 text-xl md:text-3xl font-medium tracking-tight text-foreground/80">
            Free Online Utility Tools
          </h2>

          <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Image processing, developer utilities, design tools, and more.
            <br />
            Everything runs in your browser — your data stays private.
          </p>

          <div className="mt-10 flex items-center gap-5 flex-wrap">
            <Link
              href="#tools"
              className="hero-btn group inline-flex items-center gap-3 px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explore Tools
              <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              100% Client-Side · No Sign Up
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ TOOLS ═══════════ */}
      <section id="tools" className="scroll-mt-28 px-6 sm:px-8 md:px-16 lg:px-24 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] block mb-3 text-accent">
              Tools
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
              What Can You Do?
            </h2>
            <p className="mt-3 font-mono text-sm text-muted-foreground max-w-lg">
              Pick a tool below. All processing happens locally in your browser — nothing is uploaded to any server.
            </p>
          </div>

          {/* Category sections */}
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category.name}>
                {/* Category header */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{category.tag}</span>
                  <div className="flex-1 h-px bg-border/40" />
                  <h3 className="text-lg font-black tracking-tight uppercase text-muted-foreground">{category.name}</h3>
                </div>

                {/* Tool cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.tools.map((tool) => {
                    const idx = ++globalIndex;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        aria-label={`${tool.title}. ${tool.description}`}
                        className={`tool-card group flex flex-col justify-between p-6 min-h-[200px] border border-border/40 transition-all duration-300 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${tool.span}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {category.tag}
                          </span>
                          <ArrowUpRight size={16} className="text-muted-foreground/30 group-hover:text-accent group-hover:rotate-45 transition-all duration-300" />
                        </div>

                        <div className="mt-auto">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase mb-2 group-hover:text-accent transition-colors duration-300">
                            {tool.title}
                          </h3>
                          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>
                        </div>

                        <span className="absolute bottom-3 right-4 font-mono text-[10px] text-muted-foreground/20 group-hover:text-accent/40 transition-colors">
                          {String(idx).padStart(2, "0")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
