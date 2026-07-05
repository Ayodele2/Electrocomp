import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Manage Products" };

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "ENGINEER") redirect("/dashboard");

  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { reviews: true, orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Products</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{products.length} in catalog</p>
        </div>
        <Link href="/admin/products/new" style={{ background: "#1d4ed8", color: "white", fontWeight: 700, padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>
          + Add product
        </Link>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
        {products.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>No products yet</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 100px 80px 100px 60px", gap: 12, padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Product", "Category", "Price", "Stock", "Orders", "Added", ""].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
              ))}
            </div>
            {products.map(p => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 100px 80px 100px 60px", gap: 12, padding: "14px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : "🔌"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    {p.sku && <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>SKU: {p.sku}</p>}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#374151" }}>{p.category.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{formatPrice(Number(p.price))}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 999, display: "inline-block", background: p.stock === 0 ? "#fee2e2" : p.stock < 10 ? "#ffedd5" : "#dcfce7", color: p.stock === 0 ? "#991b1b" : p.stock < 10 ? "#9a3412" : "#166534" }}>
                  {p.stock === 0 ? "Out" : `${p.stock} left`}
                </span>
                <span style={{ fontSize: 13, color: "#374151" }}>{p._count.orderItems}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(p.createdAt)}</span>
                <Link href={`/admin/products/${p.id}/edit`} style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
