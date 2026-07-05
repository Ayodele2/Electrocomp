import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { ProjectMessages } from "@/components/project/ProjectMessages";
import { ProjectTimeline } from "@/components/project/ProjectTimeline";

export const metadata = { title: "Project" };

const SC: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#fef9c3", color: "#854d0e" },
  REVIEWING: { bg: "#fef9c3", color: "#854d0e" },
  QUOTED:    { bg: "#dbeafe", color: "#1e40af" },
  ACTIVE:    { bg: "#cffafe", color: "#155e75" },
  ON_HOLD:   { bg: "#ffedd5", color: "#9a3412" },
  DELIVERED: { bg: "#f3e8ff", color: "#6b21a8" },
  COMPLETED: { bg: "#dcfce7", color: "#166534" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = (session.user as any).id;
  const isAdmin = ["ADMIN","ENGINEER"].includes((session.user as any).role);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, image: true, role: true } },
      milestones: { orderBy: { order: "asc" } },
      messages: {
        include: { sender: { select: { id: true, name: true, image: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      files: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!project) notFound();
  if (!isAdmin && project.clientId !== userId) redirect("/projects");

  const serialized = {
    ...project,
    quote: project.quote ? Number(project.quote) : null,
    budget: project.budget ? Number(project.budget) : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deadline: project.deadline?.toISOString() ?? null,
    milestones: project.milestones.map(m => ({
      ...m,
      dueDate: m.dueDate?.toISOString() ?? null,
      completedAt: m.completedAt?.toISOString() ?? null,
    })),
    messages: project.messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
    files: project.files.map(f => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })),
  };

  const c = SC[project.status] ?? { bg: "#f3f4f6", color: "#374151" };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af", marginBottom: 6 }}>
            <Link href="/projects" style={{ color: "#9ca3af", textDecoration: "none" }}>Projects</Link>
            <span>/</span>
            <span style={{ color: "#374151" }}>{project.title}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{project.title}</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Submitted {formatDate(project.createdAt)}</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999, background: c.bg, color: c.color, flexShrink: 0 }}>
          {project.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Quote banner */}
      {project.status === "QUOTED" && serialized.quote && !project.depositPaid && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ fontWeight: 700, color: "#1e40af", margin: "0 0 4px" }}>Quote received!</p>
            <p style={{ fontSize: 13, color: "#3b82f6", margin: 0 }}>
              Our engineers quoted <strong>{formatPrice(serialized.quote)}</strong> for this project. Pay the 50% deposit to get started.
            </p>
          </div>
          <button style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
            Pay deposit {formatPrice(serialized.quote / 2)}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Description */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Project description</h2>
            <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{project.description}</p>
          </div>

          {/* Milestones */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Milestones</h2>
            <ProjectTimeline milestones={serialized.milestones as any} isAdmin={isAdmin} projectId={project.id} />
          </div>

          {/* Messages */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Messages</h2>
            <ProjectMessages messages={serialized.messages as any} projectId={project.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Project details</h3>
            {[
              ["Budget", serialized.budget ? formatPrice(serialized.budget) : "Not specified"],
              ["Quote", serialized.quote ? formatPrice(serialized.quote) : "Pending"],
              ["Deadline", serialized.deadline ? formatDate(serialized.deadline) : "Flexible"],
              ["Submitted", formatDate(project.createdAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Payment</h3>
            {[["Deposit (50%)", project.depositPaid], ["Balance (50%)", project.balancePaid]].map(([label, paid]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{label as string}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: paid ? "#dcfce7" : "#f3f4f6", color: paid ? "#166534" : "#6b7280" }}>
                  {paid ? "Paid" : "Pending"}
                </span>
              </div>
            ))}
          </div>

          {serialized.files.length > 0 && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Files</h3>
              {serialized.files.map((f: any) => (
                <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f3f4f6", textDecoration: "none" }}>
                  <span>📄</span>
                  <span style={{ fontSize: 12, color: "#1d4ed8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
