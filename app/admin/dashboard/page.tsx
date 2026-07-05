import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

const SC: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#fef9c3", color: "#854d0e" },
  REVIEWING: { bg: "#fef9c3", color: "#854d0e" },
  QUOTED:    { bg: "#dbeafe", color: "#1e40af" },
  ACTIVE:    { bg: "#cffafe", color: "#155e75" },
  COMPLETED: { bg: "#dcfce7", color: "#166534" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  PAID:      { bg: "#dcfce7", color: "#166534" },
  SHIPPED:   { bg: "#f3e8ff", color: "#6b21a8" },
};

function Badge({ s }: { s: string }) {
  const c = SC[s] ?? { bg: "#f3f4f6", color: "#374151" };
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.color }}>{s.replace(/_/g, " ")}</span>;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "ENGINEER") redirect("/dashboard");

  const [orderCount, projectCount, userCount, revenue, pendingProjects, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.project.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "DELIVERED"] } } }),
    prisma.project.findMany({
      where: { status: { in: ["PENDING", "REVIEWING"] } },
      include: { client: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
    }),
  ]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Admin dashboard</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Overview of orders, projects, and revenue</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
        {[
          { label: "Total orders", value: orderCount },
          { label: "Total projects", value: projectCount },
          { label: "Total users", value: userCount },
          { label: "Revenue", value: formatPrice(Number(revenue._sum.total ?? 0)) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Project queue */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Project queue</h2>
            <Link href="/admin/projects" style={{ fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {pendingProjects.length === 0 ? (
            <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: 32, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No pending projects</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingProjects.map(p => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                      <Badge s={p.status} />
                    </div>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>{p.client.name} · {p.client.email}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{formatDate(p.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent orders */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Recent orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 12, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: 32, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No orders yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>#{order.id.slice(-8).toUpperCase()}</span>
                    <Badge s={order.status} />
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.user.name} · {order.items.map((i: any) => i.product.name).join(", ")}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#9ca3af" }}>{formatDate(order.createdAt)}</span>
                    <span style={{ fontWeight: 700 }}>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
