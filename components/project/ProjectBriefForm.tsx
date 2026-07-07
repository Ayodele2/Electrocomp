"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function ProjectBriefForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", requirements: "", budget: "", deadline: "" });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const input: React.CSSProperties = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10,
    padding: "10px 14px", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };
  const textarea: React.CSSProperties = { ...input, resize: "vertical" as const };
  const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 };

  const next = (validate: () => boolean) => { setError(""); if (validate()) setStep(s => s + 1); };

  const handleSubmit = async () => {
    if (!session) { router.push("/login"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description,
          requirements: form.requirements,
          budget: form.budget ? parseFloat(form.budget) : undefined,
          deadline: form.deadline || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 64, height: 64, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>Project submitted!</h2>
        <p style={{ color: "#6b7280", marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
          We&apos;ll review your brief and get back to you within 48 hours with a full quote and timeline.
        </p>
        <button onClick={() => router.push("/projects")} style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
          View my projects
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        {["Overview", "Requirements", "Review"].map((l, i) => (
          <div key={l} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: step > i + 1 ? "#16a34a" : step === i + 1 ? "#1d4ed8" : "white",
                color: step > i + 1 ? "white" : step === i + 1 ? "white" : "#9ca3af",
                border: `2px solid ${step > i + 1 ? "#16a34a" : step === i + 1 ? "#1d4ed8" : "#d1d5db"}`,
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, color: step === i + 1 ? "#1d4ed8" : "#9ca3af", fontWeight: 500 }}>{l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "#16a34a" : "#e5e7eb", margin: "0 6px", marginBottom: 18 }} />}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Project overview</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Give us a high-level summary of what you&apos;re building.</p>
          </div>
          <div>
            <label style={label}>Project title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Arduino-based soil moisture monitor" style={input} />
          </div>
          <div>
            <label style={label}>Project description *</label>
            <textarea value={form.description} onChange={set("description")} rows={5} placeholder="Describe your project, its purpose, and what you're trying to achieve..." style={textarea} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => next(() => {
              if (form.title.trim().length < 5) { setError("Title must be at least 5 characters"); return false; }
              if (form.description.trim().length < 20) { setError("Description must be at least 20 characters"); return false; }
              return true;
            })} style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "11px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Requirements & timeline</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>More detail = more accurate quote.</p>
          </div>
          <div>
            <label style={label}>Technical requirements *</label>
            <textarea value={form.requirements} onChange={set("requirements")} rows={6}
              placeholder="List components you'd like used, output specs, constraints, communication protocols needed..." style={textarea} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={label}>Budget (₦)</label>
              <input value={form.budget} onChange={set("budget")} type="number" placeholder="e.g. 150000" style={input} />
            </div>
            <div>
              <label style={label}>Deadline</label>
              <input value={form.deadline} onChange={set("deadline")} type="date" style={input} />
            </div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1d4ed8" }}>
            💡 No file uploads needed — describe everything in detail. Our team will follow up if we need schematics.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "1.5px solid #e5e7eb", color: "#374151", fontWeight: 600, padding: "11px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>← Back</button>
            <button onClick={() => next(() => {
              if (form.requirements.trim().length < 10) { setError("Please describe your requirements"); return false; }
              return true;
            })} style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "11px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Review your project</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Double-check before submitting.</p>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            {[
              ["Title", form.title],
              ["Description", form.description],
              ["Requirements", form.requirements],
              ["Budget", form.budget ? `₦${Number(form.budget).toLocaleString()}` : "Not specified"],
              ["Deadline", form.deadline || "Flexible"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>{l}</span>
                <span style={{ fontSize: 13, color: "#111827", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1d4ed8" }}>
            After submitting, our team reviews within <strong>48 hours</strong> and sends a full quote and project timeline.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={{ background: "none", border: "1.5px solid #e5e7eb", color: "#374151", fontWeight: 600, padding: "11px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>← Edit</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              background: loading ? "#93c5fd" : "#1d4ed8", color: "white", fontWeight: 700,
              padding: "11px 28px", borderRadius: 10, border: "none",
              cursor: loading ? "not-allowed" : "pointer", fontSize: 14,
            }}>
              {loading ? "Submitting…" : "✓ Submit project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
