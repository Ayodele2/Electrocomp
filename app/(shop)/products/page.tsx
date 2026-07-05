import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Products" };

async function getProducts(params: Record<string, string>) {
  const where: any = {};
  if (params.category) where.category = { slug: params.category };
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  const orderBy: any =
    params.sort === "price-asc" ? { price: "asc" } :
    params.sort === "price-desc" ? { price: "desc" } :
    { createdAt: "desc" };

  const page = parseInt(params.page ?? "1");
  const limit = 20;

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, _count: { select: { reviews: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Convert Decimal to plain number so it can be passed to Client Components
  const serialized = products.map(p => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return { products: serialized, total, categories, page, totalPages: Math.ceil(total / limit) };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const { products, total, categories, page, totalPages } = await getProducts(params);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
      {/* Search */}
      <form method="GET" action="/products" style={{ marginBottom: 28 }}>
        <div style={{ position: "relative", maxWidth: 520 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 16 }}>🔍</span>
          <input name="search" defaultValue={params.search}
            placeholder="Search components, sensors, modules..."
            style={{ width: "100%", paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
      </form>

      <div style={{ display: "flex", gap: 32 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0, display: "none" }}>
          <Suspense><ProductFilters categories={categories as any} /></Suspense>
        </div>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              {total === 0 ? "No products found" : `${total} product${total !== 1 ? "s" : ""}`}
              {params.search && <span> for <strong>"{params.search}"</strong></span>}
            </p>
            <form method="GET" action="/products">
              {params.search && <input type="hidden" name="search" value={params.search} />}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              <select name="sort" defaultValue={params.sort ?? "newest"} onChange={e => (e.target.form as HTMLFormElement).submit()}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#374151" }}>
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </form>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <a href="/products" style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none", background: !params.category ? "#1d4ed8" : "#f3f4f6", color: !params.category ? "white" : "#374151", border: "1px solid", borderColor: !params.category ? "#1d4ed8" : "#e5e7eb" }}>All</a>
            {categories.map(cat => (
              <a key={cat.id} href={`/products?category=${cat.slug}`} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none", background: params.category === cat.slug ? "#1d4ed8" : "#f3f4f6", color: params.category === cat.slug ? "white" : "#374151", border: "1px solid", borderColor: params.category === cat.slug ? "#1d4ed8" : "#e5e7eb" }}>{cat.name}</a>
            ))}
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 16px", border: "2px dashed #e5e7eb", borderRadius: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>No products found</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 }}>
              {products.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const sp = new URLSearchParams(params);
                sp.set("page", String(p));
                return (
                  <a key={p} href={`/products?${sp}`} style={{
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none",
                    background: p === page ? "#1d4ed8" : "white",
                    color: p === page ? "white" : "#374151",
                    border: `1px solid ${p === page ? "#1d4ed8" : "#e5e7eb"}`,
                  }}>{p}</a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
