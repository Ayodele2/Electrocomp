"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PRICE_RANGES = [
  { label: "Under ₦5,000", min: 0, max: 5000 },
  { label: "₦5,000 – ₦20,000", min: 5000, max: 20000 },
  { label: "₦20,000 – ₦50,000", min: 20000, max: 50000 },
  { label: "₦50,000+", min: 50000, max: undefined },
];

export function ProductFilters({ categories }: { categories: any[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback((key: string, value: string | undefined) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`/products?${p.toString()}`);
  }, [params, router]);

  const activeCategory = params.get("category");
  const activeSort = params.get("sort") ?? "newest";
  const activeMin = params.get("minPrice");
  const activeMax = params.get("maxPrice");

  const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sort */}
      <div>
        <span style={label}>Sort by</span>
        {SORT_OPTIONS.map(o => (
          <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
            <input type="radio" name="sort" value={o.value} checked={activeSort === o.value}
              onChange={() => update("sort", o.value)} style={{ accentColor: "#1d4ed8" }} />
            <span style={{ fontSize: 13, color: "#374151" }}>{o.label}</span>
          </label>
        ))}
      </div>

      {/* Categories */}
      <div>
        <span style={label}>Category</span>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
          <input type="radio" name="category" checked={!activeCategory}
            onChange={() => update("category", undefined)} style={{ accentColor: "#1d4ed8" }} />
          <span style={{ fontSize: 13, color: "#374151" }}>All categories</span>
        </label>
        {categories.map(cat => (
          <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
            <input type="radio" name="category" value={cat.slug} checked={activeCategory === cat.slug}
              onChange={() => update("category", cat.slug)} style={{ accentColor: "#1d4ed8" }} />
            <span style={{ fontSize: 13, color: "#374151" }}>{cat.name}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div>
        <span style={label}>Price range</span>
        {PRICE_RANGES.map(r => {
          const active = activeMin === String(r.min) && activeMax === String(r.max ?? "");
          return (
            <label key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
              <input type="radio" name="price" checked={active}
                onChange={() => { update("minPrice", String(r.min)); update("maxPrice", r.max ? String(r.max) : undefined); }}
                style={{ accentColor: "#1d4ed8" }} />
              <span style={{ fontSize: 13, color: "#374151" }}>{r.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
