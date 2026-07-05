import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatPrice, formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) notFound();

  // Serialize Decimal and Date fields
  const serialized = {
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    reviews: product.reviews.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const avgRating = serialized.reviews.length > 0
    ? serialized.reviews.reduce((s: number, r: any) => s + r.rating, 0) / serialized.reviews.length
    : 0;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    include: { category: true, _count: { select: { reviews: true } } },
  });

  const serializedRelated = related.map(p => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const perks = [
    ["📦", "In stock & ready to ship"],
    ["🚚", "Free shipping over ₦50,000"],
    ["✅", "30-day return guarantee"],
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24, display: "flex", gap: 6, alignItems: "center" }}>
        <a href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</a>
        <span>/</span>
        <a href="/products" style={{ color: "#9ca3af", textDecoration: "none" }}>Products</a>
        <span>/</span>
        <a href={`/products?category=${product.category.slug}`} style={{ color: "#9ca3af", textDecoration: "none" }}>{product.category.name}</a>
        <span>/</span>
        <span style={{ color: "#374151" }}>{product.name}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 56 }}>
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>{product.category.name}</p>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#111827", margin: "0 0 4px", lineHeight: 1.25 }}>{product.name}</h1>
            {product.sku && <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>SKU: {product.sku}</p>}
          </div>

          {/* Rating */}
          {serialized._count.reviews > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(avgRating) ? "#f59e0b" : "#d1d5db", fontSize: 16 }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                {avgRating.toFixed(1)} ({serialized._count.reviews} review{serialized._count.reviews !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price & Stock */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>{formatPrice(serialized.price)}</span>
            {product.stock > 0
              ? <span style={{ fontSize: 12, fontWeight: 600, background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 999 }}>{product.stock} in stock</span>
              : <span style={{ fontSize: 12, fontWeight: 600, background: "#fee2e2", color: "#991b1b", padding: "3px 10px", borderRadius: 999 }}>Out of stock</span>
            }
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>{product.description}</p>

          {/* Add to cart */}
          <AddToCartButton product={serialized as any} />

          {/* Perks */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            {perks.map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#374151" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>
          Customer reviews {serialized._count.reviews > 0 && <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 15 }}>({serialized._count.reviews})</span>}
        </h2>
        {serialized.reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", border: "2px dashed #e5e7eb", borderRadius: 14, color: "#9ca3af" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>No reviews yet</p>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>Be the first to review this product</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {serialized.reviews.map((r: any) => (
              <div key={r.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#1d4ed8" }}>
                      {r.user.name?.[0] ?? "U"}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user.name ?? "Customer"}</span>
                  </div>
                  <div>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#d1d5db", fontSize: 14 }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {serializedRelated.length > 0 && (
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Related products</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {serializedRelated.map((p: any) => {
              const { ProductCard } = require("@/components/product/ProductCard");
              return <ProductCard key={p.id} product={p} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
