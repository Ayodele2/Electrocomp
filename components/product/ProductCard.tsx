"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = typeof product.price === "number" ? product.price : Number(product.price);

  return (
    <div style={{
      background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
      overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <Link href={`/products/${product.slug}`} style={{ display: "block", position: "relative", textDecoration: "none" }}>
        <div style={{ aspectRatio: "1", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🔌"}
        </div>
        {product.stock === 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "white", border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 12px", color: "#6b7280" }}>Out of stock</span>
          </div>
        )}
        {product.featured && (
          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 700, background: "#1d4ed8", color: "white", borderRadius: 999, padding: "3px 8px" }}>Featured</span>
        )}
      </Link>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {product.category?.name}
        </p>
        <Link href={`/products/${product.slug}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.4 }}>
            {product.name}
          </h3>
        </Link>
        {product.sku && <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>SKU: {product.sku}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>{formatPrice(price)}</span>
          <button
            onClick={() => addItem({ ...product, price }, 1)}
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? "#f3f4f6" : "#1d4ed8",
              color: product.stock === 0 ? "#9ca3af" : "white",
              border: "none", borderRadius: 8, padding: "6px 12px",
              fontSize: 12, fontWeight: 700, cursor: product.stock === 0 ? "not-allowed" : "pointer",
            }}>
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
}
