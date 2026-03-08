"use client";
import { useState } from "react";
import Link from "next/link";

const SAMPLE = {
  clientName: "GreenLeaf Hospitality",
  industry: "Hotels & Hospitality",
  totalBudget: 150000,
  currency: "INR",
  numberOfEmployees: 120,
  sustainabilityGoals: "Eliminate single-use plastics, achieve zero-waste kitchen by 2026",
  preferredCategories: ["Home & Living", "Personal Care"],
  additionalNotes: "Focused on guest experience — products must look premium",
};

export default function ProposalPage() {
  const [form, setForm] = useState({
    clientName: "", industry: "", totalBudget: "", currency: "INR",
    numberOfEmployees: "", sustainabilityGoals: "", preferredCategories: "", additionalNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.clientName || !form.industry || !form.totalBudget) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const body = {
        clientName: form.clientName,
        industry: form.industry,
        totalBudget: Number(form.totalBudget),
        currency: form.currency,
        numberOfEmployees: form.numberOfEmployees ? Number(form.numberOfEmployees) : undefined,
        sustainabilityGoals: form.sustainabilityGoals || undefined,
        preferredCategories: form.preferredCategories ? form.preferredCategories.split(",").map(s => s.trim()) : undefined,
        additionalNotes: form.additionalNotes || undefined,
      };
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const loadSample = () => setForm({
    ...SAMPLE,
    totalBudget: String(SAMPLE.totalBudget),
    numberOfEmployees: String(SAMPLE.numberOfEmployees),
    preferredCategories: SAMPLE.preferredCategories.join(", "),
  });

  const f = (k) => ({
    value: form[k],
    onChange: (v) => setForm({ ...form, [k]: v }),
  });

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-4 px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>← Back</Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Module 2 · B2B Proposal Generator</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 fade-up">
            <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Generate a Proposal
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Provide client details and budget. AI builds a full sustainable product proposal.
            </p>
            <button onClick={loadSample} className="text-xs mb-6 px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
              style={{ borderColor: "var(--accent-warm)", color: "var(--accent-warm)" }}>
              Load sample client
            </button>

            <div className="flex flex-col gap-3">
              <Field label="Client Name *" placeholder="GreenLeaf Hospitality" {...f("clientName")} />
              <Field label="Industry *" placeholder="Hotels & Hospitality" {...f("industry")} />
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field label="Total Budget *" placeholder="150000" {...f("totalBudget")} type="number" />
                </div>
                <Field label="Currency" placeholder="INR" {...f("currency")} />
              </div>
              <Field label="No. of Employees" placeholder="120" {...f("numberOfEmployees")} type="number" />
              <Field label="Sustainability Goals" placeholder="Eliminate single-use plastics…" {...f("sustainabilityGoals")} rows={3} />
              <Field label="Preferred Categories (comma-separated)" placeholder="Home & Living, Personal Care" {...f("preferredCategories")} />
              <Field label="Additional Notes" placeholder="Products must look premium…" {...f("additionalNotes")} rows={2} />

              <button
                onClick={handleSubmit}
                disabled={loading || !form.clientName || !form.industry || !form.totalBudget}
                className="mt-2 py-3 px-6 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
                style={{ background: "var(--accent-warm)", color: "var(--bg)" }}
              >
                {loading ? "Generating proposal…" : "Generate Proposal →"}
              </button>

              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ background: "#2a1515", color: "#f87171" }}>⚠ {error}</div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            {loading && <ProposalSkeleton />}
            {result && !loading && <ProposalResult data={result.data} meta={result.meta} />}
            {!loading && !result && (
              <div className="h-full flex items-center justify-center rounded-2xl border border-dashed" style={{ borderColor: "var(--border)", minHeight: 500 }}>
                <p className="text-sm text-center px-8" style={{ color: "var(--text-secondary)" }}>
                  Your generated proposal will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, rows, type }) {
  const base = {
    background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)",
    borderRadius: 10, padding: "9px 11px", fontSize: 13, width: "100%",
    outline: "none", resize: "none", fontFamily: "inherit",
  };
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
        : <input type={type ?? "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function ProposalResult({ data, meta }) {
  const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

  return (
    <div className="fade-up flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data.proposalTitle}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>For {data.clientName} · {meta.durationMs}ms</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Executive Summary</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{data.executiveSummary}</p>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Budget Allocation</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Total Budget", val: fmt(data.budgetAllocation.totalBudget), color: "var(--text-primary)" },
            { label: "Allocated", val: fmt(data.budgetAllocation.allocated), color: "var(--accent-warm)" },
            { label: "Buffer", val: fmt(data.budgetAllocation.remaining), color: "var(--accent)" },
          ].map(({ label, val, color }) => (
            <div key={label} className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className="text-base font-semibold font-mono" style={{ color }}>₹{val}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {Object.entries(data.budgetAllocation.allocationByCategory).map(([cat, amt]) => {
            const pct = (amt / data.budgetAllocation.totalBudget) * 100;
            return (
              <div key={cat} className="h-2 rounded-full" title={`${cat}: ₹${fmt(amt)}`}
                style={{ width: `${pct}%`, background: `hsl(${Math.abs(cat.charCodeAt(0) * 7) % 360}, 40%, 40%)` }} />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(data.budgetAllocation.allocationByCategory).map(([cat, amt]) => (
            <span key={cat} className="text-xs" style={{ color: "var(--text-secondary)" }}>{cat}: ₹{fmt(amt)}</span>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Recommended Products ({data.products.length})</p>
        <div className="flex flex-col gap-3">
          {data.products.map((p, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.productName}</p>
                <p className="text-xs font-mono ml-3 shrink-0" style={{ color: "var(--accent-warm)" }}>₹{fmt(p.totalCost)}</p>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                {p.category} · ₹{fmt(p.unitCost)} × {p.quantity} units
              </p>
              <div className="flex flex-wrap gap-1 mb-1">
                {p.sustainabilityHighlights.map((h) => (
                  <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a2e14", color: "#6abf5e" }}>🌿 {h}</span>
                ))}
              </div>
              <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>{p.whyRecommended}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "#0f1e0e", borderColor: "#2a4a20" }}>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#4a8a40" }}>Impact Positioning</p>
        <p className="font-display text-lg font-semibold mb-3" style={{ color: "#8fd488" }}>{data.impactPositioning.headline}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-lg" style={{ background: "#0a1a09" }}>
            <p className="text-xs mb-1" style={{ color: "#4a8a40" }}>Plastic Saved</p>
            <p className="text-xl font-bold font-mono" style={{ color: "#6abf5e" }}>{data.impactPositioning.estimatedPlasticSavedKg}kg</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "#0a1a09" }}>
            <p className="text-xs mb-1" style={{ color: "#4a8a40" }}>CO₂ Avoided</p>
            <p className="text-xl font-bold font-mono" style={{ color: "#6abf5e" }}>{data.impactPositioning.estimatedCO2AvoidedKg}kg</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1 mb-3">
          {data.impactPositioning.keyBenefits.map((b) => (
            <li key={b} className="text-xs flex items-start gap-2" style={{ color: "#8fd488" }}>
              <span className="mt-0.5">✓</span>{b}
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed" style={{ color: "#4a8a40" }}>{data.impactPositioning.sustainabilityNarrative}</p>
      </div>

      <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Next Steps</p>
        <ol className="flex flex-col gap-2">
          {data.nextSteps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "var(--text-primary)" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
                style={{ background: "var(--surface-2)", color: "var(--accent-warm)" }}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <details>
        <summary className="cursor-pointer text-xs mb-2" style={{ color: "var(--text-secondary)" }}>View raw JSON</summary>
        <pre className="text-xs p-4 rounded-xl overflow-auto" style={{ background: "var(--surface)", color: "var(--accent)", maxHeight: 300 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function ProposalSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[60, 100, 160, 200, 120, 80].map((h, i) => (
        <div key={i} className="shimmer rounded-xl" style={{ height: h }} />
      ))}
    </div>
  );
}
