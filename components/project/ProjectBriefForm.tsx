"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export function ProjectBriefForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please fill in a title and description");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          budget: form.budget ? Number(form.budget) : null,
          deadline: form.deadline || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/projects/${data.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c" }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>Project title</label>
        <input
          type="text"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Custom PCB for a solar charge controller"
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Describe what you need</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Share as much detail as you can — goals, specs, quantities, any constraints..."
          required
          rows={6}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Estimated budget (₦)</label>
          <input
            type="number"
            min={0}
            value={form.budget}
            onChange={set("budget")}
            placeholder="Optional"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Target deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={set("deadline")}
            style={inputStyle}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "#1d4ed8",
          color: "white",
          fontWeight: 700,
          padding: "12px 20px",
          borderRadius: 10,
          border: "none",
          fontSize: 14,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Submitting...
          </>
        ) : (
          "Submit project brief"
        )}
      </button>
    </form>
  );
}