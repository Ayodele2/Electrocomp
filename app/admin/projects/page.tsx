import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Manage Projects" };

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

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "ENGINEER") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, email: true } },
      _count: { select: { milestones: true, messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>All projects</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{projects.length} total</p>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
        {projects.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No projects yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 80px 80px 100px 80px", gap: 12, padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Project", "Client", "Status", "Milestones", "Messages", "Submitted", ""].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
              ))}
            </div>
            {projects.map(p => {
              const c = SC[p.status] ?? { bg: "#f3f4f6", color: "#374151" };
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 80px 80px 100px 80px", gap: 12, padding: "14px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                  <div>
                    <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{p.client.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{p.client.email}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: c.bg, color: c.color, display: "inline-block" }}>{p.status.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{p._count.milestones}</span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{p._count.messages}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(p.createdAt)}</span>
                  <Link href={`/admin/projects/${p.id}`} style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>Review →</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
