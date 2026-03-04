"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://www.rayeva.com/logo.svg"
            alt="Rayeva Logo"
            className="w-7 h-7 object-contain"
          />

          <span
            className="font-display text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Rayeva
          </span>
        </div>
      </nav>


      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-widest mb-6 fade-up" style={{ color: "var(--accent)", animationDelay: "0ms" }}>
          Applied AI for Sustainable Commerce
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-none mb-6 fade-up" style={{ color: "var(--text-primary)", animationDelay: "80ms" }}>
          Intelligent Tools
          <br />
          <em className="font-normal italic" style={{ color: "var(--accent-warm)" }}>for Green Commerce</em>
        </h1>
        <p className="max-w-lg text-base leading-relaxed mb-14 fade-up" style={{ color: "var(--text-secondary)", animationDelay: "160ms" }}>
          Two fully implemented AI modules — auto-categorization for product catalogs
          and proposal generation for B2B sustainable procurement.
        </p>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-5 w-full max-w-3xl fade-up" style={{ animationDelay: "240ms" }}>
          <Link href="/categorize" className="group text-left p-7 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">🏷️</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>Module 1</span>
            </div>
            <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Auto-Category & Tag</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Paste a product name and description. Get primary category, sub-category, 5–10 SEO tags, and sustainability filters — structured JSON, instantly.
            </p>
            <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "var(--accent)" }}>
              Try it <span>→</span>
            </div>
          </Link>

          <Link href="/proposal" className="group text-left p-7 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">📋</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--accent-warm)" }}>Module 2</span>
            </div>
            <h2 className="font-display text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>B2B Proposal Generator</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Enter client name, industry, and budget. Receive a full product mix, cost breakdown, impact positioning, and next steps as a structured proposal.
            </p>
            <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: "var(--accent-warm)" }}>
              Try it <span>→</span>
            </div>
          </Link>
        </div>

        {/* Architecture pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-14 fade-up" style={{ animationDelay: "320ms" }}>
          {["Next.js 14", "Google Gemini", "Zod Validation", "Prompt Logging", "Structured JSON"].map((t) => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full border"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Made with <span style={{ color: "#e25555" }}>❤️</span> by{" "}
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>Divyanshu Kumawat</span>
        </p>
      </footer>
    </main>
  );
}