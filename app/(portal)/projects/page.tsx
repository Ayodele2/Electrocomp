import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Projects" };

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

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { clientId: (session.user as any).id },
    include: { milestones: true, _count: { select: { messages: true, files: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>My projects</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Track your custom engineering projects</p>
        </div>
        <Link href="/projects/new" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>+ New project</Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 16px", border: "2px dashed #e5e7eb", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🛠️</div>
          <p style={{ fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>No projects yet</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Submit a brief and our engineers will get back to you within 48 hours</p>
          <Link href="/projects/new" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>Start your first project</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {projects.map(project => {
            const done = project.milestones.filter((m: any) => m.status === "COMPLETED").length;
            const total = project.milestones.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const c = SC[project.status] ?? { bg: "#f3f4f6", color: "#374151" };
            return (
              <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.title}</h2>
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.description.slice(0, 100)}...</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: c.bg, color: c.color, flexShrink: 0, alignSelf: "flex-start" }}>{project.status.replace(/_/g, " ")}</span>
                  </div>
                  {total > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                        <span>{done}/{total} milestones</span><span>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "#1d4ed8", borderRadius: 999 }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af" }}>
                    <span>{formatDate(project.createdAt)}</span>
                    {project._count.messages > 0 && <span>💬 {project._count.messages}</span>}
                    {project._count.files > 0 && <span>📎 {project._count.files}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
