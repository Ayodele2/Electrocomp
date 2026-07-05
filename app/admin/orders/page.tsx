import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Manage Orders" };

const SC: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "#fef9c3", color: "#854d0e" },
  PAID:       { bg: "#dcfce7", color: "#166534" },
  PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
  SHIPPED:    { bg: "#f3e8ff", color: "#6b21a8" },
  DELIVERED:  { bg: "#dcfce7", color: "#166534" },
  CANCELLED:  { bg: "#fee2e2", color: "#991b1b" },
};

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "ENGINEER") redirect("/dashboard");

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Orders</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{orders.length} total orders</p>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
        {orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>No orders yet</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 2fr 100px 120px 100px", gap: 12, padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
              ))}
            </div>
            {orders.map(order => {
              const c = SC[order.status] ?? { bg: "#f3f4f6", color: "#374151" };
              return (
                <div key={order.id} style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 2fr 100px 120px 100px", gap: 12, padding: "14px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}>#{order.id.slice(-8).toUpperCase()}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{order.user.name ?? "—"}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{order.user.email}</p>
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.items.map((i: any) => `${i.product.name} ×${i.quantity}`).join(", ")}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{formatPrice(Number(order.total))}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: c.bg, color: c.color, display: "inline-block" }}>{order.status}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(order.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
