"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

export function ProjectTimeline({ milestones, isAdmin, projectId, onUpdate }: {
  milestones: any[];
  isAdmin?: boolean;
  projectId: string;
  onUpdate?: () => void;
}) {
  const [items, setItems] = useState(milestones);

  const toggle = async (m: any) => {
    if (!isAdmin) return;
    const next = m.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    await fetch(`/api/projects/${projectId}/milestones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: m.id, status: next }),
    });
    setItems(prev => prev.map(x => x.id === m.id ? { ...x, status: next, completedAt: next === "COMPLETED" ? new Date().toISOString() : null } : x));
    onUpdate?.();
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px", border: "2px dashed #e5e7eb", borderRadius: 12, color: "#9ca3af", fontSize: 13 }}>
        No milestones set yet
      </div>
    );
  }

  const done = items.filter(m => m.status === "COMPLETED").length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
          <span>{done} of {items.length} milestones completed</span>
          <span style={{ fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(to right, #1d4ed8, #06b6d4)", borderRadius: 999, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* List */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 11, top: 12, bottom: 12, width: 2, background: "#e5e7eb" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 14, position: "relative" }}>
              <div
                onClick={() => toggle(m)}
                style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1, cursor: isAdmin ? "pointer" : "default", fontSize: 14,
                  background: m.status === "COMPLETED" ? "#16a34a" : m.status === "IN_PROGRESS" ? "#1d4ed8" : "white",
                  border: `2px solid ${m.status === "COMPLETED" ? "#16a34a" : m.status === "IN_PROGRESS" ? "#1d4ed8" : "#d1d5db"}`,
                  color: m.status === "COMPLETED" || m.status === "IN_PROGRESS" ? "white" : "#9ca3af",
                }}>
                {m.status === "COMPLETED" ? "✓" : m.status === "IN_PROGRESS" ? "⟳" : "○"}
              </div>
              <div style={{
                flex: 1, background: "white", border: `1px solid ${m.status === "IN_PROGRESS" ? "#93c5fd" : "#e5e7eb"}`,
                borderRadius: 12, padding: "12px 14px",
                opacity: m.status === "COMPLETED" ? 0.65 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, textDecoration: m.status === "COMPLETED" ? "line-through" : "none" }}>
                    {m.title}
                  </p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                    background: m.status === "COMPLETED" ? "#dcfce7" : m.status === "IN_PROGRESS" ? "#dbeafe" : "#f3f4f6",
                    color: m.status === "COMPLETED" ? "#166534" : m.status === "IN_PROGRESS" ? "#1e40af" : "#6b7280",
                  }}>{m.status.replace("_", " ")}</span>
                </div>
                {m.description && <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0", lineHeight: 1.5 }}>{m.description}</p>}
                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#9ca3af" }}>
                  {m.dueDate && <span>Due {formatDate(m.dueDate)}</span>}
                  {m.completedAt && <span style={{ color: "#16a34a" }}>Completed {formatDate(m.completedAt)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
