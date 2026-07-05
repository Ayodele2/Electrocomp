"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectTimeline } from "@/components/project/ProjectTimeline";
import { ProjectMessages } from "@/components/project/ProjectMessages";
import { formatDate, formatPrice } from "@/lib/utils";
import Link from "next/link";

const STATUSES = ["PENDING","REVIEWING","QUOTED","ACTIVE","ON_HOLD","DELIVERED","COMPLETED","CANCELLED"];

export function AdminProjectPanel({ project }: { project: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [quote, setQuote] = useState(project.quote ? String(project.quote) : "");
  const [adminNotes, setAdminNotes] = useState(project.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mlTitle, setMlTitle] = useState("");
  const [mlDesc, setMlDesc] = useState("");
  const [mlDate, setMlDate] = useState("");
  const [addingMl, setAddingMl] = useState(false);
  const [milestones, setMilestones] = useState(project.milestones);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, quote: quote ? parseFloat(quote) : null, adminNotes }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const addMilestone = async () => {
    if (!mlTitle.trim()) return;
    setAddingMl(true);
    const res = await fetch(`/api/projects/${project.id}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: mlTitle, description: mlDesc, dueDate: mlDate || null, order: milestones.length }),
    });
    const data = await res.json();
    setMilestones((m: any[]) => [...m, data.data]);
    setMlTitle(""); setMlDesc(""); setMlDate("");
    setAddingMl(false);
  };

  const input: React.CSSProperties = { width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 13px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>
            <Link href="/admin/projects" style={{ color: "#9ca3af", textDecoration: "none" }}>Projects</Link>
            <span>/</span>
            <span style={{ color: "#374151" }}>{project.title}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{project.title}</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Client: <strong style={{ color: "#374151" }}>{project.client.name}</strong> ({project.client.email}) · {formatDate(project.createdAt)}
          </p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: saved ? "#16a34a" : "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Description */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Project description</h2>
            <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{project.description}</p>
          </div>

          {/* Milestones */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Milestones</h2>
            <ProjectTimeline milestones={milestones} isAdmin projectId={project.id} onUpdate={() => router.refresh()} />
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>Add milestone</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={mlTitle} onChange={e => setMlTitle(e.target.value)} placeholder="Title *" style={input} />
                <input value={mlDesc} onChange={e => setMlDesc(e.target.value)} placeholder="Description (optional)" style={input} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="date" value={mlDate} onChange={e => setMlDate(e.target.value)} style={{ ...input, flex: 1 }} />
                  <button onClick={addMilestone} disabled={!mlTitle.trim() || addingMl}
                    style={{ background: mlTitle.trim() ? "#1d4ed8" : "#e5e7eb", color: mlTitle.trim() ? "white" : "#9ca3af", fontWeight: 700, padding: "9px 18px", borderRadius: 10, border: "none", cursor: mlTitle.trim() ? "pointer" : "default", fontSize: 13 }}>
                    {addingMl ? "Adding…" : "+ Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Messages</h2>
            <ProjectMessages messages={project.messages} projectId={project.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Status */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Status</h3>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...input, marginBottom: 0 }}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          {/* Quote */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Quote (₦)</h3>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 13 }}>₦</span>
              <input type="number" value={quote} onChange={e => setQuote(e.target.value)} placeholder="0.00" min="0" style={{ ...input, paddingLeft: 28 }} />
            </div>
            {quote && (
              <p style={{ fontSize: 12, color: "#6b7280", margin: "8px 0 0" }}>
                Deposit: <strong>{formatPrice(parseFloat(quote) / 2)}</strong> · Balance: <strong>{formatPrice(parseFloat(quote) / 2)}</strong>
              </p>
            )}
          </div>

          {/* Notes */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Internal notes</h3>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4}
              placeholder="Notes visible only to admin/engineers..." style={{ ...input, resize: "vertical" }} />
          </div>

          {/* Payment */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Payment</h3>
            {[["Deposit", project.depositPaid], ["Balance", project.balancePaid]].map(([l, p]) => (
              <div key={l as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{l as string}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: p ? "#dcfce7" : "#f3f4f6", color: p ? "#166534" : "#6b7280" }}>
                  {p ? "Paid" : "Unpaid"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
