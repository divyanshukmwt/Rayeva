"use client";
import { useState } from "react";
import Link from "next/link";

const SAMPLE = {
  name: "Bamboo Dish Brush with Compostable Bristles",
  description:
    "A durable dish brush made from sustainably harvested bamboo. The handle is untreated and compostable. Bristles are made from plant-based agave fibres. Replaces 5+ plastic brushes over its lifetime.",
  materials: "Bamboo handle, agave fibre bristles, stainless steel wire",
  brand: "EcoNest",
};

export default function CategorizePage() {
  const [form, setForm] = useState({ name: "", description: "", materials: "", brand: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.description) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Request failed");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => setForm(SAMPLE);

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-4 px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>← Back</Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Module 1 · Auto-Category & Tag Generator</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="fade-up">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Categorize a Product
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            AI assigns category, tags, and sustainability filters from your product info.
          </p>

          <button
            onClick={loadSample}
            className="text-xs mb-6 px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Load sample product
          </button>

          <div className="flex flex-col gap-4">
            <Field label="Product Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Bamboo Dish Brush" />
            <Field label="Description *" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Describe the product, use case, and materials…" rows={4} />
            <Field label="Materials (optional)" value={form.materials} onChange={(v) => setForm({ ...form, materials: v })} placeholder="e.g. Bamboo, agave fibre" />
            <Field label="Brand (optional)" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} placeholder="e.g. EcoNest" />

            <button
              onClick={handleSubmit}
              disabled={loading || !form.name || !form.description}
              className="mt-2 py-3 px-6 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              {loading ? "Categorizing…" : "Generate Categories & Tags →"}
            </button>

            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: "#2a1515", color: "#f87171" }}>
                ⚠ {error}
              </div>
            )}
          </div>
        </div>

        <div>
          {loading && <LoadingSkeleton />}
          {result && !loading && <ResultPanel data={result.data} meta={result.meta} />}
          {!loading && !result && (
            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed" style={{ borderColor: "var(--border)", minHeight: 400 }}>
              <p className="text-sm text-center px-8" style={{ color: "var(--text-secondary)" }}>
                Results will appear here after categorization
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, rows }) {
  const base = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
  };
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function ResultPanel({ data, meta }) {
  return (
    <div className="fade-up flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Results</h2>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{meta.durationMs}ms · {meta.logId}</span>
      </div>

      <Card title="Category">
        <div className="flex flex-wrap gap-2">
          <Tag color="accent">{data.primaryCategory}</Tag>
          <Tag color="warm">{data.subCategory}</Tag>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Confidence</span>
          <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full" style={{ width: `${data.confidenceScore * 100}%`, background: "var(--accent)" }} />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{(data.confidenceScore * 100).toFixed(0)}%</span>
        </div>
      </Card>

      <Card title={`SEO Tags (${data.seoTags.length})`}>
        <div className="flex flex-wrap gap-2">
          {data.seoTags.map((t) => <Tag key={t} color="neutral">{t}</Tag>)}
        </div>
      </Card>

      <Card title="Sustainability Filters">
        <div className="flex flex-wrap gap-2">
          {data.sustainabilityFilters.map((f) => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#1a2e14", color: "#6abf5e", border: "1px solid #2a4a20" }}>
              🌿 {f}
            </span>
          ))}
        </div>
      </Card>

      <Card title="AI Reasoning">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{data.reasoning}</p>
      </Card>

      <details className="group">
        <summary className="cursor-pointer text-xs mb-2" style={{ color: "var(--text-secondary)" }}>View raw JSON</summary>
        <pre className="text-xs p-4 rounded-xl overflow-auto" style={{ background: "var(--surface)", color: "var(--accent)", maxHeight: 240 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>{title}</p>
      {children}
    </div>
  );
}

function Tag({ children, color }) {
  const styles = {
    accent: { background: "#162a12", color: "#6abf5e", border: "1px solid #2a4a20" },
    warm: { background: "#2a1f0a", color: "#d4a04a", border: "1px solid #4a3415" },
    neutral: { background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
  };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full" style={styles[color]}>{children}</span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[120, 80, 100, 60].map((h, i) => (
        <div key={i} className="shimmer rounded-xl" style={{ height: h }} />
      ))}
    </div>
  );
}
