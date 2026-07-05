import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "#fef9c3", color: "#854d0e" },
  PAID:       { bg: "#dbeafe", color: "#1e40af" },
  ACTIVE:     { bg: "#cffafe", color: "#155e75" },
  COMPLETED:  { bg: "#dcfce7", color: "#166534" },
  CANCELLED:  { bg: "#fee2e2", color: "#991b1b" },
  REVIEWING:  { bg: "#fef9c3", color: "#854d0e" },
  QUOTED:     { bg: "#dbeafe", color: "#1e40af" },
  DELIVERED:  { bg: "#f3e8ff", color: "#6b21a8" },
  SHIPPED:    { bg: "#f3e8ff", color: "#6b21a8" },
  PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
  ON_HOLD:    { bg: "#ffedd5", color: "#9a3412" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.color }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "ADMIN" || role === "ENGINEER") redirect("/admin/dashboard");

  const [orders, projects] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
    prisma.project.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { milestones: true },
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Here&apos;s what&apos;s happening with your account</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Total orders", value: orders.length, href: "/orders" },
          { label: "Active projects", value: projects.filter(p => p.status === "ACTIVE").length, href: "/projects" },
          { label: "Pending review", value: projects.filter(p => ["PENDING","REVIEWING"].includes(p.status)).length, href: "/projects" },
          { label: "Completed", value: projects.filter(p => p.status === "COMPLETED").length, href: "/projects" },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18 }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{value}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Orders */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Recent orders</h2>
            <Link href="/orders" style={{ fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {orders.length === 0 ? (
            <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>No orders yet</p>
              <Link href="/products" style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>Browse products →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>#{order.id.slice(-8).toUpperCase()}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.items.map((i: any) => i.product.name).join(", ")}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#9ca3af" }}>{formatDate(order.createdAt)}</span>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projects */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>My projects</h2>
            <Link href="/projects" style={{ fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛠️</div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>No projects yet</p>
              <Link href="/projects/new" style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>Start a project →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.map(project => {
                const done = project.milestones.filter((m: any) => m.status === "COMPLETED").length;
                const total = project.milestones.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.title}</p>
                        <StatusBadge status={project.status} />
                      </div>
                      {total > 0 && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                            <span>{done}/{total} milestones</span><span>{pct}%</span>
                          </div>
                          <div style={{ height: 5, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#1d4ed8", borderRadius: 999 }} />
                          </div>
                        </div>
                      )}
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0" }}>{formatDate(project.createdAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Link href="/projects/new" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, border: "2px dashed #bfdbfe", borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>
            + Start a new project
          </Link>
        </section>
      </div>
    </div>
  );
}
