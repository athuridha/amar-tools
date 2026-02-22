import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmarTools — Free Online Utility Tools",
  description:
    "Free online tools: Image Upscaler, QR Code Generator, Color Picker, Text Counter. All processing happens in your browser — no data uploaded.",
  keywords: [
    "image upscaler",
    "qr code generator",
    "color picker",
    "text counter",
    "online tools",
    "free tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
