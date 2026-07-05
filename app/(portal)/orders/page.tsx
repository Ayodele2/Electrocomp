import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Order History" };

const SC: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "#fef9c3", color: "#854d0e" },
  PAID:       { bg: "#dcfce7", color: "#166534" },
  PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
  SHIPPED:    { bg: "#f3e8ff", color: "#6b21a8" },
  DELIVERED:  { bg: "#dcfce7", color: "#166534" },
  CANCELLED:  { bg: "#fee2e2", color: "#991b1b" },
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: { select: { name: true, images: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 28 }}>Order history</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 16px", border: "2px dashed #e5e7eb", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
          <p style={{ fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>No orders yet</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Your orders will appear here</p>
          <Link href="/products" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>Browse products</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const c = SC[order.status] ?? { bg: "#f3f4f6", color: "#374151" };
            return (
              <div key={order.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>#{order.id.slice(-8).toUpperCase()}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: c.bg, color: c.color }}>{order.status}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, background: "#f3f4f6", borderRadius: 10, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        {item.product.images?.[0] ? <img src={item.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🔌"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Link href={`/products/${item.product.slug}`} style={{ fontSize: 13, fontWeight: 600, color: "#111827", textDecoration: "none" }}>{item.product.name}</Link>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
